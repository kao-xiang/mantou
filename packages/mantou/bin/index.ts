#!/usr/bin/env bun
import { program } from "commander";
import { watch } from "chokidar";
import pc from "picocolors";
import type Elysia from "elysia";
import { startServer } from "lib/server";
import { buildApp } from "lib/config";

let currentServer: Elysia | null = null;

async function restartServer(options: { isDev?: boolean } = {}) {
  try {
    if (currentServer) {
      try {
        await currentServer.stop?.();
      } catch {}
      currentServer = null;
    }
    currentServer = await startServer(options);
  } catch (error: any) {
    console.error(pc.red("Error restarting server:"), error?.message || error);
    process.exit(1);
  }
}

program.name("mantou").description("Mantou framework CLI").version("1.0.0");

program
  .command("dev")
  .description("Start development server with live reload")
  .action(async () => {
    process.env.NODE_ENV = "development";
    await restartServer({ isDev: true });

    const watcher = watch("./src", {
      ignored: /(^|[\/\\])\../,
      persistent: true,
      ignoreInitial: true,
      awaitWriteFinish: { stabilityThreshold: 100, pollInterval: 100 },
    });

    watcher
      .on("all", async (act, path) => {
        if (["change", "add", "unlink"].includes(act)) {
          console.log(pc.blue(`File ${act}: ${path}`));
          if (
            path.includes("server") ||
            path.endsWith(".ts") ||
            path.includes("client") ||
            path.endsWith(".tsx") ||
            path.endsWith(".css")
          ) {
            console.log(pc.blue("Restarting server..."));
            await restartServer({ isDev: true });
            if (
              path.includes("client") ||
              path.endsWith(".tsx") ||
              path.endsWith(".css")
            )
              global.notifyClientsToReload();
          }
        }
      })
      .on("error", (error) => console.error(pc.red(`Watcher error: ${error}`)));

    process.on("SIGINT", async () => {
      console.log(pc.yellow("\nGracefully shutting down..."));
      if (currentServer) await currentServer.stop();
      await watcher.close();
      process.exit(0);
    });
  });

program
  .command("build")
  .description("Build client for production")
  .action(async () => {
    process.env.NODE_ENV = "production";
    await buildApp({ isDev: false });
  });

program
  .command("start")
  .description("Start production server")
  .action(async () => {
    process.env.NODE_ENV = "production";
    await startServer({ isDev: false });
  });

program.parse();
