import { useRouter } from "./useRouter";
import {
  Routes,
  Route,
  StaticRouter,
  Outlet,
  BrowserRouter,
  useBlocker,
  useBeforeUnload,
  Link,
} from "react-router";

const redirect = (to: string) => {
  if (typeof window !== "undefined") {
    window.location.href = to;
  } else {
    throw {
      type: "mantou/redirect",
      url: to,
    };
  }
};

export {
  Routes,
  Route,
  StaticRouter,
  Outlet,
  redirect,
  BrowserRouter,
  useRouter,
  useBlocker,
  useBeforeUnload,
  Link,
};