import { Navigate, useParams, Link as LinkDom } from 'react-router-dom';
import {
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Stack,
    Typography
} from '@mui/material';
import { FolderOpen as FolderOpenIcon } from '@mui/icons-material';
import { is_TaiGer_role } from '@taiger-common/core';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';

import ErrorPage from '../Utils/ErrorPage';
import { getExpenseQuery } from '@/api/query';
import { TabTitle } from '../Utils/TabTitle';
import DEMO from '@store/constant';
import {
    ExtendableTable,
    type ExtendableTableStudent
} from '@components/ExtendableTable/ExtendableTable';
import { appConfig } from '../../config';
import { useAuth } from '@components/AuthProvider';
import Loading from '@components/Loading/Loading';
import { BreadcrumbsNavigation } from '@components/BreadcrumbsNavigation/BreadcrumbsNavigation';
import { stringAvatar } from '@utils/contants';

const SingleBalanceSheetOverview = () => {
    const { taiger_user_id } = useParams<{ taiger_user_id: string }>();
    const { user } = useAuth();
    const { t } = useTranslation();

    // Fetch expense data using React Query
    const {
        data: response,
        isLoading,
        error,
        isError
    } = useQuery({
        ...getExpenseQuery(taiger_user_id ?? ''),
        enabled: Boolean(taiger_user_id)
    });

    if (
        !user ||
        !is_TaiGer_role(user as Parameters<typeof is_TaiGer_role>[0])
    ) {
        return <Navigate to={`${DEMO.DASHBOARD_LINK}`} />;
    }

    if (!taiger_user_id) {
        return <Navigate to={DEMO.ACCOUNTING_LINK} replace />;
    }

    if (isLoading) {
        return <Loading />;
    }

    if (isError || !response?.data?.success) {
        const axiosError = error as
            | { response?: { status?: number } }
            | undefined;
        const res_status =
            (response?.status || axiosError?.response?.status) ?? 500;
        return <ErrorPage res_status={res_status} />;
    }

    const students: ExtendableTableStudent[] = response.data.data.students;
    const the_user = response.data.data.the_user;
    const fullName =
        `${the_user.firstname ?? ''} ${the_user.lastname ?? ''}`.trim();

    // Payment summary: total amount, students, applications, doc threads
    const totalAmount = students.reduce(
        (sum, s) =>
            sum + (s.expenses?.reduce((a, e) => a + (e?.amount ?? 0), 0) ?? 0),
        0
    );
    const totalApplications =
        students.reduce((s, st) => s + (st.applying_program_count ?? 0), 0) ??
        0;
    const docThreadCounts = students.reduce(
        (acc, s) => {
            const general = s.generaldocs_threads?.length ?? 0;
            const appThreads =
                s.applications?.reduce(
                    (a, app) => a + (app.doc_modification_thread?.length ?? 0),
                    0
                ) ?? 0;
            const total = general + appThreads;
            const completed =
                (s.generaldocs_threads?.filter((t) => t.isFinalVersion)
                    .length ?? 0) +
                (s.applications?.reduce(
                    (a, app) =>
                        a +
                        (app.doc_modification_thread?.filter(
                            (t) => t.isFinalVersion
                        ).length ?? 0),
                    0
                ) ?? 0);
            return {
                total: acc.total + total,
                completed: acc.completed + completed
            };
        },
        { total: 0, completed: 0 }
    );

    TabTitle(
        `${appConfig.companyName} - ${the_user.role}: ${fullName || 'User'}`
    );

    return (
        <Box>
            <BreadcrumbsNavigation
                items={[
                    { label: appConfig.companyName, link: DEMO.DASHBOARD_LINK },
                    {
                        label: t('tenant-team', {
                            ns: 'common',
                            tenant: appConfig.companyName
                        }),
                        link: DEMO.ACCOUNTING_LINK
                    },
                    { label: fullName || t('Unknown', { ns: 'common' }) }
                ]}
            />
            <Box sx={{ mb: 3, mt: 1 }}>
                <Typography variant="h5">
                    {t('Salary Overview', { ns: 'common' })}
                </Typography>
                <Typography color="text.secondary" variant="body2">
                    {t(
                        'Balance sheet and expenses for students assigned to this team member',
                        {
                            ns: 'common'
                        }
                    )}
                </Typography>
            </Box>
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Stack
                        direction="row"
                        alignItems="center"
                        spacing={2}
                        flexWrap="wrap"
                        useFlexGap
                    >
                        <Avatar
                            alt={fullName}
                            src={the_user.pictureUrl}
                            sx={{
                                width: 56,
                                height: 56,
                                ...(fullName ? stringAvatar(fullName).sx : {})
                            }}
                        >
                            {fullName ? stringAvatar(fullName).children : '?'}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="h6">
                                {fullName || t('Unknown', { ns: 'common' })}
                            </Typography>
                            <Chip
                                color={
                                    the_user.role === 'Agent'
                                        ? 'secondary'
                                        : 'primary'
                                }
                                label={t(the_user.role ?? 'Unknown', {
                                    ns: 'common'
                                })}
                                size="small"
                                sx={{ mt: 0.5 }}
                            />
                        </Box>
                    </Stack>
                </CardContent>
            </Card>
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="subtitle1" sx={{ mb: 2 }}>
                        {t('Payment Summary', { ns: 'common' })}
                    </Typography>
                    <Box
                        sx={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 3
                        }}
                    >
                        <Box>
                            <Typography color="text.secondary" variant="body2">
                                {t('Total Amount', { ns: 'common' })}
                            </Typography>
                            <Typography variant="h6">{totalAmount}</Typography>
                        </Box>
                        <Box>
                            <Typography color="text.secondary" variant="body2">
                                {t('Students', { ns: 'common' })}
                            </Typography>
                            <Typography variant="h6">
                                {students.length}
                            </Typography>
                        </Box>
                        <Box>
                            <Typography color="text.secondary" variant="body2">
                                # {t('Applications')}
                            </Typography>
                            <Typography variant="h6">
                                {totalApplications}
                            </Typography>
                        </Box>
                        <Box>
                            <Typography color="text.secondary" variant="body2">
                                {t('Document Threads', { ns: 'common' })}
                            </Typography>
                            <Typography variant="h6">
                                {docThreadCounts.completed} /{' '}
                                {docThreadCounts.total}{' '}
                                {t('completed', { ns: 'common' })}
                            </Typography>
                        </Box>
                    </Box>
                </CardContent>
            </Card>
            <ExtendableTable data={students} />
            <Box sx={{ mt: 3 }}>
                <Button
                    component={LinkDom}
                    to={`${DEMO.TEAM_AGENT_ARCHIV_LINK(the_user._id.toString())}`}
                    variant="contained"
                    color="primary"
                    startIcon={<FolderOpenIcon />}
                >
                    {t('See Archiv Student', { ns: 'common' })}
                </Button>
            </Box>
        </Box>
    );
};

export default SingleBalanceSheetOverview;
