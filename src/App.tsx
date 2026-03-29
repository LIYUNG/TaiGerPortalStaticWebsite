import { Suspense } from 'react';
import {
    Navigate,
    Outlet,
    RouterProvider,
    createBrowserRouter,
    useNavigation,
    type RouteObject
} from 'react-router-dom';
import '@fontsource/roboto';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/400-italic.css';

import NavBar from '@components/NavBar';
import routes from './routes';
import routes2 from './route';
import { CssBaseline } from '@mui/material';
import DEMO from '@store/constant';
import { useAuth } from '@components/AuthProvider';
import Loading from '@components/Loading/Loading';
import { ChunkLoadErrorBoundary } from '@utils/chunkLoadError';

const Layout = (): JSX.Element => {
    const navigation = useNavigation();
    return (
        <>
            <CssBaseline />
            <NavBar>
                <main>
                    {navigation.state === 'loading' ? (
                        <Loading />
                    ) : (
                        <ChunkLoadErrorBoundary>
                            <Suspense fallback={<Loading />}>
                                <Outlet />
                            </Suspense>
                        </ChunkLoadErrorBoundary>
                    )}
                </main>
            </NavBar>
        </>
    );
};

const WrapperPublic = (): JSX.Element => {
    const { isAuthenticated } = useAuth();
    const query = new URLSearchParams(window.location.search);

    return isAuthenticated ? (
        query.get('p') ? (
            <Navigate to={query.get('p') ?? '/'} />
        ) : (
            <Navigate to={DEMO.DASHBOARD_LINK} />
        )
    ) : (
        <ChunkLoadErrorBoundary>
            <Suspense fallback={<Loading />}>
                <Outlet />
            </Suspense>
        </ChunkLoadErrorBoundary>
    );
};

const router = createBrowserRouter([
    {
        path: '/account',
        element: <WrapperPublic />,
        children: [...routes2] as RouteObject[]
    },
    {
        path: '/',
        element: <Layout />,
        children: [...routes] as RouteObject[]
    },
    {
        path: '*',
        element: <Navigate replace to={DEMO.LOGIN_LINK} />
    }
]);

const App = (): JSX.Element => {
    return <RouterProvider router={router} />;
};

export default App;
