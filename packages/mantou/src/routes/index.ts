import { error, file, type Static, type TSchema } from "elysia";
import { t as o } from "elysia";
import type { HTTPHeaders } from "elysia/types";

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

export interface Guard {
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
> = (context: T & BaseContext) => MetaData;

export type { TSchema, Static };

export { o, error, file };
