// src/page,tsx
import type { GenerateMetadata, GetServerSideData, PageProps } from 'mantou';

export const metadata = {
    title: "Mantou"
}

export default function Page({ data }: PageProps) {
  console.log('Data: ', data);
  return (
    <div className="container">
      <header className="header">
        <div className="logo">🍞 Mantou PP</div>
        <div className="subtitle">
          The Next Generation Web Framework Powered by Bun
        </div>
      </header>

      <main>
        <div className="card-grid">
          <div className="card">
            <h2>⚡️ Super Fast</h2>
            <p>
              Built on top of Bun, mantou delivers exceptional performance with
              near-instant startup times and blazing-fast hot module
              replacement.
            </p>
          </div>
          <div className="card">
            <h2>🎯 Effortless File-Based Routing</h2>
            <p>
              Familiar Next.js-like API with effortless file-based routing,
              server components, and API routes, all optimized for the Bun
              runtime.
            </p>
          </div>
          <div className="card">
            <h2>🛠 Typesafe API Routes</h2>
            <p>
              TypeScript first, zero-config, and built-in support for typesafe
              API routes, ensuring robust and maintainable code.
            </p>
          </div>
          <div className="card">
            <h2>📦 Auto OpenAPI Docs</h2>
            <p>
              Automatically generate OpenAPI documentation for your API routes,
              making it easy to keep your API docs up-to-date.
            </p>
          </div>
          <div className="card">
            <h2>🔥 Hot Module Replacement</h2>
            <p>
              Instantly see your changes reflected in the browser with hot
              module replacement, powered by Bun.
            </p>
          </div>
          <div className="card">
            <h2>🚀 Zero Config</h2>
            <p>
              Get started with zero configuration. Just run a single command to
              create a new project and start developing.
            </p>
          </div>
        </div>

        <div className="code">
            Editing <code>src/page.tsx</code> and saving will update the page in real-time.
        </div>

        <div className="links">
          <a href="https://github.com/ppenter/mantou" target="_blank">
            Documentation
          </a>
          <a href="https://github.com/ppenter/mantou" target="_blank">
            GitHub
          </a>
        </div>
      </main>
    </div>
  );
}


export const getServerSideData: GetServerSideData = async (ctx) => {
    return {
        data: 'Hello World 23',
    }
}

export const generateMetadata: GenerateMetadata = () => {
    return {
        title: 'Page',
        description: 'Mantou Example API',
    }
}