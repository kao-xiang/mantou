import { Elysia } from 'elysia';
import type { ServerOptions } from '@/types/server';
export declare function buildRoutes(app: Elysia, config?: ServerOptions): Promise<Elysia>;
export declare const startServer: (_options: ServerOptions) => Promise<Elysia<"", {
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
