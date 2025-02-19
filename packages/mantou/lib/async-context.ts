import type { Context } from "@/routes";
import { AsyncLocalStorage } from "node:async_hooks";

export const astorage = (() => {
  if (typeof window === "undefined") {
    const asyncLocalStorage = new AsyncLocalStorage<{
        ctx: Context<any>
    }>();
    return asyncLocalStorage;
  }
})();


export const getStore = () => {
    return astorage?.getStore();
}