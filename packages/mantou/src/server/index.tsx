 
import dotenv from 'dotenv'
dotenv.config()
import { Elysia, file, type TSchema } from 'elysia'
import { swagger } from '@elysiajs/swagger'
import { logger } from '../lib/logger';
import _ from 'lodash';
import type { ServerOptions } from '@/types/server';
import upath, { resolve } from 'upath';
import { loadConfig } from '@/lib/fs';
import cors from '@elysiajs/cors';
import { RouteResolver } from '@/core/file-base-router';
import Ajv from "ajv";
import addFormats from "ajv-formats";
import { staticPlugin } from '@elysiajs/static';
import { glob } from "glob";
import fs from 'fs/promises';

let projectReact: typeof import('react')
let projectReactDOMServer: typeof import('react-dom/server')
let projectReactRouter: typeof import('react-router')

async function loadProjectReact(projectPath: string) {
  try {
    // Load React from the project's node_modules
    const reactPath = resolve(projectPath, 'node_modules/react');
    const reactDOMServerPath = resolve(projectPath, 'node_modules/react-dom/server');
    const reactRouterPath = resolve(projectPath, 'node_modules/react-router');
    projectReact = await import(reactPath);
    projectReactDOMServer = await import(reactDOMServerPath);
    projectReactRouter = await import(reactRouterPath);
    
    // Make this React instance global
    (global as any).React = projectReact;
    (global as any).ReactDOMServer = projectReactDOMServer;
    (global as any).ReactRouter = projectReactRouter;

    return {
      React: projectReact,
      ReactDOMServer: projectReactDOMServer,
      ReactRouter: projectReactRouter,
    }
  } catch (error) {
    console.error('Failed to load project React:', error);
    throw error;
  }
}


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
  config?: ServerOptions,
): Promise<Elysia> {
  const resolver = new RouteResolver(config || {});
  const { routes, middlewares } = await resolver.resolveRoutes();

  await resolver.buildApp();

  try{
    app.use(staticPlugin({
      assets: upath.resolve(process.cwd(), 'dist'),
      prefix: '/dist',
      alwaysStatic: true,
    }))
  
    app.use(staticPlugin({
      assets: upath.resolve(process.cwd(), 'public'),
      prefix: '/public',
      alwaysStatic: true,
    }))

  }catch(e) {
    console.log(e)
  }

  await loadProjectReact(process.cwd());

  app.onBeforeHandle(async (context) => {
    const middlewarePaths = middlewares.map((m) => m.path);
    const route = resolver.getRouteByPath(context.path);
    const page = resolver.getPageByPath(context.path);
    const hasPage = !!page || (route && context.request.method === "GET");
    if(!route || hasPage) {
      return;
    }
    const applicableMiddlewares = middlewarePaths.filter((path) =>
      context.path.startsWith(path) && context.path.startsWith(route?.path)
    );


    if(applicableMiddlewares.length === 0) {
      return;
    }

    const sortedMiddlewares = applicableMiddlewares.sort(
      (a, b) => a.split("/").length - b.split("/").length
    );

    for(const middlewarePath of sortedMiddlewares) {
      const middleware = middlewares.find((m) => m.path === middlewarePath);
      const page = resolver.getPageByPath(context.path);
      if(middleware) {
        await middleware.handler(context);
      }
    }

  });

  for(const page of resolver.pages) {
    app.get(page.path, async (ctx) => {
      try {
        const ImportedApp = await import(upath.resolve(config?.outputDir || "./dist", `App.tsx?imported=${Date.now()}`));
        const Component = ImportedApp.default
  
        if(!projectReact || !projectReactDOMServer || !projectReactRouter) {
          await loadProjectReact(process.cwd());
        }

        const layout = await import(upath.resolve(resolver.getLayoutByPath(ctx.path)?.filePath + `?imported=${Date.now()}`)).then((layout) => layout).catch((e) => { console.error("Failed to load layout", e); return null; });
        const page = await import(upath.resolve(resolver.getPageByPath(ctx.path)?.filePath + `?imported=${Date.now()}`)).then((page) => page).catch((e) => { console.error("Failed to load page", e); return null; });

        const layoutMetadata = layout.metadata || {};
        const pageMetadata = page.metadata || {};

        const layoutGenerateMetadata = layout.generateMetadata || (() => ({}));
        const pageGenerateMetadata = page.generateMetadata || (() => ({}));

        const staticMetadata = _.merge({}, layoutMetadata, pageMetadata);

        const dynamicMetadata = _.merge({}, layoutGenerateMetadata(ctx), pageGenerateMetadata(ctx));

        const metadata = _.merge({}, staticMetadata, dynamicMetadata);

        const getServerSideData = page.getServerSideData || (() => ({}));
  
        const data = await getServerSideData(ctx);
        const params = ctx.params || {};
        const query = ctx.query || {};
  
        const content = projectReactDOMServer?.renderToString(
          projectReact?.createElement(projectReactRouter.StaticRouter, {
            location: ctx.path,
          }, projectReact?.createElement(Component, { data, params, query })
          ),
        )

        const csss = glob.sync(upath.join(process.cwd(), 'dist', '*.css')).map((file) => {
          return `<link rel="stylesheet" href="/dist/${upath.basename(file)}" />`
        }).join('\n')

        const loadedHTML = await fs.readFile(upath.resolve(process.cwd(), 'public/index.html'), 'utf-8')

        const html = loadedHTML
        .replace("<!-- mantou_header -->", `
          <title>${metadata.title}</title>
          <meta name="description" content="${metadata.description}">
          ${Object.keys(metadata).map((key) => {
            if (key === "title" || key === "description") return "";
            return `<meta name="${key}" content="${metadata[key]}">`;
          }).join('\n')}
          ${csss}
        `)
        .replace("<!-- mantou_root -->", content || "")
        .replace("<!--  mantou_script -->", `
          <script src="/dist/index.js?a=${Date.now()}" type="module"></script>
          <script>
            window.__INITIAL_DATA__ = ${JSON.stringify(data)}
            window.__INITIAL_PARAMS__ = ${JSON.stringify(params)}
            window.__INITIAL_QUERY__ = ${JSON.stringify(query)}
          </script>
          `)

        return new Response(html, {
          headers: { 'Content-Type': 'text/html' },
        })
      } catch (error) {
        console.log(error)
        throw error;
      }
    }, {
      detail: {
        hide: true,
      }
    })
  }
  
  for (const route of routes) {
    const routePath = route.path?.startsWith("/") ? route.path : `/${route.path}`;
    const existingPage = resolver.pages.find(page => page.path === routePath);
    if(existingPage || route.method === "get") {
      continue;
    }
    (app as any)[route.method](routePath, async (ctx: any) => {
      const handler = await import(`${route.filePath}?imported=${Date.now()}`);
      return await handler[route.method]?.handler(ctx)
    }, {
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
    });
  }

  return app;
}

export const startServer = async (_options: ServerOptions) => {
  const options = await loadConfig(upath.resolve(process.cwd() || "", 'mantou.config.ts'), _options)
  const app = new Elysia()

  const isSSL = options.ssl
  const sslText = isSSL ? "https" : "http"

  if(options?.swagger) {
    logger.info(`📄 OpenAPI Docs available at ${sslText}://${options.host}:${options.port}${options.swagger.path}`)
    app
      .use(swagger({
        ...options.swagger,
      }))
  }

  if(options?.cors) {
    app.use(cors(options?.cors))
  }

  await buildRoutes(app, options)

  app.listen({
    port: options.port,
    hostname: options.host,
  }, () => {
    logger.info(`🍞 Server started on ${sslText}://${options.host}:${options.port}`)
  })

  return app
}