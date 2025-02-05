#!/usr/bin/env bun
import { program } from 'commander';
import prompts from 'prompts';
import pc from 'picocolors';
import { join } from 'path';
import { copy, ensureDir, writeFile } from 'fs-extra';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

const mantouVersion = "^1.0.13"

interface ProjectOptions {
  name: string;
  template: 'basic' | 'full';
  // guards?: boolean;
  // database?: 'none' | 'postgres' | 'mysql';
}

async function createProject(options: ProjectOptions) {
  const projectDir = join(process.cwd(), options.name);

  try {
    await ensureDir(projectDir);

    const templateDir = join(__dirname, '..', 'templates', options.template);
    await copy(templateDir, projectDir);

    // Create package.json
    const packageJson: {
      name: string;
      version: string;
      type: string;
      scripts: { [key: string]: string };
      dependencies: { [key: string]: string };
      devDependencies: { [key: string]: string };
    } = {
      name: options.name,
      version: "0.1.0",
      type: "module",
      scripts: {
        "dev": "mantou dev",
        "start": "mantou start",
        "build": "mantou build",
        "typecheck": "tsc --noEmit"
      },
      dependencies: {
        "mantou": mantouVersion,
        "react": "^18.2.0",
        "react-dom": "^18.2.0",
        "glob": "^11.0.1"
      },
      devDependencies: {
        "bun-types": "latest",
        "typescript": "^5.0.0",
        "@types/react": "^18.0.0",
      }
    }; 

    // Add optional dependencies
    // if (options.database === 'postgres') {
    //   packageJson.dependencies["drizzle-orm"] = "^0.30.0";
    //   packageJson.dependencies["postgres"] = "^3.4.0";
    // } else if (options.database === 'mysql') {
    //   packageJson.dependencies["drizzle-orm"] = "^0.30.0";
    //   packageJson.dependencies["mysql2"] = "^3.9.0";
    // }

    await writeFile(
      join(projectDir, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );

    console.log(pc.green('\nSuccess! Created Mantou app at'), pc.cyan(projectDir));
    console.log('\nInside that directory, you can run several commands:');
    console.log('\n  ' + pc.cyan('bun dev'));
    console.log('    Starts the development server.');
    console.log('\n  ' + pc.cyan('bun build'));
    console.log('    Builds the app for production.');
    console.log('\n  ' + pc.cyan('bun start'));
    console.log('    Runs the built app in production mode.');
    console.log('\nWe suggest that you begin by typing:');
    console.log('\n  ' + pc.cyan('cd') + ' ' + options.name);
    console.log('  ' + pc.cyan('bun install'));
    console.log('  ' + pc.cyan('bun dev'));
    console.log('\nHappy hacking!');
  } catch (error) {
    console.error(pc.red('\nError creating project:'), error);
    process.exit(1);
  }
}

program
  .name('create-mantou-app')
  .description('Create a new Mantou application')
  .argument('[name]', 'Project name')
  .action(async (name: string) => {
    const questions: prompts.PromptObject<string>[] = [];

    if (!name) {
      questions.push({
        type: 'text',
        name: 'name',
        message: 'What is your project named?',
        initial: 'my-mantou-app'
      });
    }

    questions.push(
      {
        type: 'select',
        name: 'template',
        message: 'Which template would you like to use?',
        choices: [
          { title: 'Basic', value: 'basic' },
          // { title: 'Full (with examples)', value: 'full' }
        ]
      },
      // {
      //   type: 'confirm',
      //   name: 'guards',
      //   message: 'Would you like to include authentication guards?',
      //   initial: true
      // },
      // {
      //   type: 'select',
      //   name: 'database',
      //   message: 'Which database would you like to use?',
      //   choices: [
      //     { title: 'None', value: 'none' },
      //     { title: 'PostgreSQL', value: 'postgres' },
      //     { title: 'MySQL', value: 'mysql' }
      //   ]
      // }
    );

    const response = await prompts(questions);
    await createProject({
      name: name || response.name, ...response,
      template: response.template as 'basic' | 'full',
    });
  });

program.parse();