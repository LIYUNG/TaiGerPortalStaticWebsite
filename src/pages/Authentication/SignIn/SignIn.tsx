import { useState, FormEvent } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import {
    CircularProgress,
    Button,
    Link,
    Box,
    Typography,
    TextField,
    Alert,
    Divider
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';

import { login as loginApi } from '@/api';
import Reactivation from '../Activation/Reactivation';
import { useAuth } from '@components/AuthProvider';
import AuthWrapper from '@components/AuthWrapper';
import DEMO from '@store/constant';
import { GoogleLoginButton } from '@components/Buttons/GoolgeSignInButton';
import type { IUserWithId } from '@taiger-common/model';

interface LoginError extends Error {
    status?: number;
}

export default function SignIn() {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [reactivateAccount, setReactivateAccount] = useState(false);
    const { t } = useTranslation();

    const {
        mutate: submitLogin,
        isPending,
        isError
    } = useMutation<
        IUserWithId,
        LoginError,
        { email: string; password: string }
    >({
        mutationFn: async ({ email, password }) => {
            const resp = await loginApi({ email, password });
            if (resp.status >= 400) {
                const err = new Error('Login failed') as LoginError;
                err.status = resp.status;
                throw err;
            }
            return resp.data.data as IUserWithId;
        },
        onSuccess: (userData) => {
            login(userData);
        },
        onError: (err) => {
            if (err.status === 403) {
                setReactivateAccount(true);
            }
        }
    });

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        submitLogin({ email, password });
    };

    if (reactivateAccount) {
        return (
            <Box>
                <Reactivation email={email} />
            </Box>
        );
    }

    return (
        <AuthWrapper>
            <Alert severity="success">
                <span style={{ fontWeight: 'bold' }}>
                    🎊 TaiGer
                    最新好友推薦計劃開跑！邀請好友一起去歐洲留學，你與好友都有現金回饋！
                </span>
                <span style={{ fontWeight: 'bold' }}>
                    詳情請看
                    <Link
                        href="https://drive.google.com/file/d/1JNV0_1-62yxYoHUX3AmFJgK4zxwa4IoU/view"
                        target="_blank"
                    >
                        活動連結
                    </Link>
                </span>
            </Alert>
            <Typography component="h1" sx={{ mt: 1 }} variant="h5">
                {t('Sign in', { ns: 'auth' })}
            </Typography>
            <form onSubmit={handleSubmit}>
                <TextField
                    autoComplete="email"
                    fullWidth
                    id="email"
                    label={t('Email Address')}
                    margin="normal"
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    type="email"
                    value={email}
                />
                <TextField
                    autoComplete="password"
                    fullWidth
                    id="standard-password-input"
                    label={t('Password', { ns: 'common' })}
                    margin="normal"
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    type="password"
                    value={password}
                />
                {isError && (
                    <Typography color="error">
                        Email or password is not correct.
                    </Typography>
                )}
                <Button
                    disabled={isPending}
                    fullWidth
                    sx={{ mt: 2 }}
                    type="submit"
                    variant="contained"
                >
                    {isPending ? (
                        <CircularProgress
                            color="secondary"
                            size={24}
                            sx={{ color: 'white' }}
                        />
                    ) : (
                        <Typography>{`${t('Login', { ns: 'auth' })}`}</Typography>
                    )}
                </Button>
            </form>
            <Typography sx={{ my: 1 }} variant="body2">
                {t('Forgot Password', { ns: 'common' })}?{' '}
                <Link component={NavLink} to={DEMO.FORGOT_PASSWORD_LINK}>
                    {t('Reset Login Password')}
                </Link>
            </Typography>
            <Divider sx={{ mb: 1 }}>or</Divider>
            <GoogleLoginButton />
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 1
                }}
            >
                <HomeIcon sx={{ my: 1 }} />
                <Link component={NavLink} to={DEMO.LANDING_PAGE_LINK}>
                    {t('Home')}
                </Link>
            </Box>
        </AuthWrapper>
    );
}
