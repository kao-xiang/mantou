const common = {
  tagFormat: 'v${version}',
  branches: [
    {
      name: 'master'
    },
    {
      name: 'develop',
      channel: 'canary',
      prerelease: 'canary',
      base: 'master'
    }
  ]
};

const masterPlugins = [
  '@semantic-release/commit-analyzer',
  '@semantic-release/release-notes-generator',
  '@semantic-release/changelog',
  [
    '@semantic-release/npm',
    {
      pkgRoot: '.'
    }
  ],
  '@semantic-release/github',
  [
    '@semantic-release/git',
    {
      message: 'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}'
    }
  ]
];

const canaryPlugins = [
  '@semantic-release/commit-analyzer',
  '@semantic-release/release-notes-generator',
  [
    '@semantic-release/npm',
    {
      pkgRoot: '.'
    }
  ]
];

module.exports = {
  ...common,
  plugins: process.env.GITHUB_REF === 'refs/heads/develop' ? canaryPlugins : masterPlugins
};