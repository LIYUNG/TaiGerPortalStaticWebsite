import { useState, useMemo, useEffect } from 'react';
import { Link as LinkDom } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageOutlinedIcon from '@mui/icons-material/LanguageOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import TipsAndUpdatesOutlinedIcon from '@mui/icons-material/TipsAndUpdatesOutlined';
import TouchAppOutlinedIcon from '@mui/icons-material/TouchAppOutlined';
import VpnKeyOutlinedIcon from '@mui/icons-material/VpnKeyOutlined';
import {
    Alert,
    Avatar,
    Box,
    Breadcrumbs,
    Card,
    Link,
    Stack,
    Typography
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { isProgramDecided } from '@taiger-common/core';
import type {
    IApplicationPopulated,
    IProgramWithId,
    PortalCredentialsStudent
} from '@taiger-common/model';

import ErrorPage from '../Utils/ErrorPage';
import ModalMain from '../Utils/ModalHandler/ModalMain';
import { usePortalCredentials } from '@/hooks/usePortalCredentials';
import { TabTitle } from '../Utils/TabTitle';
import DEMO from '@store/constant';
import { appConfig } from '../../config';
import Loading from '@components/Loading/Loading';
import { useSnackBar } from '@contexts/use-snack-bar';

import { PortalCredentialsApplicationBlock } from './PortalCredentialsApplicationBlock';
import {
    buildBooleanFlagMapForApplications,
    buildCredentialsFromApplications,
    EMPTY_PORTAL_CREDENTIAL_FIELDS,
    mergeServerCredentialsWithDelta,
    parsePortalCredentialTextFieldId,
    type PortalCredentialFields
} from './portalCredentialsUtils';

interface PortalCredentialsCardProps {
    student_id: string;
    showTitle?: boolean;
}

function PortalCredentialsHowToGuide() {
    const { t } = useTranslation();
    const theme = useTheme();
    const steps = [
        {
            n: 1,
            icon: <LanguageOutlinedIcon sx={{ fontSize: 20 }} />,
            label: t('portalCreds.step1', {
                defaultValue: 'Register or log in on each university website'
            }),
            color: theme.palette.primary.main
        },
        {
            n: 2,
            icon: <TouchAppOutlinedIcon sx={{ fontSize: 20 }} />,
            label: t('portalCreds.step2', {
                defaultValue:
                    'Copy your account & password into the fields below'
            }),
            color: theme.palette.info.main
        },
        {
            n: 3,
            icon: <SaveOutlinedIcon sx={{ fontSize: 20 }} />,
            label: t('portalCreds.step3', {
                defaultValue: 'Press Save on that program after you edit'
            }),
            color: theme.palette.success.main
        }
    ];

    return (
        <Alert
            icon={<TipsAndUpdatesOutlinedIcon />}
            severity="info"
            sx={{
                alignItems: 'flex-start',
                borderRadius: 2,
                border: 1,
                borderColor: 'info.light',
                bgcolor: (th) => alpha(th.palette.info.main, 0.06),
                '& .MuiAlert-icon': { color: 'info.main', mt: 0.25 }
            }}
        >
            <Typography
                component="div"
                fontWeight={700}
                sx={{ mb: 1.5, color: 'info.dark' }}
                variant="subtitle2"
            >
                {t('portalCreds.guideTitle', {
                    defaultValue: 'What to do on this page'
                })}
            </Typography>
            <Stack
                direction={{ xs: 'column', md: 'row' }}
                spacing={{ xs: 2, md: 3 }}
            >
                {steps.map((step) => (
                    <Stack
                        alignItems="flex-start"
                        direction="row"
                        key={step.n}
                        spacing={1.5}
                        sx={{ flex: 1, minWidth: 0 }}
                    >
                        <Avatar
                            sx={{
                                width: 32,
                                height: 32,
                                fontSize: '0.875rem',
                                fontWeight: 700,
                                bgcolor: alpha(step.color, 0.15),
                                color: step.color
                            }}
                            variant="rounded"
                        >
                            {step.n}
                        </Avatar>
                        <Box sx={{ minWidth: 0 }}>
                            <Box
                                sx={{
                                    color: step.color,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.5,
                                    mb: 0.25
                                }}
                            >
                                {step.icon}
                            </Box>
                            <Typography
                                color="text.primary"
                                variant="body2"
                                sx={{ lineHeight: 1.45 }}
                            >
                                {step.label}
                            </Typography>
                        </Box>
                    </Stack>
                ))}
            </Stack>
        </Alert>
    );
}

export default function PortalCredentialsCard(
    props: PortalCredentialsCardProps
) {
    const { t } = useTranslation();
    const { setMessage, setSeverity, setOpenSnackbar } = useSnackBar();
    const portalQuery = usePortalCredentials(props.student_id);
    const { postCredentialsMutation } = portalQuery;

    const portalPayload = useMemo(() => {
        const r = portalQuery.data;
        if (!r?.success || !r.data) {
            return null;
        }
        return r.data;
    }, [portalQuery.data]);

    const applications = useMemo(
        () => (portalPayload?.applications ?? []) as IApplicationPopulated[],
        [portalPayload]
    );
    const student: PortalCredentialsStudent | null =
        portalPayload?.student ?? null;

    const serverCredentials = useMemo(
        () => buildCredentialsFromApplications(applications),
        [applications]
    );

    const [credentialDelta, setCredentialDelta] = useState<
        Record<string, Partial<PortalCredentialFields>>
    >({});
    const [isChangedById, setIsChangedById] = useState<Record<string, boolean>>(
        {}
    );
    const [isUpdateLoadedById, setIsUpdateLoadedById] = useState<
        Record<string, boolean>
    >({});
    const [modalState, setModalState] = useState({
        res_modal_status: 0,
        res_modal_message: ''
    });

    /** Reset local edits when switching student or when the server payload refetches */
    const syncKey = `${props.student_id}:${portalQuery.dataUpdatedAt ?? 0}`;
    const [prevSyncKey, setPrevSyncKey] = useState(syncKey);
    if (syncKey !== prevSyncKey) {
        setPrevSyncKey(syncKey);
        setCredentialDelta({});
        setIsChangedById({});
        setIsUpdateLoadedById({});
    }

    const credentials = useMemo(
        () =>
            mergeServerCredentialsWithDelta(serverCredentials, credentialDelta),
        [serverCredentials, credentialDelta]
    );

    const isChangedMap = useMemo(
        () =>
            buildBooleanFlagMapForApplications(
                applications,
                isChangedById,
                false
            ),
        [applications, isChangedById]
    );

    const isUpdateLoadedMap = useMemo(
        () =>
            buildBooleanFlagMapForApplications(
                applications,
                isUpdateLoadedById,
                true
            ),
        [applications, isUpdateLoadedById]
    );

    const decidedApplications = useMemo(
        () =>
            applications.filter(
                (application) =>
                    isProgramDecided(application) &&
                    Boolean(application.programId)
            ),
        [applications]
    );

    useEffect(() => {
        TabTitle(
            `Student ${student?.firstname ?? ''} ${student?.lastname ?? ''} || Portal Credentials`
        );
    }, [student?.firstname, student?.lastname]);

    const onCredentialFieldChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const parsed = parsePortalCredentialTextFieldId(e.target.id);
        if (!parsed) {
            return;
        }
        const { applicationId, field } = parsed;
        setIsChangedById((prev) => ({ ...prev, [applicationId]: true }));
        setCredentialDelta((d) => ({
            ...d,
            [applicationId]: {
                ...d[applicationId],
                [field]: e.target.value
            }
        }));
    };

    const onSubmit = async (
        application_id: string,
        creds: Record<string, string>
    ) => {
        setIsUpdateLoadedById((prev) => ({
            ...prev,
            [application_id]: false
        }));
        try {
            const resp = await postCredentialsMutation.mutateAsync({
                applicationId: application_id,
                credentials: creds
            });
            const { success } = resp.data;
            const { status } = resp;
            if (success) {
                setSeverity('success');
                setMessage(
                    t('Update portal credentials successfully', {
                        ns: 'portalManagement'
                    })
                );
                setOpenSnackbar(true);
                setIsChangedById((prev) => ({
                    ...prev,
                    [application_id]: false
                }));
                setIsUpdateLoadedById((prev) => ({
                    ...prev,
                    [application_id]: true
                }));
                setModalState({
                    res_modal_status: status,
                    res_modal_message: ''
                });
            } else {
                const { message } = resp.data;
                setModalState({
                    res_modal_status: status,
                    res_modal_message: message ?? ''
                });
            }
        } catch (error: unknown) {
            const message =
                error instanceof Error
                    ? error.message
                    : 'An error occurred. Please try again.';
            setSeverity('error');
            setMessage(message);
            setOpenSnackbar(true);
            setModalState({
                res_modal_status: 500,
                res_modal_message: ''
            });
            setIsUpdateLoadedById((prev) => ({
                ...prev,
                [application_id]: true
            }));
            alert('Course Update failed. Please try later.');
        }
    };

    const confirmModalError = () => {
        setModalState({ res_modal_status: 0, res_modal_message: '' });
    };

    if (portalQuery.isPending) {
        return <Loading />;
    }

    if (portalQuery.isError) {
        return <ErrorPage res_status={500} />;
    }

    const pendingApplicationId =
        postCredentialsMutation.isPending && postCredentialsMutation.variables
            ? String(postCredentialsMutation.variables.applicationId)
            : null;

    return (
        <Box sx={{ pb: 3 }}>
            {modalState.res_modal_status >= 400 ? (
                <ModalMain
                    ConfirmError={confirmModalError}
                    res_modal_message={modalState.res_modal_message}
                    res_modal_status={modalState.res_modal_status}
                />
            ) : null}
            {!props.showTitle ? (
                <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
                    <Link
                        color="inherit"
                        component={LinkDom}
                        to={`${DEMO.DASHBOARD_LINK}`}
                        underline="hover"
                    >
                        {appConfig.companyName}
                    </Link>
                    <Typography color="text.primary">
                        Portal Credentials
                    </Typography>
                </Breadcrumbs>
            ) : null}

            <Card
                elevation={0}
                sx={{
                    p: { xs: 2, sm: 3 },
                    borderRadius: 2,
                    border: 1,
                    borderColor: 'divider',
                    overflow: 'hidden'
                }}
                variant="outlined"
            >
                <Stack spacing={2.5}>
                    <Stack
                        alignItems="flex-start"
                        direction="row"
                        spacing={1.5}
                    >
                        <Box
                            aria-hidden
                            sx={{
                                color: 'primary.main',
                                display: 'flex',
                                mt: 0.25,
                                p: 1,
                                borderRadius: 2,
                                bgcolor: (th) =>
                                    alpha(th.palette.primary.main, 0.08)
                            }}
                        >
                            <VpnKeyOutlinedIcon sx={{ fontSize: 28 }} />
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography
                                component="h2"
                                fontWeight={700}
                                sx={{ mb: 0.5, color: 'primary.dark' }}
                                variant="h6"
                            >
                                {t('portalCreds.cardHeading', {
                                    defaultValue:
                                        'Your application portal logins'
                                })}
                            </Typography>
                            <Typography
                                color="text.secondary"
                                variant="body2"
                                sx={{ lineHeight: 1.5 }}
                            >
                                {t('portalCreds.cardSubheading', {
                                    defaultValue:
                                        'Agents use these to verify uploads. Only share credentials for portals you use.'
                                })}
                            </Typography>
                        </Box>
                    </Stack>

                    <PortalCredentialsHowToGuide />

                    <Stack spacing={1}>
                        <Typography
                            component="div"
                            variant="body1"
                            sx={{ lineHeight: 1.7 }}
                        >
                            請到下列各學校網站 [
                            <Box component="span" sx={{ fontWeight: 700 }}>
                                {t('Link', { ns: 'common' })}
                            </Box>
                            ]
                            申請該校的申請平台帳號密碼，並在此頁面提供帳號密碼，方便日後Agent為您登入檢查上傳文件正確性。若有[
                            <Box component="span" sx={{ fontWeight: 700 }}>
                                {t('Instructions')}
                            </Box>
                            ]
                            連結，請點入連結，依照裡面教學完成。填完帳號密碼，請務必點擊各申請下方的{' '}
                            <Box
                                component="span"
                                sx={{
                                    fontWeight: 700,
                                    color: 'primary.main'
                                }}
                            >
                                {t('Update', { ns: 'common' })}
                            </Box>
                            按鈕儲存。
                        </Typography>
                        <Typography
                            color="text.secondary"
                            component="p"
                            variant="body2"
                            sx={{ lineHeight: 1.65, m: 0 }}
                        >
                            Please share your universities&apos; application
                            portal credentials below. Your agent(s) can help you
                            review your applications when you are blocked.
                        </Typography>
                    </Stack>

                    {decidedApplications.length === 0 ? (
                        <Alert
                            icon={<SchoolOutlinedIcon />}
                            severity="info"
                            sx={{
                                borderRadius: 2,
                                bgcolor: (th) =>
                                    alpha(th.palette.info.main, 0.06)
                            }}
                        >
                            {t('No programs to show portal credentials for.', {
                                defaultValue:
                                    'There are no decided applications with portal links here yet. When a program is marked decided, it will appear in this list.'
                            })}
                        </Alert>
                    ) : null}

                    {decidedApplications.map((application) => {
                        const program = application.programId as IProgramWithId;
                        const appId = application._id.toString();
                        const rowCreds =
                            credentials[appId] ??
                            EMPTY_PORTAL_CREDENTIAL_FIELDS;
                        return (
                            <PortalCredentialsApplicationBlock
                                key={appId}
                                appId={appId}
                                credentials={rowCreds}
                                isChanged={isChangedMap[appId] ?? false}
                                isSubmittingThisApp={
                                    pendingApplicationId === appId
                                }
                                isUpdateLoaded={
                                    isUpdateLoadedMap[appId] ?? true
                                }
                                onCredentialFieldChange={
                                    onCredentialFieldChange
                                }
                                onUpdateClick={() => onSubmit(appId, rowCreds)}
                                program={program}
                            />
                        );
                    })}
                </Stack>
            </Card>
        </Box>
    );
}
