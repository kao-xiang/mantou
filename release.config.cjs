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
    [
      '@semantic-release/commit-analyzer',
      {
        preset: 'angular'
      }
    ],
    '@semantic-release/release-notes-generator',
    '@semantic-release/changelog',
    [
      '@semantic-release/npm',
      {
        npmPublish: true,
        pkgRoot: '.'
      }
    ],
    [
      '@semantic-release/npm',
      {
        npmPublish: true,
        pkgRoot: '.',
        registry: 'https://npm.pkg.github.com'
      }
    ],
    [
      '@semantic-release/github',
      {
        successComment: false,
        failTitle: false
      }
    ],
    [
      '@semantic-release/git',
      {
        message: 'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}'
      }
    ]
  ]
};

module.exports = config;