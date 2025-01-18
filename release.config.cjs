const config = {
  tagFormat: 'v${version}',
  branches: [
    'master',
    {
      name: 'develop',
      prerelease: 'canary',
      channel: 'canary'
    }
  ],
  plugins: process.env.GITHUB_REF === 'refs/heads/develop' 
    ? [
        '@semantic-release/commit-analyzer',
        '@semantic-release/release-notes-generator',
        [
          '@semantic-release/npm',
          {
            pkgRoot: '.',
            distTag: 'canary'
          }
        ]
      ]
    : [
        '@semantic-release/commit-analyzer',
        '@semantic-release/release-notes-generator',
        '@semantic-release/changelog',
        [
          '@semantic-release/npm',
          {
            pkgRoot: '.',
            distTag: 'latest'
          }
        ],
        '@semantic-release/github',
        [
          '@semantic-release/git',
          {
            message: 'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}'
          }
        ]
      ]
};

module.exports = config;