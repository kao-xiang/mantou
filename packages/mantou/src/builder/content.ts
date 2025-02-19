import type { MantouBuilder } from "./builder";
import type { Layout, Page, PageLayout } from "./types";

function generateTsxRoute(
  path: string,
  layouts: string[],
  page: string
): string {
  let layoutStructure = "";
  for (let i = layouts.length - 1; i >= 0; i--) {
    if (i === layouts.length - 1) {
      layoutStructure = `<Route path="${path}" element={<${layouts[i]}><Outlet /></${layouts[i]}>}>\n${layoutStructure}</Route>\n`;
    } else {
      layoutStructure = `<Route path="" element={<${layouts[i]}><Outlet /></${layouts[i]}>}>\n${layoutStructure}</Route>\n`;
    }
  }
  const pageRoute = `<Route index element={<${page} data={data} search={search} params={params} />} />\n`;
  layoutStructure = layoutStructure.replace("</Route>", `${pageRoute}</Route>`);

  return layoutStructure;
}

export const content_templates = {
  "App.tsx": (
    pageLayouts: PageLayout[],
    pages: Page[],
    builder: MantouBuilder<any, any>
  ) => {
    let content = "";
    content += "import React from 'react'\n";
    content += `import { Routes, Route, Outlet, useRouter, useBlocker } from 'mantou/router'\n\n`;

    const uniqueImports = [] as string[];
    const page_layouts = pages
      .map((page) => {
        if (!uniqueImports.includes(page.filePath)) {
          uniqueImports.push(page.filePath);
        }
        const layouts = builder.getLayoutsByPath(page.path) as Layout[];
        for (let layout of layouts) {
          if (!uniqueImports.includes(layout.filePath)) {
            uniqueImports.push(layout.filePath);
          }
        }
      })
      .flat();
    // sort unique imports
    uniqueImports.sort((a, b) => a.split("/").length + b.split("/").length);

    const importMap = new Map<string, string>();
    uniqueImports.forEach((filePath, index) => {
      const isLayout = filePath.includes("layout.");
      const componentName = isLayout ? `Layout${index}` : `Page${index}`;
      importMap.set(filePath, componentName);
      content += `import ${componentName} from '${filePath}'\n`;
    });
    let routes = [];
    for (let page of pages) {
      const layouts = builder.getLayoutsByPath(page.path) as Layout[];
      const layoutComponents = layouts.map(
        (layout) => importMap.get(layout.filePath) as string
      );
      const pageComponent = importMap.get(page.filePath) as string;
      routes.push(generateTsxRoute(page.path, layoutComponents, pageComponent));
    }

    let routesJSX = "";
    for (let route of routes) {
      routesJSX += route;
    }

    content += `\n
    export default function App({ data: _data, search: _search, params: _params }: any) {
        const router = useRouter();
        const [data, setData] = React.useState(_data);
        const [search, setSearch] = React.useState(_search);
        const [params, setParams] = React.useState(_params);
        const debounceTimeout = React.useRef<NodeJS.Timeout | null>(null);

          React.useEffect(() => {
            if (debounceTimeout.current) {
              clearTimeout(debounceTimeout.current);
            }

            debounceTimeout.current = setTimeout(() => {
              fetch(
                router.pathname +
                  "?__mantou_only_data=1" +
                  "&" +
                  new URLSearchParams(router.search).toString()
              )
                .then(async (res) => {
                  const r = await res.json();
                  setData(r.data);
                  setSearch(r.search);
                  setParams(r.params);
                })
                .catch(() => {
                  window.location.href = "/not-found";
                });
            }, 10); // Adjust debounce delay as needed

            return () => {
              if (debounceTimeout.current) {
                clearTimeout(debounceTimeout.current);
              }
            };
          }, [router.pathname, router.search]);
        
    return (
      <Routes>
      ${routesJSX}
      </Routes>
    )
  }
  `;
    return content;
  },
  "index.tsx": () => {
    const ssl = global.__mantou_config.ssl;
    const content = `
      import React from "react";
      import ReactDOM from "react-dom/client";
      import { BrowserRouter } from "mantou/router";
      import App from "./App";
      
      const initialData = typeof window !== "undefined" ? (window as any).__INITIAL_DATA__ : undefined;
      const initialParams = typeof window !== "undefined" ? (window as any).__INITIAL_PARAMS__ : undefined;
      const initialSearch = typeof window !== "undefined" ? (window as any).__INITIAL_SEARCH__ : undefined;
      const rootElement = document.getElementById("root");
      
      if (!rootElement) throw new Error("Root element not found");
      const AppWithRouter = () => (
        <BrowserRouter>
          <App data={initialData} search={initialSearch} params={initialParams} />
        </BrowserRouter>
      );
      
      // In development, set up live reload with reconnect support
      if (process.env.NODE_ENV === "development") {
        const connectWebSocket = (maxReload = 5) => {
          let reloadAttempts = 0;
          const ws = new WebSocket(\`${ssl ? "wss" : "ws"}://\${window.location.host}/__mantou_live_reload\`);
          
          ws.onmessage = (event) => {
            if (event.data === 'reload') {
              window.location.reload();
            }
          };
          
          ws.onclose = () => {
            if (reloadAttempts < maxReload) {
              reloadAttempts++;
              setTimeout(() => connectWebSocket(maxReload), reloadAttempts * 1500); // Reconnect after 1.5s, 3s, 4.5s, 6s, 7.5s
            }
          };
        };
        
        connectWebSocket();
      
        const root = ReactDOM.createRoot(rootElement);
        root.render(<AppWithRouter />);
      } 
      // In production, hydrate for SSR
      else {
        ReactDOM.hydrateRoot(rootElement, <AppWithRouter />);
      }
      `;

    return content;
  },
};
