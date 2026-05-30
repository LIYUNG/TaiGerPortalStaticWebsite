import { Link as LinkDom, Navigate } from 'react-router-dom';
import {
    Box,
    Card,
    CardContent,
    Link,
    Typography,
    Avatar,
    Stack,
    Chip,
    useTheme
} from '@mui/material';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Role } from '@taiger-common/core';
import type {
    IAgentWithId,
    IEditorWithId,
    IStudentResponse
} from '@taiger-common/model';

import { TabTitle } from '../Utils/TabTitle';
import DEMO from '@store/constant';
import { appConfig } from '../../config';
import { useAuth } from '@components/AuthProvider';
import { BreadcrumbsNavigation } from '@components/BreadcrumbsNavigation/BreadcrumbsNavigation';
import Loading from '@components/Loading/Loading';
import { getStudentQuery } from '@/api/query';
import { stringAvatar } from '@utils/contants';

type TeamMember = IAgentWithId | IEditorWithId;

interface TeamMemberCardProps {
    member: TeamMember;
    roleLabel: string;
    profileLink?: string;
}

const getDisplayName = (member: TeamMember): string =>
    [member.firstname, member.lastname].filter(Boolean).join(' ').trim() ||
    member.email ||
    '—';

const getInitials = (member: TeamMember): string => {
    const first = member.firstname?.charAt(0) ?? '';
    const last = member.lastname?.charAt(0) ?? '';
    const initials = `${first}${last}`.toUpperCase();
    return initials || member.email?.charAt(0).toUpperCase() || '?';
};

const TeamMemberCard = ({
    member,
    roleLabel,
    profileLink
}: TeamMemberCardProps) => {
    const theme = useTheme();
    const displayName = getDisplayName(member);
    const avatarProps = stringAvatar(displayName);

    return (
        <Card
            sx={{
                height: '100%',
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`,
                boxShadow: theme.shadows[1]
            }}
            variant="outlined"
        >
            <CardContent sx={{ p: 2.5 }}>
                <Stack alignItems="center" spacing={1.5}>
                    <Avatar
                        src={member.pictureUrl}
                        {...avatarProps}
                        sx={{
                            ...avatarProps.sx,
                            width: 72,
                            height: 72,
                            fontSize: '1.25rem',
                            fontWeight: 600
                        }}
                    >
                        {getInitials(member)}
                    </Avatar>
                    <Box sx={{ textAlign: 'center', width: '100%' }}>
                        {profileLink ? (
                            <Typography
                                component={LinkDom}
                                sx={{
                                    color: 'text.primary',
                                    fontWeight: 600,
                                    textDecoration: 'none',
                                    '&:hover': { color: 'primary.main' }
                                }}
                                to={profileLink}
                                variant="subtitle1"
                            >
                                {displayName}
                            </Typography>
                        ) : (
                            <Typography fontWeight={600} variant="subtitle1">
                                {displayName}
                            </Typography>
                        )}
                        <Chip
                            label={roleLabel}
                            size="small"
                            sx={{ mt: 0.75, fontWeight: 500 }}
                            variant="outlined"
                        />
                    </Box>
                    {member.email ? (
                        <Stack
                            alignItems="center"
                            direction="row"
                            spacing={0.75}
                            sx={{
                                color: 'text.secondary',
                                maxWidth: '100%'
                            }}
                        >
                            <EmailOutlinedIcon fontSize="small" />
                            <Link
                                href={`mailto:${member.email}`}
                                sx={{
                                    color: 'primary.main',
                                    fontSize: '0.875rem',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                }}
                                underline="hover"
                            >
                                {member.email}
                            </Link>
                        </Stack>
                    ) : null}
                </Stack>
            </CardContent>
        </Card>
    );
};

interface TeamSectionProps {
    members: TeamMember[];
    roleLabel: string;
    title: string;
    getProfileLink?: (member: TeamMember) => string | undefined;
}

const TeamSection = ({
    members,
    roleLabel,
    title,
    getProfileLink
}: TeamSectionProps) => {
    if (members.length === 0) {
        return (
            <Box sx={{ mb: 3 }}>
                <Typography
                    color="text.secondary"
                    sx={{
                        fontSize: '0.7rem',
                        letterSpacing: 0.5,
                        mb: 1,
                        textTransform: 'uppercase'
                    }}
                    variant="overline"
                >
                    {title}
                </Typography>
                <Typography color="text.secondary" variant="body2">
                    No team members assigned yet.
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ mb: 3 }}>
            <Typography
                color="text.secondary"
                sx={{
                    fontSize: '0.7rem',
                    letterSpacing: 0.5,
                    mb: 1.5,
                    textTransform: 'uppercase'
                }}
                variant="overline"
            >
                {title}
            </Typography>
            <Box
                sx={{
                    display: 'grid',
                    gap: 2,
                    gridTemplateColumns: {
                        xs: '1fr',
                        sm: 'repeat(2, 1fr)',
                        md: 'repeat(3, 1fr)'
                    }
                }}
            >
                {members.map((member) => (
                    <TeamMemberCard
                        key={String(member._id)}
                        member={member}
                        profileLink={getProfileLink?.(member)}
                        roleLabel={roleLabel}
                    />
                ))}
            </Box>
        </Box>
    );
};

const Contact = () => {
    const { user } = useAuth();
    const { t } = useTranslation();
    const theme = useTheme();
    const studentId = user?._id?.toString() ?? '';
    const isStudent = user?.role === Role.Student;
    const { data, isLoading } = useQuery({
        ...getStudentQuery(studentId),
        enabled: isStudent && !!studentId
    });
    const student = (data as { data?: { data?: IStudentResponse } } | undefined)
        ?.data?.data;
    const agents = student?.agents ?? [];
    const editors = student?.editors ?? [];
    const hasTeam = agents.length > 0 || editors.length > 0;

    if (
        user?.role !== Role.Admin &&
        user?.role !== Role.Editor &&
        user?.role !== Role.Agent &&
        user?.role !== Role.Student
    ) {
        return <Navigate to={`${DEMO.DASHBOARD_LINK}`} />;
    }
    TabTitle(t('Contact Us', { ns: 'common' }));

    if (isStudent && isLoading) {
        return <Loading />;
    }

    return (
        <Box>
            <BreadcrumbsNavigation
                items={[
                    { label: appConfig.companyName, link: DEMO.DASHBOARD_LINK },
                    {
                        label: t('Contact Us', { ns: 'common' })
                    }
                ]}
            />
            <Card
                sx={{
                    borderRadius: 2,
                    boxShadow: theme.shadows[1],
                    border: `1px solid ${theme.palette.divider}`,
                    mt: 2,
                    overflow: 'hidden'
                }}
            >
                <Box
                    sx={{
                        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                        color: 'primary.contrastText',
                        p: 2.5
                    }}
                >
                    <Stack alignItems="center" direction="row" spacing={1}>
                        <GroupsOutlinedIcon />
                        <Box>
                            <Typography fontWeight={600} variant="h6">
                                Your {appConfig.companyName} Team
                            </Typography>
                            <Typography sx={{ opacity: 0.9 }} variant="body2">
                                Reach out to your assigned agents and editors
                                anytime.
                            </Typography>
                        </Box>
                    </Stack>
                </Box>

                <Box sx={{ p: 2.5 }}>
                    {isStudent && !hasTeam ? (
                        <Typography color="text.secondary" variant="body1">
                            No team members have been assigned to you yet.
                            Please contact support if you need assistance.
                        </Typography>
                    ) : (
                        <>
                            <TeamSection
                                getProfileLink={(member) =>
                                    DEMO.TEAM_AGENT_PROFILE_LINK(
                                        String(member._id)
                                    )
                                }
                                members={agents}
                                roleLabel={t('Agent', { ns: 'common' })}
                                title={t('Agents', { ns: 'common' })}
                            />
                            <TeamSection
                                members={editors}
                                roleLabel={t('Editor', { ns: 'common' })}
                                title={t('Editors', { ns: 'common' })}
                            />
                        </>
                    )}
                </Box>
            </Card>
        </Box>
    );
};

export default Contact;
