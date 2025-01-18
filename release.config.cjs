/** @type {import('semantic-release').GlobalConfig} */
module.exports = {
  extends: "semantic-release-monorepo",
  tagFormat: "v${version}",
  branches: [
    "master",
    {
      name: "develop",
      prerelease: "canary",
      channel: "canary"
    }
  ],
  plugins: [
    ["@semantic-release/commit-analyzer", {
      preset: "angular",
      releaseRules: [
        {type: "feat", release: "minor"},
        {type: "fix", release: "patch"},
        {type: "docs", release: "patch"},
        {type: "style", scope: "ui", release: "patch"},
        {type: "refactor", release: "patch"},
        {type: "perf", release: "patch"},
        {type: "test", release: "patch"}
      ]
    }],
    "@semantic-release/release-notes-generator",
    "@semantic-release/changelog",
    ["@semantic-release/npm", {
      pkgRoot: `packages/${process.env.PACKAGE_NAME}`,
      npmPublish: true,
      tarballDir: "dist"
    }],
    ["@semantic-release/git", {
      assets: [
        `packages/${process.env.PACKAGE_NAME}/package.json`,
        `packages/${process.env.PACKAGE_NAME}/CHANGELOG.md`
      ],
      message: "chore(release): v${nextRelease.version} [skip ci]\n\n${nextRelease.notes}"
    }],
    ["@semantic-release/github", {
      assets: [{
        path: "dist/*.tgz",
        label: "npm package"
      }],
      successComment: false,
      failTitle: false,
      releasedLabels: false,
      addReleases: "bottom",
      releaseNameTemplate: "Release <%= nextRelease.version %> <%= branch.channel ? '(' + branch.channel + ')' : '' %>"
    }]
  ]
}
