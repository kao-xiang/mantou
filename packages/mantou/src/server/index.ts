 
import dotenv from 'dotenv'
dotenv.config()
import { Elysia } from 'elysia'
import { swagger } from '@elysiajs/swagger'
import { logger } from '../lib/logger';
import _ from 'lodash';
import { buildRoutes } from '@/core/file-base-router';
import type { ServerOptions } from '@/types/server';
import path from 'path';
import { loadConfig } from '@/lib/fs';
import cors from '@elysiajs/cors';

const defaultOptions: ServerOptions = {
  isDev: true,
  port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
  ssl: process.env.SSL === 'true',
  host: process.env.HOST || 'localhost',
  swagger: {
    path: "/swagger" as any,
    documentation: {
      info: {
        title: "API Documentation",
        description: "API Documentation",
        version: "1.0.0"
      }
    }
  },
  baseDir: './src',
  configPath: './mantou.config.ts'
}

export const startServer = async (_options: ServerOptions) => {
  const __options = _.merge(defaultOptions, _options)
  const config = await loadConfig(path.resolve(process.cwd() || "", __options.configPath || ""))
  const options = _.merge(__options, config) as ServerOptions

  const app = new Elysia()


  if(config?.swagger) {
    app
      .use(swagger({
        ...options.swagger,
      }))
  }

  if(options?.cors) {
    app.use(cors(options?.cors))
  }

  await buildRoutes(app, path.resolve(options.baseDir || "", 'routes'))

  app.listen(options.port || 3000, () => {
    logger.info(`🚀 Server started on http://${options.host}:${options.port}`)
  })

  return app
}