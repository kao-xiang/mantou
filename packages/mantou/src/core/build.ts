import type { ServerOptions } from "@/types/server"
import { RouteResolver } from "./file-base-router"

export const buildApp = async (options: ServerOptions) => {
    console.log('Building app...')
    const router = new RouteResolver(options)
    await router.buildApp()
    console.log('Done!')
    return true
}