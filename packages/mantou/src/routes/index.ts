import { error, file, type Static, type TSchema } from "elysia";
import { t as o } from "elysia";
import type { HTTPHeaders } from "elysia/types";
import type { PropsWithChildren } from "react";

type ContentType =
  | "text"
  | "json"
  | "formdata"
  | "urlencoded"
  | "text/plain"
  | "application/json"
  | "multipart/form-data"
  | "application/x-www-form-urlencoded";

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

export interface Store {
  [key: string]: any;
}

export type Context<TConfig extends HandlerConfig> = BaseContext & {
  body: TConfig["body"] extends TSchema ? Static<TConfig["body"]> : undefined;
  query: TConfig["query"] extends TSchema
    ? Static<TConfig["query"]>
    : undefined;
  params: TConfig["params"] extends TSchema
    ? Static<TConfig["params"]>
    : undefined;
};

export interface HandlerConfig {
  body?: TSchema;
  query?: TSchema;
  params?: TSchema;
  response?: TSchema;
  detail?: Record<string, any>;
  type?: ContentType;
  [key: string]: any;
}

export type RouteHandlerFunction<TConfig extends HandlerConfig> = (
  ctx: Context<TConfig>
) => Promise<any> | any;

export interface TGuard {
  handler: RouteHandlerFunction<any>;
  config?: HandlerConfig;
}

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
    detail?: {
      tags: string[];
      [key: string]: any;
    };
    type?: ContentType;
    [key: string]: any;
  },
  guards: TGuard[] = []
) {
  return { handler: fn, config, guards, "__type": "handler" };
}

export interface MiddlewareContext extends BaseContext {
  path: string;
  route: string;
  body: any;
  query: Record<string, string>;
  params: Record<string, any>;
  isPage?: boolean;
}

export type MiddlewareHandler<T = any> = (ctx: MiddlewareContext, next: () => Promise<any>) => Promise<T> | T;

export function middleware<T = any>(
  fn: (ctx: MiddlewareContext, next: () => Promise<any>) => Promise<T> | T,
  guards?: Guard[]
) {
  return { handler: fn, guards, "__type": "middleware" };
}

export function guard<TConfig extends HandlerConfig>(
  fn: RouteHandlerFunction<TConfig>,
  config?: TConfig
) {
  return { handler: fn, config, "__type": "guard" };
}

export type Middleware = ReturnType<typeof middleware>;

export type Guard = ReturnType<typeof guard>;

export type Handler = ReturnType<typeof handler>;

export function acts(
  namespace: string | undefined,
  actions: Record<
    string,
    {
      handler: RouteHandlerFunction<any>;
      config?: HandlerConfig;
      guards?: TGuard[];
    }
  >
) {
  let renamedActions: Record<
    string,
    {
      handler: RouteHandlerFunction<any>;
      config?: HandlerConfig;
      guards?: TGuard[];
    }
  > = {};
  for (const key in actions) {
    renamedActions[`${namespace ? `${namespace}_` : ""}${key}`] = actions[key];
  }
  return renamedActions;
}

export type Acts = ReturnType<typeof acts>;

export type GetServerSideData<
  T extends {
    data: any;
    params?: any;
    query?: any;
  } = any
> = (
  context: {
    data: T["data"];
    params: T["params"];
    query: T["query"];
  } & BaseContext
) => Promise<T["data"]> | T["data"];

export interface MetaData {
  title: string;
  description: string;
  image?: string;
  url?: string;
  [key: string]: any;
}

export type GenerateMetadata<
  T extends {
    params?: any;
    query?: any;
  } = {
    params: any;
    query: any;
  }
> = (context: T & Context<any>) => MetaData | Promise<MetaData>;

export interface PageProps<
  TProps extends {
    data?: any;
    params?: any;
    search?: any;
  } = any
> {
  data: TProps["data"];
  params: TProps["params"];
  search: TProps["search"];
}

export interface ErrorPageProps {
  error: {
    status: number;
    message: any;
    code: string | number;
  };
}

interface MantouFC<T = PageProps> extends React.FC<PropsWithChildren<T>> {
  getServerSideData?: Handler;
  generateMetadata?: Handler;
  metadata?: MetaData;
}

export type FC<T = PageProps> = MantouFC<PropsWithChildren<T>>;

export type { TSchema, Static };

export { o, error, file };
