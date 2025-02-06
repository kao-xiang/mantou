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
  const search = useSearchParams();

  const FETCH_AFTER_ROUTER =
    process?.env?.MANTOU_PUBLIC_FETCH_AFTER_ROUTER === "true";

  const push = (to: string) => {
    !FETCH_AFTER_ROUTER
      ? fetch(to + "?__mantou_only_data=1")
          .then((res) => res.json())
          .then((r) => {
            navigate(to, {
              state: {
                data: r.data,
                params: r.params,
                search: r.search,
              },
            });
          })
          .catch((e: any) => {})
      : navigate(to);
  };

  const replace = (to: string) => {
    !FETCH_AFTER_ROUTER
      ? fetch(to + "?__mantou_only_data=1")
          .then((res) => res.json())
          .then((r) => {
            navigate(to, {
              state: {
                data: r.data,
                params: r.params,
                search: r.search,
              },
              replace: true,
            });
          })
          .catch((e: any) => {})
      : navigate(to, { replace: true });
  };
  return {
    push: push,
    replace: replace,
    pathname: location.pathname,
    params,
    search,
    state: location.state,
  };
};
