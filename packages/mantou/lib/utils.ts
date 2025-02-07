import { mantouCorsPlugin } from "@/plugins/mantou-cors";
import { mantouGuard } from "@/plugins/mantou-guard";
import { mantouPostCSSPlugin } from "@/plugins/mantou-postcss";
import { mantouRouteValidation } from "@/plugins/mantou-route-validation";
import { mantouStaticPlugin } from "@/plugins/mantou-static";
import { mantouSwaggerPlugin } from "@/plugins/mantou-swagger";
import type { BaseContext, Context } from "@/routes";
import type { MantouPlugin, OnAppType, OnRequestType } from "@/types";
import fs from "fs/promises";
import upath from "upath";

export const useNoLog = (callback: () => void) => {
  const original = console.log;
  console.log = () => {};
  callback();
  console.log = original;
};

export const applyPlugins = async (
  hookName: OnAppType | OnRequestType,
  ctx?: Context<any>
) => {
  const plugins = global.__mantou_config?.plugins || [];
  const builtInPlugins = [
    mantouStaticPlugin(),
    mantouPostCSSPlugin(),
    mantouSwaggerPlugin(),
    mantouCorsPlugin(),
    mantouRouteValidation(),
    mantouGuard(),
  ] as MantouPlugin[];
  const allPlugins = [...builtInPlugins, ...plugins];

  for (const plugin of allPlugins) {
    const isOnApp = plugin.onApp?.[hookName as OnAppType];
    const isOnRequest = plugin.onRequest?.[hookName as OnRequestType];
    if (isOnRequest && ctx) {
      const res = await isOnRequest(ctx, {
        app: global.__mantou_app,
        config: global.__mantou_config,
        organs: global.__mantou_organs,
      });
      if (res) {
        return res;
      }
    } else {
      if (isOnApp) {
        const res = await isOnApp({
          app: global.__mantou_app,
          config: global.__mantou_config,
          organs: global.__mantou_organs,
        });
        if (res) {
          return res;
        }
      }
    }
  }
};

export async function cleanOutputDir() {
  const outputDir = upath.resolve(
    process.cwd(),
    global.__mantou_config.outputDir
  );
  await fs.rm(outputDir, { recursive: true, force: true });
  return outputDir;
}
