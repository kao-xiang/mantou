import type { Bunios } from "bunios";
import { useActionForm } from "./action-form-provider";

export interface FormProps extends React.HTMLAttributes<HTMLFormElement> {
  onResponse?: (response: any) => void | Promise<void>;
  onError?: (error: any) => void | Promise<void>;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  task?: string;
}

export const ActionForm = (props: FormProps) => {
  const { onResponse: onPropsResponse, onError: onPropsError, ...rest } = props;
  const { client, onError, onResponse, baseActionUrl } = useActionForm();
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const _data = new FormData(form);
    const data: Record<string, any> = {};
    _data.forEach((value, key) => {
      data[key] = value;
    });
    const method = form.method?.toLowerCase() || ("post" as any);
    //  not support get method
    if (method === "get") {
      throw new Error("get method is not supported");
    }
    const url = baseActionUrl || form.action || (typeof window !== "undefined" ? window.location.href : "");
    try {
      if ((client as any)?.request) {
        const response = await (client as Bunios).request({
          url,
          method,
          data: {
            task: props.task,
            payload: data,
          },
        });
        if (onResponse) {
          await onResponse(response);
        } else if (props.onResponse) {
          await props.onResponse(response);
        }
        return;
      } else {
        const response = await (client as Fetch)(url, {
          method,
          body: JSON.stringify({
            task: props.task,
            payload: data,
          }),
        });
        if (onResponse) {
          await onResponse(response);
        } else if (props.onResponse) {
          await props.onResponse(response);
        }
        return;
      }
    } catch (e) {
      if (onError) {
        await onError(e);
      } else if (props.onError) {
        await props.onError(e);
      }
      console.error(e);
    }
  };
  return (
    <form {...rest} onSubmit={handleSubmit}>
      {props.children}
    </form>
  );
};
