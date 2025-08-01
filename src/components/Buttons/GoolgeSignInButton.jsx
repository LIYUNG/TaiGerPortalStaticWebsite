import React from 'react';
import { Button, SvgIcon } from '@mui/material';

const GOOGLE_OAUTH_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
const GOOGLE_OAUTH_REDIRECT_URL = process.env.REACT_APP_GOOGLE_REDIRECT_URL;

function GoogleIcon() {
    return (
        <SvgIcon>
            <svg
                fill="none"
                height="16"
                viewBox="0 0 16 16"
                width="16"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M15.68 8.18182C15.68 7.61455 15.6291 7.06909 15.5345 6.54545H8V9.64364H12.3055C12.1164 10.64 11.5491 11.4836 10.6982 12.0509V14.0655H13.2945C14.8073 12.6691 15.68 10.6182 15.68 8.18182Z"
                    fill="#4285F4"
                />
                <path
                    d="M8 16C10.16 16 11.9709 15.2873 13.2945 14.0655L10.6982 12.0509C9.98545 12.5309 9.07636 12.8218 8 12.8218C5.92 12.8218 4.15273 11.4182 3.52 9.52727H0.858182V11.5927C2.17455 14.2036 4.87273 16 8 16Z"
                    fill="#34A853"
                />
                <path
                    d="M3.52 9.52C3.36 9.04 3.26545 8.53091 3.26545 8C3.26545 7.46909 3.36 6.96 3.52 6.48V4.41455H0.858182C0.312727 5.49091 0 6.70545 0 8C0 9.29455 0.312727 10.5091 0.858182 11.5855L2.93091 9.97091L3.52 9.52Z"
                    fill="#FBBC05"
                />
                <path
                    d="M8 3.18545C9.17818 3.18545 10.2255 3.59273 11.0618 4.37818L13.3527 2.08727C11.9636 0.792727 10.16 0 8 0C4.87273 0 2.17455 1.79636 0.858182 4.41455L3.52 6.48C4.15273 4.58909 5.92 3.18545 8 3.18545Z"
                    fill="#EA4335"
                />
            </svg>
        </SvgIcon>
    );
}

export const GoogleLoginButton = () => {
    const handleGoogleLogin = () => {
        const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');

        const query = new URLSearchParams({
            client_id: GOOGLE_OAUTH_CLIENT_ID,
            redirect_uri: GOOGLE_OAUTH_REDIRECT_URL,
            response_type: 'code', // Use 'code' for Authorization Code flow
            scope: 'openid email profile'
        });
        url.search = new URLSearchParams(query).toString();

        window.location.href = url.toString();
    };

    return (
        <Button
            fullWidth
            onClick={handleGoogleLogin}
            startIcon={<GoogleIcon />}
            variant="outlined"
        >
            Continue with Google
        </Button>
    );
};
