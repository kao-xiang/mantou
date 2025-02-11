import { Head } from "@/components/head";
import { acts, error, file, guard, handler, o, middleware } from "./routes";
import type {
  MetaData,
  GenerateMetadata,
  Guard,
  Handler,
  Acts,
  PageProps,
  FC,
  Middleware,
  Store
} from "./routes";
import { ActionForm, ActionFormProvider } from "./action-form";

export {
  Head,
  error,
  file,
  o,
  guard,
  handler,
  acts,
  ActionForm,
  ActionFormProvider,
  middleware
};

export type { MetaData, GenerateMetadata, Guard, Handler, PageProps, FC, Acts, Middleware, Store };
