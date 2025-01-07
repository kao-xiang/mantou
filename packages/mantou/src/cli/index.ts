#!/usr/bin/env bun
import { program } from 'commander';
import { watch } from 'chokidar';
import pc from 'picocolors';
import path from 'node:path';
import { loadConfig, writeRecursive } from '@/lib/fs';
import { fork } from 'child_process';
import { buildApp } from '@/core/build';
import type Elysia from 'elysia';
import { startServer } from '@/server';

let currentServer = null as Elysia | null;

// async function startServer(config: any) {
//   const loadedConfig = await loadConfig(path.resolve(process.cwd(), 'mantou.config.ts'));
//   await buildApp(loadedConfig);

//   const serverPath = path.resolve(process.cwd(), loadedConfig?.outputDir || '', 'server.js');
//   const serverProcess = fork(serverPath, [], {
//     env: { ...process.env, ...config },
//   });

//   return serverProcess;
// }

async function restartServer(isDev = false) {
  try {
    if (currentServer) {
      // Gracefully close the current server
      currentServer.stop()
    }

    currentServer = await startServer({});
  } catch (error: any) {
    console.error(pc.red('Error restarting server:'), error?.message || error);
    process.exit(1);
  }
}

program
  .name('mantou')
  .description('Mantou framework CLI')
  .version('1.0.0');

program
  .command('dev')
  .description('Start development server with hot reload')
  .action(async () => {
    process.env.NODE_ENV = 'development';
    
    // Start server initially
    await restartServer(true);

    // Watch for file changes
    const watcher = watch("./src", {});

    watcher
      .on('change', async (path) => {
        console.log(pc.blue('Restarting server...'));

        await restartServer(true);
      })
      .on('error', error => console.error(pc.red(`Watcher error: ${error}`)));

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.log(pc.yellow('\nGracefully shutting down...'));
      if (currentServer) {
        currentServer.stop();
      }
      process.exit(0);
    });
  });

program
  .command('start')
  .description('Start production server')
  .action(async () => {
    process.env.NODE_ENV = 'production';
    await startServer({ isDev: false });
  });

program.parse();
