import type { MantouPlugin } from "@/types";
import swagger from "@elysiajs/swagger";
import { logger } from "lib/logger";

export const mantouSwaggerPlugin = () => {
  return {
    name: "mantou-swagger-plugin",
    onApp: {
      afterBuild({ app, config }) {
        if (config?.swagger) {
          app.use(
            swagger({
              ...config.swagger,
            })
          );
        }
      },
      beforeStart({ app, config }) {
        if (config?.swagger) {
          const isSSL = config.ssl;
          const sslText = isSSL ? "https" : "http";
          logger.info(
            `📄 OpenAPI Docs available at ${sslText}://${config.host}:${config.port}${config.swagger.path}`
          );
        }
      }
    },
  } as MantouPlugin;
};
