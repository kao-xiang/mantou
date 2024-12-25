import { Elysia, type Static, type TSchema } from 'elysia';
import { glob } from 'glob';
import path from 'path';
import { swagger } from '@elysiajs/swagger';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

// Types
type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';
type ContentType = 
  | 'text' 
  | 'json' 
  | 'formdata' 
  | 'urlencoded'
  | 'text/plain'
  | 'application/json'
  | 'multipart/form-data'
  | 'application/x-www-form-urlencoded';

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

interface Route<TConfig extends HandlerConfig = any> {
  filePath: string;
  path: string;
  method: HttpMethod;
  handler: RouteHandlerFunction<TConfig>;
  config: TConfig;
  guards: Guard[];
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
  body: TConfig['body'] extends TSchema ? Static<TConfig['body']> : undefined;
  query: TConfig['query'] extends TSchema ? Static<TConfig['query']> : undefined;
  params: TConfig['params'] extends TSchema ? Static<TConfig['params']> : undefined;
};

type RouteHandlerFunction<TConfig extends HandlerConfig> = 
  (ctx: Context<TConfig>) => Promise<any> | any;

// Constants
const HTTP_METHODS: readonly HttpMethod[] = ['get', 'post', 'put', 'patch', 'delete'];

// Schema Validation
const ajv = addFormats(
  new Ajv({ 
    removeAdditional: true,
    useDefaults: true,
    coerceTypes: true,
    allErrors: true
  }), 
  ['date-time', 'time', 'date', 'email', 'hostname', 'ipv4', 'ipv6', 'uri', 
    'uri-reference', 'uuid', 'uri-template', 'json-pointer', 'relative-json-pointer', 'regex']
);

function validateSchema(schema: TSchema | undefined, data: any): { 
  valid: boolean;
  errors?: any;
} {
  if (!schema) return { valid: true };
  
  const validate = ajv.compile(schema);
  const valid = validate(data);
  
  return valid ? { valid } : { valid, errors: validate.errors };
}

// Route Resolution
class RouteResolver<M extends HandlerConfig, R extends HandlerConfig> {
  private readonly routesDir: string;
  private readonly pathMap = new Map<string, string>();
  public middlewares: MiddlewareConfig<M>[] = [];
  public routes: Route<R>[] = [];

  constructor(baseDir: string = './src/routes') {
    this.routesDir = path.resolve(process.cwd(), baseDir);
  }

  private normalizePath(rawPath: string): string {
    return rawPath
      .replace(/\\/g, '/')
      .replace(/\.ts$|\.js$/, '')
      .replace(/\/index$/, '')
      .replace(/\/route$/, '')
      .replace(/\[\.{3}(.*?)\]/, ':$1*')
      .replace(/\[(.*?)\]/g, ':$1')
      .replace(/^\/+|\/+$/g, '')
      .replace(/\((.*?)\)/g, '')
      .replace(/\/+/g, '/')
      .replace(/\/$/, '') || '/';
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
      handler: module.default
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
          guards: module[method]?.guards ?? []
        });
      }
    }
  }

  async resolveRoutes(): Promise<{
    middlewares: MiddlewareConfig[];
    routes: Route[];
  }> {
    this.pathMap.clear();
    
    const files = await glob('**/*.{ts,js}', {
      cwd: this.routesDir,
      ignore: ['**/*.d.ts', '**/*.test.ts', '**/*.spec.ts', '_*/**']
    });

    // Process middlewares first
    await Promise.all(
      files
        .filter(file => file.includes('middleware.'))
        .map(file => this.processMiddleware(path.resolve(this.routesDir, file)))
    );

    // Then process routes
    await Promise.all(
      files
        .filter(file => file.includes('route.'))
        .map(async file => {
          const resolvedPath = this.filePathToRoutePath(path.resolve(this.routesDir, file));
          
          if (this.pathMap.has(resolvedPath)) {
            throw new Error(
              `Path collision detected: ${resolvedPath} in ${file} and ${this.pathMap.get(resolvedPath)}`
            );
          }
          
          this.pathMap.set(resolvedPath, file);
          await this.processRoute(path.resolve(this.routesDir, file));
        })
    );

    return {
      middlewares: this.middlewares,
      routes: this.routes
    };
  }
}

// Route Building
export async function buildRoutes(
  app: Elysia,
  baseDir = './src/routes',
  config?: { swaggerOption?: any }
): Promise<Elysia> {
  app.use(
    swagger({
      ...config?.swaggerOption,
      exclude: ['node_modules', 'build', 'dist', 'src'],
      excludeMethods: ['OPTIONS']
    })
  );

  const resolver = new RouteResolver(baseDir);
  const { routes, middlewares } = await resolver.resolveRoutes();

  for (const route of routes) {
    (app as any)[route.method](route.path, route.handler, {
      beforeHandle: async (context: any) => {
        // Apply matching middlewares
        const applicableMiddlewares = middlewares
          .filter(middleware => context.path.startsWith(middleware.path))
          .sort((a, b) => a.filePath.split('/').length - b.filePath.split('/').length);

        const shortestPathLength = applicableMiddlewares[0]?.filePath.split('/').length;
        const closestMiddlewares = applicableMiddlewares
          .filter(m => m.filePath.split('/').length === shortestPathLength);

        for (const middleware of closestMiddlewares) {
          await middleware.handler(context);
        }

        // Apply guards
        for (const [index, guard] of route.guards.entries()) {
          // Validate guard schemas
          for (const schemaType of ['body', 'query', 'params'] as const) {
            const { valid, errors } = validateSchema(guard.config?.[schemaType], context[schemaType]);
            
            if (!valid) {
              throw {
                message: `${schemaType} validation failed for guard #${index}`,
                errors
              };
            }
          }
          
          await guard.handler(context);
        }
      },
      ...route.config
    });
  }

  return app;
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

export type { 
  HandlerConfig,
  Context,
  ContentType,
  RouteHandlerFunction
};