declare const window: any;

export function redirect(props: {
    url: string;
    status?: number;
}) {
    if (typeof window !== 'undefined' && window) {
        window.location.href = props.url;
    }else{
        throw {
            type: 'mantou/redirect',
            url: props.url,
            status: props.status || 302,
        }
    }
}