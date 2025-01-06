import { Elysia } from 'elysia';
import type { ServerOptions } from '@/types/server';
export declare function buildRoutes(app: Elysia, baseDir?: string, config?: ServerOptions, App?: any): Promise<Elysia>;
export declare const startServer: (_options: ServerOptions, App?: any) => Promise<Elysia<"", {
    decorator: {};
    store: {};
    derive: {};
    resolve: {};
}, {
    typebox: import("@sinclair/typebox").TModule<{}>;
    error: {};
}, {
    schema: {};
    macro: {};
    macroFn: {};
    parser: {};
}, {}, {
    derive: {};
    resolve: {};
    schema: {};
}, {
    derive: {};
    resolve: {};
    schema: {};
}>>;
