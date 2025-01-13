#!/usr/bin/env bun
import { program } from 'commander';
import { watch } from 'chokidar';
import pc from 'picocolors';
import type Elysia from 'elysia';
import { startServer } from '@/server';
import { buildApp } from '@/core/build';

let currentServer: Elysia | null = null;
const liveReloadClients = new Set<WebSocket>();


// Notify connected clients to reload
function notifyClientsToReload() {
  for (const client of liveReloadClients) {
    try {
      client.send('reload');
    } catch (error) {
      liveReloadClients.delete(client);
    }
  }
}

async function restartServer(options: { isDev?: boolean } = {}) {
  try {
    if (currentServer) {
      console.log(pc.yellow('Stopping current server...'));
      await currentServer.stop();
      currentServer = null;
    }

    console.log(pc.blue('Starting new server instance...'));
    currentServer = await startServer(options);
    
    if (options.isDev) {
      currentServer.ws('/live-reload', {
        open(ws: any) {
          liveReloadClients.add(ws);
        },
        close(ws: any) {
          liveReloadClients.delete(ws);
        }
      });
    }
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
  .description('Start development server with live reload')
  .action(async () => {
    process.env.NODE_ENV = 'development';
    
    // Initial build and server start
    await restartServer({ isDev: true });

    // Watch for file changes
    const watcher = watch('./src', {
      ignored: /(^|[\/\\])\../, // Ignore dotfiles
      persistent: true,
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 100,
        pollInterval: 100
      }
    });

    watcher
      .on('change', async (path) => {
        console.log(pc.blue(`File changed: ${path}`));
        
        if (path.includes('server') || path.endsWith('.ts')) {
          // Server-side changes
          console.log(pc.blue('Restarting server...'));
          await restartServer({ isDev: true });
        } 
        
        if (path.includes('client') || path.endsWith('.tsx')) {
          // Client-side changes - rebuild and notify
          await restartServer({ isDev: true });
          notifyClientsToReload();
        }
      })
      .on('error', error => console.error(pc.red(`Watcher error: ${error}`)));

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.log(pc.yellow('\nGracefully shutting down...'));
      if (currentServer) {
        await currentServer.stop();
      }
      await watcher.close();
      process.exit(0);
    });
  });

program
  .command('build')
  .description('Build client for production')
  .action(async () => {
    process.env.NODE_ENV = 'production';
    await buildApp({ isDev: false });
  });

program
  .command('start')
  .description('Start production server')
  .action(async () => {
    process.env.NODE_ENV = 'production';
    await startServer({ isDev: false });
  });

program.parse();