import { useNavigate, useLocation, replace, useParams, useSearchParams } from 'react-router';
export const useRouter = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const params = useParams();
    const search = useSearchParams();
    return {
        push: navigate,
        replace: replace,
        pathname: location.pathname,
        params,
        search
    };
}