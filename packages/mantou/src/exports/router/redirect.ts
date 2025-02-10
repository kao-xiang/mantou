import { redirect as elysiaRedirect } from "elysia";
declare const window: any;

export function redirect(props: {
    url: string;
    status?: number;
}) {
    if (typeof window !== 'undefined' && window) {
        window.location.href = props.url;
    }else{
        elysiaRedirect(props.url, 302);
    }
}