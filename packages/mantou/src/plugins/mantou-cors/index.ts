import type { MantouPlugin } from "@/types";
import cors from "@elysiajs/cors";

export const mantouCorsPlugin = () => {
  return {
    name: "mantou-cors-plugin",
    onApp: {
      async afterBuild({ app, config }) {
        if (config.cors) {
          app.use(cors(config.cors));
        }
      },
    },
  } as MantouPlugin;
};
