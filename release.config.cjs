const masterConfig = {
  tagFormat: 'v${version}',
  branches: [
    {
      name: 'master'
    },
    {
      name: 'develop',
      channel: 'canary',
      prerelease: 'canary'
    }
  ],
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    '@semantic-release/changelog',
    [
      '@semantic-release/npm',
      {
        pkgRoot: '.'
      }
    ],
    [
      '@semantic-release/github',
      {
        successComment: false,
        failTitle: false,
        releasedLabels: false
      }
    ],
    [
      '@semantic-release/git',
      {
        message: 'chore(release): v${nextRelease.version} [skip ci]',
        assets: ['CHANGELOG.md', 'package.json']
      }
    ]
  ]
};

const developConfig = {
  tagFormat: 'v${version}',
  branches: [
    {
      name: 'master'
    },
    {
      name: 'develop',
      channel: 'canary',
      prerelease: 'canary'
    }
  ],
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    [
      '@semantic-release/npm',
      {
        pkgRoot: '.'
      }
    ]
  ]
};

module.exports = process.env.GITHUB_REF === 'refs/heads/develop' ? developConfig : masterConfig;