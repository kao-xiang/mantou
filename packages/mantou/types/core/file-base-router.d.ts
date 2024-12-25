import { Elysia, type Static, type TSchema } from 'elysia';
type ContentType = 'text' | 'json' | 'formdata' | 'urlencoded' | 'text/plain' | 'application/json' | 'multipart/form-data' | 'application/x-www-form-urlencoded';
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
export interface Guard {
    handler: RouteHandlerFunction<any>;
    config?: HandlerConfig;
}
type Context<TConfig extends HandlerConfig> = BaseContext & {
    body: TConfig['body'] extends TSchema ? Static<TConfig['body']> : undefined;
    query: TConfig['query'] extends TSchema ? Static<TConfig['query']> : undefined;
    params: TConfig['params'] extends TSchema ? Static<TConfig['params']> : undefined;
};
type RouteHandlerFunction<TConfig extends HandlerConfig> = (ctx: Context<TConfig>) => Promise<any> | any;
export declare function buildRoutes(app: Elysia, baseDir?: string, config?: {
    swaggerOption?: any;
}): Promise<Elysia>;
export declare function handler<TBody extends TSchema, TQuery extends TSchema, TParams extends TSchema>(fn: RouteHandlerFunction<{
    body: TBody;
    query: TQuery;
    params: TParams;
}>, config?: {
    body?: TBody;
    query?: TQuery;
    params?: TParams;
    response?: TSchema;
    detail?: Record<string, any>;
    type?: ContentType;
    [key: string]: any;
}, guards?: Guard[]): {
    handler: RouteHandlerFunction<{
        body: TBody;
        query: TQuery;
        params: TParams;
    }>;
    config: {
        [key: string]: any;
        body?: TBody;
        query?: TQuery;
        params?: TParams;
        response?: TSchema;
        detail?: Record<string, any>;
        type?: ContentType;
    } | undefined;
    guards: Guard[];
};
export declare function guard<TConfig extends HandlerConfig>(fn: RouteHandlerFunction<TConfig>, config?: TConfig): {
    handler: RouteHandlerFunction<TConfig>;
    config: TConfig | undefined;
};
export type { HandlerConfig, Context, ContentType, RouteHandlerFunction };
