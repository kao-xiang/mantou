import type { ServerOptions } from "@/types/server";
import fs from "fs/promises";
import _ from "lodash";
import upath from "upath";

const defaultOptions: ServerOptions = {
  isDev: true,
  port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
  ssl: process.env.SSL === "true",
  host: process.env.HOST || "localhost",
  swagger: {
    path: "/docs" as any,
    documentation: {
      info: {
        title: "API Documentation",
        description: "API Documentation",
        version: "1.0.0",
      },
    },
  },
  baseDir: "./src",
  appDir: "./app",
  configPath: "./mantou.config.ts",
  outputDir: "./dist",
  apiPrefix: "/api",
};

export const loadConfig = async (
  configPath = "./mantou.config.ts",
  _options?: ServerOptions
) => {
  const __options = _.merge(defaultOptions, _options);
  const loaded = await import(upath.resolve(process.cwd(), configPath))
    .then((config) => config.default || config)
    .catch((e) => {
      console.error("Failed to load config", e);
      return {};
    });
  const tsconfig = await import(upath.resolve(process.cwd(), "tsconfig.json"))
    .then((config) => config.default || config)
    .catch((e) => {
      return {};
    });

  const options = _.merge(__options, loaded, {
    baseDir:
      tsconfig.compilerOptions.baseUrl || __options.baseDir || loaded.baseDir,
  }) as ServerOptions;

  return options;
};

export async function writeRecursive(filePath: string, content: string) {
  const dir = upath.dirname(filePath); // Extract directory from filePath
  await fs.mkdir(dir, { recursive: true }); // Create directories recursively
  await fs.writeFile(filePath, content); // Write the file

  return true;
}
