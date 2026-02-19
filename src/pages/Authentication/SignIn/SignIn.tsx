import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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

import { login as Login } from '@/api';
import Reactivation from '../Activation/Reactivation';
import { useAuth } from '@components/AuthProvider';
import AuthWrapper from '@components/AuthWrapper';
import DEMO from '@store/constant';
import { GoogleLoginButton } from '@components/Buttons/GoolgeSignInButton';

export default function SignIn() {
    const { login } = useAuth();
    const [emailaddress, setEmailaddress] = useState<string | undefined>(undefined);
    const [password, setPassword] = useState<string | undefined>(undefined);
    const [loginsuccess, setLoginsuccess] = useState(true);
    const [buttondisable, setButtondisable] = useState(false);
    const [reactivateAccount, setReactivateAccount] = useState(false);
    const { t } = useTranslation();

    const setuserdata2 = (resp) => {
        try {
            if (resp) {
                if (
                    resp.status === 400 ||
                    resp.status === 401 ||
                    resp.status === 500
                ) {
                    setLoginsuccess(false);
                    setButtondisable(false);
                } else if (resp.status === 403) {
                    setReactivateAccount(true);
                    setButtondisable(false);
                } else if (resp.status === 429) {
                    setLoginsuccess(false);
                    alert(`${resp.data}`);
                    setButtondisable(false);
                } else {
                    setButtondisable(false);
                    login(resp.data.data);
                }
            } else {
                alert('Email or password not correct.');
                setLoginsuccess(false);
                setButtondisable(false);
            }
        } catch {
            // TODO: Error handler
            setButtondisable(false);
        }
    };

    const onChangeEmail = async (e: React.FormEvent, value: string) => {
        e.preventDefault();
        setEmailaddress(value);
    };

    const onChangePassword = async (e: React.FormEvent, value: string) => {
        e.preventDefault();
        setPassword(value);
    };
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!password) {
            alert('Password please!');
            setButtondisable(false);
        } else {
            try {
                const resp = await Login({ email: emailaddress, password });
                setuserdata2(resp);
                setButtondisable(false);
            } catch (err) {
                // TODO: handle error
                alert('Server is busy! Please try in 5 minutes later.');
                console.error(err);
                setButtondisable(false);
            }
        }
    };

    const onLoginSubmit = async (
        e: React.FormEvent<HTMLFormElement>,
        buttondisable: boolean
    ) => {
        e.preventDefault();
        setButtondisable(buttondisable);
        setLoginsuccess(true);
        handleSubmit(e);
    };

    if (reactivateAccount) {
        return (
            <Box>
                <Reactivation email={emailaddress} />
            </Box>
        );
    } else {
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
                <form onSubmit={(e) => onLoginSubmit(e, true)}>
                    <TextField
                        autoComplete="email"
                        fullWidth
                        id="email"
                        label={t('Email Address')}
                        margin="normal"
                        onChange={(e) => onChangeEmail(e, e.target.value)}
                        required
                        type="email"
                    />
                    <TextField
                        autoComplete="password"
                        fullWidth
                        id="standard-password-input"
                        label={t('Password', { ns: 'common' })}
                        margin="normal"
                        onChange={(e) => onChangePassword(e, e.target.value)}
                        required
                        type="password"
                    />
                    {!loginsuccess ? (
                        <Typography>
                            Email or password is not correct.
                        </Typography>
                    ) : null}
                    <Button
                        fullWidth
                        sx={{ mt: 2 }}
                        type="submit"
                        variant="contained"
                    >
                        {buttondisable ? (
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
}
