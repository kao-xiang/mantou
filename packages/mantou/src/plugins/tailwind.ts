import fs from "fs/promises";
import { glob } from "glob";
import path from "path";
import postcss from "postcss";
import postcssImport from "postcss-import";
import type { MantouPlugin, ServerOptions } from "@/types";
import { writeRecursive } from "@/utils/fs";

async function getTailwindConfig() {
  const tailwindConfigPath = path.resolve(process.cwd(), "tailwind.config");
  const tailwindConfig = await import(tailwindConfigPath)
    .then((m) => m.default || m)
    .catch(() => ({
      content: ["./src/**/*.{html,js,ts,jsx,tsx}"],
      theme: {
        extend: {},
      },
      plugins: [],
    }));

  return tailwindConfig;
}

async function v4(config: ServerOptions) {
  const cssFiles = glob.sync(
    path.resolve(process.cwd(), "src/**/*.{css,scss,sass}")
  );

  //   find css files with @import 'tailwindcss';
  const cssFilesWithTailwind = await Promise.all(
    cssFiles.filter(async (file) => {
      const content = await fs.readFile(file, "utf-8");
      return content.includes(`@import 'tailwindcss';`);
    })
  );

  const cssContent = await Promise.all(
    cssFilesWithTailwind.map(async (file) => {
      const content = await fs.readFile(file, "utf-8");
      const result = await postcss([postcssImport()]).process(content, {
        from: file,
      });

      return result.css;
    })
  );

  const outPath = path.resolve(process.cwd(), "dist", "styles.css");
  await writeRecursive(outPath, cssContent.join("\n"));
}

async function v3(config: ServerOptions) {
  const tailwindConfig = await getTailwindConfig();

  const tailwindcssPath = path.resolve(
    process.cwd(),
    "node_modules/tailwindcss"
  );
  const tailwindcss = await import(tailwindcssPath).then((m) => m.default || m);

  const cssFiles = glob.sync(
    path.resolve(process.cwd(), "src/**/*.{css,scss,sass}")
  );

  //   find css files with @import 'tailwindcss';
  const cssFilesWithTailwind = await Promise.all(
    cssFiles.filter(async (file) => {
      const content = await fs.readFile(file, "utf-8");
      return content.includes(`@tailwind`);
    })
  );

  let cssContent = await Promise.all(
    cssFilesWithTailwind.map(async (file) => {
      const content = await fs.readFile(file, "utf-8");
      const result = await postcss([
        tailwindcss(tailwindConfig),
        postcssImport(),
      ]).process(content, {
        from: file,
      });

      return result.css;
    })
  );

  const outPath = path.resolve(process.cwd(), "dist", "styles.css");
  await writeRecursive(outPath, cssContent.join("\n"));
}

export const tailwind = () => {
  return {
    name: "tailwind",
    afterBuild: async (config) => {
      const packageJsonPath = path.resolve(process.cwd(), "package.json");
      const packageJson = JSON.parse(
        await fs.readFile(packageJsonPath, "utf-8")
      );
      const dependencies = packageJson.dependencies || {};

      if (!dependencies["tailwindcss"]) {
        console.log(`Tailwind CSS is not installed.`);
        return;
      }

      const tailwindVersion = dependencies["tailwindcss"];

      const regex = /(\d+)/;
      const version = tailwindVersion.match(regex);
      if (!version) {
        console.log(`Tailwind CSS version is not valid.`);
        return;
      }

      const majorVersion = parseInt(version[0]);

      if (majorVersion === 4) {
        await v4(config);
      } else if (majorVersion === 3) {
        await v3(config);
      } else {
        console.log(`Tailwind CSS version ${majorVersion} is not supported.`);
      }
    },
  } as MantouPlugin;
};
