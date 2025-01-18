const getLatestVersion = async () => {
  try {
    // Try to get latest git tag first
    const { execSync } = require('child_process');
    const latestTag = execSync('git describe --tags --abbrev=0').toString().trim();
    return latestTag.replace('v', '');
  } catch (gitError) {
    // If no git tags exist, check npm registry
    const https = require('https');
    
    const getPackageVersion = (pkg) => {
      return new Promise((resolve, reject) => {
        https.get(`https://registry.npmjs.org/${pkg}/latest`, (res) => {
          if (res.statusCode !== 200) {
            reject(new Error(`Failed to fetch version for ${pkg}: HTTP ${res.statusCode}`));
            return;
          }

          let data = '';
          res.on('data', (chunk) => { data += chunk; });
          res.on('end', () => {
            try {
              const version = JSON.parse(data).version;
              if (!version) {
                reject(new Error(`No version found for ${pkg}`));
                return;
              }
              resolve(version);
            } catch (e) {
              reject(new Error(`Failed to parse version data for ${pkg}: ${e.message}`));
            }
          });
        }).on('error', (error) => reject(new Error(`Network error for ${pkg}: ${error.message}`)));
      });
    };

    // Check both packages
    try {
      const [mantouVersion, createAppVersion] = await Promise.all([
        getPackageVersion('mantou'),
        getPackageVersion('create-mantou-app')
      ]);

      // Verify we have at least one valid version
      const versions = [mantouVersion, createAppVersion].filter(Boolean);
      if (!versions.length) {
        throw new Error('No valid versions found for any package');
      }

      return versions.sort().reverse()[0];
    } catch (npmError) {
      throw new Error(`Failed to determine version: ${npmError.message}`);
    }
  }
};

const config = {
  branches: [
    'master',
    {
      name: 'develop',
      prerelease: 'canary',
      channel: 'canary'
    }
  ],
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    [
      '@semantic-release/changelog',
      {
        changelogFile: 'CHANGELOG.md'
      }
    ],
    [
      '@semantic-release/npm',
      {
        npmPublish: true,
        pkgRoot: '.'
      }
    ],
    [
      '@semantic-release/git',
      {
        assets: [
          'CHANGELOG.md',
          'package.json',
          'bun.lockb'
        ],
        message: 'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}'
      }
    ],
    [
      '@semantic-release/github',
      {
        assets: []
      }
    ]
  ],
  releaseRules: [
    { type: 'feat', release: 'minor' },
    { type: 'fix', release: 'patch' },
    { type: 'docs', release: 'patch' },
    { type: 'style', release: 'patch' },
    { type: 'refactor', release: 'patch' },
    { type: 'perf', release: 'patch' },
    { breaking: true, release: 'major' }
  ],
  preset: 'angular',
  tagFormat: 'v${version}',
  ci: true,
  // Dynamic version determination with strict error handling
  versionInput: {
    update: async (current, type) => {
      const latestVersion = await getLatestVersion();
      if (!latestVersion) {
        throw new Error('Failed to determine current version');
      }
      return latestVersion;
    },
    verification: true
  }
};

module.exports = config;