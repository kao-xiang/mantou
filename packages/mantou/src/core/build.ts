import type { ServerOptions } from "@/types/server"
import { RouteResolver } from "./file-base-router"
import { loadConfig } from "@/lib/fs"
import _ from "lodash"

export const buildApp = async (_options: ServerOptions) => {
    const options = _.merge(await loadConfig(), _options)
    const router = new RouteResolver(options)
    await router.buildApp()
    return true
}