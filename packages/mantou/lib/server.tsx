import dotenv from "dotenv";
dotenv.config();
import { Elysia } from "elysia";
import { logger } from "./logger";
import _ from "lodash";
import type { PartialServerOptions } from "mantou/types";
import { loadConfig } from "./config";
import { build } from "@/builder";
import { applyPlugins, cleanOutputDir } from "./utils";

export const startServer = async (_options?: PartialServerOptions) => {
  const __options = await loadConfig(_options);
  const _app = new Elysia();

  global.__mantou_config = __options;
  global.__mantou_app = _app;

  await cleanOutputDir();

  await applyPlugins("beforeBuild");

  await build({
    app: global.__mantou_app,
    config: global.__mantou_config,
    organs: global.__mantou_organs,
  });

  await applyPlugins("afterBuild");

  const isSSL = global.__mantou_config.ssl;
  const sslText = isSSL ? "https" : "http";

  await applyPlugins("beforeStart");

  global.__mantou_app.listen(
    {
      port: global.__mantou_config.port,
      hostname: global.__mantou_config.host,
    },
    () => {
      logger.info(
        `🍞 Server started on ${sslText}://${global.__mantou_config.host}:${global.__mantou_config.port}`
      );
    }
  );

  return global.__mantou_app;
};
