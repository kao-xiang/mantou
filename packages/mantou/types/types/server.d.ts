import type { ElysiaSwaggerConfig } from "@elysiajs/swagger";
export interface ServerOptions<Path extends string = any> {
    isDev?: boolean;
    port?: number;
    host?: string;
    ssl?: boolean;
    middlewares?: any[];
    baseDir?: string;
    swagger?: ElysiaSwaggerConfig<Path>;
    configPath?: string;
    cors?: {
        origin?: string | string[];
    };
    outputDir?: string;
    apiPrefix?: string;
}
