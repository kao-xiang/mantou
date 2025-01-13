import type { ServerOptions } from '@/types/server';
import fs from 'fs/promises';
import _ from 'lodash';
import path from 'path';

const defaultOptions: ServerOptions = {
  isDev: true,
  port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
  ssl: process.env.SSL === 'true',
  host: process.env.HOST || 'localhost',
  swagger: {
    path: "/docs" as any,
    documentation: {
      info: {
        title: "API Documentation",
        description: "API Documentation",
        version: "1.0.0"
      }
    }
  },
  baseDir: './src',
  appDir: './app',
  configPath: './mantou.config.ts',
  outputDir: './dist',
  apiPrefix: '/api'
}

export const loadConfig = async (configPath = './mantou.config.ts', _options?: ServerOptions) => {
  const __options = _.merge(defaultOptions, _options)
  const loaded = await import(path.resolve(process.cwd(), configPath)).then((config) => config.default || config).catch((e) => {
    console.error("Failed to load config", e);
    return {};
  });
  const tsconfig = await import(process.cwd() + "/tsconfig.json").then((config) => config.default || config).catch((e) => { return {} });

  const options = _.merge(__options, loaded, {
    baseDir: tsconfig.compilerOptions.baseUrl || __options.baseDir || loaded.baseDir,
  }) as ServerOptions

  return  options
}

export async function writeRecursive(path: string, content: string) {
  const parts = path.split("/");
  const fileName = parts.pop();
  const dir = parts.join("/");
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(`${dir}/${
    fileName
  }`, content);

  return true;
}