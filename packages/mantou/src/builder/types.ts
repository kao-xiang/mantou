import type {
  GenerateMetadata,
  GetServerSideData,
  TGuard,
  HandlerConfig,
  MetaData,
  RouteHandlerFunction,
  BaseContext,
  MiddlewareHandler,
} from "@/routes";
import type { HTTPMethod } from "elysia";

export interface BasePath {
  filePath: string;
  path: string;
}

export interface Route<TConfig extends HandlerConfig = any> extends BasePath {
  method: HTTPMethod;
  handler: RouteHandlerFunction<TConfig>;
  config: TConfig;
  guards: TGuard[];
}

export interface WsRoute<TConfig extends HandlerConfig = any> extends BasePath {
  onMessage: RouteHandlerFunction<TConfig>;
  config: TConfig;
  guards: TGuard[];
}

export interface Page<C = any> extends BasePath {
  Component: React.ComponentType<C>;
  metadata?: MetaData;
  getServerSideData?: GetServerSideData;
  generateMetadata?: GenerateMetadata;
}

export interface Layout extends BasePath {
  children?: (Page | Layout)[];
  metadata?: MetaData;
  generateMetadata?: GenerateMetadata;
}

export interface PageLayout {
  path: string;
  element: {
    page: string;
    layouts?: string[];
  };
}

export interface TMiddleware<T = any> extends BasePath {
  handler: MiddlewareHandler<T>;
  guards: TGuard[];
}

export interface Action<TConfig extends HandlerConfig = any> extends BasePath {
  handler: RouteHandlerFunction<TConfig>;
  guards: TGuard[];
  config: TConfig;
}
