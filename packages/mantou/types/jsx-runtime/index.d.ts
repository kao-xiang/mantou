import type { JSX } from "react";
export interface MantouElement {
    [JSX_SYMBOL]: boolean;
}
export type JSXType = string | ((props: any) => JSX.Element) | null;
export type Props = {
    children?: JSX.Element | JSX.Element[];
    [key: string]: any;
};
export type JSXSymbolMark = {
    [JSX_SYMBOL]: boolean;
};
export type ElementWithJSXMark = JSX.Element & JSXSymbolMark;
declare const JSX_SYMBOL: unique symbol;
declare function Fragment(props: Props): JSXSymbolMark & MantouElement;
declare function createNode(type: JSXType, { children, ...props }: Props & {
    children?: JSX.Element | JSX.Element[];
}, key?: string): JSXSymbolMark & MantouElement;
export declare function isArrawOfJSXContent(content: unknown): content is MantouElement & {
    [JSX_SYMBOL]?: boolean;
};
export declare function isDangerHTML(content: unknown[]): boolean;
export interface IntrinsicElements {
    [key: string]: any;
}
export { createNode as jsx, createNode as jsxs, createNode as jsxDEV, Fragment, };
