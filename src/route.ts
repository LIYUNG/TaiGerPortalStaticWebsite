import { lazy } from 'react';

const SignIn = lazy(() => import('@pages/Authentication/SignIn/SignIn'));
const GoogleOAuthCallback = lazy(
    () => import('@pages/Authentication/GoogleOauthCallback/index')
);
const LandingPage = lazy(
    () => import('@pages/Authentication/LandingPage/index')
);
const ResetPasswordRequest = lazy(
    () =>
        import(
            '@pages/Authentication/ResetPasswordRequest/ResetPasswordRequest'
        )
);
const ResetPassword = lazy(
    () => import('@pages/Authentication/ResetPassword/ResetPassword')
);
const AccountActivation = lazy(
    () => import('@pages/Authentication/Activation/Activation')
);

const route = [
    {
        path: '/account/activation',
        exact: true,
        name: 'Signup 1',
        Component: AccountActivation
    },
    {
        path: '/account/reset-password',
        exact: true,
        name: 'ResetPassword',
        Component: ResetPassword
    },
    {
        path: '/account/forgot-password',
        exact: true,
        name: 'ResetPassword 1',
        Component: ResetPasswordRequest
    },
    {
        path: '/account/home',
        exact: true,
        name: 'Home 1',
        Component: LandingPage
    },
    {
        path: '/account/login',
        name: 'Login',
        Component: SignIn
    },
    {
        path: '/account/google/verify',
        name: 'Google OAuth Callback',
        Component: GoogleOAuthCallback
    }
    // { path: '/', exact: false, name: 'Default', Component: SignIn }
];

export default route;
