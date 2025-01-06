import { Elysia, type Static, type TSchema } from "elysia";
import { glob } from "glob";
import path from "path";
import { swagger } from "@elysiajs/swagger";
import type { ServerOptions } from "@/types/server";
import React, { createElement, lazy, Suspense } from "react";
import { App } from "./components";
import ServerReactDOM from "react-dom/server";
import { writeFile } from "fs/promises";
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
    cookie: (
      name: string,
      value: string,
      options?: Record<string, any>
    ) => void;
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

interface Route<TConfig extends HandlerConfig = any> {
  filePath: string;
  path: string;
  method: HttpMethod;
  handler: RouteHandlerFunction<TConfig>;
  config: TConfig;
  guards: Guard[];
}

interface BasePath {
  filePath: string;
  path: string;
}

interface Page extends BasePath {}

interface Layout extends BasePath {
  children?: (Page | Layout)[];
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
  query: TConfig["query"] extends TSchema
    ? Static<TConfig["query"]>
    : undefined;
  params: TConfig["params"] extends TSchema
    ? Static<TConfig["params"]>
    : undefined;
};

type RouteHandlerFunction<TConfig extends HandlerConfig> = (
  ctx: Context<TConfig>
) => Promise<any> | any;

// Constants
const HTTP_METHODS: readonly HttpMethod[] = [
  "get",
  "post",
  "put",
  "patch",
  "delete",
];
// Route Resolution
export class RouteResolver<M extends HandlerConfig, R extends HandlerConfig> {
  private readonly routesDir: string;
  private readonly pathMap = new Map<string, string>();
  public middlewares: MiddlewareConfig<M>[] = [];
  public routes: Route<R>[] = [];
  public pages: Page[] = [];
  public layouts: Layout[] = [];
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

  private async recursiveGetImportStatement(layout: Layout, index: number, pageIndex: number): Promise<string> {
    let content = "";
    if (layout.children) {
      content += `import LAYOUT_${index} from "${layout.filePath}";\n`;
      for (const [childIndex, child] of layout.children.entries()) {
        content += await this.recursiveGetImportStatement(child, index + 1, pageIndex + childIndex);
      }
    } else {
      content += `import PAGE_${pageIndex} from "${layout.filePath}";\n`;
      pageIndex++;
    }

    return content;
  }

  public async buildApp() {
    const outputDir = path.resolve(process.cwd(), this.config.outputDir || "./dist");
    const files = glob.sync("**/*.{ts,js,tsx,jsx}", {
      cwd: this.routesDir,
      ignore: ["**/*.d.ts", "**/*.test.ts", "**/*.spec.ts", "_*/**"],
    });

    await this.resolveRoutes();

    let appContent = ``;

    // build App.tsx (React Router)
    // console.log(this.layouts);
    for (const layout of this.layouts) {
      appContent += await this.recursiveGetImportStatement(layout, 0, 0);
    }
    // console.log(appContent);
    appContent += `
    import React from 'react'
export default function App() {
    const [count, setCount] = React.useState(0)
  return (
     <html>
            <head>
                <meta charSet='utf-8' />
                <title>React app</title>
                <meta name='viewport' content='width=device-width, initial-scale=1' />
            </head>
            <body>
                <h1>Test Page</h1>
                <h2>Counter {count}</h2>
                <button onClick={() => setCount(count + 1)}>Increment</button>
            </body>
        </html>
  )
  }

  export { React }
    `

  //   <Routes>
  //   ${this.layouts.map((layout, index) => {
  //     return layout.children ? `
  //     <Route path="${layout.path}" element={<LAYOUT_${index}/>}>
  //         ${layout.children.map((child, childIndex) => {
  //           return `
  //           <Route path="${child.path}" element={<PAGE_${index + childIndex}/>}/>
  //           `
  //         }).join('\n')}
  //     </Route>
  //     `
  //     : ``
  //   }).join('\n')}
  // </Routes>
    let indexContent = ``

    indexContent += `
import { hydrateRoot } from 'react-dom/client'
import App from './App'

hydrateRoot(document, <App />)
`

let serverContent = `

    
import { startServer, loadConfig } from 'mantou'
import App from './App'

async function serverStart(){
  const loadedConfig = await loadConfig('./mantou.config.ts')
  await startServer(loadedConfig, App)
}

serverStart()


`



    await writeRecursive(path.resolve(outputDir, "App.tsx"), appContent);
    await writeRecursive(path.resolve(outputDir, "index.tsx"), indexContent);
    await writeRecursive(path.resolve(outputDir, "server.ts"), serverContent);
    await Bun.build({
      entrypoints: [path.resolve(outputDir, "App.tsx")],
      outdir: path.resolve(outputDir),
      external: ['react', 'react-dom', 'react-router', 'react-router-dom'],
    })
    await Bun.build({
      entrypoints: [path.resolve(outputDir, "index.tsx")],
      outdir: path.resolve(outputDir),
      // external: ['react', 'react-dom', 'react-router', 'react-router-dom'],
    });

    await Bun.build({
      entrypoints: [path.resolve(outputDir, "server.ts")],
      outdir: path.resolve(outputDir),
      target: "bun",
      external: ['react', 'react-dom', 'react-router', 'react-router-dom'],
    })
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
  }

  getComponentPath(filePath: string, baseDir = "./src"): string {
    return path.resolve(baseDir, filePath.replace(/\.tsx?$/, ""));
  }

  createRoutes(node: Page | Layout): any {
    // const isLayout = "children" in node;
    // const componentPath = this.getComponentPath(
    //   node.filePath,
    //   this.config.baseDir
    // );

    // // Create lazy loaded component
    // const Component = lazy(() => import(componentPath));

    // if (isLayout) {
    //   const layout = node as Layout;
    //   return {
    //     path: layout.path === "/" ? "/" : layout.path.replace(/^\//, ""),
    //     type: "layout",
    //     element: (
    //       <Route path={layout.path}>
    //         <React.Suspense fallback={<div>Loading...</div>}>
    //           <Component>
    //             {layout.children?.map(
    //               (child) => this.createRoutes(child).element
    //             )}
    //           </Component>
    //         </React.Suspense>
    //       </Route>
    //     ),
    //     children: layout.children?.map((child) => this.createRoutes(child)),
    //   };
    // } else {
    //   return {
    //     path: node.path === "/" ? "/" : node.path.replace(/^\//, ""),
    //     type: "page",
    //     element: (
    //       <Route path={node.path}>
    //         <React.Suspense fallback={<div>Loading...</div>}>
    //           <Component />
    //         </React.Suspense>
    //       </Route>
    //     ),
    //   };
    // }
  }

  createRouterConfig(layouts: Layout[], pages: Page[]) {
    // First merge pages into layouts
    const merged = this.mergePagesIntoLayouts(layouts, pages);

    // Create routes for merged structure
    const routes = merged.map((node) => this.createRoutes(node));

    return routes;
  }

  mergePagesIntoLayouts(layouts: Layout[], pages: Page[]): (Page | Layout)[] {
    const result = [...layouts];

    // Helper function to check if a path has a corresponding layout
    function hasMatchingLayout(path: string, layoutNodes: Layout[]): boolean {
      for (const node of layoutNodes) {
        if (node.path === path) return true;
        if (node.children) {
          const hasMatchingChild = node.children.some(
            (child) =>
              "children" in child && hasMatchingLayout(path, [child as Layout])
          );
          if (hasMatchingChild) return true;
        }
      }
      return false;
    }

    // Helper function to find the appropriate parent layout
    function findParentLayout(
      path: string,
      nodes: (Page | Layout)[]
    ): Layout | null {
      // Direct match
      const directMatch = nodes.find((node) => node.path === path);
      if (directMatch && "children" in directMatch)
        return directMatch as Layout;

      // Find the closest parent path
      let bestMatch: Layout | null = null;
      let bestMatchLength = -1;

      for (const node of nodes) {
        if (path.startsWith(node.path) && node.path.length > bestMatchLength) {
          if ("children" in node) {
            bestMatch = node as Layout;
            bestMatchLength = node.path.length;
          }
        }

        // Recursively search in children
        if ("children" in node) {
          if (node.children) {
            const childMatch = findParentLayout(path, node.children);
            if (childMatch) {
              if (
                !bestMatch ||
                childMatch.path.length > bestMatch.path.length
              ) {
                bestMatch = childMatch;
              }
            }
          }
        }
      }

      return bestMatch;
    }

    // Process each page
    for (const page of pages) {
      // Skip if the page already has a matching layout
      if (hasMatchingLayout(page.path, layouts)) {
        continue;
      }

      const parentDir =
        page.path === "/"
          ? ""
          : page.path.substring(0, page.path.lastIndexOf("/"));
      const parent = findParentLayout(parentDir, result);

      if (parent) {
        if (!parent.children) {
          parent.children = [];
        }
        parent.children.push({ ...page });
      } else {
        // If no parent found, add to root level
        result.push({ ...page });
      }
    }
    return result;
  }

  private async processPage(file: string): Promise<void> {
    const module = await import(file);
    this.pages.push({
      filePath: file,
      path: this.filePathToRoutePath(file),
    });
  }

  private async processLayout(file: string): Promise<void> {
    const module = await import(file);

    for (const existingLayout of this.layouts.sort(
      (a, b) => a.filePath.split("/").length - b.filePath.split("/").length
    )) {
      if (file.includes(existingLayout.path)) {
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
    this.layouts = this.mergePagesIntoLayouts(this.layouts, this.pages);

    return {
      middlewares: this.middlewares,
      routes: this.routes,
      pages: this.pages,
      layouts: this.layouts,
    };
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
