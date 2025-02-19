import type { LifeProps } from "@/exports/types"
import { MantouBuilder } from "./builder"
import fs from "fs/promises"
import { applyPlugins } from "lib/utils"

export const build = async (props: LifeProps) => {
    const { app, config } = props
    const builder = new MantouBuilder(app, config)
    global.__mantou_organs = builder
    await applyPlugins("beforeBuild");
    await builder.build()

    

    await fs.mkdir(config.outputDir, { recursive: true })
}