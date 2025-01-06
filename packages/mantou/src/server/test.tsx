import React from "react";


export const TestPage = () => {
    const [state, setState] = React.useState(0);
    return (
        <html>
            <head>
                <meta charSet='utf-8' />
                <title>React app</title>
                <meta name='viewport' content='width=device-width, initial-scale=1' />
            </head>
            <body>
                <h1>Test Page</h1>
                <p>Current state: {state}</p>
                <button onClick={() => setState(state + 1)}>Increment</button>
            </body>
        </html>
    )
}