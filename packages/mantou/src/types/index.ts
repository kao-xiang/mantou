import type { ElysiaSwaggerConfig } from "@elysiajs/swagger";
import type { HTTPHeaders } from "elysia/types";

export interface MantouPlugin {
    name: string;
  
    beforeBuild?: (config: ServerOptions) => void | Promise<void>;
    afterBuild?: (config: ServerOptions) => void | Promise<void>;
    beforeStart?: (config: ServerOptions) => void | Promise<void>;
    afterStart?: (config: ServerOptions) => void | Promise<void>;
  }

export interface ServerOptions<Path extends string = any> {
  isDev?: boolean;
  port?: number;
  host?: string;
  ssl?: boolean;
  middlewares?: any[];
  baseDir?: string;
  appDir?: string;
  wsDir?: string;
  swagger?: ElysiaSwaggerConfig<Path> | false;
  configPath?: string;
  cors?: {
    origin?: string | string[];
  };
  outputDir?: string;
  apiPrefix?: string;
  plugins?: MantouPlugin[];
}

export interface PageProps<
  TProps extends {
    data?: any;
    params?: any;
    query?: any;
  } = any
> {
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

export interface ValidationResult {
  valid: boolean;
  errors?: any;
}

export interface ReactDependencies {
  React: typeof import("react");
  ReactDOMServer: typeof import("react-dom/server");
  ReactRouter: any
}