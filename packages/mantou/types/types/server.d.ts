import type { ElysiaSwaggerConfig } from "@elysiajs/swagger";
import type { HTTPHeaders } from "elysia/types";
export interface ServerOptions<Path extends string = any> {
    isDev?: boolean;
    port?: number;
    host?: string;
    ssl?: boolean;
    middlewares?: any[];
    baseDir?: string;
    appDir?: string;
    swagger?: ElysiaSwaggerConfig<Path> | false;
    configPath?: string;
    cors?: {
        origin?: string | string[];
    };
    outputDir?: string;
    apiPrefix?: string;
}
export interface PageProps<TProps extends {
    data?: any;
    params?: any;
    query?: any;
} = any> {
    data: TProps["data"];
    params: TProps["params"];
    query: TProps["query"];
}
export interface Store {
    [key: string]: any;
}
export interface BaseContext {
    request: Request;
    path: string;
    set: {
        headers: HTTPHeaders;
        status?: number | string;
        cookie?: Record<string, any>;
    };
    store: Store;
    route: string;
    headers?: Record<string, string | undefined>;
}
export interface MetaData {
    title: string;
    description: string;
    image?: string;
    url?: string;
    [key: string]: any;
}
export type GetServerSideData<T extends {
    data: any;
    params?: any;
    query?: any;
} = any> = (context: {
    data: T["data"];
    params: T["params"];
    query: T["query"];
} & BaseContext) => Promise<T["data"]> | T["data"];
export type GenerateMetadata<T extends {
    params?: any;
    query?: any;
} = {
    params: any;
    query: any;
}> = (context: T & BaseContext) => MetaData;
export interface ValidationResult {
    valid: boolean;
    errors?: any;
}
export interface ReactDependencies {
    React: typeof import("react");
    ReactDOMServer: typeof import("react-dom/server");
    ReactRouter: typeof import("react-router");
}
