import { type Static, type TSchema } from "elysia";
import type { BaseContext, ServerOptions } from "@/types/server";
type HttpMethod = "get" | "post" | "put" | "patch" | "delete";
type ContentType = "text" | "json" | "formdata" | "urlencoded" | "text/plain" | "application/json" | "multipart/form-data" | "application/x-www-form-urlencoded";
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
interface Page extends BasePath {
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
type RouteHandlerFunction<TConfig extends HandlerConfig> = (ctx: Context<TConfig>) => Promise<any> | any;
export declare class RouteResolver<M extends HandlerConfig, R extends HandlerConfig> {
    private readonly appDir;
    private readonly baseDir;
    private readonly pathMap;
    middlewares: MiddlewareConfig<M>[];
    routes: Route<R>[];
    pages: Page[];
    layouts: Layout[];
    pageLayouts: PageLayout[];
    config: ServerOptions;
    constructor(config: ServerOptions);
    private normalizePath;
    getRouteGroup(filePath: string): string;
    findMatchingLayouts(page: Page, layouts: Layout[]): string[];
    combinePageLayouts(layouts: Layout[], pages: Page[]): Promise<PageLayout[]>;
    buildApp(): Promise<void>;
    private getPathFromLayout;
    private filePathToRoutePath;
    private processMiddleware;
    private processRoute;
    private processPage;
    private processLayout;
    resolveRoutes(): Promise<{
        middlewares: MiddlewareConfig[];
        routes: Route[];
        pages: Page[];
        layouts: Layout[];
    }>;
    getRouteByPath(path: string): Route | undefined;
    getLayoutByPath(path: string): Layout | undefined;
    getPageByPath(path: string): Page | undefined;
}
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
