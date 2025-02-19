import { Link } from "@/components/link";
import { redirect } from "./redirect";
import { useRouter } from "./useRouter";
import {
  Routes,
  Route,
  StaticRouter,
  Outlet,
  BrowserRouter,
  useBlocker,
  useBeforeUnload,
} from "react-router";

const Blocker = () => {
  useBlocker((tx) => {
    if (!window.confirm("Are you sure you want to go back?")) {
      return false;
    }
    return true;
  });
  return null;
}

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
  Blocker
};