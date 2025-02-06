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
import React, { type PropsWithChildren } from "react";
import { StaticRouter } from "mantou/router";
import postcss from "postcss";
import path from "path";
import { writeRecursive } from "@/utils";

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

  async function handlePage(ctx: any) {
    const ImportedApp = await import(
      path.resolve(
        config?.outputDir || "./dist",
        "client",
        `App.tsx?imported=${Date.now()}`
      )
    );
    const Component = ImportedApp.default;
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
      _nearestLayout?.filePath + `?imported=${Date.now()}`
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

    const pageGetServerSideData = page?.getServerSideData || (() => ({}));
    const layoutGetServerSideData = layout?.getServerSideData || (() => ({}));

    const handleGetServerSideData = async (fn: any) => {
      return await fn(ctx);
    };
    const layoutData = await handleGetServerSideData(layoutGetServerSideData);
    const pageData = await handleGetServerSideData(pageGetServerSideData);

    const data = _.merge({}, layoutData, pageData);

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

    const originalConsoleLog = console.log;
    console.log = () => {};

    const HTMLShell = (props: PropsWithChildren) => {
      return (
        <html>
          <head>
            <div id="mantou-head"></div>
            <link rel="stylesheet" href="/dist/styles/global.css" />
          </head>
          <body>
            <div id="root">{props.children}</div>
            <script src="/dist/client/index.js" type="module"></script>
            <div id="mantou-script"></div>
          </body>
        </html>
      );
    };

    let content = "";
    try {
      content = ReactDomServer?.renderToString(
        React.createElement(HTMLShell, {
          children: React?.createElement(
            StaticRouter,
            {
              location: ctx.path,
            },
            React.createElement(Component, { data, params, query })
          ),
        })
      );
    } catch (e) {
      console.log = originalConsoleLog;
      originalConsoleLog(e);
    } finally {
      console.log = originalConsoleLog;
    }

    const csss = glob
      .sync(upath.join(process.cwd(), config?.outputDir, "client", "*.css"))
      .map((file) => {
        return `<link rel="stylesheet" href="/dist/client/${upath.basename(file)}">`;
      })
      .join("\n");

    // const loadedHTML = await fs.readFile(
    //   upath.resolve(process.cwd(), "public/index.html"),
    //   "utf-8"
    // );

    const frontend_envs = Object.keys(process.env)
      .filter((key) => key.startsWith("MANTOU_PUBLIC_"))
      .reduce((acc, key) => {
        const newKey = key;
        acc[newKey] = process.env[key];
        return acc;
      }, {} as any);

    const html = content
      .replace(
        `<div id="mantou-head"></div>`,
        `
      <title>${metadata.title || "Mantou | Fullstack Framework"}</title>
          <meta name="description" content="${metadata.description || "Mantou is a fullstack framework powered by Bun"}">
          ${Object.keys(metadata)
            .map((key) => {
              if (key === "title" || key === "description") return "";
              return `<meta name="${key}" content="${metadata[key]}">`;
            })
            .join("\n")}
            ${csss}
          `
      )
      .replace(
        `<div id="mantou-script"></div>`,
        `
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
        beforeHandle: async (context: any) => {
          let parentMiddlewares = resolver.getMiddlewaresByPath(
            context.path,
            "page"
          );
          parentMiddlewares.sort(
            (a, b) => a.path.split("/").length - b.path.split("/").length
          );
          for (const middleware of parentMiddlewares) {
            const guards = middleware.guards;
            for (const guard of guards) {
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
        },
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
          let parentMiddlewares = resolver.getMiddlewaresByPath(
            context.path,
            "routes"
          );
          parentMiddlewares.sort(
            (a, b) => a.path.split("/").length - b.path.split("/").length
          );

          for (const middleware of parentMiddlewares) {
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

async function applyPostCSS() {
  const postcssConfig = await import(
    upath.resolve(process.cwd(), "postcss.config.js")
  );
  const plugins = postcssConfig.plugins;
  const isArray = Array.isArray(plugins);
  if (isArray) {
    const cssFiles = glob.sync(
      upath.resolve(process.cwd(), "src/**/global.{css,scss,sass}")
    );
    const cssContent = await Promise.all(
      cssFiles.map(async (file) => {
        const content = await fs.readFile(file, "utf-8");
        const result = await postcss(plugins).process(content, {
          from: file,
        });
        return result.css;
      })
    );

    const outPath = upath.resolve(process.cwd(), "dist", "styles.css");
    await fs.writeFile(outPath, cssContent.join("\n"));
  } else {
    const pluginNames = Object.keys(plugins);
    const pluginParams = Object.values(plugins);
    const cssFiles = glob.sync(
      upath.resolve(process.cwd(), "src/**/global.{css,scss,sass}")
    );
    const cssContent = await Promise.all(
      cssFiles.map(async (file) => {
        const content = await fs.readFile(file, "utf-8");
        const result = await postcss(
          await Promise.all(
            pluginNames.map(async (n) => {
              return await import(
                path.resolve(process.cwd(), "node_modules", n)
              )
                .then((plugin) => {
                  return plugin.default(pluginParams[pluginNames.indexOf(n)]);
                })
                .catch(async (e) => {
                  const json = JSON.parse(
                    await fs.readFile(
                      path.resolve(
                        process.cwd(),
                        "node_modules",
                        n,
                        "package.json"
                      ),
                      "utf-8"
                    )
                  );
                  const entry = json.main || json.exports?.["."]?.import;
                  return await import(
                    path.resolve(process.cwd(), "node_modules", n, entry)
                  ).then((plugin) => {
                    return plugin.default(pluginParams[pluginNames.indexOf(n)]);
                  });
                });
            })
          )
        ).process(content, {
          from: file,
        });

        return result.css;
      })
    );

    const outPath = path.resolve(process.cwd(), "dist", "styles", "global.css");
    await writeRecursive(outPath, cssContent.join("\n"));
  }
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
  await applyPostCSS();

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
