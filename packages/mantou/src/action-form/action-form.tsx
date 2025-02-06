import { useActionForm } from "./action-form-provider";
import axios, { Axios, type AxiosInstance } from "axios";

export interface FormProps extends React.HTMLAttributes<HTMLFormElement> {
  onResponse?: (response: any) => void | Promise<void>;
  onError?: (error: any) => void | Promise<void>;
  method?: "GET" | "POST" | "PUT" | "DELETE";
}

export const ActionForm = (props: FormProps) => {
  const { onResponse: onPropsResponse, onError: onPropsError, ...rest } = props;
  const { client, onError, onResponse } = useActionForm();
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const _data = new FormData(form);
    const data: Record<string, any> = {};
    _data.forEach((value, key) => {
      data[key] = value;
    });
    const method = form.method || "POST";
    //  not support get method
    if (method === "get") {
      throw new Error("get method is not supported");
    }
    const url = form.action;
    try {
      if ((client as any)?.request) {
        console.log("axios");
        const response = await (client as Axios).request({
          url,
          method,
          data,
        });
        if (props.onResponse) {
          await props.onResponse(response);
        } else if (onResponse) {
          await onResponse(response);
        }
        return;
      } else {
        const response = await client(url, {
          method,
          body: _data,
        });
        if (props.onResponse) {
          await props.onResponse(response);
        } else if (onResponse) {
          await onResponse(response);
        }
        return;
      }
    } catch (e) {
      if (props.onError) {
        await props.onError(e);
      } else if (onError) {
        await onError(e);
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
