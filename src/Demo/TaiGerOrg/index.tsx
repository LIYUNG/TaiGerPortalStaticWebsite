import React, { useState } from 'react';
import { Navigate, Link as LinkDom } from 'react-router-dom';
import {
    Avatar,
    Box,
    Breadcrumbs,
    Card,
    CardContent,
    Chip,
    IconButton,
    Link,
    Menu,
    MenuItem,
    Paper,
    TableContainer,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Tooltip,
    Typography,
    alpha
} from '@mui/material';
import {
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    Edit as EditIcon,
    Person as PersonIcon,
    SupervisorAccount as SupervisorAccountIcon,
    AdminPanelSettings as AdminPanelSettingsIcon,
    Shield as ShieldIcon
} from '@mui/icons-material';
import { useMutation, useQuery } from '@tanstack/react-query';
import { is_TaiGer_Admin, is_TaiGer_role, Role } from '@taiger-common/core';
import i18next from 'i18next';

import ErrorPage from '../Utils/ErrorPage';
import { updateUserPermission } from '../../api';
import { getTeamMembersQuery } from '../../api/query';
import { queryClient } from '../../api/client';
import { TabTitle } from '../Utils/TabTitle';
import DEMO from '../../store/constant';
import GrantPermissionModal from './GrantPermissionModal';
import type { UserPermissions } from './GrantPermissionModal';
import GrantManagerModal from './GrantManagerModal';
import { appConfig } from '../../config';
import { useAuth } from '../../components/AuthProvider';
import Loading from '../../components/Loading/Loading';
import { stringAvatar } from '../../utils/contants';

interface TeamMember {
    _id: { toString(): string };
    firstname?: string;
    lastname?: string;
    email?: string;
    pictureUrl?: string;
    permissions?: UserPermissions[];
    role?: string;
}

const PermissionIcon = ({
    hasPermission
}: {
    hasPermission?: boolean | null;
}) => {
    if (hasPermission === null || hasPermission === undefined) {
        return (
            <Tooltip title="No permission data">
                <CancelIcon sx={{ color: 'grey.400', fontSize: 20 }} />
            </Tooltip>
        );
    }
    return hasPermission ? (
        <Tooltip title="Granted">
            <CheckCircleIcon sx={{ color: 'success.main', fontSize: 20 }} />
        </Tooltip>
    ) : (
        <Tooltip title="Denied">
            <CancelIcon sx={{ color: 'error.main', fontSize: 20 }} />
        </Tooltip>
    );
};

const PERMISSION_COLUMN_DEFINITIONS: Record<string, { labelLines: string[] }> =
    {
        canModifyProgramList: {
            labelLines: ['Program', 'List']
        },
        canModifyAllBaseDocuments: {
            labelLines: ['Base', 'Docs']
        },
        canAccessAllChat: {
            labelLines: ['All', 'Chat']
        },
        canAssignAgents: {
            labelLines: ['Assign', 'Agents']
        },
        canAssignEditors: {
            labelLines: ['Assign', 'Editors']
        },
        canModifyDocumentation: {
            labelLines: ['Modify', 'Docs']
        },
        canAccessStudentDatabase: {
            labelLines: ['Student', 'DB']
        },
        canAddUser: {
            labelLines: ['Add', 'User']
        },
        canUseTaiGerAI: {
            labelLines: ['TaiGer', 'AI']
        }
    };

const PERMISSION_COLUMNS = [
    'canModifyProgramList',
    'canModifyAllBaseDocuments',
    'canAccessAllChat',
    'canAssignAgents',
    'canAssignEditors',
    'canModifyDocumentation',
    'canAccessStudentDatabase',
    'canAddUser',
    'canUseTaiGerAI'
];

interface TeamConfig {
    icon: React.ComponentType<{ sx?: object }>;
    paletteColor: 'primary' | 'secondary';
    chipColor: 'primary' | 'secondary';
    actionButtonColor: 'primary' | 'secondary';
    quotaChipColor: 'primary' | 'secondary';
    permissionColumns: string[];
    getMemberLink: (member: TeamMember) => string;
}

const createTeamConfig = ({
    icon,
    paletteColor,
    getMemberLink,
    permissionColumns = PERMISSION_COLUMNS
}: {
    icon: React.ComponentType<{ sx?: object }>;
    paletteColor: 'primary' | 'secondary';
    getMemberLink: (member: TeamMember) => string;
    permissionColumns?: string[];
}): TeamConfig => ({
    icon,
    paletteColor,
    chipColor: paletteColor,
    actionButtonColor: paletteColor,
    quotaChipColor: paletteColor,
    permissionColumns,
    getMemberLink
});

const TEAM_CONFIG: Partial<Record<Role, TeamConfig>> = {
    [Role.Agent]: createTeamConfig({
        icon: SupervisorAccountIcon,
        paletteColor: 'secondary',
        getMemberLink: (member) => DEMO.TEAM_AGENT_LINK(member._id.toString())
    }),
    [Role.Editor]: createTeamConfig({
        icon: PersonIcon,
        paletteColor: 'primary',
        getMemberLink: (member) => DEMO.TEAM_EDITOR_LINK(member._id.toString())
    })
};

const TEAM_SECTIONS: { role: Role; titleKey: string }[] = [
    {
        role: Role.Agent,
        titleKey: 'Agent'
    },
    {
        role: Role.Editor,
        titleKey: 'Editor'
    }
];

const renderColumnLabel = (columnKey: string) => {
    const column = PERMISSION_COLUMN_DEFINITIONS[columnKey];

    if (!column) {
        return columnKey;
    }

    return column.labelLines.map((line, index) => (
        <React.Fragment key={`${columnKey}-${line}`}>
            {line}
            {index !== column.labelLines.length - 1 && <br />}
        </React.Fragment>
    ));
};

interface TeamMemberRowProps {
    member: TeamMember;
    config: TeamConfig;
    setModalShow: (
        firstname: string,
        lastname: string,
        user_id: string,
        permissions: UserPermissions[] | undefined
    ) => void;
    user: ReturnType<typeof useAuth>['user'];
}

const TeamMemberRow = ({
    member,
    config,
    setModalShow,
    user
}: TeamMemberRowProps) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const permissions = member.permissions?.[0] ?? {};
    const firstName = member.firstname ?? '';
    const lastName = member.lastname ?? '';
    const fullName = `${firstName} ${lastName}`.trim();
    const initials =
        `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase();
    const avatarColors =
        firstName && lastName ? stringAvatar(`${firstName} ${lastName}`) : {};

    return (
        <TableRow
            sx={{
                '&:hover': {
                    backgroundColor: (theme) =>
                        alpha(theme.palette[config.paletteColor].main, 0.05)
                }
            }}
        >
            <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar
                        alt={fullName}
                        src={member.pictureUrl}
                        sx={{
                            width: 32,
                            height: 32,
                            fontSize: 14,
                            ...(avatarColors?.sx ?? {})
                        }}
                    >
                        {avatarColors?.children ?? initials}
                    </Avatar>
                    <Link
                        component={LinkDom}
                        sx={{
                            textDecoration: 'none',
                            fontWeight: 500,
                            '&:hover': { textDecoration: 'underline' }
                        }}
                        to={config.getMemberLink(member)}
                    >
                        {firstName} {lastName}
                    </Link>
                </Box>
            </TableCell>
            {config.permissionColumns.map((columnKey) => (
                <TableCell align="center" key={columnKey}>
                    <PermissionIcon
                        hasPermission={
                            permissions[columnKey as keyof UserPermissions] as
                                | boolean
                                | undefined
                        }
                    />
                </TableCell>
            ))}
            <TableCell align="center">
                <Chip
                    color={config.quotaChipColor}
                    label={permissions?.taigerAiQuota || 0}
                    size="small"
                    variant="outlined"
                />
            </TableCell>
            <TableCell align="center">
                <Tooltip title={i18next.t('Edit', { ns: 'common' })}>
                    <IconButton
                        aria-controls={open ? `basic-menu` : undefined}
                        aria-expanded={open ? 'true' : undefined}
                        aria-haspopup="true"
                        color={config.actionButtonColor}
                        id="basic-button"
                        onClick={handleClick}
                        size="small"
                    >
                        <EditIcon />
                    </IconButton>
                </Tooltip>
                <Menu
                    MenuListProps={{
                        'aria-labelledby': 'basic-button'
                    }}
                    anchorEl={anchorEl}
                    disabled={!user || !is_TaiGer_Admin(user)}
                    id="basic-menu"
                    onClose={handleClose}
                    open={open}
                >
                    <MenuItem
                        onClick={() =>
                            setModalShow(
                                member.firstname ?? '',
                                member.lastname ?? '',
                                member._id.toString(),
                                member.permissions
                            )
                        }
                    >
                        <EditIcon sx={{ mr: 1, fontSize: 20 }} />
                        Permission
                    </MenuItem>
                </Menu>
            </TableCell>
        </TableRow>
    );
};

interface TeamSectionProps {
    config: TeamConfig;
    members: TeamMember[];
    setModalShow: (
        firstname: string,
        lastname: string,
        user_id: string,
        permissions: UserPermissions[] | undefined
    ) => void;
    user: ReturnType<typeof useAuth>['user'];
    title: string;
    memberCount: number;
}

const TeamSection = ({
    config,
    members,
    setModalShow,
    user,
    title,
    memberCount
}: TeamSectionProps) => {
    const IconComponent = config.icon;

    return (
        <Paper
            elevation={3}
            sx={{
                mb: 3,
                borderRadius: 2,
                overflow: 'hidden'
            }}
        >
            <Box
                sx={{
                    p: 2,
                    background: (theme) =>
                        `linear-gradient(135deg, ${alpha(theme.palette[config.paletteColor].main, 0.1)} 0%, ${alpha(theme.palette[config.paletteColor].main, 0.05)} 100%)`,
                    borderBottom: (theme) =>
                        `2px solid ${theme.palette[config.paletteColor].main}`
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconComponent
                        sx={{
                            mr: 1,
                            color: `${config.paletteColor}.main`,
                            fontSize: 28
                        }}
                    />
                    <Typography
                        sx={{
                            fontWeight: 600,
                            color: `${config.paletteColor}.main`
                        }}
                        variant="h5"
                    >
                        {title}
                    </Typography>
                    <Chip
                        color={config.chipColor}
                        label={memberCount}
                        size="small"
                        sx={{ ml: 1 }}
                    />
                </Box>
            </Box>
            <TableContainer>
                <Table size="small">
                    <TableHead>
                        <TableRow
                            sx={{
                                backgroundColor: (theme) =>
                                    alpha(
                                        theme.palette[config.paletteColor].main,
                                        0.08
                                    )
                            }}
                        >
                            <TableCell sx={{ fontWeight: 600 }}>
                                {i18next.t('Name', { ns: 'common' })}
                            </TableCell>
                            {config.permissionColumns.map((columnKey) => (
                                <TableCell
                                    align="center"
                                    key={`header-${columnKey}`}
                                    sx={{ fontWeight: 600 }}
                                >
                                    {renderColumnLabel(columnKey)}
                                </TableCell>
                            ))}
                            <TableCell align="center" sx={{ fontWeight: 600 }}>
                                AI
                                <br /> Quota
                            </TableCell>
                            <TableCell align="center" sx={{ fontWeight: 600 }}>
                                Actions
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {members.map((member) => (
                            <TeamMemberRow
                                config={config}
                                key={member._id.toString()}
                                member={member}
                                setModalShow={setModalShow}
                                user={user}
                            />
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );
};

interface ModalState {
    modalShow: boolean;
    managerModalShow: boolean;
    firstname: string;
    lastname: string;
    selected_user_id: string;
    user_permissions: UserPermissions[];
}

const TaiGerOrg = () => {
    const { user } = useAuth();

    const [modalState, setModalState] = useState<ModalState>({
        modalShow: false,
        managerModalShow: false,
        firstname: '',
        lastname: '',
        selected_user_id: '',
        user_permissions: []
    });

    const {
        data: response,
        isLoading,
        isError,
        error
    } = useQuery(getTeamMembersQuery());

    const { mutate: updatePermissionsMutation } = useMutation({
        mutationFn: ({
            userId,
            permissions
        }: {
            userId: string;
            permissions: UserPermissions;
        }) => updateUserPermission(userId, permissions),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['team-members']
            });
            setModalState({
                modalShow: false,
                managerModalShow: false,
                firstname: '',
                lastname: '',
                selected_user_id: '',
                user_permissions: []
            });
        },
        onError: (err) => {
            console.error('Failed to update permissions:', err);
        }
    });

    const setModalShow = (
        user_firstname: string,
        user_lastname: string,
        user_id: string,
        permissions: UserPermissions[] | undefined
    ) => {
        setModalState({
            modalShow: true,
            managerModalShow: false,
            firstname: user_firstname,
            lastname: user_lastname,
            selected_user_id: user_id,
            user_permissions: permissions ?? []
        });
    };

    const setModalHide = () => {
        setModalState((prev) => ({
            ...prev,
            modalShow: false
        }));
    };

    const setManagerModalHide = () => {
        setModalState((prev) => ({
            ...prev,
            managerModalShow: false
        }));
    };

    const onUpdatePermissions = (
        e: React.FormEvent,
        permissions: UserPermissions | Record<string, unknown>
    ) => {
        e.preventDefault();
        updatePermissionsMutation({
            userId: modalState.selected_user_id,
            permissions: permissions as UserPermissions
        });
    };

    if (!user || !is_TaiGer_role(user)) {
        return <Navigate to={`${DEMO.DASHBOARD_LINK}`} />;
    }

    TabTitle(`${appConfig.companyName} Team Permissions Management`);

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
    const membersByRole = teams.reduce<Record<string, TeamMember[]>>(
        (acc, member) => {
            const role = member.role ?? 'unknown';
            if (!acc[role]) {
                acc[role] = [];
            }
            acc[role].push(member);
            return acc;
        },
        {}
    );

    return (
        <Box sx={{ p: 3 }}>
            <Breadcrumbs
                aria-label="breadcrumb"
                sx={{
                    mb: 3,
                    p: 2,
                    backgroundColor: 'background.paper',
                    borderRadius: 1,
                    boxShadow: 1
                }}
            >
                <Link
                    color="inherit"
                    component={LinkDom}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        '&:hover': { color: 'primary.main' }
                    }}
                    to={`${DEMO.DASHBOARD_LINK}`}
                    underline="hover"
                >
                    {appConfig.companyName}
                </Link>
                <Typography
                    color="text.primary"
                    sx={{ display: 'flex', alignItems: 'center' }}
                >
                    {i18next.t('tenant-team', {
                        ns: 'common',
                        tenant: appConfig.companyName
                    })}
                </Typography>
                <Typography
                    color="text.primary"
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        fontWeight: 600
                    }}
                >
                    <ShieldIcon sx={{ mr: 0.5, fontSize: 20 }} />
                    {i18next.t('Permissions Management', { ns: 'common' })}
                </Typography>
            </Breadcrumbs>

            {is_TaiGer_Admin(user) && admins.length > 0 && (
                <Card
                    sx={{
                        mb: 3,
                        boxShadow: 3,
                        borderRadius: 2,
                        overflow: 'hidden'
                    }}
                >
                    <CardContent>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                mb: 2
                            }}
                        >
                            <AdminPanelSettingsIcon
                                sx={{
                                    mr: 1,
                                    color: 'error.main',
                                    fontSize: 28
                                }}
                            />
                            <Typography
                                sx={{ fontWeight: 600, color: 'error.main' }}
                                variant="h5"
                            >
                                Administrators
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {admins.map((admin, i) => (
                                <Chip
                                    clickable
                                    color="error"
                                    component={LinkDom}
                                    icon={<AdminPanelSettingsIcon />}
                                    key={i}
                                    label={`${admin.firstname} ${admin.lastname}`}
                                    sx={{ fontWeight: 500 }}
                                    to={DEMO.TEAM_ADMIN_LINK(
                                        admin._id.toString()
                                    )}
                                    variant="outlined"
                                />
                            ))}
                        </Box>
                    </CardContent>
                </Card>
            )}

            {TEAM_SECTIONS.map(({ role, titleKey }) => {
                const config = TEAM_CONFIG[role];
                if (!config) {
                    return null;
                }
                const members = membersByRole[role] ?? [];

                return (
                    <TeamSection
                        config={config}
                        key={role}
                        memberCount={members.length}
                        members={members}
                        setModalShow={setModalShow}
                        title={`${i18next.t(titleKey, { ns: 'common' })}s`}
                        user={user}
                    />
                );
            })}

            {modalState.modalShow && (
                <GrantPermissionModal
                    firstname={modalState.firstname}
                    lastname={modalState.lastname}
                    modalShow={modalState.modalShow}
                    onUpdatePermissions={onUpdatePermissions}
                    setModalHide={setModalHide}
                    user_permissions={modalState.user_permissions}
                />
            )}
            {modalState.managerModalShow && (
                <GrantManagerModal
                    firstname={modalState.firstname}
                    lastname={modalState.lastname}
                    managerModalShow={modalState.managerModalShow}
                    onUpdatePermissions={onUpdatePermissions}
                    setManagerModalHide={setManagerModalHide}
                    user_permissions={modalState.user_permissions}
                />
            )}
        </Box>
    );
};

export default TaiGerOrg;
