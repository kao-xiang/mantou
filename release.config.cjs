/** @type {import('semantic-release').GlobalConfig} */
module.exports = {
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/changelog",
    ["@semantic-release/npm", {
      "pkgRoot": "packages/${process.env.PACKAGE_NAME}"
    }],
    ["@semantic-release/git", {
      "assets": [
        "packages/${process.env.PACKAGE_NAME}/package.json",
        "packages/${process.env.PACKAGE_NAME}/CHANGELOG.md"
      ],
      "message": "chore(release): ${process.env.PACKAGE_NAME} v${nextRelease.version} [skip ci]\n\n${nextRelease.notes}"
    }],
    ["@semantic-release/github", {
      "assets": [
        {
          "path": "packages/${process.env.PACKAGE_NAME}/dist/**",
          "label": "${process.env.PACKAGE_NAME} distribution"
        }
      ]
    }]
  ],
  "branches": ["main"],
  "monorepo": {
    "packageFiles": [
      "packages/*/package.json"
    ],
    "plugins": [
      ["@semantic-release/commit-analyzer", {
        "preset": "angular",
        "releaseRules": [
          {"type": "feat", "release": "minor"},
          {"type": "fix", "release": "patch"},
          {"type": "docs", "release": "patch"},
          {"type": "style", "scope": "ui", "release": "patch"},
          {"type": "refactor", "release": "patch"},
          {"type": "perf", "release": "patch"},
          {"type": "test", "release": "patch"}
        ]
      }]
    ]
  }
}