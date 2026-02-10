import { useMutation } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { googleOAuthCallback } from '@api';
import { useEffect } from 'react';
import {
    Box,
    Typography,
    Alert,
    CircularProgress,
    Button,
    useTheme
} from '@mui/material';
import { useAuth } from '@components/AuthProvider';
import DEMO from '@store/constant';
import AuthWrapper from '@components/AuthWrapper';
import { t } from 'i18next';

export default function GoogleOAuthCallback() {
    const [searchParams] = useSearchParams();
    const theme = useTheme();
    const codeValue = searchParams.get('code');
    const navigate = useNavigate();
    const { login } = useAuth();

    const { mutate, isPending, isError, error, isSuccess } = useMutation({
        mutationFn: () => googleOAuthCallback(codeValue),
        onSuccess: (response) => {
            // Extract data from response (assuming it's an AxiosResponse)
            const responseData = response;
            console.log(responseData.data);
            login(responseData.data);
            // Redirect to dashboard or home page
            navigate(DEMO.DASHBOARD_LINK, { replace: true });
        },
        onError: (error) => {
            console.error('OAuth failed:', error);
            // You might want to redirect to login page with error message
            // navigate('/login?error=oauth_failed', { replace: true });
        }
    });

    // Automatically call the mutation when component mounts
    useEffect(() => {
        if (codeValue) {
            mutate();
        } else {
            // No code provided, redirect to login
            navigate('/login?error=no_code', { replace: true });
        }
    }, [codeValue, mutate, navigate]);

    // Show loading state
    if (isPending) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '100vh',
                    gap: 2,
                    backgroundColor: theme.palette.background.default
                }}
            >
                <CircularProgress size={60} />
                <Typography color="text.secondary" variant="h6">
                    {t('Verifying your Google account...')}
                </Typography>
                <Typography color="text.secondary" variant="body2">
                    {t(
                        'Please wait while we complete the authentication process.'
                    )}
                </Typography>
            </Box>
        );
    }

    // Show error state
    if (isError) {
        return (
            <AuthWrapper>
                <Alert severity="error">
                    <Typography gutterBottom variant="h6">
                        {t('Authentication Failed')}
                    </Typography>
                    <Typography variant="body2">
                        {error?.message ||
                            t(
                                'An error occurred during Google authentication. Please try again.'
                            )}
                    </Typography>
                </Alert>
                <Button
                    onClick={() => navigate('/login')}
                    sx={{ my: 2 }}
                    variant="contained"
                >
                    {t('Return to Login')}
                </Button>
            </AuthWrapper>
        );
    }

    // Show success state (this should be brief as we redirect on success)
    if (isSuccess) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '100vh',
                    gap: 2
                }}
            >
                <CircularProgress size={60} />
                <Typography color="success.main" variant="h6">
                    {t('Authentication Successful!')}
                </Typography>
                <Typography color="text.secondary" variant="body2">
                    {t('Redirecting to dashboard...')}
                </Typography>
            </Box>
        );
    }

    // Fallback (shouldn't reach here)
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                gap: 2
            }}
        >
            <Typography variant="h6">
                {t('Processing authentication...')}
            </Typography>
        </Box>
    );
}
