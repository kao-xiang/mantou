import type { LifeProps } from "@/types"
import { MantouBuilder } from "./builder"
import fs from "fs/promises"

export const build = async (props: LifeProps) => {
    const { app, config } = props

    const builder = new MantouBuilder(app, config)
    await builder.build()

    global.__mantou_organs = builder

    await fs.mkdir(config.outputDir, { recursive: true })
}