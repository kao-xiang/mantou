import { getCssContent, getPublicEnvs } from "@/utils";
import { useNoLog } from "lib/utils";
import type { PropsWithChildren } from "react";
import React from "react";
import ReactDOMServer from "react-dom/server";

interface HTMLShellProps extends PropsWithChildren {
  // metadata: Record<string, string>
  // data: Record<string, any>
  // params: Record<string, any>
  // query: Record<string, any>
}

export const HTMLShell = (props: HTMLShellProps) => {
  return (
    <html>
      <head>
        <div id="mantou-head"></div>
        <link rel="stylesheet" href="/dist/styles/global.css" />
      </head>
      <body>
        <div id="root">{props.children}</div>
        <div id="mantou-script"></div>
      </body>
    </html>
  );
};

interface GenerateHtmlProps {
  metadata: Record<string, string>;
  data: Record<string, any>;
  params: Record<string, any>;
  query: Record<string, any>;
  scriptSrc?: string;
  children: React.ReactNode;
}

export function generateHtml(props: GenerateHtmlProps) {
  const { metadata, data, params, query, scriptSrc = "/dist/client/index.js" } = props;
  let content = "";
  useNoLog(() => {
    content = ReactDOMServer.renderToString(props.children);
  });

  const frontend_envs = getPublicEnvs();
  const cssContent = getCssContent();

  const html = content
    .replace(
      `<div id="mantou-head"></div>`,
      `
      <title>${metadata.title || "Mantou | Fullstack Framework"}</title>
          <meta name="description" content="${
            metadata.description ||
            "Mantou is a fullstack framework powered by Bun"
          }">
          ${Object.keys(metadata)
            .map((key) => {
              if (key === "title" || key === "description") return "";
              return `<meta name="${key}" content="${metadata[key]}">`;
            })
            .join("\n")}
            ${cssContent}
          `
    )
    .replace(
      `<div id="mantou-script"></div>`,
      `
      <script src="${scriptSrc}" type="module"></script>
        <script>
          window.__INITIAL_DATA__ = ${JSON.stringify(data)}
          window.__INITIAL_PARAMS__ = ${JSON.stringify(params)}
          window.__INITIAL_SEARCH__ = ${JSON.stringify(query)}
          process = {}
          process.env = {
            ...process.env,
            ...${JSON.stringify(frontend_envs)}
          }
        </script>
        `
    );

  return html;
}
