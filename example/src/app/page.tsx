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
                    <h2>⚡️ Lightning Fast</h2>
                    <p>Built on top of Bun, mantou delivers exceptional performance with near-instant startup times and blazing-fast hot module replacement.</p>
                </div>
                <div className="card">
                    <h2>🎯 Next.js Inspired</h2>
                    <p>Familiar Next.js-like API with file-based routing, server components, and API routes, all optimized for the Bun runtime.</p>
                </div>
                <div className="card">
                    <h2>🛠 Modern Development</h2>
                    <p>TypeScript first, zero-config, and built-in support for modern web features like CSS modules, ES modules, and more.</p>
                </div>
                <div className="card">
                    <h2>📦 Optimized Build</h2>
                    <p>Leveraging Bun's built-in bundler and transpiler for extremely fast builds and optimized production deployments.</p>
                </div>
            </div>

            <div className="code">
                $ bunx create-mantou-app my-project
            </div>

            <div className="links">
                <a href="/docs">Documentation</a>
                <a href="/github">GitHub</a>
            </div>
        </main>
    </div>
    )
}