import React, { useEffect } from "react";
import {
  useNavigate,
  useLocation,
  useParams,
  useSearchParams,
} from "react-router";
export const useRouter = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const [_search] = useSearchParams();
  const [search, setSearch] = React.useState(_search);
  useEffect(() => {
    setSearch(Object.fromEntries(_search) as any);
  }, [_search]);

  const FETCH_AFTER_ROUTER =
    process?.env?.MANTOU_PUBLIC_FETCH_AFTER_ROUTER === "true";

  const push = (
    to: string,
    options?: {
      persistSearch?: boolean;
      search?: Record<string, any>;
    }
  ) => {
    const searchMap = new Map();
    const prevSearch = Object.fromEntries(new URLSearchParams(location.search));
    if (options?.persistSearch) {
      for (let key of Object.keys(prevSearch)) {
        const value = prevSearch[key];
        searchMap.set(key, value);
      }
    }
    if (options?.search) {
      for (let key of Object.keys(options.search)) {
        const value = options.search[key];
        searchMap.set(key, value);
      }
    }

    const hasSearch = searchMap.size > 0;
    for (let key of searchMap.keys()) {
      if (searchMap.get(key) === undefined) {
        searchMap.delete(key);
      }
    }
    navigate(
      to +
        (hasSearch
          ? "?" + new URLSearchParams(Object.fromEntries(searchMap)).toString()
          : "")
    );
  };

  const replace = (
    to: string,
    options?: { search?: Record<string, any>; persistSearch?: boolean }
  ) => {
    const searchMap = new Map();
    const prevSearch = Object.fromEntries(new URLSearchParams(location.search));
    if (options?.persistSearch) {
      for (let key of Object.keys(prevSearch)) {
        const value = prevSearch[key];
        searchMap.set(key, value);
      }
    }
    if (options?.search) {
      for (let key of Object.keys(options.search)) {
        const value = options.search[key];
        searchMap.set(key, value);
      }
    }
    const hasSearch = searchMap.size > 0;
    // remove undefined values
    for (let key of searchMap) {
      if (searchMap.get(key) === undefined) {
        searchMap.delete(key);
      }
    }
    navigate(
      to +
        (hasSearch
          ? "?" + new URLSearchParams(Object.fromEntries(searchMap)).toString()
          : ""),
      { replace: true }
    );
  };
  return {
    push: push,
    replace: replace,
    pathname: location.pathname,
    params,
    search: search,
    state: location.state,
    url: location.pathname + location.search,
  };
};
