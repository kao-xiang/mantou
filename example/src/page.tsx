// src/page,tsx
export default function Page({ data }: any) {
    return (
        <div className="container">
            <header className="header">
                <div className="logo">🍞 mantou</div>
                <div className="subtitle">The Next Generation Web Framework Powered by Bun</div>
            </header>

            <main>
                <div className="card-grid">
                    <div className="card">
                        <h2>⚡️ Super Fast</h2>
                        <p>Built on top of Bun, mantou delivers exceptional performance with near-instant startup times and blazing-fast hot module replacement.</p>
                    </div>
                    <div className="card">
                        <h2>🎯 Effortless File-Based Routing</h2>
                        <p>Familiar Next.js-like API with effortless file-based routing, server components, and API routes, all optimized for the Bun runtime.</p>
                    </div>
                    <div className="card">
                        <h2>🛠 Typesafe API Routes</h2>
                        <p>TypeScript first, zero-config, and built-in support for typesafe API routes, ensuring robust and maintainable code.</p>
                    </div>
                    <div className="card">
                        <h2>📦 Auto OpenAPI Docs</h2>
                        <p>Automatically generate OpenAPI documentation for your API routes, making it easy to keep your API docs up-to-date.</p>
                    </div>
                </div>

                <div className="code">
                    $ bunx create-mantou-app my-project
                </div>

                <div className="links">
                    <a href="https://github.com/ppenter/mantou" target="_blank">Documentation</a>
                    <a href="https://github.com/ppenter/mantou" target="_blank">GitHub</a>
                </div>
            </main>
        </div>
    )
}