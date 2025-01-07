 
import dotenv from 'dotenv'
dotenv.config()
import { Elysia, file, type TSchema } from 'elysia'
import { swagger } from '@elysiajs/swagger'
import { logger } from '../lib/logger';
import _ from 'lodash';
import type { ServerOptions } from '@/types/server';
import path, { resolve } from 'path';
import { loadConfig } from '@/lib/fs';
import cors from '@elysiajs/cors';
import { RouteResolver } from '@/core/file-base-router';
import Ajv from "ajv";
import addFormats from "ajv-formats";
import { staticPlugin } from '@elysiajs/static';

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
  baseDir = "./src",
  config?: ServerOptions,
): Promise<Elysia> {

  try{
    app.use(staticPlugin({
      assets: process.cwd() + '/dist',
      prefix: '/dist',
      alwaysStatic: true,
    }))
  
    app.use(staticPlugin({
      assets: process.cwd() + '/public',
      prefix: '/public',
      alwaysStatic: true,
    }))
  }catch(e) {
    console.log(e)
  }

  // app.get('/dist/*', ({ path, params }) => {
  //   return file(process.cwd() + `/dist/${params["*"]}`)
  // })
  // app.get('public/*', ({ path, params }) => {
  //   return file(process.cwd() + `/public/${params["*"]}`)
  // })
  app.use(
    swagger({
      ...config?.swagger,
      exclude: ["node_modules", "build", "dist", "src"],
      excludeMethods: ["OPTIONS"],
    })
  );

  const resolver = new RouteResolver(config || { baseDir });
  const { routes, middlewares } = await resolver.resolveRoutes();

  await resolver.buildApp();

  await loadProjectReact(process.cwd());

  for (const route of routes) {
    if (!route.path?.startsWith(config?.apiPrefix || "/api")) {
      continue;
    }
    (app as any)[route.method](route.path, route.handler, {
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



  app.get("*", async (ctx) => {
    try {
      // clear import cache
      const ImportedApp = await import(path.resolve("./dist", `App.tsx?imported=${Date.now()}`));
      const Component = ImportedApp.default

      if(!projectReact || !projectReactDOMServer || !projectReactRouter) {
        await loadProjectReact(process.cwd());
      }

      const data = await resolver.getRouteByPath(ctx.path)?.routeData?.data?.();

      const content = projectReactDOMServer?.renderToString(
        projectReact?.createElement(projectReactRouter.StaticRouter, {
          location: ctx.path,
        }, projectReact?.createElement(Component, { data })
        ),
      )

      const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Document</title>
        </head>
        <body>
          <div id="root">${content}</div>
          <script src="/dist/index.js" type="module"></script>
          <script>
            window.__INITIAL_DATA__ = ${JSON.stringify(data)}
          </script>
        </body>
      </html>
      `

      return new Response(html, {
        headers: { 'Content-Type': 'text/html' },
      })
    } catch (error) {
      console.log(error)
      throw error;
    }

  });

  return app;
}

export const startServer = async (_options: ServerOptions) => {
  const options = await loadConfig(path.resolve(process.cwd() || "", 'mantou.config.ts'), _options)
  const app = new Elysia()

  if(options?.swagger) {
    app
      .use(swagger({
        ...options.swagger,
      }))
  }

  if(options?.cors) {
    app.use(cors(options?.cors))
  }

  await buildRoutes(app, path.resolve(options.baseDir || ""), options)

  app.listen(options.port || 3000, () => {
    logger.info(`🚀 Server started on http://${options.host}:${options.port}`)
  })

  return app
}