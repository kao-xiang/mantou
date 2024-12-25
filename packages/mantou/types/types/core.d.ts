import { Elysia } from "elysia";
export type Plugin = {
    name: string;
    setup: (app: Elysia) => void;
};
export type FrameworkConfig = {
    port?: number;
    skipFolders?: string[];
    plugins?: Plugin[];
};
export interface GuardFunction {
    (context: any): boolean | Promise<boolean>;
}
export type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete' | 'options' | 'head';
