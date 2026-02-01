import React, { useEffect, useState } from 'react';
import {
    Box,
    Button,
    Breadcrumbs,
    Link,
    TextField,
    Typography,
    CircularProgress,
    FormControl,
    FormLabel,
    RadioGroup,
    FormControlLabel,
    Radio,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Link as LinkDom } from 'react-router-dom';

import ErrorPage from '../Utils/ErrorPage';
import ModalMain from '../Utils/ModalHandler/ModalMain';

import { updateCredentials } from '../../api';
import { TabTitle } from '../Utils/TabTitle';
import { useAuth } from '../../components/AuthProvider';
import { useCustomTheme } from '../../components/ThemeProvider';
import { appConfig } from '../../config';
import DEMO from '../../store/constant';

interface Credentials {
    current_password: string;
    new_password: string;
    new_password_again: string;
}

interface SettingsState {
    error: unknown;
    isLoaded: boolean;
    data: unknown;
    success: boolean;
    user: Record<string, unknown>;
    changed_personaldata: boolean;
    personaldata: Record<string, unknown>;
    credentials: Credentials;
    updatecredentialconfirmed: boolean;
    res_status: number;
    res_modal_message: string;
    res_modal_status: number;
}

const Settings = () => {
    const { isDarkMode, toggleDarkMode } = useCustomTheme();
    const { t } = useTranslation();
    const { user, logout } = useAuth();

    const [settingsState, setSettingsState] = useState<SettingsState>({
        error: '',
        isLoaded: false,
        data: null,
        success: false,
        user: {},
        changed_personaldata: false,
        personaldata: {
            firstname: user.firstname,
            firstname_chinese: user.firstname_chinese,
            lastname: user.lastname,
            lastname_chinese: user.lastname_chinese,
            birthday: user.birthday
        },
        credentials: {
            current_password: '',
            new_password: '',
            new_password_again: ''
        },
        updatecredentialconfirmed: false,
        res_status: 0,
        res_modal_message: '',
        res_modal_status: 0
    });

    useEffect(() => {
        setSettingsState((prev) => ({
            ...prev,
            isLoaded: true,
            success: true
        }));
    }, []);

    const handleChange_Credentials = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const credentials_temp = { ...settingsState.credentials };
        credentials_temp[e.target.id as keyof Credentials] = e.target.value;
        setSettingsState((prev) => ({
            ...prev,
            credentials: credentials_temp
        }));
    };

    const handleSubmit_Credentials = (
        _e: React.MouseEvent,
        credentials: Credentials,
        email: string
    ) => {
        if (credentials.new_password !== credentials.new_password_again) {
            alert('New password not matched');
            return;
        }
        if (credentials.new_password.length < 8) {
            alert('New password should have at least 8 characters.');
            return;
        }
        updateCredentials(
            credentials,
            email,
            credentials.current_password
        ).then(
            (resp: {
                data: { success?: boolean; message?: string };
                status?: number;
            }) => {
                const { success } = resp.data;
                const { status } = resp;
                if (success) {
                    setSettingsState((prev) => ({
                        ...prev,
                        isLoaded: true,
                        success: success ?? false,
                        updatecredentialconfirmed: true,
                        res_modal_status: status ?? 0
                    }));
                } else {
                    const { message } = resp.data;
                    setSettingsState((prev) => ({
                        ...prev,
                        isLoaded: true,
                        res_modal_message: message ?? '',
                        res_modal_status: status ?? 0
                    }));
                }
            },
            () => {
                setSettingsState((prev) => ({
                    ...prev,
                    isLoaded: true,
                    res_modal_status: 500,
                    res_modal_message: ''
                }));
            }
        );
    };

    const setmodalhideUpdateCredentials = () => {
        logout();
    };

    const ConfirmError = () => {
        setSettingsState((prev) => ({
            ...prev,
            res_modal_status: 0,
            res_modal_message: ''
        }));
    };

    const { res_status, isLoaded, res_modal_status, res_modal_message } =
        settingsState;
    TabTitle('Settings');
    if (!isLoaded) {
        return <CircularProgress />;
    }

    if (res_status >= 400) {
        return <ErrorPage res_status={res_status} />;
    }

    return (
        <Box>
            <Breadcrumbs aria-label="breadcrumb">
                <Link
                    color="inherit"
                    component={LinkDom}
                    to={`${DEMO.DASHBOARD_LINK}`}
                    underline="hover"
                >
                    {appConfig.companyName}
                </Link>
                <Typography color="text.primary">
                    {t('Settings', { ns: 'common' })}
                </Typography>
            </Breadcrumbs>

            {res_modal_status >= 400 ? (
                <ModalMain
                    ConfirmError={ConfirmError}
                    res_modal_message={res_modal_message}
                    res_modal_status={res_modal_status}
                />
            ) : null}

            <Box sx={{ mx: 2 }}>
                <Typography variant="h6">{t('Preference')}</Typography>
                <FormControl>
                    <FormLabel id="demo-row-radio-buttons-group-label">
                        {t('Theme', { ns: 'common' })}
                    </FormLabel>{' '}
                    <RadioGroup
                        aria-labelledby="demo-controlled-radio-buttons-group"
                        name="controlled-radio-buttons-group"
                        onChange={toggleDarkMode}
                        row
                        value={isDarkMode}
                    >
                        <FormControlLabel
                            control={<Radio />}
                            label="Dark"
                            value={true}
                        />
                        <FormControlLabel
                            control={<Radio />}
                            label="Light"
                            value={false}
                        />
                    </RadioGroup>
                </FormControl>
            </Box>

            <Box sx={{ p: 2 }}>
                <Typography variant="h6">{t('Account')}</Typography>
                <Typography>{t('Reset Login Password')}</Typography>
                <TextField
                    autoComplete="off"
                    fullWidth
                    id="current_password"
                    label={`${t('Current Password')}`}
                    onChange={handleChange_Credentials}
                    required
                    size="small"
                    sx={{ my: 1 }}
                    type="password"
                />
                <TextField
                    autoComplete="off"
                    fullWidth
                    id="new_password"
                    label={`${t('Enter New Password')}`}
                    onChange={handleChange_Credentials}
                    required
                    size="small"
                    sx={{ mb: 1 }}
                    type="password"
                />
                <TextField
                    autoComplete="off"
                    fullWidth
                    id="new_password_again"
                    label={`${t('Enter New Password Again')}`}
                    onChange={handleChange_Credentials}
                    required
                    size="small"
                    sx={{ mb: 1 }}
                    type="password"
                />
                <Button
                    color="primary"
                    disabled={
                        settingsState.credentials.current_password === '' ||
                        settingsState.credentials.new_password === '' ||
                        settingsState.credentials.new_password_again === ''
                    }
                    onClick={(e) =>
                        handleSubmit_Credentials(
                            e,
                            settingsState.credentials,
                            (user.email as string) ?? ''
                        )
                    }
                    variant="contained"
                >
                    {t('Reset Password')}
                </Button>
            </Box>
            <Dialog
                onClose={setmodalhideUpdateCredentials}
                open={settingsState.updatecredentialconfirmed}
            >
                <DialogTitle>
                    {t('Update Credentials Successfully')}
                </DialogTitle>
                <DialogContent>
                    {t(
                        'Credentials are updated successfully! Please login again.'
                    )}
                </DialogContent>
                <DialogActions>
                    <Button
                        color="primary"
                        onClick={() => setmodalhideUpdateCredentials()}
                        variant="contained"
                    >
                        {t('Ok')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Settings;
