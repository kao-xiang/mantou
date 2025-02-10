import _ from "lodash";
import type { PartialServerOptions, ServerOptions } from "@/exports/types";
import path from "path";
import { deepMerge } from "@/utils";
import { MantouBuilder } from "@/builder/builder";
import Elysia from "elysia";

const defaultOptions: ServerOptions = {
  isDev: true,
  onlyBuild: false,
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
  appDir: "./src/app",
  configPath: "./mantou.config.ts",
  outputDir: "./dist",
  apiPrefix: "/",
  middlewares: [],
  cors: { origin: ["*"] },
  wsDir: "./ws",
  plugins: [],
  actionPath: "/_",
};

export const loadConfig = async (
  _options?: PartialServerOptions
) => {
  const __options =deepMerge(defaultOptions, _options);
  const loaded = await import(path.resolve(process.cwd(), "mantou.config.ts"))
    .then((config) => config.default || config)
    .catch((e) => {
      console.error("Failed to load config", e);
      return {};
    });

  return deepMerge(__options, loaded);
};

export const buildApp = async (_options: PartialServerOptions) => {
  const options = deepMerge(await loadConfig(), _options);
  const app = new Elysia()
  const builder = new MantouBuilder(app, options);
  await builder.build();
  return true;
};
