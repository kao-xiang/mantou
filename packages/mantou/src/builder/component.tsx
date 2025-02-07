import type { PropsWithChildren } from "react";

export const HTMLShell = (props: PropsWithChildren) => {
  return (
    <html>
      <head>
        <div id="mantou-head"></div>
        <link rel="stylesheet" href="/dist/styles/global.css" />
      </head>
      <body>
        <div id="root">{props.children}</div>
        <script src="/dist/client/index.js" type="module"></script>
        <div id="mantou-script"></div>
      </body>
    </html>
  );
};
