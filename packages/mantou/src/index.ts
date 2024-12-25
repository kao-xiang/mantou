import { Elysia as Mantou, t } from "elysia"
import type { RouteContext } from "./types/handler"
import { Controller } from "./types/controller"
import type { ServerOptions } from "./types/server"
import { guard, handler } from "./core/file-base-router"

export {
  Mantou,
  t,
  Controller,
  handler,
  guard
}

export type { RouteContext, ServerOptions }