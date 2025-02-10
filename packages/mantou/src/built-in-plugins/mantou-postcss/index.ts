import type { MantouPlugin, ServerOptions } from "@/exports/types";
import postcss from "postcss";
import path from "path";
import { glob } from "glob";
import fs from "fs/promises";
import { writeRecursive } from "@/utils";

const apply = async (config: ServerOptions) => {
  const postcssConfig = await import(
    path.resolve(process.cwd(), "postcss.config.js")
  ).then((c) => c.default || c).catch((e) => {return undefined});
  if(!postcssConfig) return;
  const plugins = postcssConfig.plugins;
  const isArray = Array.isArray(plugins);
  if (isArray) {
    const cssFiles = glob.sync(
      path.resolve(process.cwd(), "src/**/global.{css,scss,sass}")
    );
    const cssContent = await Promise.all(
      cssFiles.map(async (file) => {
        const content = await fs.readFile(file, "utf-8");
        const result = await postcss(plugins).process(content, {
          from: file,
        });
        return result.css;
      })
    );

    const outPath = path.resolve(process.cwd(), "dist", "styles.css");
    await fs.writeFile(outPath, cssContent.join("\n"));
  } else {
    const pluginNames = Object.keys(plugins);
    const pluginParams = Object.values(plugins);
    const cssFiles = glob.sync(
      path.resolve(process.cwd(), "src/**/global.{css,scss,sass}")
    );
    const cssContent = await Promise.all(
      cssFiles.map(async (file) => {
        const content = await fs.readFile(file, "utf-8");
        const result = await postcss(
          await Promise.all(
            pluginNames.map(async (n) => {
              return await import(
                path.resolve(process.cwd(), "node_modules", n)
              )
                .then((plugin) => {
                  return plugin.default(pluginParams[pluginNames.indexOf(n)]);
                })
                .catch(async (e) => {
                  const json = JSON.parse(
                    await fs.readFile(
                      path.resolve(
                        process.cwd(),
                        "node_modules",
                        n,
                        "package.json"
                      ),
                      "utf-8"
                    )
                  );
                  const entry = json.main || json.exports?.["."]?.import;
                  return await import(
                    path.resolve(process.cwd(), "node_modules", n, entry)
                  ).then((plugin) => {
                    return plugin.default(pluginParams[pluginNames.indexOf(n)]);
                  });
                });
            })
          )
        ).process(content, {
          from: file,
        });

        return result.css;
      })
    );

    const outPath = path.resolve(
      process.cwd(),
      config.outputDir,
      "styles",
      "global.css"
    );
    await writeRecursive(outPath, cssContent.join("\n"));
  }
};

export const mantouPostCSSPlugin = () => {
  return {
    name: "mantou-postcss-plugin",
    onApp: {
      async afterBuild({ app, config }) {
        await apply(config);
      },
    },
  } as MantouPlugin;
};
