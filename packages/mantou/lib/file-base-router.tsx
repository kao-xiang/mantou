import { Elysia, type Static, type TSchema } from "elysia";
import { glob } from "glob";
import upath from "upath";
import fs from "fs/promises";
import type { HTTPHeaders, HTTPMethod } from "elysia/types";
import lightningcss from "bun-lightningcss";
import type { BaseContext, ServerOptions } from "mantou/types";
import { writeRecursive } from "mantou/utils";
import type { GenerateMetadata, GetServerSideData, Guard, HandlerConfig, RouteHandlerFunction } from "mantou/routes";
import path from "path";

interface MiddlewareContext extends BaseContext {
  app: Elysia;
}

interface Route<TConfig extends HandlerConfig = any> {
  filePath: string;
  path: string;
  method: HTTPMethod;
  handler: RouteHandlerFunction<TConfig>;
  config: TConfig;
  guards: Guard[];
  // routeData?: RouteData;
}

interface WsRoute<TConfig extends HandlerConfig = any> {
  filePath: string;
  path: string;
  onMessage: RouteHandlerFunction<TConfig>;
  config: TConfig;
  guards: Guard[];
}

interface BasePath {
  filePath: string;
  path: string;
}

interface Page extends BasePath {
  getServerSideData?: GetServerSideData,
  generateMetadata?: GenerateMetadata
}

interface Layout extends BasePath {
  children?: (Page | Layout)[];
}

interface PageLayout {
  path: string;
  element: {
    page: string;
    layouts?: string[];
  };
}

interface MiddlewareConfig<TConfig extends HandlerConfig = any> {
  filePath: string;
  path: string;
  handler: RouteHandlerFunction<TConfig>;
  guards: Guard[];
}

// Constants
const HTTP_METHODS: readonly HTTPMethod[] = [
  "get",
  "post",
  "put",
  "patch",
  "delete",
];

// Route Resolution
export class RouteResolver<M extends HandlerConfig, R extends HandlerConfig> {
  private readonly appPath: string;
  private readonly baseDir: string = process.cwd();
  private readonly pathMap = new Map<string, string>();
  public middlewares: MiddlewareConfig<M>[] = [];
  public routes: Route<R>[] = [];
  public pages: Page[] = [];
  public layouts: Layout[] = [];
  public wsRoutes: WsRoute<R>[] = [];
  public pageLayouts: PageLayout[] = [];
  public config: ServerOptions = {};

  constructor(config: ServerOptions) {
    this.config = config;
    this.appPath = upath.resolve(
      process.cwd(),
      config?.baseDir || "./src",
      config.appDir || ""
    );
    this.baseDir = upath.resolve(process.cwd(), config?.baseDir || "./src");
  }

  private normalizePath(rawPath: string): string {
    let newPath =
      rawPath
        .replace(/\\/g, "/") // Normalize Windows backslashes to forward slashes
        .replace(/\.ts$|\.js$/, "") // Remove `.ts` and `.js` extensions
        .replace(/\/index$/, "") // Remove `/index`
        .replace(/\/route$/, "") // Remove `/route`
        .replace(/\[\.{3}(.*?)\]/, ":$1*") // Handle spread parameters like `[...param]`
        .replace(/\[(.*?)\]/g, ":$1") // Handle dynamic parameters like `[param]`
        .replace(/^\/+|\/+$/g, "") // Remove leading/trailing slashes
        .replace(/\((.*?)\)/g, "") // Remove any parentheses (like in optional routes)
        .replace(/\/+/g, "/") // Replace multiple slashes with one
        .replace(/\/$/, "") || "/"; // Remove trailing slashes, default to `/`

    if (!newPath.startsWith("/")) {
      newPath = `/${newPath}`;
    }

    return newPath;
  }

  getRouteGroup(filePath: string): string {
    const match = filePath.match(/src\/\((.*?)\)/);
    return match ? match[1] : "";
  }

  findMatchingLayouts(page: Page, layouts: Layout[]): string[] {
    const pageGroup = this.getRouteGroup(page.filePath);
    const pagePath = page.path;

    const rootLayout = layouts.find(
      (layout) =>
        this.getRouteGroup(layout.filePath) === pageGroup && layout.path === "/"
    );

    const matchingLayouts = layouts
      .filter((layout) => {
        if (layout === rootLayout) return false;

        const layoutGroup = this.getRouteGroup(layout.filePath);
        if (layoutGroup !== pageGroup) return false;

        return (
          pagePath === layout.path || pagePath.startsWith(layout.path + "/")
        );
      })
      .sort((a, b) => b.path.length - a.path.length)
      .map((layout) => layout.filePath);

    if (rootLayout) {
      matchingLayouts.push(rootLayout.filePath);
    }

    return matchingLayouts;
  }

  public async combinePageLayouts(
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

  public async cleanOutputDir() {
    const outputDir = upath.resolve(
      process.cwd(),
      this.config.outputDir || "./dist"
    );

    // delete existing output directory
    await fs.rm(outputDir, { recursive: true, force: true });
  }

  public async buildApp() {
    try {
      const outputDir = upath.resolve(
        process.cwd(),
        this.config.outputDir || "./dist",
        "client"
      );
      // const files = glob.sync("**/*.{ts,js,tsx,jsx}", {
      //   cwd: this.baseDir,
      //   ignore: ["**/*.d.ts", "**/*.test.ts", "**/*.spec.ts", "_*/**"],
      // });

      await this.resolveRoutes();

      let appContent = `import React from 'react'\n`;
      appContent += `import { Routes, Route, Outlet, useRouter } from 'mantou/router'\n\n`;

      // Get all unique imports and route data
      const uniqueImports = new Set<string>();
      const routeDataMap = new Map<string, string>();

      this.pageLayouts.forEach((route) => {
        uniqueImports.add(route.element.page);
        route.element.layouts?.forEach((layout) => uniqueImports.add(layout));

        // const matchingRoute = this.routes.find(
        //   (r) => r.path === route.path && r.routeData
        // );
        // if (matchingRoute?.routeData) {
        //   routeDataMap.set(route.path, matchingRoute.filePath);
        // }
      });

      // Generate imports and import map
      const importMap = new Map<string, string>();
      Array.from(uniqueImports).forEach((filePath, index) => {
        const isLayout = filePath.includes("layout");
        const componentName = isLayout ? `Layout${index}` : `Page${index}`;
        importMap.set(filePath, componentName);
        appContent += `import ${componentName} from '${filePath}'\n`;
      });

      function generateTsxRoute(
        path: string,
        layouts: string[],
        page: string
      ): string {
        // Generate the nested layout structure
        let layoutStructure = "";
        for (let i = layouts.length - 1; i >= 0; i--) {
          if (i === layouts.length - 1) {
            // Outer-most layout
            layoutStructure = `<Route path="${path}" element={<${layouts[i]}><Outlet /></${layouts[i]}>}>${layoutStructure}</Route>`;
          } else {
            // Inner layouts
            layoutStructure = `<Route path="" element={<${layouts[i]}><Outlet /></${layouts[i]}>}>${layoutStructure}</Route>`;
          }
        }

        // Add the page as the index route
        const pageRoute = `<Route index element={<${page} data={data} search={search} params={params} />} />`;
        layoutStructure = layoutStructure.replace(
          "</Route>",
          `${pageRoute}</Route>`
        );

        return layoutStructure;
      }

      let routes = [];
      for (let page of this.pages) {
        const layouts = this.getLayoutsByPath(page.path);
        const layoutComponents = layouts.map(
          (layout) => importMap.get(layout.filePath) as string
        );
        const pageComponent = importMap.get(page.filePath) as string;
        routes.push(
          generateTsxRoute(page.path, layoutComponents, pageComponent)
        );
      }

      let routesJSX = "";
      for (let route of routes) {
        routesJSX += route;
      }

      appContent += `\nexport default function App({ data: _data, search: _search, params: _params }: any) {
        const router = useRouter();
        const [data, setData] = React.useState(_data);
        const [search, setSearch] = React.useState(_search);
        const [params, setParams] = React.useState(_params);

        React.useEffect(() => {
        const FETCH_AFTER_ROUTER = process?.env?.MANTOU_PUBLIC_FETCH_AFTER_ROUTER === "true";
        if(FETCH_AFTER_ROUTER) {
          fetch(router.pathname + "?__mantou_only_data=1").then((res) => res.json()).then((r) => {
            setData(r.data);
            setSearch(r.search);
            setParams(r.params);
          }).catch((e: any) => {});
        }else{
          setData(router?.state?.data);
          setSearch(router?.state?.search);
          setParams(router?.state?.params);
        }
          
        }, [router.pathname]);
    return (
      <Routes>${routesJSX}
      </Routes>
    )
  }
  `;

      let indexContent = `
      import React from "react";
      import ReactDOM from "react-dom/client";
      import { BrowserRouter } from "mantou/router";
      import App from "./App";
      
      const initialData = typeof window !== "undefined" ? (window as any).__INITIAL_DATA__ : undefined;
      const initialParams = typeof window !== "undefined" ? (window as any).__INITIAL_PARAMS__ : undefined;
      const initialSearch = typeof window !== "undefined" ? (window as any).__INITIAL_SEARCH__ : undefined;
      const rootElement = document.getElementById("root");
      
      if (!rootElement) throw new Error("Root element not found");
      
      const AppWithRouter = () => (
        <BrowserRouter>
      <App data={initialData} search={initialSearch} params={initialParams} />
        </BrowserRouter>
      );
      
      // In development, set up live reload with reconnect support
      if (process.env.NODE_ENV === "development") {
        const connectWebSocket = () => {
      const ws = new WebSocket(\`ws://\${window.location.host}/live-reload\`);
      
      ws.onmessage = (event) => {
        if (event.data === 'reload') {
          window.location.reload();
        }
      };
      
      ws.onclose = () => {
        setTimeout(connectWebSocket, 100); // Reconnect after 1 second
      };
        };
        
        connectWebSocket();
      
        const root = ReactDOM.createRoot(rootElement);
        root.render(<AppWithRouter />);
      } 
      // In production, hydrate for SSR
      else {
        ReactDOM.hydrateRoot(rootElement, <AppWithRouter />);
      }
      `;

      await writeRecursive(upath.resolve(outputDir, "App.tsx"), appContent);
      await writeRecursive(upath.resolve(outputDir, "index.tsx"), indexContent);

      await Bun.build({
        entrypoints: [upath.resolve(outputDir, "index.tsx")],
        outdir: upath.resolve(outputDir),
      })
        .then(() => {})
        .catch((e) => {
          console.error(e);
        });

      // await fs
      //   .unlink(upath.resolve(outputDir, "index.tsx"))
      //   ?.then(() => {})
      //   .catch(() => {});
    } catch (e) {
      console.error(e);
    }
  }

  private getPathFromLayout(layoutPath: string): string {
    const parts = layoutPath.split("/");
    const layoutDir = parts[parts.length - 2];
    return layoutDir.startsWith("(") ? "/" : `/${layoutDir}`;
  }

  private filePathToRoutePath(filePath: string): string {
    const parsedPath = upath.parse(filePath);
    const relativePath = upath.relative(this.appPath, parsedPath.dir);
    return this.normalizePath(relativePath);
  }

  private async processMiddleware(file: string): Promise<void> {
    const module = await import(path.resolve(`${file}?imported=${Date.now()}`));
    if (this.middlewares.find((middleware) => middleware.filePath === file)) {
      return;
    }
    this.middlewares.push({
      filePath: file,
      path: this.filePathToRoutePath(file),
      handler: module.default.handler,
      guards: module.default.guards ?? [],
    });
  }

  private async processRoute(file: string): Promise<void> {
    const module = await import(
      upath.resolve(`${file}?imported=${Date.now()}`)
    );
    const routePath = this.filePathToRoutePath(file);

    if (this.routes.find((route) => route.path === routePath)) {
      return;
    }

    // Extract route data if it exists
    const routeData = module.data ? { data: module.data } : undefined;

    for (const method of HTTP_METHODS) {
      if (method in module) {
        this.routes.push({
          filePath: file,
          path: routePath,
          method,
          handler: module[method]?.handler,
          config: module[method]?.config,
          guards: module[method]?.guards ?? [],
        });
      }
    }

    // If there's only data export (no HTTP methods), still create a route
    if (!HTTP_METHODS.some((method) => method in module) && module.data) {
      this.routes.push({
        filePath: file,
        path: routePath,
        method: "get",
        handler: async () => ({}),
        config: {} as R,
        guards: [],
      });
    }
  }

  private async processPage(file: string): Promise<void> {
    if (this.pages.find((page) => page.filePath === file)) {
      return;
    }
    this.pages.push({
      filePath: file,
      path: this.filePathToRoutePath(file),
    });
  }

  private async processLayout(file: string): Promise<void> {
    if (this.layouts.find((layout) => layout.filePath === file)) {
      return;
    }
    for (const existingLayout of this.layouts.sort(
      (a, b) => a.filePath.split("/").length + b.filePath.split("/").length
    )) {
      if (file.includes(existingLayout.filePath)) {
        if (!existingLayout.children) {
          existingLayout.children = [];
        }

        existingLayout.children.push({
          filePath: file,
          path: this.filePathToRoutePath(file),
        });
        return;
      }
    }

    this.layouts.push({
      filePath: file,
      path: this.filePathToRoutePath(file),
    });
  }

  private async processWsRoute(file: string): Promise<void> {
    const module = await import(`${file}?imported=${Date.now()}`);
    const routePath = this.filePathToRoutePath(file);

    if (this.wsRoutes.find((route) => route.path === routePath)) {
      return;
    }

    for (const method of HTTP_METHODS) {
      if (method in module) {
        this.wsRoutes.push({
          filePath: file,
          path: routePath,
          onMessage: module.default?.handler,
          config: module.default?.config,
          guards: module.default?.guards ?? [],
        });
      }
    }
  }

  async resolveRoutes(): Promise<{
    middlewares: MiddlewareConfig[];
    routes: Route[];
    pages: Page[];
    wsRoutes: WsRoute[];
    layouts: Layout[];
  }> {
    this.pathMap.clear();

    const cwd = upath.resolve(this.baseDir, this.config.appDir || "");
    const files = await glob("**/*.{ts,js,tsx,jsx}", {
      cwd: upath.resolve(this.appPath),
      ignore: [
        "**/*.d.ts",
        "**/*.test.ts",
        "**/*.spec.ts",
        "_*/**",
        "**/node_modules/**",
      ],
    });

    // Process middlewares first
    await Promise.all(
      files
        .filter((file) => file.includes("middleware."))
        .map((file) =>
          this.processMiddleware(upath.resolve(this.appPath, file))
        )
    );

    // Then process routes
    await Promise.all(
      files
        .filter((file) => file.includes("route."))
        .map(async (file) => {
          const resolvedPath = this.filePathToRoutePath(
            upath.resolve(this.appPath, file)
          );

          if (this.pathMap.has(resolvedPath)) {
            throw new Error(
              `Path collision detected: ${resolvedPath} in ${file} and ${this.pathMap.get(
                resolvedPath
              )}`
            );
          }

          this.pathMap.set(resolvedPath, file);
          await this.processRoute(upath.resolve(this.appPath, file));
        })
    );

    // Process layouts before pages
    await Promise.all(
      files
        .filter((file) => file.includes("layout."))
        .map((file) => this.processLayout(upath.resolve(this.appPath, file)))
    );

    // Finally process pages
    await Promise.all(
      files
        .filter((file) => file.includes("page."))
        .map((file) => this.processPage(upath.resolve(this.appPath, file)))
    );

    // Process ws routes
    await Promise.all(
      files
        .filter((file) => file.includes("msg."))
        .map((file) => this.processWsRoute(upath.resolve(this.appPath, file)))
    );

    // Merge pages into layouts
    this.pageLayouts = await this.combinePageLayouts(this.layouts, this.pages);

    // check duplicate paths
    for (const pageLayout of this.pageLayouts) {
      const path = pageLayout.path;
      if (this.pageLayouts.filter((p) => p.path === path).length > 1) {
        throw new Error(
          `Duplicate path: ${path} in ${pageLayout.element.page}`
        );
      }
    }

    return {
      middlewares: this.middlewares,
      routes: this.routes,
      pages: this.pages,
      layouts: this.layouts,
      wsRoutes: this.wsRoutes,
    };
  }

  public matchParentOrDynamicPath(
    path: string,
    routePath: string
  ): {
    isMatch: boolean;
    params: Record<string, string>;
  } {
    return (
      this.matchParentPath(path, routePath) ||
      this.matchDynamicPath(path, routePath)
    );
  }

  public matchParentPath(
    path: string,
    routePath: string
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

  private matchDynamicPath(
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

  public getRouteByPath(path: string): Route | undefined {
    return this.routes.find(
      (route) => this.matchDynamicPath(path, route.path).isMatch
    );
  }

  public getPathParams(
    path: string,
    routePath: string
  ): Record<string, string> {
    return this.matchDynamicPath(path, routePath).params;
  }

  public getLayoutsByPath(path: string): Layout[] | [] {
    const pageFilePath = this.getPageByPath(path)?.filePath || "";
    return this.layouts
      .filter(
        (layout) => this.matchParentOrDynamicPath(path, layout.path).isMatch
      )
      .filter((layout) => {
        const isParent = pageFilePath
          .replace("page.tsx", "")
          .startsWith(layout.filePath.replace("layout.tsx", ""));
        return isParent;
      });
  }

  public getMiddlewaresByPath(
    path: string,
    type: "page" | "routes"
  ): MiddlewareConfig[] {
    const filePath =
      type === "page"
        ? this.getPageByPath(path)?.filePath
        : this.getRouteByPath(path)?.filePath;
    return this.middlewares
      .filter(
        (middleware) =>
          this.matchParentOrDynamicPath(path, middleware.path).isMatch
      )
      .filter((middleware) => {
        const isParent = filePath
          ?.replace("page.tsx", "")
          .startsWith(middleware.filePath.replace("middleware.tsx", ""));
        return isParent;
      });
  }

  public getPageByPath(path: string): Page | undefined {
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
