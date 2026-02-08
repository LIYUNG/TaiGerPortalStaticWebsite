import React, { useEffect, useState } from 'react';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Breadcrumbs,
    Button,
    Card,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    Link,
    List,
    ListItem,
    ListItemText,
    Stack,
    TextField,
    Typography
} from '@mui/material';
import { Link as LinkDom, useParams } from 'react-router-dom';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import { useTranslation } from 'react-i18next';
import { is_TaiGer_Agent, is_TaiGer_Editor } from '@taiger-common/core';

import ErrorPage from '../Utils/ErrorPage';
import ModalMain from '../Utils/ModalHandler/ModalMain';
import { updatePersonalData, getUser } from '../../api';
import { TabTitle } from '../Utils/TabTitle';
import { is_personal_data_filled } from '../Utils/util_functions';
import DEMO from '../../store/constant';
import { useAuth } from '../../components/AuthProvider';
import { appConfig } from '../../config';
import Loading from '../../components/Loading/Loading';

interface PersonalData {
    firstname: string;
    firstname_chinese: string;
    lastname: string;
    lastname_chinese: string;
    birthday?: string;
    email?: string;
    role?: string;
    lineId?: string;
    linkedIn?: string;
    [key: string]: string | undefined;
}

interface ProfileState {
    error: unknown;
    role: string;
    isLoaded: boolean;
    data: unknown;
    success: boolean;
    user: Record<string, unknown>;
    changed_personaldata: boolean;
    personaldata: PersonalData;
    updateconfirmed: boolean;
    res_status: number;
    res_modal_message: string;
    res_modal_status: number;
    user_id?: string;
}

const Profile = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const { user_id } = useParams<{ user_id?: string }>();
    const [profileState, setProfileState] = useState<ProfileState>({
        error: '',
        role: '',
        isLoaded: false,
        data: null,
        success: false,
        user: {},
        changed_personaldata: false,
        personaldata: user_id
            ? {
                  firstname: '',
                  firstname_chinese: '',
                  lastname: '',
                  lastname_chinese: '',
                  birthday: '',
                  email: '',
                  lineId: '',
                  linkedIn: ''
              }
            : {
                  firstname: user.firstname ?? '',
                  firstname_chinese: user.firstname_chinese ?? '',
                  lastname: user.lastname ?? '',
                  lastname_chinese: user.lastname_chinese ?? '',
                  birthday: user.birthday ?? '',
                  role: user.role ?? '',
                  email: user.email ?? '',
                  lineId: user.lineId ?? '',
                  linkedIn: user.linkedIn ?? ''
              },
        updateconfirmed: false,
        res_status: 0,
        res_modal_message: '',
        res_modal_status: 0
    });

    useEffect(() => {
        getUser_function();
    }, [user_id]);

    const getUser_function = () => {
        if (user_id) {
            getUser(user_id).then(
                (resp: {
                    data: { success?: boolean; data?: PersonalData };
                    status?: number;
                }) => {
                    const { success, data } = resp.data;
                    const { status } = resp;
                    if (success && data) {
                        setProfileState((prevState) => ({
                            ...prevState,
                            success: success ?? false,
                            isLoaded: true,
                            personaldata: {
                                firstname: data.firstname ?? '',
                                firstname_chinese: data.firstname_chinese ?? '',
                                lastname: data.lastname ?? '',
                                lastname_chinese: data.lastname_chinese ?? '',
                                birthday: data.birthday ?? '',
                                role: data.role ?? '',
                                email: data.email ?? '',
                                linkedIn: data.linkedIn ?? '',
                                lineId: data.lineId ?? ''
                            },
                            user_id: user_id ?? user._id?.toString(),
                            res_status: status ?? 0
                        }));
                    } else {
                        setProfileState((prevState) => ({
                            ...prevState,
                            isLoaded: true,
                            res_status: status ?? 0
                        }));
                    }
                },
                (error: unknown) => {
                    setProfileState((prevState) => ({
                        ...prevState,
                        isLoaded: true,
                        error,
                        res_status: 500
                    }));
                }
            );
        } else {
            setProfileState((prevState) => ({
                ...prevState,
                isLoaded: true,
                success: true
            }));
        }
    };

    const handleChange_PersonalData = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const personaldata_temp = { ...profileState.personaldata };
        personaldata_temp[e.target.id] = e.target.value;
        setProfileState((prevState) => ({
            ...prevState,
            changed_personaldata: true,
            personaldata: personaldata_temp
        }));
    };

    const handleSubmit_PersonalData = (
        e: React.MouseEvent,
        personaldata: PersonalData
    ) => {
        updatePersonalData(
            user_id
                ? (profileState.user_id ?? '')
                : (user._id?.toString() ?? ''),
            personaldata
        ).then(
            (resp: {
                data: {
                    data?: PersonalData;
                    success?: boolean;
                    message?: string;
                };
                status?: number;
            }) => {
                const { data, success } = resp.data;
                const { status } = resp;
                if (success && data) {
                    setProfileState((prevState) => ({
                        ...prevState,
                        isLoaded: true,
                        personaldata: data,
                        success: success ?? false,
                        changed_personaldata: false,
                        updateconfirmed: true,
                        res_modal_status: status ?? 0
                    }));
                } else {
                    const { message } = resp.data;
                    setProfileState((prevState) => ({
                        ...prevState,
                        isLoaded: true,
                        res_modal_message: message ?? '',
                        res_modal_status: status ?? 0
                    }));
                }
            },
            () => {
                setProfileState((prevState) => ({
                    ...prevState,
                    isLoaded: true,
                    res_modal_status: 500,
                    res_modal_message: ''
                }));
            }
        );
    };

    const setmodalhide = () => {
        window.location.reload();
    };

    const ConfirmError = () => {
        setProfileState((prevState) => ({
            ...prevState,
            res_modal_status: 0,
            res_modal_message: ''
        }));
    };

    const { res_status, isLoaded, res_modal_status, res_modal_message } =
        profileState;
    if (!isLoaded) {
        return <Loading />;
    }
    TabTitle(
        `${profileState.personaldata.firstname} ${
            profileState.personaldata.lastname
        } |${
            profileState.personaldata.firstname_chinese
                ? profileState.personaldata.firstname_chinese
                : ' '
        }${
            profileState.personaldata.lastname_chinese
                ? profileState.personaldata.lastname_chinese
                : ' '
        }Profile`
    );
    if (res_status >= 400) {
        return <ErrorPage res_status={res_status} />;
    }

    const personalDataFields = [
        { name: 'firstname', label: `${t('First Name')} (English)`, sm: 6 },
        { name: 'lastname', label: `${t('Last Name')} (English)`, sm: 6 },
        {
            name: 'firstname_chinese',
            label: `${t('First Name')} (中文)`,
            sm: 6
        },
        { name: 'lastname_chinese', label: `${t('Last Name')} (中文)`, sm: 6 },
        {
            name: 'birthday',
            label: t('Birthday', { ns: 'common' }),
            type: 'date',
            sm: 12,
            inputLabelProps: { shrink: true }
        },
        {
            name: 'email',
            label: t('Email', { ns: 'common' }),
            sm: 12,
            disabled: true,
            inputLabelProps: { shrink: true }
        },
        {
            name: 'linkedIn',
            label: t('LinkedIn', { ns: 'common' }),
            sm: 12,
            inputLabelProps: { shrink: true }
        },
        {
            name: 'lineId',
            label: t('Line ID', { ns: 'common' }),
            sm: 12,
            inputLabelProps: { shrink: true }
        }
    ];

    return (
        <Box>
            {res_modal_status >= 400 ? (
                <ModalMain
                    ConfirmError={ConfirmError}
                    res_modal_message={res_modal_message}
                    res_modal_status={res_modal_status}
                />
            ) : null}
            <Breadcrumbs aria-label="breadcrumb">
                <Link
                    color="inherit"
                    component={LinkDom}
                    to={`${DEMO.DASHBOARD_LINK}`}
                    underline="hover"
                >
                    {appConfig.companyName}
                </Link>
                {user_id ? (
                    <Link
                        color="inherit"
                        component={LinkDom}
                        to={`${DEMO.STUDENT_DATABASE_STUDENTID_LINK(
                            user_id,
                            DEMO.PROFILE_HASH
                        )}`}
                        underline="hover"
                    >
                        {`${profileState.personaldata.firstname} ${
                            profileState.personaldata.lastname
                        } |${
                            profileState.personaldata.firstname_chinese
                                ? profileState.personaldata.firstname_chinese
                                : ' '
                        }${
                            profileState.personaldata.lastname_chinese
                                ? profileState.personaldata.lastname_chinese
                                : ' '
                        }`}
                    </Link>
                ) : null}

                <Typography color="text.primary">
                    {t('Personal Data', { ns: 'common' })}
                </Typography>
            </Breadcrumbs>
            <Box component="form" noValidate sx={{ mt: 3 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        {!is_personal_data_filled(profileState.personaldata) ? (
                            <Accordion
                                defaultExpanded
                                disableGutters
                                sx={{ backgroundColor: '#FF0000' }}
                            >
                                <AccordionSummary
                                    aria-controls="panel1-content"
                                    expandIcon={<ExpandMoreIcon />}
                                    id="panel1-header"
                                >
                                    <Stack
                                        alignItems="center"
                                        direction="row"
                                        spacing={1}
                                    >
                                        <ReportProblemIcon fontSize="small" />
                                        <Typography>
                                            {t('Reminder')}: Please fill your
                                        </Typography>
                                    </Stack>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <List>
                                        {personalDataFields.map(
                                            (item) =>
                                                !profileState.personaldata[
                                                    item.name
                                                ] && (
                                                    <ListItem key={item.name}>
                                                        <ListItemText
                                                            primary={item.label}
                                                        />
                                                    </ListItem>
                                                )
                                        )}
                                    </List>
                                </AccordionDetails>
                            </Accordion>
                        ) : null}
                    </Grid>
                    {personalDataFields.map(
                        ({
                            name,
                            label,
                            sm,
                            type = 'text',
                            disabled = false,
                            inputLabelProps
                        }) => (
                            <Grid item key={name} sm={sm} xs={12}>
                                <TextField
                                    InputLabelProps={inputLabelProps}
                                    autoComplete={name}
                                    disabled={disabled}
                                    fullWidth
                                    id={name}
                                    label={label}
                                    name={name}
                                    onChange={handleChange_PersonalData}
                                    required={!disabled}
                                    type={type}
                                    value={
                                        profileState.personaldata[name] ?? ''
                                    }
                                />
                            </Grid>
                        )
                    )}
                </Grid>
                <Button
                    color="primary"
                    disabled={
                        profileState.personaldata.firstname === '' ||
                        profileState.personaldata.firstname_chinese === '' ||
                        profileState.personaldata.lastname === '' ||
                        profileState.personaldata.lastname_chinese === '' ||
                        !profileState.changed_personaldata
                    }
                    fullWidth
                    onClick={(e) =>
                        handleSubmit_PersonalData(e, profileState.personaldata)
                    }
                    sx={{ mt: 3, mb: 2 }}
                    variant="contained"
                >
                    {t('Update', { ns: 'common' })}
                </Button>
            </Box>
            {!user_id && (is_TaiGer_Agent(user) || is_TaiGer_Editor(user)) ? (
                <Card sx={{ padding: 2, mb: 2 }}>
                    <Typography>{t('Profile', { ns: 'common' })}</Typography>
                    <Typography variant="h5">
                        {t('Introduction', { ns: 'common' })}
                    </Typography>
                    <Typography>{user.selfIntroduction as string}</Typography>
                </Card>
            ) : null}
            <Dialog
                aria-labelledby="contained-modal-title-vcenter"
                onClose={setmodalhide}
                open={profileState.updateconfirmed}
            >
                <DialogTitle>
                    {t('Update Successfully', { ns: 'common' })}
                </DialogTitle>
                <DialogContent>
                    {t('Personal Data is updated successfully!', {
                        ns: 'common'
                    })}
                </DialogContent>
                <DialogActions>
                    <Button
                        color="primary"
                        onClick={setmodalhide}
                        variant="contained"
                    >
                        {t('Close', { ns: 'common' })}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Profile;
