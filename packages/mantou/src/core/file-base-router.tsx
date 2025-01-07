import { Elysia, type Static, type TSchema } from "elysia";
import { glob } from "glob";
import path from "path";
import type { ServerOptions } from "@/types/server";
import fs from "fs/promises";
import { writeRecursive } from "@/lib/fs";

// Types
type HttpMethod = "get" | "post" | "put" | "patch" | "delete";
type ContentType =
  | "text"
  | "json"
  | "formdata"
  | "urlencoded"
  | "text/plain"
  | "application/json"
  | "multipart/form-data"
  | "application/x-www-form-urlencoded";

interface BaseContext {
  app: any;
  request: Request;
  path: string;
  set: {
    headers: (headers: Record<string, string>) => void;
    status: (status: number) => void;
    cookie: (name: string, value: string, options?: Record<string, any>) => void;
  };
  store: Record<string, any>;
  url: string;
  route: string;
  headers: Record<string, string>;
}

interface HandlerConfig {
  body?: TSchema;
  query?: TSchema;
  params?: TSchema;
  response?: TSchema;
  detail?: Record<string, any>;
  type?: ContentType;
  [key: string]: any;
}

interface RouteData {
  data?: () => Promise<any> | any;
}

interface Route<TConfig extends HandlerConfig = any> {
  filePath: string;
  path: string;
  method: HttpMethod;
  handler: RouteHandlerFunction<TConfig>;
  config: TConfig;
  guards: Guard[];
  routeData?: RouteData;
}

interface BasePath {
  filePath: string;
  path: string;
}

interface Page extends BasePath {}

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

interface RouteNode {
  layout: string;
  path: string;
  children: Map<string, RouteNode>;
  pages: Array<{
    path: string;
    page: string;
  }>;
}

export interface Guard {
  handler: RouteHandlerFunction<any>;
  config?: HandlerConfig;
}

interface MiddlewareConfig<TConfig extends HandlerConfig = any> {
  filePath: string;
  path: string;
  handler: RouteHandlerFunction<TConfig>;
}

type Context<TConfig extends HandlerConfig> = BaseContext & {
  body: TConfig["body"] extends TSchema ? Static<TConfig["body"]> : undefined;
  query: TConfig["query"] extends TSchema ? Static<TConfig["query"]> : undefined;
  params: TConfig["params"] extends TSchema ? Static<TConfig["params"]> : undefined;
};

type RouteHandlerFunction<TConfig extends HandlerConfig> = (
  ctx: Context<TConfig>
) => Promise<any> | any;

// Constants
const HTTP_METHODS: readonly HttpMethod[] = ["get", "post", "put", "patch", "delete"];

// Route Resolution
export class RouteResolver<M extends HandlerConfig, R extends HandlerConfig> {
  private readonly routesDir: string;
  private readonly pathMap = new Map<string, string>();
  public middlewares: MiddlewareConfig<M>[] = [];
  public routes: Route<R>[] = [];
  public pages: Page[] = [];
  public layouts: Layout[] = [];
  public pageLayouts: PageLayout[] = [];
  public config: ServerOptions = {};

  constructor(config: ServerOptions) {
    this.config = config;
    this.routesDir = path.resolve(process.cwd(), config?.baseDir || "./src");
  }

  private normalizePath(rawPath: string): string {
    return (
      rawPath
        .replace(/\\/g, "/")
        .replace(/\.ts$|\.js$/, "")
        .replace(/\/index$/, "")
        .replace(/\/route$/, "")
        .replace(/\[\.{3}(.*?)\]/, ":$1*")
        .replace(/\[(.*?)\]/g, ":$1")
        .replace(/^\/+|\/+$/g, "")
        .replace(/\((.*?)\)/g, "")
        .replace(/\/+/g, "/")
        .replace(/\/$/, "") || "/"
    );
  }

  getRouteGroup(filePath: string): string {
    const match = filePath.match(/src\/\((.*?)\)/);
    return match ? match[1] : '';
  }

  findMatchingLayouts(page: Page, layouts: Layout[]): string[] {
    const pageGroup = this.getRouteGroup(page.filePath);
    const pagePath = page.path;
    
    const rootLayout = layouts.find(layout => 
      this.getRouteGroup(layout.filePath) === pageGroup && 
      layout.path === "/"
    );
  
    const matchingLayouts = layouts
      .filter(layout => {
        if (layout === rootLayout) return false;
        
        const layoutGroup = this.getRouteGroup(layout.filePath);
        if (layoutGroup !== pageGroup) return false;
        
        return pagePath === layout.path || pagePath.startsWith(layout.path + '/');
      })
      .sort((a, b) => b.path.length - a.path.length)
      .map(layout => layout.filePath);
  
    if (rootLayout) {
      matchingLayouts.push(rootLayout.filePath);
    }
  
    return matchingLayouts;
  }

  public async combinePageLayouts(layouts: Layout[], pages: Page[]): Promise<PageLayout[]> {
    const combinedRoutes: PageLayout[] = [];
  
    pages.forEach(page => {
      const matchingLayouts = this.findMatchingLayouts(page, layouts);
      combinedRoutes.push({
        path: page.path,
        element: {
          page: page.filePath,
          layouts: matchingLayouts
        }
      });
    });
  
    return combinedRoutes;
  }

  public async buildApp() {
    const outputDir = path.resolve(process.cwd(), this.config.outputDir || "./dist");
    const files = glob.sync("**/*.{ts,js,tsx,jsx}", {
      cwd: this.routesDir,
      ignore: ["**/*.d.ts", "**/*.test.ts", "**/*.spec.ts", "_*/**"],
    });

    await this.resolveRoutes();

    let appContent = `import React from 'react'\n`;
    appContent += `import { Routes, Route, Outlet } from 'react-router'\n\n`;

    // Get all unique imports and route data
    const uniqueImports = new Set<string>();
    const routeDataMap = new Map<string, string>();

    this.pageLayouts.forEach(route => {
      uniqueImports.add(route.element.page);
      route.element.layouts?.forEach(layout => uniqueImports.add(layout));

      const matchingRoute = this.routes.find(r => r.path === route.path && r.routeData);
      if (matchingRoute?.routeData) {
        routeDataMap.set(route.path, matchingRoute.filePath);
      }
    });

    // Generate imports and import map
    const importMap = new Map<string, string>();
    Array.from(uniqueImports).forEach((filePath, index) => {
      const isLayout = filePath.includes('layout');
      const componentName = isLayout ? `Layout${index}` : `Page${index}`;
      importMap.set(filePath, componentName);
      appContent += `import ${componentName} from '${filePath}'\n`;
    });

    // Group routes by root layout
    const groupRoutes = () => {
      const groups = new Map<string, PageLayout[]>();
      
      this.pageLayouts.forEach(route => {
        const rootLayout = route.element.layouts?.[route.element.layouts.length - 1];
        if (rootLayout) {
          const group = this.getRouteGroup(rootLayout);
          if (!groups.has(group)) {
            groups.set(group, []);
          }
          groups.get(group)!.push(route);
        }
      });
      
      return groups;
    };

    // Generate routes for a group
    const generateGroupRoutes = (routes: PageLayout[]): string => {
      if (routes.length === 0) return '';

      const rootLayout = routes[0].element.layouts?.[routes[0].element.layouts.length - 1];
      if (!rootLayout) return '';

      const rootLayoutComponent = importMap.get(rootLayout);
      let jsxContent = `\n        <Route path="" element={<${rootLayoutComponent}><Outlet /></${rootLayoutComponent}>}>`;

      const getNestedPath = (fullPath: string, parentPath: string) => {
        if (fullPath === '/') return '';
        return parentPath === '/' ? fullPath.slice(1) : fullPath.slice(parentPath.length + 1);
      };

      const addInitialData = (path: string) => {
        if(routeDataMap.has(path)) {
          return `data={data}`;
        }else{
          return '';
        }
      }

      routes.forEach(route => {
        const { page, layouts = [] } = route.element;
        const pageComponent = importMap.get(page);

        if (route.path === '/') {
          jsxContent += `\n          <Route index element={<${pageComponent} ${addInitialData(route.path)} />} />`;
        } else if (layouts.length === 1) {
          jsxContent += `\n          <Route path="${route.path.slice(1)}" element={<${pageComponent} ${addInitialData(route.path)} />} />`;
        } else {
          let currentPath = '/';
          for (let i = layouts.length - 2; i >= 0; i--) {
            const layout = layouts[i];
            const layoutComponent = importMap.get(layout);
            const layoutPath = this.getPathFromLayout(layout);
            const nestedPath = getNestedPath(layoutPath, currentPath);
            
            if (i === 0) {
              const finalPath = getNestedPath(route.path, layoutPath);
              jsxContent += `\n          <Route path="${nestedPath}" element={<${layoutComponent} ${addInitialData(route.path)}><Outlet ${addInitialData(route.path)} /></${layoutComponent}>}>`;
              jsxContent += `\n            <Route path="${finalPath}" element={<${pageComponent} ${addInitialData(route.path)} />} />`;
              jsxContent += `\n          </Route>`;
            } else {
              jsxContent += `\n          <Route path="${nestedPath}" element={<${layoutComponent} ${addInitialData(route.path)}><Outlet ${addInitialData(route.path)} /></${layoutComponent}>}>`;
            }
            currentPath = layoutPath;
          }
        }
      });

      jsxContent += '\n        </Route>';
      return jsxContent;
    };

    const routeGroups = groupRoutes();
    let routesJSX = '';
    routeGroups.forEach((routes) => {
      routesJSX += generateGroupRoutes(routes);
    });

    appContent += `\nexport default function App({ data }: any) {
  return (
    <Routes>${routesJSX}
    </Routes>
  )
}
`;

    let indexContent = `
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import App from "./App";

const initialData = typeof window !== "undefined" ? window.__INITIAL_DATA__ : undefined;
const root = document.getElementById("root");

ReactDOM.createRoot(root).render(
  <BrowserRouter>
    <App data={initialData}/>
  </BrowserRouter>
);
`;

    await writeRecursive(path.resolve(outputDir, "App.tsx"), appContent);
    await writeRecursive(path.resolve(outputDir, "index.tsx"), indexContent);
    
    await Bun.build({
      entrypoints: [path.resolve(outputDir, "index.tsx")],
      outdir: path.resolve(outputDir),
    });
    
    await fs.unlink(path.resolve(outputDir, "index.tsx"));
  }

  private getPathFromLayout(layoutPath: string): string {
    const parts = layoutPath.split('/');
    const layoutDir = parts[parts.length - 2];
    return layoutDir.startsWith('(') ? '/' : `/${layoutDir}`;
  }

  private filePathToRoutePath(filePath: string): string {
    const parsedPath = path.parse(filePath);
    const relativePath = path.relative(this.routesDir, parsedPath.dir);
    return this.normalizePath(relativePath);
  }

  private async processMiddleware(file: string): Promise<void> {
    const module = await import(file);
    this.middlewares.push({
      filePath: file,
      path: this.filePathToRoutePath(file),
      handler: module.default,
    });
  }

  private async processRoute(file: string): Promise<void> {
    const module = await import(file);
    const routePath = this.filePathToRoutePath(file);

    if(this.routes.find(route => route.path === routePath)) {
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
          routeData
        });
      }
    }

    // If there's only data export (no HTTP methods), still create a route
    if (!HTTP_METHODS.some(method => method in module) && module.data) {
      this.routes.push({
        filePath: file,
        path: routePath,
        method: 'get',
        handler: async () => ({}),
        config: {} as R,
        guards: [],
        routeData: { data: module.data }
      });
    }
  }

  private async processPage(file: string): Promise<void> {
    if(this.pages.find(page => page.filePath === file)) {
      return;
    }
    this.pages.push({
      filePath: file,
      path: this.filePathToRoutePath(file),
    });
  }

  private async processLayout(file: string): Promise<void> {
    if(this.layouts.find(layout => layout.filePath === file)) {
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

  async resolveRoutes(): Promise<{
    middlewares: MiddlewareConfig[];
    routes: Route[];
    pages: Page[];
    layouts: Layout[];
  }> {
    this.pathMap.clear();

    const files = await glob("**/*.{ts,js,tsx,jsx}", {
      cwd: this.routesDir,
      ignore: ["**/*.d.ts", "**/*.test.ts", "**/*.spec.ts", "_*/**"],
    });

    // Process middlewares first
    await Promise.all(
      files
        .filter((file) => file.includes("middleware."))
        .map((file) =>
          this.processMiddleware(path.resolve(this.routesDir, file))
        )
    );

    // Then process routes
    await Promise.all(
      files
        .filter((file) => file.includes("route."))
        .map(async (file) => {
          const resolvedPath = this.filePathToRoutePath(
            path.resolve(this.routesDir, file)
          );

          if (this.pathMap.has(resolvedPath)) {
            throw new Error(
              `Path collision detected: ${resolvedPath} in ${file} and ${this.pathMap.get(
                resolvedPath
              )}`
            );
          }

          this.pathMap.set(resolvedPath, file);
          await this.processRoute(path.resolve(this.routesDir, file));
        })
    );

    // Process layouts before pages
    await Promise.all(
      files
        .filter((file) => file.includes("layout."))
        .map((file) => this.processLayout(path.resolve(this.routesDir, file)))
    );

    // Finally process pages
    await Promise.all(
      files
        .filter((file) => file.includes("page."))
        .map((file) => this.processPage(path.resolve(this.routesDir, file)))
    );

    // Merge pages into layouts
    this.pageLayouts = await this.combinePageLayouts(this.layouts, this.pages);

    // check duplicate paths
    for(const pageLayout of this.pageLayouts) {
      const path = pageLayout.path;
      if(this.pageLayouts.filter(p => p.path === path).length > 1) {
        throw new Error(`Duplicate path: ${path} in ${pageLayout.element.page}`);
      }
    }
    
    return {
      middlewares: this.middlewares,
      routes: this.routes,
      pages: this.pages,
      layouts: this.layouts,
    };
  }

  public getRouteByPath(path: string): Route | undefined {
    return this.routes.find((route) => route.path === path);
  }
}

// Helper Functions
export function handler<
  TBody extends TSchema,
  TQuery extends TSchema,
  TParams extends TSchema
>(
  fn: RouteHandlerFunction<{
    body: TBody;
    query: TQuery;
    params: TParams;
  }>,
  config?: {
    body?: TBody;
    query?: TQuery;
    params?: TParams;
    response?: TSchema;
    detail?: Record<string, any>;
    type?: ContentType;
    [key: string]: any;
  },
  guards: Guard[] = []
) {
  return { handler: fn, config, guards };
}

export function guard<TConfig extends HandlerConfig>(
  fn: RouteHandlerFunction<TConfig>,
  config?: TConfig
) {
  return { handler: fn, config };
}

export type { HandlerConfig, Context, ContentType, RouteHandlerFunction };