import type Elysia from "elysia";
import type { MantouOrgans, ServerOptions } from ".";
import type { MantouBuilder } from "@/builder/builder";

declare global {
    var __mantou_config: ServerOptions;
    var __mantou_app: Elysia;
    var __mantou_App_tsx: any;
    var __mantou_organs: MantouBuilder
}