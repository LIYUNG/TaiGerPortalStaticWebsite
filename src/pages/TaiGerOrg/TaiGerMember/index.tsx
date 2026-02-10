import React, { useState, useMemo } from 'react';
import {
    Box,
    Breadcrumbs,
    Card,
    CardContent,
    Link,
    Typography,
    Avatar,
    Stack,
    Chip,
    Divider,
    Grid,
    Paper,
    TextField,
    InputAdornment,
    CardActionArea
} from '@mui/material';
import {
    AdminPanelSettings as AdminIcon,
    SupportAgent as AgentIcon,
    Edit as EditorIcon,
    People as PeopleIcon,
    Search as SearchIcon,
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon,
    Email as EmailIcon
} from '@mui/icons-material';
import { Navigate, Link as LinkDom } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { is_TaiGer_Admin, is_TaiGer_role, Role } from '@taiger-common/core';

import ErrorPage from '../../Utils/ErrorPage';
import { getTeamMembersQuery } from '@api/query';
import { TabTitle } from '../../Utils/TabTitle';
import DEMO from '../../../store/constant';
import { appConfig } from '../../../config';
import { useAuth } from '@components/AuthProvider';
import Loading from '@components/Loading/Loading';

interface TeamMember {
    _id: { toString(): string };
    firstname?: string;
    lastname?: string;
    email?: string;
    pictureUrl?: string;
    role?: string;
}

const getInitials = (firstname?: string, lastname?: string) => {
    return `${firstname?.charAt(0) || ''}${lastname?.charAt(0) || ''}`.toUpperCase();
};

const getAvatarColor = (role?: string) => {
    switch (role) {
        case Role.Admin:
            return '#d32f2f';
        case Role.Agent:
            return '#1976d2';
        case Role.Editor:
            return '#388e3c';
        default:
            return '#757575';
    }
};

interface MemberCardProps {
    member: TeamMember;
    roleLink: (id: string) => string;
}

const MemberCard = ({ member, roleLink }: MemberCardProps) => {
    return (
        <Card
            sx={{
                height: '100%',
                transition: 'all 0.3s ease',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4
                }
            }}
        >
            <CardActionArea
                component={LinkDom}
                to={roleLink(member._id.toString())}
            >
                <CardContent>
                    <Stack alignItems="center" spacing={1.5}>
                        <Avatar
                            src={member.pictureUrl}
                            sx={{
                                bgcolor: getAvatarColor(member.role),
                                fontWeight: 'bold',
                                height: 64,
                                width: 64
                            }}
                        >
                            {getInitials(member.firstname, member.lastname)}
                        </Avatar>
                        <Box sx={{ textAlign: 'center', width: '100%' }}>
                            <Typography
                                component="div"
                                sx={{
                                    fontWeight: 600,
                                    fontSize: '1rem',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                {member.firstname} {member.lastname}
                            </Typography>
                            {member.email && (
                                <Stack
                                    alignItems="center"
                                    direction="row"
                                    justifyContent="center"
                                    spacing={0.5}
                                    sx={{ mt: 0.5 }}
                                >
                                    <EmailIcon
                                        sx={{
                                            color: 'text.secondary',
                                            fontSize: 14
                                        }}
                                    />
                                    <Typography
                                        color="text.secondary"
                                        sx={{
                                            fontSize: '0.875rem',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        }}
                                        variant="body2"
                                    >
                                        {member.email}
                                    </Typography>
                                </Stack>
                            )}
                        </Box>
                    </Stack>
                </CardContent>
            </CardActionArea>
        </Card>
    );
};

interface MemberSectionProps {
    title: string;
    members: TeamMember[];
    icon: React.ReactNode;
    roleLink: (id: string) => string;
    roleColor: string;
    showSection?: boolean;
    t: ReturnType<typeof useTranslation>['t'];
}

const MemberSection = ({
    title,
    members,
    icon,
    roleLink,
    roleColor,
    showSection = true,
    t
}: MemberSectionProps) => {
    const [expanded, setExpanded] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredMembers = useMemo(() => {
        if (!searchQuery.trim()) return members;

        const query = searchQuery.toLowerCase();
        return members.filter(
            (member) =>
                member.firstname?.toLowerCase().includes(query) ||
                member.lastname?.toLowerCase().includes(query) ||
                member.email?.toLowerCase().includes(query)
        );
    }, [members, searchQuery]);

    const displayLimit = 12;
    const hasMore = filteredMembers.length > displayLimit;
    const displayedMembers = expanded
        ? filteredMembers
        : filteredMembers.slice(0, displayLimit);

    if (!showSection) return null;

    return (
        <Card sx={{ mb: 3 }}>
            <CardContent>
                <Stack
                    alignItems="center"
                    direction="row"
                    spacing={2}
                    sx={{ mb: 2 }}
                >
                    <Avatar
                        sx={{
                            bgcolor: roleColor,
                            height: 48,
                            width: 48
                        }}
                    >
                        {icon}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                        <Typography component="h2" variant="h5">
                            {title}
                        </Typography>
                        <Chip
                            label={`${filteredMembers.length}${searchQuery ? ` of ${members.length}` : ''} ${filteredMembers.length === 1 ? t('member', { ns: 'common' }) : t('members', { ns: 'common' })}`}
                            size="small"
                            sx={{ mt: 0.5 }}
                        />
                    </Box>
                </Stack>

                {members.length > 6 && (
                    <TextField
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            )
                        }}
                        fullWidth
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t('Search members...', { ns: 'common' })}
                        size="small"
                        sx={{ mb: 2 }}
                        value={searchQuery}
                        variant="outlined"
                    />
                )}

                <Divider sx={{ mb: 2 }} />

                {filteredMembers.length === 0 ? (
                    <Typography
                        color="text.secondary"
                        sx={{ py: 4, textAlign: 'center' }}
                    >
                        {searchQuery
                            ? t('No members found matching your search', {
                                  ns: 'common'
                              })
                            : t('No members found', { ns: 'common' })}
                    </Typography>
                ) : (
                    <>
                        <Grid container spacing={2}>
                            {displayedMembers.map((member, i) => (
                                <Grid item key={i} lg={2} md={3} sm={4} xs={6}>
                                    <MemberCard
                                        member={member}
                                        roleLink={roleLink}
                                    />
                                </Grid>
                            ))}
                        </Grid>

                        {hasMore && (
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    mt: 2
                                }}
                            >
                                <Chip
                                    clickable
                                    color="primary"
                                    icon={
                                        expanded ? (
                                            <ExpandLessIcon />
                                        ) : (
                                            <ExpandMoreIcon />
                                        )
                                    }
                                    label={
                                        expanded
                                            ? t('Show less', { ns: 'common' })
                                            : t(
                                                  `Show ${filteredMembers.length - displayLimit} more`,
                                                  { ns: 'common' }
                                              )
                                    }
                                    onClick={() => setExpanded(!expanded)}
                                    variant="outlined"
                                />
                            </Box>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
};

const TaiGerMember = () => {
    const { user } = useAuth();
    const { t } = useTranslation();

    const {
        data: response,
        isLoading,
        isError,
        error
    } = useQuery(getTeamMembersQuery());

    if (!user || !is_TaiGer_role(user)) {
        return <Navigate to={`${DEMO.DASHBOARD_LINK}`} />;
    }

    TabTitle(`${appConfig.companyName} Team Member`);

    if (isLoading) {
        return <Loading />;
    }

    if (isError || !response?.data?.success) {
        const status =
            response?.status ??
            (error as { response?: { status?: number } })?.response?.status ??
            500;
        return <ErrorPage res_status={status} />;
    }

    const teams: TeamMember[] = response?.data?.data || [];
    const admins = teams.filter((member) => member.role === Role.Admin);
    const agents = teams.filter((member) => member.role === Role.Agent);
    const editors = teams.filter((member) => member.role === Role.Editor);

    return (
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
            <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
                <Link
                    color="inherit"
                    component={LinkDom}
                    to={`${DEMO.DASHBOARD_LINK}`}
                    underline="hover"
                >
                    {appConfig.companyName}
                </Link>
                <Typography color="text.primary">
                    {t('tenant-team', {
                        ns: 'common',
                        tenant: appConfig.companyName
                    })}
                </Typography>
                <Typography color="text.primary">
                    {t('tenant-members', {
                        ns: 'common',
                        tenant: appConfig.companyName
                    })}
                </Typography>
            </Breadcrumbs>

            <Paper
                elevation={0}
                sx={{
                    p: 3,
                    mb: 3,
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText'
                }}
            >
                <Stack alignItems="center" direction="row" spacing={2}>
                    <PeopleIcon sx={{ fontSize: 40 }} />
                    <Box>
                        <Typography component="h1" gutterBottom variant="h4">
                            {t('tenant-members', {
                                ns: 'common',
                                tenant: appConfig.companyName
                            })}
                        </Typography>
                        <Typography sx={{ opacity: 0.9 }} variant="body1">
                            {t('Total', { ns: 'common' })}: {teams.length}{' '}
                            {t('members', { ns: 'common' })}
                        </Typography>
                    </Box>
                </Stack>
            </Paper>

            {is_TaiGer_Admin(user) && (
                <MemberSection
                    icon={<AdminIcon />}
                    members={admins}
                    roleColor="#d32f2f"
                    roleLink={DEMO.TEAM_ADMIN_LINK}
                    showSection={true}
                    t={t}
                    title={t('Admin', { ns: 'common' })}
                />
            )}

            <MemberSection
                icon={<AgentIcon />}
                members={agents}
                roleColor="#1976d2"
                roleLink={DEMO.TEAM_AGENT_LINK}
                showSection={true}
                t={t}
                title={t('Agent', { ns: 'common' })}
            />

            <MemberSection
                icon={<EditorIcon />}
                members={editors}
                roleColor="#388e3c"
                roleLink={DEMO.TEAM_EDITOR_LINK}
                showSection={true}
                t={t}
                title={t('Editor', { ns: 'common' })}
            />
        </Box>
    );
};

export default TaiGerMember;
