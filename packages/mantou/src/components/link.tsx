import { useRouter } from "@/exports/router";
import { cn } from "@/utils/client";

interface LinkProps extends React.PropsWithChildren<{}> {
    to: string;
    replace?: boolean;
    className?: string;
    [key: string]: any;
}

export const Link = (props: LinkProps) => {
    const { to, replace, className, ...rest } = props;
    const router = useRouter();
    return (
        <a onClick={() => (replace ? router.replace(to) : router.push(to))} style={{
            cursor: "pointer",
        }} className={cn(
            className,
        )} {...rest}>
            {props.children}
        </a>
    )
}