import type { ServerOptions } from "@/types/server"
import { RouteResolver } from "./file-base-router"

export const buildApp = async (options: ServerOptions) => {
    const router = new RouteResolver(options)
    await router.buildApp()
    return true
}