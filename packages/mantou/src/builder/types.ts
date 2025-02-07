import type {
  GenerateMetadata,
  GetServerSideData,
  Guard,
  HandlerConfig,
  MetaData,
  RouteHandlerFunction,
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
  guards: Guard[];
}

export interface WsRoute<TConfig extends HandlerConfig = any> extends BasePath {
  onMessage: RouteHandlerFunction<TConfig>;
  config: TConfig;
  guards: Guard[];
}

export interface Page extends BasePath {
  Component: React.ComponentType;
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

export interface Middleware<TConfig extends HandlerConfig = any> extends BasePath {
  handler: RouteHandlerFunction<TConfig>;
  guards: Guard[];
}

export interface Action<TConfig extends HandlerConfig = any> extends BasePath {
  handler: RouteHandlerFunction<TConfig>;
  guards: Guard[];
  config: TConfig;
}
