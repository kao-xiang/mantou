import React from "react";
import type {
  Context,
  ErrorPageProps,
  Handler,
  HandlerConfig,
  MetaData,
  RouteHandlerFunction,
  TGuard,
} from "@/routes";
import type { ServerOptions } from "@/exports/types";
import {
  deepMerge,
  dynamicImport,
  normalizePath,
  removeFilenameFromPath,
  writeRecursive,
} from "@/utils";
import type { HTTPMethod } from "elysia";
import type Elysia from "elysia";
import { glob } from "glob";
import path from "path";
import upath from "upath";
import type {
  Action,
  BasePath,
  Layout,
  TMiddleware,
  Page,
  PageLayout,
  Route,
  WsRoute,
} from "./types";
import { content_templates } from "./content";
import _ from "lodash";
import { applyPlugins, useNoLog } from "lib/utils";
import { generateHtml, HTMLShell } from "./component";
import { StaticRouter } from "react-router";
import { ErrorPage } from "shell/ErrorPage";
import { logger } from "lib/logger";
import { f } from "@/utils/client";
import { astorage } from "lib/async-context";
// Constants
const HTTP_METHODS: readonly HTTPMethod[] = [
  "get",
  "post",
  "put",
  "patch",
  "delete",
];

type ErrorPage = Page<ErrorPageProps>;

export class MantouBuilder<M extends HandlerConfig, R extends HandlerConfig> {
  private app: Elysia;
  private config: ServerOptions;

  public pages: Page[] = [];
  public layouts: Layout[] = [];
  public routes: Route<R>[] = [];
  public actions: Action[] = [];
  public wsRoutes: WsRoute[] = [];
  public middlewares: TMiddleware<M>[] = [];
  public pageLayouts: PageLayout[] = [];

  public errorPage: ErrorPage | undefined;
  public notFoundPage: ErrorPage | undefined;

  constructor(app: Elysia, config: ServerOptions) {
    this.app = app;
    this.config = config;
  }

  private shouldProcess(type: "page" | "route") {
    if (this.config.mode === "framework") {
      return false;
    }
    if (this.config.mode === "api" && type === "page") {
      return false;
    }
    if (this.config.mode === "web" && type === "route") {
      return false;
    }
    if (this.config.mode === "both") {
      return true;
    }
  }

  public build = async () => {
    const outputDir = upath.resolve(process.cwd(), this.config.outputDir);
    if (this.shouldProcess("route")) {
      this.middlewares = await this.processMiddlewares();
      await this.processRoutes();
      await this.processActions();
    }
    if (this.shouldProcess("page")) {
      await this.processPages();
      await this.processLayouts();
      this.errorPage = await this.processErrorPage();
      this.notFoundPage = await this.processNotFoundPage();
    }

    // await this.processWsRoutes();
    // await this.processMiddlewares();

    this.pageLayouts = await this.combinePageLayouts(this.layouts, this.pages);

    const AppTsx = content_templates["App.tsx"](
      this.pageLayouts,
      this.pages,
      this
    );
    const indexTsx = content_templates["index.tsx"]();

    await writeRecursive(upath.resolve(outputDir, "client", "App.tsx"), AppTsx);
    await writeRecursive(
      upath.resolve(outputDir, "client", "index.tsx"),
      indexTsx
    );

    await Bun.build({
      entrypoints: [path.resolve(outputDir, "client", "index.tsx")],
      outdir: path.resolve(outputDir, "client"),
    });

    if(this.config.mode !== "framework") {
      await Bun.build({
        entrypoints: [
          path.resolve(this.config.appDir, this.config.errorPageDir, "error.tsx"),
          path.resolve(this.config.appDir, this.config.errorPageDir, "404.tsx"),
        ],
        outdir: path.resolve(outputDir, "client"),
      });
    }

    global.__mantou_App_tsx = await dynamicImport(
      path.resolve(outputDir, "client", `App.tsx`)
    );

    this.applyRoutes();
    this.applyPages();
    this.applyActions();
  };
  //   ------------------------------

  //           Add

  //   ------------------------------

  public async addAction(props: {
    path: string;
    handler: RouteHandlerFunction<any>;
    filePath?: string;
    config?: HandlerConfig;
    guards?: TGuard[];
  }) {
    this.actions.push({
      path: props.path,
      filePath: props.filePath || "",
      handler: props.handler,
      config: props.config,
      guards: props.guards || [],
    });
  }

  public async addRoute(props: {
    method: HTTPMethod;
    path: string;
    filePath?: string;
    handler: RouteHandlerFunction<any>;
    config?: HandlerConfig;
    guards?: TGuard[];
  }) {
    this.routes.push({
      method: props.method,
      path: props.path,
      filePath: props.filePath || "",
      handler: props.handler,
      config: props.config,
      guards: props.guards || [],
    } as Route);
  }

  public async addPage(props: { path?: string; filePath: string }) {
    const module = (await dynamicImport(props.filePath)).default;
    let _path = props.path || module.path;
    if (!_path) {
      _path = this.filePathToRoutePath(props.filePath);
    }
    this.pages.push({
      filePath: props.filePath,
      path: _path,
      metadata: module.metadata,
      getServerSideData: module.getServerSideData?.handler,
      generateMetadata: module.generateMetadata,
      Component: module,
    });
  }

  public async addLayout(props: { path?: string; filePath: string }) {
    const module = (await dynamicImport(props.filePath)).default;
    let _path = props.path || module.path;
    if (!_path) {
      _path = this.filePathToRoutePath(props.filePath);
    }
    this.layouts.push({
      filePath: props.filePath,
      metadata: module.metadata,
      path: this.filePathToRoutePath(props.filePath),
      children: module.children,
      generateMetadata: module.generateMetadata,
    });
  }

  //   ------------------------------

  //           Apply

  //   ------------------------------

  public async _applyMiddlewares(path: string, ctx: any): Promise<any> {
    const middlewares = this.getMiddlewaresByPath(
      path,
      ctx.request?.method?.toLowerCase()
    );
    const next = async () => {
      const middleware = middlewares.shift();
      if (middleware) {
        const mRes = await middleware.handler(ctx, next);
        if (mRes) {
          return mRes;
        }
      }
    };
    await next();
  }

  public applyActions() {
    this.actions.forEach((action) => {
      const actionPath = global.__mantou_config.actionPath;
      const app = global.__mantou_app;
      app.post(
        actionPath + "/" + action.path,
        async (ctx: any) => {
          astorage?.run({ ctx }, async () => {
            const res = await action.handler(ctx);
            return res;
          });
        },
        {
          detail: {
            tags: ["Actions"],
            description:
              action.config?.detail?.description || `Action ${action.path}`,
          },
        }
      );
    });
  }

  public applyRoutes() {
    this.routes.forEach((route) => {
      const detail = route.config?.detail || {
        tags: [
          f(
            route.path?.startsWith("/api/")
              ? route.path.split("/")[2]
              : route.path.split("/")[1]
          ) || "Routes",
        ],
        description: `Route ${route.path}`,
      };

      (this.app as any)[route.method](
        route.path,
        async (_ctx: any) => {
          return astorage?.run({ ctx: _ctx }, async () => {
            const store = astorage?.getStore() as any;
            const body = await _ctx.request?.json().catch(() => ({}));
            const ctx = store.ctx;
            const newCtx = _.merge({
              body: body,
              headers: _ctx.request.headers.toJSON(),
            }, ctx, _ctx);
            const middlewareRes = await this._applyMiddlewares(
              route.path,
              newCtx
            );
            if (middlewareRes) {
              return middlewareRes;
            }
            return route.handler(newCtx).catch((e: any) => {
              logger.error(e);
              _ctx.set.status = e.status || e?.code || 500;
              _ctx.set.headers = {
                "Content-Type": "application/json",
              };
              return {
                error: e,
                message: e.response?.message || e.message || "Internal Server Error",
              }
            });
          });
        },
        {
          ...route.config,
          detail: detail,
        }
      );
    });
  }

  public applyPages() {
    this.pages.forEach((page) => {
      this.app.get(
        page.path,
        async (ctx: any) => {
          let _data = (await page.getServerSideData?.(ctx)) || {};
          const data = deepMerge({}, _data, ctx.data);
          if (ctx.query?.__mantou_only_data) {
            const query_no___mantou_only_data = _.omit(
              ctx.query,
              "__mantou_only_data"
            );
            return {
              data: data,
              params: ctx.params,
              search: query_no___mantou_only_data,
            };
          }
          const metadata = (await this.getMetadataByPath(page.path, ctx)) || {};
          const App = global.__mantou_App_tsx.default;

          const html = generateHtml({
            metadata,
            data,
            params: ctx.params,
            query: ctx.query,
            children: React.createElement(HTMLShell, {
              children: React?.createElement(
                StaticRouter,
                {
                  location: ctx.path,
                },
                React.createElement(App, {
                  data,
                  search: ctx.query,
                  params: ctx.params,
                })
              ),
            }),
          });

          return new Response(html, {
            headers: { "Content-Type": "text/html" },
          });
        },
        {
          detail: {
            hide: true,
          },
        }
      );
    });
  }

  //   ------------------------------

  //           UTILS

  //   ------------------------------

  public async getMetadataByPath(
    path: string,
    ctx: Context<any>
  ): Promise<MetaData | undefined> {
    const page = this.getPageByPath(path);
    if (!page) return undefined;
    const layouts = this.getLayoutsByPath(page.path);
    const layout_metadatas = await Promise.all(
      layouts.map(async (layout) => {
        if (layout.metadata) {
          return layout.metadata;
        }
        if (layout.generateMetadata) {
          return await layout.generateMetadata(ctx);
        }
      })
    );
    const page_metadata =
      (await page.generateMetadata?.(ctx)) || page.metadata || {};
    const metadata = deepMerge({}, ...layout_metadatas, page_metadata);
    return metadata;
  }

  private hasDuplicateRoutes(routes: BasePath[]): BasePath[] {
    const duplicateRoutes = routes.filter(
      (route, index, self) =>
        index !== self.findIndex((t) => t.path === route.path)
    );
    return duplicateRoutes;
  }

  private getRouteGroup(filePath: string): string {
    const match = filePath.match(/src\/\((.*?)\)/);
    return match ? match[1] : "";
  }

  private findMatchingLayouts(page: Page, layouts: Layout[]): string[] {
    const pageGroup = this.getRouteGroup(page.filePath);
    const pageFilePath = removeFilenameFromPath(page.filePath);

    const rootLayout = layouts.find(
      (layout) =>
      {
        return this.getRouteGroup(layout.filePath) === pageGroup && pageFilePath === removeFilenameFromPath(layout.filePath)
      }
    );

    const matchingLayouts = layouts
      .filter((layout) => {
        if (layout === rootLayout) return false;

        const layoutGroup = this.getRouteGroup(layout.filePath);
        if (layoutGroup !== pageGroup) return false;
        return (
          pageFilePath === removeFilenameFromPath(layout.filePath) || pageFilePath.startsWith(removeFilenameFromPath(layout.filePath))
        );
      })
      .sort((a, b) => b.path.length - a.path.length)
      .map((layout) => layout.filePath);

    if (rootLayout) {
      matchingLayouts.push(rootLayout.filePath);
    }

    return matchingLayouts;
  }

  private async combinePageLayouts(
    layouts: Layout[],
    pages: Page[]
  ): Promise<PageLayout[]> {
    const combinedRoutes: PageLayout[] = [];

    pages.forEach((page) => {
      const matchingLayouts = this.findMatchingLayouts(page, layouts);
      combinedRoutes.push({
        path: page.path,
        element: {
          page: page.filePath,
          layouts: matchingLayouts,
        },
      });
    });

    return combinedRoutes;
  }

  private filePathToRoutePath(filePath: string): string {
    const parsedPath = upath.parse(filePath);
    const appPath = path.resolve(process.cwd(), this.config.appDir);
    const relativePath = upath.relative(appPath, parsedPath.dir);
    const _path = normalizePath(relativePath);
    return _path;
  }

  //   ------------------------------

  //           File Processing

  //   ------------------------------

  private async getFiles(props: {
    dir: string;
    filename: string;
    nested?: boolean;
  }) {
    const { dir, filename, nested = true } = props;
    const files = await glob(
      path.resolve(process.cwd(), dir, nested ? "**" : "", filename),
      {
        ignore: [
          "**/*.d.ts",
          "**/*.test.ts",
          "**/*.spec.ts",
          "**/node_modules/**",
          "**/_*/**",
        ],
      }
    );
    return files;
  }

  public async processFiles(filename: string) {
    const files = await this.getFiles({
      dir: this.config.appDir || "src/app",
      filename: filename,
      nested: true,
    });
    return files;
  }

  public async processErrorPage() {
    const errorPage = await dynamicImport(
      path.resolve(
        process.cwd(),
        global.__mantou_config.appDir,
        this.config.errorPageDir,
        "error.tsx"
      )
    )
      .then((module) => module.default)
      .catch(() => ErrorPage);
    return {
      filePath: path.resolve(
        process.cwd(),
        global.__mantou_config.appDir,
        this.config.errorPageDir,
        "error.tsx"
      ),
      path: "/error",
      Component: errorPage,
    };
  }

  public async processNotFoundPage() {
    const notFoundPage = await dynamicImport(
      path.resolve(process.cwd(), global.__mantou_config.appDir, "404.tsx")
    )
      .then((module) => module.default)
      .catch(() => ErrorPage);

    return {
      filePath: path.resolve(
        process.cwd(),
        global.__mantou_config.appDir,
        "404.tsx"
      ),
      path: "/404",
      Component: notFoundPage,
    };
  }

  public async processPages(): Promise<Page[]> {
    const files = await this.processFiles("page.tsx");
    let pages = [] as Page[];
    for (const file of files) {
      const module = (await dynamicImport(file)).default;
      if (!module) {
        logger.warn(`Page ${file} must be exported as default`);
        continue;
      }
      this.pages.push({
        filePath: file,
        path: this.filePathToRoutePath(file),
        metadata: module.metadata,
        getServerSideData: module.getServerSideData?.handler,
        generateMetadata: module.generateMetadata,
        Component: module,
      });
    }
    return pages;
  }

  public async processLayouts(): Promise<Layout[]> {
    const files = await this.processFiles("layout.tsx");
    let layouts = [] as Layout[];
    for (const file of files) {
      const module = (await dynamicImport(file)).default;
      this.layouts.push({
        filePath: file,
        metadata: module.metadata,
        path: this.filePathToRoutePath(file),
        children: module.children,
        generateMetadata: module.generateMetadata,
      });
    }
    return layouts;
  }

  public async processRoutes(): Promise<Route[]> {
    const files = await this.processFiles("route.ts");

    const routes: Route[] = [];

    for (const file of files) {
      const module = await dynamicImport(file);
      const routePath = this.filePathToRoutePath(file);

      if (routes.find((route) => route.path === routePath)) {
        continue;
      }

      for (const method of HTTP_METHODS) {
        if (method in module) {
          if (module[method]?.["__type"] !== "handler") {
            logger.error(
              `Route ${file} must be exported as default and have __type: "handler"`
            );
            continue;
          }
          this.addRoute({
            method,
            filePath: file,
            path: routePath,
            handler: module[method]?.handler,
            config: module[method]?.config,
            guards: module[method]?.guards ?? [],
          });
        }
      }
    }
    return routes;
  }

  public async processWsRoutes(): Promise<void> {
    const files = await this.getFiles({
      dir: this.config.appDir || "src/app",
      filename: "msg.ts",
    });
  }

  public async processMiddlewares(): Promise<TMiddleware[]> {
    const files = await this.getFiles({
      dir: this.config.appDir || "src/app",
      filename: "middleware.ts",
    });
    let middlewares = [] as TMiddleware[];

    for (const file of files) {
      const module = await dynamicImport(file);
      if (module.default?.["__type"] !== "middleware") {
        logger.error(
          `Middleware ${file} must be exported as default and have __type: "middleware"`
        );
        continue;
      }
      middlewares.push({
        filePath: file,
        path: this.filePathToRoutePath(file),
        handler: module.default?.handler,
        guards: module.default?.guards ?? [],
      });
    }
    return middlewares;
  }

  public async processActions(): Promise<Action[]> {
    const files = await this.getFiles({
      dir: this.config.appDir || "src/app",
      filename: "route.ts",
    });
    let actions = [] as Action[];

    for (const file of files) {
      const module = await dynamicImport(file);
      const _actions = module.actions as Record<string, Handler>;
      for (const key in _actions) {
        if (_actions[key]?.["__type"] !== "handler") {
          logger.error(
            `Action ${file} must be exported as default and have __type: "handler"`
          );
          continue;
        }
        this.actions.push({
          filePath: file,
          path: key,
          handler: _actions[key].handler,
          guards: _actions[key].guards ?? [],
          config: _actions[key].config,
        });
      }
    }
    // if duplicate, use the last one and show warning
    const duplicateActions = this.hasDuplicateRoutes(actions);
    if (duplicateActions.length > 0) {
      console.warn(
        `Duplicate actions found: ${duplicateActions
          .map((route) => route.path)
          .join(", ")}`
      );
    }

    return actions;
  }

  //   ------------------------------

  //           Get Functions

  //   ------------------------------

  public matchParentOrDynamicPath(
    path: string,
    routePath: string,
    offset = 0
  ): {
    isMatch: boolean;
    params: Record<string, string>;
  } {
    return this.matchParentPath(path, routePath, offset).isMatch
      ? this.matchParentPath(path, routePath, offset)
      : this.matchDynamicPath(path, routePath);
  }

  public matchParentPath(
    path: string,
    routePath: string,
    offset = 0
  ): {
    isMatch: boolean;
    params: Record<string, string>;
  } {
    // support :id and * in routePath
    const pathParts = path.split("/");
    const routeParts = routePath.split("/");
    if (routePath === "/") {
      return { isMatch: true, params: {} };
    }
    if (
      pathParts.length < routeParts.length + offset &&
      !routePath.includes("*")
    ) {
      return { isMatch: false, params: {} };
    }
    const params: Record<string, string> = {};
    for (let i = 0; i < pathParts.length; i++) {
      if (routeParts[i] === undefined) {
        break;
      }
      if (pathParts[i] === routeParts[i]) {
        continue;
      }

      if (routeParts[i]?.startsWith(":")) {
        params[routeParts[i].slice(1)] = pathParts[i];
        continue;
      }

      if (routeParts[i]?.startsWith("*")) {
        params[routeParts[i].slice(1)] = pathParts.slice(i).join("/");
        break;
      }
      return { isMatch: false, params: {} };
    }
    return { isMatch: true, params };
  }

  public matchDynamicPath(
    path: string,
    routePath: string
  ): {
    isMatch: boolean;
    params: Record<string, string>;
  } {
    // support :id and * in routePath
    const pathParts = path.split("/");
    const routeParts = routePath.split("/");
    if (pathParts.length !== routeParts.length && !routePath.includes("*")) {
      return { isMatch: false, params: {} };
    }

    const params: Record<string, string> = {};
    for (let i = 0; i < pathParts.length; i++) {
      if (pathParts[i] === routeParts[i]) {
        continue;
      }

      if (routeParts[i].startsWith(":")) {
        params[routeParts[i].slice(1)] = pathParts[i];
        continue;
      }

      if (routeParts[i].startsWith("*")) {
        params[routeParts[i].slice(1)] = pathParts.slice(i).join("/");
        break;
      }

      return { isMatch: false, params: {} };
    }

    return { isMatch: true, params };
  }

  public getRouteByPath(path: string, method: string): Route | undefined {
    const routes = this.routes.filter(
      (route) => this.matchDynamicPath(path, route.path).isMatch
    );
    const route = routes.find(
      (route) => route.method?.toLowerCase() === method?.toLowerCase()
    );
    return route;
  }

  public getPathParams(
    path: string,
    routePath: string
  ): Record<string, string> {
    return this.matchDynamicPath(path, routePath).params;
  }

  public getLayoutsByPath(path: string): Layout[] | [] {
    const page = this.getPageByPath(path);
    if (!page) return [];
    return this.layouts
      .filter((layout) =>
        removeFilenameFromPath(page.filePath).startsWith(
          removeFilenameFromPath(layout.filePath)
        )
      )
      .sort((a, b) => b.path.length + a.path.length);
  }

  public getMiddlewaresByPath(path: string, method: string): TMiddleware[] {
    const page = this.getPageByPath(path) || this.getRouteByPath(path, method);
    if (!page) return [];
    return this.middlewares
      .filter((middleware) => {
        return removeFilenameFromPath(page?.filePath || "").startsWith(
          removeFilenameFromPath(middleware.filePath)
        );
      })
      .sort((a, b) => b.path.length + a.path.length);
  }

  public getPageByPath(path: string): Page | undefined {
    if (path === "/error") {
      return this.errorPage;
    }
    if (path === "/404") {
      return this.notFoundPage;
    }
    return this.pages.find(
      (page) => this.matchDynamicPath(path, page.path).isMatch
    );
  }

  public getWsRouteByPath(path: string): WsRoute | undefined {
    return this.wsRoutes.find(
      (route) => this.matchDynamicPath(path, route.path).isMatch
    );
  }
}
