import _ from "lodash";
import { writeRecursive } from "./fs";
import { glob } from "glob";
import path from "path";

export function removeFilenameFromPath(path: string): string {
  return path.replace(/(\/.+)\/[^\/]+\.(tsx|ts)$/, "$1");
}

export function normalizePath(rawPath: string): string {
  let newPath = rawPath
    .replace(/\\/g, "/") // Normalize Windows backslashes to forward slashes
    .replace(/\.ts$|\.js$/, "") // Remove `.ts` and `.js` extensions
    .replace(/\/index$/, "") // Remove `/index`
    .replace(/\/route$/, "") // Remove `/route`
    .replace(/\[\.{3}(.*?)\]/, ":$1*") // Handle spread parameters like `[...param]`
    .replace(/\[(.*?)\]/g, ":$1") // Handle dynamic parameters like `[param]`
    .replace(/^\/+|\/+$/g, "") // Remove leading/trailing slashes
    .replace(/\((.*?)\)/g, "") // Remove any parentheses (like in optional routes)
    .replace(/\/+/g, "/") // Replace multiple slashes with one
    .replace(/\/$/, ""); // Remove trailing slashes, default to `/`

  if (!newPath.startsWith("/")) {
    newPath = `/${newPath}`;
  }

  return newPath;
}

export function normalizeFilePath(filePath: string): string {
  let newPath =
    filePath
      .replace(/\\/g, "/") // Normalize Windows backslashes to forward slashes
      .replace(/\[\.{3}(.*?)\]/, ":$1*") // Handle spread parameters like `[...param]`
      .replace(/\[(.*?)\]/g, ":$1") // Handle dynamic parameters like `[param]`
      .replace(/^\/+|\/+$/g, "") // Remove leading/trailing slashes
      .replace(/\/+/g, "/") // Replace multiple slashes with one
      .replace(/\/$/, "") || "/"; // Remove trailing slashes, default to `/`

  if (!newPath.startsWith("/")) {
    newPath = `/${newPath}`;
  }

  return newPath;
}

export function deepMerge(...args: any[]) {
  return _.mergeWith({}, ...args, (objValue: any, srcValue: any) => {
    if (_.isArray(objValue)) {
      return objValue.concat(srcValue);
    }
  });
}

export async function dynamicImport(filePath: string) {
  const module = await import(filePath + "?t=" + Date.now());
  return module;
}

export function getPublicEnvs() {
  const frontend_envs = Object.keys(process.env)
    .filter((key) => key.startsWith("MANTOU_PUBLIC_"))
    .reduce((acc, key) => {
      const newKey = key;
      acc[newKey] = process.env[key];
      return acc;
    }, {} as any);
  return frontend_envs;
}

export function getCssContent() {
  const csss = glob
    .sync(
      path.join(
        process.cwd(),
        global.__mantou_config?.outputDir,
        "client",
        "*.css"
      )
    )
    .map((file) => {
      return `<link rel="stylesheet" href="/dist/client/${path.basename(
        file
      )}">`;
    })
    .join("\n");
  return csss;
}

export { writeRecursive };
