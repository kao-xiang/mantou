import type { ServerOptions } from '@/types/server';
import fs from 'fs/promises';
import _ from 'lodash';

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
  configPath: './mantou.config.ts',
  outputDir: './dist',
  apiPrefix: '/api'
}

export const loadConfig = async (path = "mantou.config.js", _options?: ServerOptions) => {
  const __options = _.merge(defaultOptions, _options)
  const loaded = import(path).then((config) => config.default || config).catch((e) => {
    console.error("Failed to load config", e);
    return {};
  });
  const options = _.merge(__options, loaded) as ServerOptions
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