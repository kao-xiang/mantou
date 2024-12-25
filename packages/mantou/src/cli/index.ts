#!/usr/bin/env bun
import { program } from 'commander';
import { watch } from 'chokidar';
import pc from 'picocolors';
import { startServer } from '../server';
import { resolve } from 'node:path';

let currentServer = null as any

async function restartServer(isDev = false) {
  try {
    if (currentServer) {
      // Gracefully close the current server
      const app = currentServer;
      await app.stop();
    }

    currentServer = await startServer({isDev});
  } catch (error) {
    console.error(pc.red('Error restarting server:'), error);
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
    const watcher = watch("./src", {
    });

    watcher
      .on('change', async (path) => {
        // console.log(pc.yellow(`\nFile changed: ${path}`));
        console.log(pc.blue('Restarting server...'));
        
        // Clear require cache for the changed file
        delete require.cache[resolve(path as string)];
        
        await restartServer(true);
      })
      .on('error', error => console.error(pc.red(`Watcher error: ${error}`)));

    
    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.log(pc.yellow('\nGracefully shutting down...'));
      if (currentServer) {
        const app = currentServer;
        await app.stop();
      }
      process.exit(0);
    });
  });

program
  .command('start')
  .description('Start production server')
  .action(async () => {
    process.env.NODE_ENV = 'production';
    await startServer({
      isDev: false
    });
  });

program.parse();