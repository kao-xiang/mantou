import type { ServerOptions } from '@/types/server';
export declare const loadConfig: (configPath?: string, _options?: ServerOptions) => Promise<ServerOptions<any>>;
export declare function writeRecursive(path: string, content: string): Promise<boolean>;
