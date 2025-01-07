import { RouteResolver } from "./file-base-router";
export declare function App(): import("react/jsx-runtime").JSX.Element;
export declare function Index(pageRoute: any): string;
interface MantouConfig {
    resovler: RouteResolver<any, any>;
}
interface MantouAppProps {
    config: MantouConfig;
}
export declare function MantouApp({ config }: MantouAppProps): import("react/jsx-runtime").JSX.Element;
interface RouterProps {
    resolver: RouteResolver<any, any>;
}
export declare function RouteRenderer(props: {
    filePath: string;
    path: string;
    children?: any;
}): import("react/jsx-runtime").JSX.Element;
export declare function Router({ resolver }: RouterProps): import("react/jsx-runtime").JSX.Element;
export {};
