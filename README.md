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

## 📁 Project Structure

```
my-app/
├── src/
│   ├── (app)/      # Your pages live here
│   │   ├── page.tsx   # Root page
│   │   └── layout.tsx # Root layout
│   │   └── route.ts   # Route file
│   └── _types/         # Type definitions (Skip _ folder)
└── mantou.config.ts   # Configuration (optional)
```

## 💻 Code Examples

### Type-Safe Route Handler
```typescript
// src/route.ts
import { guard, handler } from 'mantou'

// Guard
const auth = (roles: string[]) => guard(async () => {
  console.log('Auth guard: ', roles);
  return true
})

// API Route
export const get = handler(() => {
  return `Hello World`;
}, {}, [auth(['buyer'])])

// SSR data
export const data = () => ({
  name: 'John Doe',
  age: 30
})
```

### Layout Component
```typescript
// src/layout.tsx
import './index.css'

export default function Layout({ children }: any) {
    return <div>{children}</div>
}
```

### Landing Page
```typescript
// src/page.tsx
export default function Page({ data }: any) {
    return (
        <div className="container">
            <header className="header">
                <div className="logo">🍞 mantou</div>
                <div className="subtitle">
                    The Next Generation Web Framework Powered by Bun
                </div>
            </header>
            <main>
                <div className="card-grid">
                    <div className="card">
                        <h2>⚡️ Super Fast</h2>
                        <p>Built on Bun for exceptional performance.</p>
                    </div>
                    {/* More feature cards */}
                </div>
            </main>
        </div>
    )
}
```

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

### Developer Joy
We believe development should be fun. MANTOU brings joy with:
- Instant feedback loops
- Clear error messages
- Intuitive APIs
- Zero-config that "just works"

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

Visit [docs.mantou.dev](https://docs.mantou.dev) for full documentation.

## 💬 Community

- 📫 [GitHub Discussions](https://github.com/ppenter/mantou/discussions)
- 🐛 [Issue Tracker](https://github.com/ppenter/mantou/issues)
- 🌟 [GitHub Stars](https://github.com/ppenter/mantou/stargazers)

## 📄 License

[MIT License](LICENSE) - feel free to use and modify!
