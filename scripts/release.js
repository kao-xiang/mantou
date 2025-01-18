const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const packagesDir = path.join(__dirname, '../packages');
const packages = fs.readdirSync(packagesDir);

let allChanges = [];

async function buildAndPublish() {
  // First build all packages
  console.log('Building all packages...');
  for (const pkg of packages) {
    if (fs.statSync(path.join(packagesDir, pkg)).isDirectory()) {
      try {
        console.log(`Building ${pkg}...`);
        execSync('bun run build', {
          cwd: path.join(packagesDir, pkg),
          stdio: 'inherit'
        });
      } catch (error) {
        console.error(`Failed to build ${pkg}:`, error);
        process.exit(1);
      }
    }
  }

  // Then publish packages
  console.log('Publishing packages...');
  for (const pkg of packages) {
    if (fs.statSync(path.join(packagesDir, pkg)).isDirectory()) {
      console.log(`Publishing ${pkg}...`);
      try {
        const output = execSync('bun semantic-release', {
          env: {
            ...process.env,
            PACKAGE_NAME: pkg
          },
          stdio: ['pipe', 'pipe', 'pipe']
        });
        
        const changelog = output.toString();
        if (changelog) {
          allChanges.push(`## ${pkg}\n${changelog}`);
        }
      } catch (error) {
        console.error(`Failed to publish ${pkg}:`, error);
      }
    }
  }

  // Write consolidated changelog
  if (allChanges.length > 0) {
    const consolidatedChangelog = allChanges.join('\n\n');
    fs.writeFileSync(
      path.join(__dirname, '../CHANGELOG.md'), 
      consolidatedChangelog,
      { flag: 'a' }
    );
  }
}

buildAndPublish().catch(console.error);
