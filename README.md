# MANTOU 🍞

*The Next Generation Web Framework Powered by Bun*

[![license](https://img.shields.io/github/license/ppenter/mantou?style=default&logo=opensourceinitiative&logoColor=white&color=ffca7f)](LICENSE)
[![last-commit](https://img.shields.io/github/last-commit/ppenter/mantou?style=default&logo=git&logoColor=white&color=ffca7f)](https://github.com/ppenter/mantou/commits/master)
[![repo-top-language](https://img.shields.io/github/languages/top/ppenter/mantou?style=default&color=ffca7f)](https://github.com/ppenter/mantou/search?l=typescript)

## 🌟 Overview

MANTOU (馒头) is a delightfully simple yet powerful web framework that brings together the best of Next.js patterns with Bun's blazing speed. Like its namesake - the fluffy Chinese steamed bun - MANTOU is light, satisfying, and gets the job done without unnecessary complexity.

## ⚡️ Key Features

- **0ms Cold Start**: Powered by Bun's lightning-fast runtime
- **Type Safety Without Tears**: Automatic type inference that just works
- **File-Based Magic**: Next.js-style routing you already know and love
- **API Docs That Write Themselves**: Automatic Swagger generation
- **Hot Like 🔥**: Ultra-fast hot module replacement
- **Zero Config**: Sensible defaults with full customization when you need it

## 🚀 Quick Start

```bash
# Create your next amazing project
bunx create-mantou-app my-app

# Jump into the action
cd my-app
bun install
bun run dev
```
Later in [Documentation](https://ppenter.github.io/mantou/)

## 🎯 Roadmap

### Phase 1
- [x] File-based routing system
- [x] Basic SSR implementation
- [x] Type-safe API routes
- [ ] Production build optimization
- [ ] Websocket Integration
- [ ] Plugins

## 🎨 Why Choose MANTOU?

### Simple Yet Powerful
Like a steamed bun, MANTOU is simple on the outside but packed with goodness inside. We eliminate complexity while keeping the power you need.

### Performance First
Built on Bun, MANTOU is designed for speed:
- Sub-millisecond cold starts
- Lightning-fast HMR
- Optimized build output
- Minimal runtime overhead

## 🛠 Configuration

```typescript
// mantou.config.ts
export default {
  swagger: {
    path: '/docs',
    documentation: {
      info: {
        title: 'Mantou Example',
        description: 'Mantou Example API',
        version: '1.0.0',
      },
      security: [{ JwtAuth: [] }],
      components: {
        securitySchemes: {
          JwtAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
            description: "Enter JWT Bearer token **_only_**",
          },
        },
      },
    }
  }
}
```

## 🤝 Contributing

We love contributions! Here's how you can help:

1. Fork the repo
2. Create your feature branch
3. Make your changes
4. Submit a PR

See our [Contributing Guide](CONTRIBUTING.md) for more details.

## 📘 Documentation

Visit [this](https://ppenter.github.io/mantou/) for full documentation.

## 💬 Community

- 📫 [GitHub Discussions](https://github.com/ppenter/mantou/discussions)
- 🐛 [Issue Tracker](https://github.com/ppenter/mantou/issues)
- 🌟 [GitHub Stars](https://github.com/ppenter/mantou/stargazers)

## 📄 License

[MIT License](LICENSE) - feel free to use and modify!
