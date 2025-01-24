# Contribution Guide for Mantou 🥟

Thank you for your interest in contributing to **Mantou**, the full-stack React framework! We welcome contributions from everyone, whether you're fixing bugs, improving documentation, or proposing new features.

To ensure a smooth collaboration, please follow the guidelines below.

---

## Table of Contents
1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Conventional Commits](#conventional-commits)
4. [Versioning and Release Strategy](#versioning-and-release-strategy)
5. [Pull Request Guidelines](#pull-request-guidelines)
6. [Development Setup](#development-setup)
7. [Reporting Issues](#reporting-issues)
8. [Feature Requests](#feature-requests)
9. [Style Guide](#style-guide)
10. [Testing](#testing)
11. [Documentation](#documentation)

---

## Code of Conduct
Before contributing, please read and adhere to our [Code of Conduct](https://github.com/kao-xiang/mantou/blob/main/CODE_OF_CONDUCT.md). We are committed to fostering a welcoming and inclusive environment for all contributors.

---

## Getting Started
1. **Fork the repository** on GitHub:
   - Visit [kao-xiang/mantou](https://github.com/kao-xiang/mantou) and click "Fork."
2. **Clone your fork** to your local machine:
   ```bash
   git clone https://github.com/your-username/mantou.git
   ```
3. **Create a new branch** for your changes:
   ```bash
   git checkout -b feat/your-feature-name
   ```
4. Make your changes and ensure they follow the guidelines below.
5. Push your changes to your fork and submit a pull request.

---

## Conventional Commits
We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification to maintain a consistent commit history. This helps with automated changelog generation and versioning.

### Commit Message Format
Each commit message should follow this format:
```
<type>(<scope>): <description>
```

#### Types
- `feat`: A new feature.
- `fix`: A bug fix.
- `docs`: Documentation changes.
- `style`: Code style changes (e.g., formatting, linting).
- `refactor`: Code changes that neither fix a bug nor add a feature.
- `test`: Adding or updating tests.
- `chore`: Maintenance tasks (e.g., dependency updates, CI/CD changes).

#### Examples
- `feat(router): add support for dynamic routes`
- `fix(server): resolve memory leak in request handling`
- `docs(readme): update installation instructions`

---

## Versioning and Release Strategy
We use a GitHub bot to automate versioning and publishing based on **Conventional Commits**. Here's how it works:

### Version Bumps
- **`major`**: Triggered by `!feat` or commits with **breaking changes**.
  - Example: `feat!: remove deprecated API`
- **`minor`**: Triggered by `feat` (new features without breaking changes).
  - Example: `feat(api): add new endpoint`
- **`patch`**: Triggered by `fix` (bug fixes) on **stable branches** (`v1`, `v2`, `v3`).
  - Example: `fix(router): handle null routes`
- **`canary`**: Triggered by `fix` (bug fixes) on the **develop branch**.
  - Example: `fix(auth): resolve login issue`

### Important Notes
- Commits that do not follow the **Conventional Commit** format or do not include `feat`, `fix`, or breaking changes will **not trigger a version change**.
- Always include a clear and descriptive commit message to ensure the bot correctly interprets your changes.

### Stable vs. Develop Branches
- **Stable branches** (`v1`, `v2`, `v3`): Only `patch` versions are published for bug fixes.
- **Develop branch**: `canary` versions are published for bug fixes, allowing for testing without affecting stable releases.

---

## Pull Request Guidelines
1. **Keep PRs focused**: Each PR should address a single issue or feature.
2. **Reference issues**: If your PR fixes an issue, include `Closes #issue-number` in the description.
3. **Write clear descriptions**: Explain the purpose of your changes and any relevant context.
4. **Update documentation**: If your changes affect the API or usage, update the relevant documentation.
5. **Run tests**: Ensure all tests pass before submitting your PR.

---

## Development Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Run tests:
   ```bash
   npm test
   ```

---

## Reporting Issues
If you find a bug or have a suggestion, please [open an issue](https://github.com/kao-xiang/mantou/issues). Include the following details:
- A clear description of the issue.
- Steps to reproduce the issue.
- Expected vs. actual behavior.
- Screenshots or error logs (if applicable).

---

## Feature Requests
We welcome feature requests! Please open an issue and:
1. Describe the feature you'd like to see.
2. Explain why it would be valuable.
3. Provide any relevant examples or references.

---

## Style Guide
- Follow the existing code style in the repository.
- Use **Prettier** and **ESLint** for consistent formatting and linting.
- Write meaningful variable and function names.
- Keep functions small and focused.

---

## Testing
- Write unit tests for new features and bug fixes.
- Ensure tests cover edge cases and error handling.
- Run the test suite before submitting your PR:
  ```bash
  npm test
  ```

---

## Documentation
- Update the README or relevant docs if your changes affect the API or usage.
- Write clear and concise documentation for new features.
- Use Markdown for formatting.

---

## Thank You!
Your contributions help make Mantou better for everyone. We appreciate your time and effort! 🎉
