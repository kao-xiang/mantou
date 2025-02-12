import React from "react";
import dotenv from "dotenv";
dotenv.config();
import { Elysia, NotFoundError, redirect } from "elysia";
import { logger } from "./logger";
import _ from "lodash";
import type { BaseContext, PartialServerOptions } from "@/exports/types";
import { loadConfig } from "./config";
import { build } from "@/builder";
import { applyPlugins, cleanOutputDir } from "./utils";
import ReactDOMServer from "react-dom/server";
import { generateHtml, HTMLShell } from "@/builder/component";
import type { MantouBuilder } from "@/builder/builder";

const liveReloadClients = new Set<WebSocket>();

function notifyClientsToReload() {
  for (const client of liveReloadClients) {
    try {
      client.send("reload");
    } catch (error) {
      liveReloadClients.delete(client);
    }
  }
}

function startDevServer() {
  global.__mantou_app.ws("/__mantou_live_reload", {
    open(ws: any) {
      liveReloadClients.add(ws);
    },
    close(ws: any) {
      liveReloadClients.delete(ws);
    },
  });
  global.notifyClientsToReload = notifyClientsToReload;
}

export const startServer = async (_options?: PartialServerOptions) => {
  const __options = await loadConfig(_options);
  const _app = new Elysia();

  global.__mantou_config = __options;
  global.__mantou_app = _app;

  await cleanOutputDir();

  await applyPlugins("beforeBuild");

  await build({
    app: global.__mantou_app,
    config: global.__mantou_config,
    organs: global.__mantou_organs,
  }).catch((error) => {
    logger.error("🍞 Build failed");
    console.error(error);
    process.exit(1);
  });

  await applyPlugins("afterBuild");

  const isSSL = global.__mantou_config.ssl;
  const sslText = isSSL ? "https" : "http";

  await applyPlugins("beforeStart");

  if (global.__mantou_config.isDev && !global.__mantou_config.onlyBuild) {
    startDevServer();
  }

  global.__mantou_app
    .onRequest(async (ctx) => {
      const verbosePath = [
        "favicon.ico",
        "dist",
        "public",
        "__mantou_live_reload",
      ];
      const url = new URL(ctx.request.url);
      const path = url.pathname;
      if (!verbosePath.some((p) => path.includes(p))) {
        logger.info(`🍞 Request: ${ctx.request.url}`);
      }
      const isPage = global.__mantou_organs.getPageByPath(path);
      interface NewCtx extends BaseContext {
        path: string;
        route: string;
        body?: any;
        query: Record<string, string>;
        params: Record<string, any>;
        isPage?: boolean;
      }
      const pages = global.__mantou_organs.pages;
      const organs = global.__mantou_organs;
      let newCtx: NewCtx = {
        ...ctx,
        path: path,
        route: "",
        query: Object.fromEntries(url.searchParams),
        params:
          pages.find((page: any) => {
            const res = organs.matchDynamicPath(path, page.path);
            return res;
          })?.params || {},
        isPage: isPage ? true : false,
      };
      await organs._applyMiddlewares(path, newCtx);
      ctx.store = newCtx.store;
      if (!isPage) {
        const route = organs.getRouteByPath(path);
        if (route) {
          return await route.handler(newCtx).catch((error: any) => {
            console.error(error);
            throw error;
          });
        }
      }
    })
    .onError(async (ctx) => {
      const builder = global.__mantou_organs as MantouBuilder<any, any>;

      if (ctx.code === "NOT_FOUND") {
        logger.error(`🍞 ${ctx.error} ${ctx.path}`);
        const html = generateHtml({
          metadata: (await builder.getMetadataByPath(ctx.path, ctx)) || {},
          data: {},
          query: {},
          params: {},
          scriptSrc: "/dist/client/404.js",
          children: React.createElement(HTMLShell, {
            children: React.createElement(
              builder.notFoundPage?.Component || (() => <div>404</div>),
              {
                error: {
                  message: ctx.error,
                  code: ctx.code,
                  status: (ctx as any).status,
                },
              }
            ),
          }),
        });

        ctx.set.headers["Content-Type"] = "text/html";
        return html;
      } else {
        logger.error(`🍞 ${ctx.error}`);
        console.error(ctx.error);
        const html = generateHtml({
          metadata: (await builder.getMetadataByPath(ctx.path, ctx)) || {},
          data: {},
          query: {},
          params: {},
          scriptSrc: "/dist/client/error.js",
          children: React.createElement(HTMLShell, {
            children: React.createElement(
              builder.errorPage?.Component || (() => <div>500</div>),
              {
                error: {
                  message: ctx.error,
                  code: ctx.code,
                  status: (ctx as any).status,
                },
              }
            ),
          }),
        });

        ctx.set.headers["Content-Type"] = "text/html";
        return html;
      }
    });

  !global.__mantou_config.onlyBuild &&
    global.__mantou_app.listen(
      {
        port: global.__mantou_config.port || 3000,
        hostname: global.__mantou_config.host || "localhost",
      },
      () => {
        logger.info(
          `🍞 Server started on ${sslText}://${global.__mantou_config.host}:${global.__mantou_config.port}`
        );
      }
    );

  return global.__mantou_app;
};
