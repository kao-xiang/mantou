import { Elysia as Mantou, t } from "elysia";
import type { RouteContext } from "./types/handler";
import { Controller } from "./types/controller";
import type { ServerOptions, GenerateMetadata, GetServerSideData, PageProps, Store } from "./types/server";
import { guard, handler } from "./core/file-base-router";
import { loadConfig } from "./lib/fs";
import { startServer } from "./server";
import { buildApp } from "./core/build";
export { Mantou, t, Controller, handler, guard, startServer, buildApp, loadConfig };
export type { Store, RouteContext, ServerOptions, GenerateMetadata, GetServerSideData, PageProps };
