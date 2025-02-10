import type { MantouPlugin } from "@/exports/types";
import staticPlugin from "@elysiajs/static";
import path from "path";

export const mantouStaticPlugin = () => {
  return {
    name: "mantou-static-plugin",
    onApp: {
      afterBuild({ app, config }) {
        app.use(
          staticPlugin({
            assets: path.resolve(process.cwd(), "dist"),
            prefix: "/dist",
            noCache: true,
          })
        );

        app.use(
          staticPlugin({
            assets: path.resolve(process.cwd(), "public"),
            prefix: "/public",
            noCache: true,
          })
        );
      },
    },
  } as MantouPlugin;
};
