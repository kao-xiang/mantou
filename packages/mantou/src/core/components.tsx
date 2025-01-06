import React, { useState } from 'react'

export function App() {
  const [count, setCount] = useState(0)
  return (
    <html>
      <head>
        <meta charSet='utf-8' />
        <title>React app</title>
        <meta name='viewport' content='width=device-width, initial-scale=1' />
      </head>
      <body>
        <h1>Counter {count}</h1>
        <button onClick={() => setCount(count + 1)}>Increment</button>
      </body>
    </html>
  )
}

export function Index(pageRoute: any) {
    return`
import React from 'react'
import { hydrateRoot } from 'react-dom/client'
import App from './App.js'

hydrateRoot(document, <App />)
    `
}