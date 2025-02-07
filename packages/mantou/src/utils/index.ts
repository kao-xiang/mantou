import _ from "lodash";
import { writeRecursive } from "./fs";

const f = (name: string) => {
    // split by _ or - or space
    if(!name) return "";
    const words = name?.split(/[_\-\s]/);
    // capitalize each word
    const capitalized = words.map((word) => {
        return word.charAt(0).toUpperCase() + word.slice(1);
    });
    // join words with space
    return capitalized.join(" ");
}

const cn = (...args: any[]) => {
    return args.filter(Boolean).join(" ");
}

export function normalizePath(rawPath: string): string {
    let newPath =
      rawPath
        .replace(/\\/g, "/") // Normalize Windows backslashes to forward slashes
        .replace(/\.ts$|\.js$/, "") // Remove `.ts` and `.js` extensions
        .replace(/\/index$/, "") // Remove `/index`
        .replace(/\/route$/, "") // Remove `/route`
        .replace(/\[\.{3}(.*?)\]/, ":$1*") // Handle spread parameters like `[...param]`
        .replace(/\[(.*?)\]/g, ":$1") // Handle dynamic parameters like `[param]`
        .replace(/^\/+|\/+$/g, "") // Remove leading/trailing slashes
        .replace(/\((.*?)\)/g, "") // Remove any parentheses (like in optional routes)
        .replace(/\/+/g, "/") // Replace multiple slashes with one
        .replace(/\/$/, "") || "/"; // Remove trailing slashes, default to `/`

    if (!newPath.startsWith("/")) {
      newPath = `/${newPath}`;
    }

    return newPath;
  }


export function deepMerge(...args: any[]){
    return _.mergeWith({}, ...args, (objValue: any, srcValue: any) => {
        if (_.isArray(objValue)) {
            return objValue.concat(srcValue);
        }
    });
}

export async function dynamicImport(filePath: string) {
    const module = await import(filePath + "?t=" + Date.now());
    return module
}

export { writeRecursive, f, cn };