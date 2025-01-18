module.exports = {
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
      '@semantic-release/changelog',
      '@semantic-release/npm',
      '@semantic-release/github',
      '@semantic-release/git'
    ]
  }
  