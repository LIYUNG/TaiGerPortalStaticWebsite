import { useMemo } from 'react';
import { Navigate, Link as LinkDom } from 'react-router-dom';
import {
    Avatar,
    Box,
    Card,
    CardContent,
    Grid,
    List,
    ListItemButton,
    ListItemAvatar,
    ListItemText,
    Typography
} from '@mui/material';
import {
    SupervisorAccount as SupervisorAccountIcon,
    Edit as EditIcon,
    ChevronRight as ChevronRightIcon
} from '@mui/icons-material';
import { is_TaiGer_role } from '@taiger-common/core';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';

import ErrorPage from '../Utils/ErrorPage';
import { getTeamMembersQuery } from '@/api/query';
import { TabTitle } from '../Utils/TabTitle';
import DEMO from '@store/constant';
import { appConfig } from '../../config';
import { useAuth } from '@components/AuthProvider';
import Loading from '@components/Loading/Loading';
import { BreadcrumbsNavigation } from '@components/BreadcrumbsNavigation/BreadcrumbsNavigation';
import { stringAvatar } from '@utils/contants';

interface TeamMember {
    _id: { toString(): string };
    firstname?: string;
    lastname?: string;
    pictureUrl?: string;
    role?: string;
}

const Accounting = () => {
    const { user } = useAuth();
    const { t } = useTranslation();

    // Fetch team members using React Query
    const {
        data: response,
        isLoading,
        error,
        isError
    } = useQuery(getTeamMembersQuery());

    // Memoize filtered lists
    const agents = useMemo(() => {
        if (!response?.data?.data) return [];
        return (response.data.data as TeamMember[]).filter(
            (member) => member.role === 'Agent'
        );
    }, [response]);

    const editors = useMemo(() => {
        if (!response?.data?.data) return [];
        return (response.data.data as TeamMember[]).filter(
            (member) => member.role === 'Editor'
        );
    }, [response]);

    if (
        !user ||
        !is_TaiGer_role(user as Parameters<typeof is_TaiGer_role>[0])
    ) {
        return <Navigate to={`${DEMO.DASHBOARD_LINK}`} />;
    }

    TabTitle(`${appConfig.companyName} Accounting`);

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

    const MemberList = ({
        members,
        emptyLabel
    }: {
        members: TeamMember[];
        emptyLabel: string;
    }) =>
        members.length === 0 ? (
            <Typography color="text.secondary" sx={{ py: 2 }} variant="body2">
                {emptyLabel}
            </Typography>
        ) : (
            <List disablePadding>
                {members.map((member) => {
                    const fullName =
                        `${member.firstname ?? ''} ${member.lastname ?? ''}`.trim();
                    const initials =
                        `${member.firstname?.[0] ?? ''}${member.lastname?.[0] ?? ''}`.toUpperCase();
                    return (
                        <ListItemButton
                            component={LinkDom}
                            key={member._id.toString()}
                            to={`${DEMO.ACCOUNTING_USER_ID_LINK(member._id.toString())}`}
                            sx={{ borderRadius: 1, mb: 0.5 }}
                        >
                            <ListItemAvatar>
                                <Avatar
                                    alt={fullName}
                                    src={member.pictureUrl}
                                    sx={{
                                        width: 40,
                                        height: 40,
                                        ...(fullName
                                            ? stringAvatar(fullName).sx
                                            : {})
                                    }}
                                >
                                    {fullName
                                        ? stringAvatar(fullName).children
                                        : initials || '?'}
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                                primary={
                                    fullName || t('Unknown', { ns: 'common' })
                                }
                                primaryTypographyProps={{ fontWeight: 600 }}
                            />
                            <ChevronRightIcon color="action" />
                        </ListItemButton>
                    );
                })}
            </List>
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
                        link: DEMO.DASHBOARD_LINK
                    },
                    {
                        label: t('tenant-accounting', {
                            ns: 'common',
                            tenant: appConfig.companyName
                        })
                    }
                ]}
            />
            <Box sx={{ mb: 3, mt: 1 }}>
                <Typography variant="h5">
                    {t('tenant-accounting', {
                        ns: 'common',
                        tenant: appConfig.companyName
                    })}
                </Typography>
                <Typography color="text.secondary" variant="body2">
                    {t(
                        'View balance sheets and salary overview by team member',
                        {
                            ns: 'common'
                        }
                    )}
                </Typography>
            </Box>
            <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    mb: 2
                                }}
                            >
                                <SupervisorAccountIcon color="secondary" />
                                <Typography variant="h6">
                                    {t('Agents', { ns: 'common' })} (
                                    {agents.length})
                                </Typography>
                            </Box>
                            <MemberList
                                emptyLabel={t('No agents assigned', {
                                    ns: 'common'
                                })}
                                members={agents}
                            />
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    mb: 2
                                }}
                            >
                                <EditIcon color="primary" />
                                <Typography variant="h6">
                                    {t('Editors', { ns: 'common' })} (
                                    {editors.length})
                                </Typography>
                            </Box>
                            <MemberList
                                emptyLabel={t('No editors assigned', {
                                    ns: 'common'
                                })}
                                members={editors}
                            />
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Accounting;
