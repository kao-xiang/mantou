import type { MantouBuilder } from "@/builder/builder";
import type { Context } from "@/routes";
import type { ElysiaSwaggerConfig } from "@elysiajs/swagger";
import type Elysia from "elysia";
import type { HTTPHeaders } from "elysia/types";

export interface MantouOrgans extends MantouBuilder<any, any> {}

export interface LifeProps {
  config: ServerOptions;
  app: Elysia;
  organs: MantouOrgans;
}

export type OnAppType =
  | "beforeBuild"
  | "afterBuild"
  | "afterBootstrap"
  | "beforeStart";
export type OnRequestType = "beforeHandle";

export type OnAppHandler = (props: LifeProps) => any | Promise<any>;
export type OnRequestHandler = (
  ctx: Context<any>,
  props: LifeProps
) => any | Promise<any>;

export class MantouPlugin {
  name = "mantou-plugin";
  onApp?: Partial<Record<OnAppType, OnAppHandler>> = {};
  onRequest?: Partial<Record<OnRequestType, OnRequestHandler>> = {};
}

export interface ServerOptions<Path extends string = any> {
  isDev: boolean;
  onlyBuild: boolean;
  port: number;
  host: string;
  ssl: boolean;
  middlewares: any[];
  appDir: string;
  wsDir: string;
  swagger: ElysiaSwaggerConfig<Path> | false;
  configPath: string;
  cors: {
    origin: string | string[];
  };
  outputDir: string;
  apiPrefix: string;
  plugins: MantouPlugin[];
  actionPath: string;
}

export type PartialServerOptions = Partial<ServerOptions>;

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
  ReactRouter: any;
}
