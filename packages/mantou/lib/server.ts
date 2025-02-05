import dotenv from "dotenv";
dotenv.config();
import { Elysia, file, redirect, type TSchema } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { logger } from "./logger";
import _ from "lodash";
import cors from "@elysiajs/cors";
import type { ServerOptions, MantouPlugin } from "mantou/types";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import { staticPlugin } from "@elysiajs/static";
import { glob } from "glob";
import fs from "fs/promises";
import upath, { resolve } from "upath";
import { loadConfig } from "./config";
import { RouteResolver } from "./file-base-router";
import ReactDomServer from "react-dom/server";
import React from "react";
import { StaticRouter} from "mantou/router";

const ajv = addFormats(
  new Ajv({
    removeAdditional: true,
    useDefaults: true,
    coerceTypes: true,
    allErrors: true,
  }),
  [
    "date-time",
    "time",
    "date",
    "email",
    "hostname",
    "ipv4",
    "ipv6",
    "uri",
    "uri-reference",
    "uuid",
    "uri-template",
    "json-pointer",
    "relative-json-pointer",
    "regex",
  ]
);

function validateSchema(
  schema: TSchema | undefined,
  data: any
): {
  valid: boolean;
  errors?: any;
} {
  if (!schema) return { valid: true };

  const validate = ajv.compile(schema);
  const valid = validate(data);

  return valid ? { valid } : { valid, errors: validate.errors };
}

// Route Building
export async function buildRoutes(
  app: Elysia,
  config?: ServerOptions
): Promise<Elysia> {
  const resolver = new RouteResolver(config || {});
  const { routes, middlewares } = await resolver.resolveRoutes();

  await resolver.cleanOutputDir();

  config?.plugins?.forEach(async (plugin) => {
    if (plugin.beforeBuild) {
      await plugin.beforeBuild(config);
    }
  });

  await resolver.buildApp();

  // await loadProjectReact(process.cwd());

  app.onBeforeHandle(async (context) => {
    const middlewarePaths = middlewares.map((m) => m.path);
    const route = resolver.getRouteByPath(context.path);
    const page = resolver.getPageByPath(context.path);
    const hasPage = !!page || (route && context.request.method === "GET");
    if (!route || hasPage) {
      return;
    }
    const applicableMiddlewares = middlewarePaths.filter(
      (path) =>
        context.path.startsWith(path) && context.path.startsWith(route?.path)
    );

    if (applicableMiddlewares.length === 0) {
      return;
    }

    const sortedMiddlewares = applicableMiddlewares.sort(
      (a, b) => a.split("/").length - b.split("/").length
    );

    for (const middlewarePath of sortedMiddlewares) {
      const middleware = middlewares.find((m) => m.path === middlewarePath);
      const page = resolver.getPageByPath(context.path);
      if (middleware) {
        await middleware.handler(context);
      }
    }
  });

  async function handlePage(ctx: any) {
    const ImportedApp = await import(
      upath.resolve(
        config?.outputDir || "./dist",
        `App.tsx?imported=${Date.now()}`
      )
    );
    const Component = ImportedApp.default;

    // if (!projectReact || !projectReactDOMServer || !projectReactRouter) {
    //   await loadProjectReact(process.cwd());
    // }

    // const layouts = resolver.getLayoutByPath(ctx.path);
    const _loaded_layouts = await Promise.all(
      resolver.getLayoutsByPath(ctx.path)
    );
    _loaded_layouts.sort(
      (a, b) => a.path.split("/").length - b.path.split("/").length
    );
    const _nearestLayout = _loaded_layouts[0];
    const layouts = Promise.all(
      _loaded_layouts.map(async (layout) => {
        return await import(layout.filePath + `?imported=${Date.now()}`)
          .then((layout) => layout)
          .catch((e) => {
            console.error("Failed to load layout", e);
            return null;
          });
      })
    );
    const layout = await import(
      _nearestLayout.filePath + `?imported=${Date.now()}`
    )
      .then((layout) => layout)
      .catch((e) => {
        console.error("Failed to load layout", e);
        return null;
      });
    const page = await import(
      upath.resolve(
        resolver.getPageByPath(ctx.path)?.filePath + `?imported=${Date.now()}`
      )
    )
      .then((page) => page)
      .catch((e) => {
        console.error("Failed to load page", e);
        return null;
      });

    const getServerSideData = page?.getServerSideData || (() => ({}));

    const data = await getServerSideData(ctx)
      ?.then?.((data: any) => data)
      .catch((e: any) => {
        const type = e?.type;
        if (type === "mantou/redirect") {
          return { status: 404, message: "Not Found" };
        }
        console.error("Failed to load data", e);
        return null;
      });

    const layoutMetadata = layout?.metadata || {};
    const pageMetadata = page?.metadata || {};

    const layoutGenerateMetadata = layout?.generateMetadata || (() => ({}));
    const pageGenerateMetadata = page?.generateMetadata || (() => ({}));

    const staticMetadata = _.merge({}, layoutMetadata, pageMetadata);

    const dynamicMetadata = _.merge(
      {},
      layoutGenerateMetadata(ctx),
      pageGenerateMetadata(ctx)
    );

    const metadata = _.merge({}, staticMetadata, dynamicMetadata);

    const params = ctx.params || {};
    const query = ctx.query || {};

    const originalConsole = console;
    console.log = () => {};
    console.error = () => {};

    let content = "";
    try {
      content = ReactDomServer?.renderToString(
        React?.createElement(
          StaticRouter,
          {
            location: ctx.path,
          },
          React.createElement(Component, { data, params, query })
        )
      );
    } catch (e) {
      // originalConsoleLog(e);
    } finally {
      console.log = originalConsole.log;
      console.error = originalConsole.error
    }

    const csss = glob
      .sync(upath.join(process.cwd(), "dist", "*.css"))
      .map((file) => {
        return `<link rel="stylesheet" href="/dist/${upath.basename(file)}">`;
      })
      .join("\n");

    const loadedHTML = await fs.readFile(
      upath.resolve(process.cwd(), "public/index.html"),
      "utf-8"
    );

    const frontend_envs = Object.keys(process.env)
      .filter((key) => key.startsWith("MANTOU_PUBLIC_"))
      .reduce((acc, key) => {
        const newKey = key;
        acc[newKey] = process.env[key];
        return acc;
      }, {} as any);

    const html = loadedHTML
      .replace(
        "<!-- mantou_header -->",
        `
        <title>${metadata.title || "Mantou | Fullstack React Framework"}</title>
        <meta name="description" content="${
          metadata.description ||
          "Mantou is a fullstack React framework that makes building web applications a breeze."
        }">
        ${Object.keys(metadata)
          .map((key) => {
            if (key === "title" || key === "description") return "";
            return `<meta name="${key}" content="${metadata[key]}">`;
          })
          .join("\n")}
        ${csss}
      `
      )
      .replace("<!-- mantou_root -->", content || "")
      .replace(
        "<!--  mantou_script -->",
        `
        <script src="/dist/index.js" type="module"></script>
        <script>
          window.__INITIAL_DATA__ = ${JSON.stringify(data)}
          window.__INITIAL_PARAMS__ = ${JSON.stringify(params)}
          window.__INITIAL_QUERY__ = ${JSON.stringify(query)}
          process = {}
          process.env = {
            ...process.env,
            ...${JSON.stringify(frontend_envs)}
          }
        </script>
        `
      );

    return new Response(html, {
      headers: { "Content-Type": "text/html" },
    });
  }

  for (const page of resolver.pages) {
    app.get(
      page.path,
      async (ctx) => {
        try {
          return await handlePage(ctx);
        } catch (e: any) {
          if (e?.type === "mantou/redirect") {
            return redirect(e.url, e.status || 302);
          } else {
            console.error(e);
            return new Response("Internal Server Error", {
              status: 500,
            });
          }
        }
      },
      {
        detail: {
          hide: true,
        },
      }
    );
  }
  for (const route of routes) {
    const routePath = route.path?.startsWith("/")
      ? route.path
      : `/${route.path}`;
    const existingPage = resolver.pages.find((page) => page.path === routePath);
    if (existingPage && route.method === "get") {
      continue;
    }
    (app as any)[route.method](
      routePath,
      async (ctx: any) => {
        const handler = await import(
          `${route.filePath}?imported=${Date.now()}`
        );
        return await handler[route.method]?.handler(ctx);
      },
      {
        beforeHandle: async (context: any) => {
          // Apply matching middlewares
          const applicableMiddlewares = middlewares
            .filter((middleware) => context.path.startsWith(middleware.path))
            .sort(
              (a, b) =>
                a.filePath.split("/").length - b.filePath.split("/").length
            );

          const shortestPathLength =
            applicableMiddlewares[0]?.filePath.split("/").length;
          const closestMiddlewares = applicableMiddlewares.filter(
            (m) => m.filePath.split("/").length === shortestPathLength
          );

          for (const middleware of closestMiddlewares) {
            // applu middleware guards
            for (const guard of middleware.guards) {
              // Validate guard schemas
              for (const schemaType of ["body", "query", "params"] as const) {
                const { valid, errors } = validateSchema(
                  guard.config?.[schemaType],
                  context[schemaType]
                );

                if (!valid) {
                  throw {
                    message: `${schemaType} validation failed for guard`,
                    errors,
                  };
                }
              }

              await guard.handler(context);
            }
            await middleware.handler(context);
          }

          // Apply guards
          for (const [index, guard] of route.guards.entries()) {
            // Validate guard schemas
            for (const schemaType of ["body", "query", "params"] as const) {
              const { valid, errors } = validateSchema(
                guard.config?.[schemaType],
                context[schemaType]
              );

              if (!valid) {
                throw {
                  message: `${schemaType} validation failed for guard #${index}`,
                  errors,
                };
              }
            }

            await guard.handler(context);
          }
        },
        ...route.config,
      }
    );
  }

  return app;
}

export const startServer = async (_options: ServerOptions) => {
  const options = await loadConfig(
    upath.resolve(process.cwd() || "", "mantou.config.ts"),
    _options
  );
  const app = new Elysia();

  const isSSL = options.ssl;
  const sslText = isSSL ? "https" : "http";

  await buildRoutes(app, options);

  if (options?.swagger) {
    logger.info(
      `📄 OpenAPI Docs available at ${sslText}://${options.host}:${options.port}${options.swagger.path}`
    );
    app.use(
      swagger({
        ...options.swagger,
      })
    );
  }

  if (options?.cors) {
    app.use(cors(options?.cors));
  }

  options?.plugins?.forEach(async (plugin) => {
    if (plugin.afterBuild) {
      await plugin.afterBuild(options);
    }
  });

  try {
    app.use(
      staticPlugin({
        assets: upath.resolve(process.cwd(), "dist"),
        prefix: "/dist",
        noCache: true,
      })
    );

    app.use(
      staticPlugin({
        assets: upath.resolve(process.cwd(), "public"),
        prefix: "/public",
        noCache: true,
      })
    );
  } catch (e) {
    console.log(e);
  }

  app.listen(
    {
      port: options.port,
      hostname: options.host,
    },
    () => {
      logger.info(
        `🍞 Server started on ${sslText}://${options.host}:${options.port}`
      );
    }
  );

  return app;
};
