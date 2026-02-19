import { useMemo, useState } from 'react';
import { Link as LinkDom } from 'react-router-dom';
import {
    Typography,
    Button,
    Card,
    Link,
    Box,
    Grid,
    useTheme,
    Avatar,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Stack,
    Divider,
    Chip,
    Tooltip
} from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import PersonIcon from '@mui/icons-material/Person';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LanguageIcon from '@mui/icons-material/Language';
import SchoolIcon from '@mui/icons-material/School';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import LaunchIcon from '@mui/icons-material/Launch';
import StarBorderRoundedIcon from '@mui/icons-material/StarBorderRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import {
    is_TaiGer_AdminAgent,
    is_TaiGer_Student,
    is_TaiGer_role
} from '@taiger-common/core';
import { useTranslation } from 'react-i18next';

import DEMO from '@store/constant';
import { stringAvatar } from '@utils/contants';
import {
    AGENT_SUPPORT_DOCUMENTS_A,
    FILE_TYPE_E
} from '../../../Utils/util_functions';
import { BASE_URL } from '@/api';
import { TopBar } from '@components/TopBar/TopBar';
import DescriptionBlock from './DescriptionBlock';
import RequirementsBlock from './RequirementsBlock';
import OriginAuthorStatementBar from './OriginAuthorStatementBar';

const InformationBlock = ({
    agents,
    deadline,
    editors,
    conflict_list,
    documentsthreadId,
    isFavorite,
    isGeneralRL,
    template_obj,
    startEditingEditor,
    handleFavoriteToggle,
    thread,
    user,
    children
}) => {
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === 'dark';
    const { t } = useTranslation();
    const [requirementsDialogOpen, setRequirementsDialogOpen] = useState(false);
    const [instructionsDialogOpen, setInstructionsDialogOpen] = useState(false);

    const getInitials = (firstname, lastname) => {
        return `${firstname?.charAt(0) || ''}${lastname?.charAt(0) || ''}`.toUpperCase();
    };

    const isDeadlineUrgent = () => {
        if (!deadline || deadline === 'No' || deadline === '-') return false;
        const deadlineDate = new Date(deadline);
        const today = new Date();
        const diffTime = deadlineDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 7 && diffDays >= 0;
    };

    const urgent = isDeadlineUrgent();

    const getGradientColors = useMemo(() => {
        const resolveColors = (colorType) => {
            if (isDarkMode) {
                switch (colorType) {
                    case 'urgent':
                        return {
                            start: theme.palette.error.dark,
                            end: theme.palette.error.main
                        };
                    case 'deadline':
                        return {
                            start: theme.palette.primary.dark,
                            end: theme.palette.primary.main
                        };
                    case 'team':
                        return {
                            start: theme.palette.primary.dark,
                            end: theme.palette.primary.main
                        };
                    case 'program':
                        return {
                            start: theme.palette.secondary.dark,
                            end: theme.palette.secondary.main
                        };
                    case 'profile':
                        return {
                            start: theme.palette.info.dark,
                            end: theme.palette.info.main
                        };
                    case 'conflict':
                        return {
                            start: theme.palette.warning.dark,
                            end: theme.palette.warning.main
                        };
                    case 'noConflict':
                        return {
                            start: theme.palette.success.dark,
                            end: theme.palette.success.main
                        };
                    default:
                        return {
                            start: theme.palette.primary.dark,
                            end: theme.palette.primary.main
                        };
                }
            }
            switch (colorType) {
                case 'urgent':
                    return {
                        start: theme.palette.error.dark,
                        end: theme.palette.error.main
                    };
                case 'deadline':
                    return {
                        start: theme.palette.primary.dark,
                        end: theme.palette.primary.main
                    };
                case 'team':
                    return {
                        start: theme.palette.primary.light,
                        end: theme.palette.primary.main
                    };
                case 'program':
                    return {
                        start: theme.palette.secondary.light,
                        end: theme.palette.secondary.main
                    };
                case 'profile':
                    return {
                        start: theme.palette.info.light,
                        end: theme.palette.info.main
                    };
                case 'conflict':
                    return {
                        start: theme.palette.warning.light,
                        end: theme.palette.warning.main
                    };
                case 'noConflict':
                    return {
                        start: theme.palette.success.light,
                        end: theme.palette.success.main
                    };
                default:
                    return {
                        start: theme.palette.primary.light,
                        end: theme.palette.primary.main
                    };
            }
        };
        return resolveColors;
    }, [isDarkMode, theme.palette]);

    const deadlineGradient = getGradientColors(urgent ? 'urgent' : 'deadline');
    const teamGradient = getGradientColors('team');
    const programGradient = getGradientColors('program');
    const profileGradient = getGradientColors('profile');
    const conflictGradient = getGradientColors(
        conflict_list.length > 0 ? 'conflict' : 'noConflict'
    );

    return (
        <Box>
            <Grid container spacing={2.5}>
                <Grid item lg={3} md={3} xs={12}>
                    <Box
                        sx={{
                            position: { md: 'sticky' },
                            top: { md: 8 },
                            maxHeight: { md: 'calc(100vh - 192px)' },
                            overflowY: { md: 'auto' },
                            '&::-webkit-scrollbar': {
                                width: '6px'
                            },
                            '&::-webkit-scrollbar-thumb': {
                                backgroundColor: theme.palette.divider,
                                borderRadius: '3px'
                            }
                        }}
                    >
                        <Stack spacing={1}>
                            {thread.isFinalVersion ? <TopBar /> : null}
                            <Card
                                elevation={urgent ? 4 : 2}
                                sx={{
                                    background: `linear-gradient(135deg, ${deadlineGradient.start} 0%, ${deadlineGradient.end} 100%)`,
                                    color: 'white',
                                    borderRadius: 2,
                                    boxShadow: urgent
                                        ? theme.shadows[4]
                                        : theme.shadows[1],
                                    border: urgent
                                        ? `2px solid ${theme.palette.error.light}`
                                        : `1px solid ${theme.palette.divider}`
                                }}
                            >
                                <Box sx={{ p: 1.5 }}>
                                    <Stack
                                        alignItems="center"
                                        direction="row"
                                        spacing={1}
                                        sx={{ mb: 1 }}
                                    >
                                        <EventIcon sx={{ fontSize: 24 }} />
                                        <Typography
                                            sx={{
                                                opacity: 0.85,
                                                fontSize: '0.65rem'
                                            }}
                                            variant="caption"
                                        >
                                            {urgent ? (
                                                <Stack
                                                    alignItems="center"
                                                    component="span"
                                                    direction="row"
                                                    spacing={0.3}
                                                >
                                                    <WarningAmberIcon
                                                        sx={{ fontSize: 12 }}
                                                    />
                                                    <span>URGENT</span>
                                                </Stack>
                                            ) : (
                                                t('Deadline', {
                                                    ns: 'common'
                                                })
                                            )}
                                        </Typography>
                                    </Stack>
                                    <Stack
                                        alignItems="center"
                                        direction="row"
                                        justifyContent="space-between"
                                    >
                                        <Box>
                                            <Typography
                                                fontWeight="700"
                                                variant="body1"
                                            >
                                                {deadline || 'Not Set'}
                                            </Typography>
                                        </Box>
                                        <Stack direction="row" spacing={0.5}>
                                            {is_TaiGer_AdminAgent(user) &&
                                                thread.program_id && (
                                                    <Tooltip title="Update Deadline">
                                                        <IconButton
                                                            component={LinkDom}
                                                            size="small"
                                                            sx={{
                                                                color: 'white',
                                                                p: 0.5
                                                            }}
                                                            target="_blank"
                                                            to={`${DEMO.SINGLE_PROGRAM_LINK(
                                                                thread.program_id._id.toString()
                                                            )}`}
                                                        >
                                                            <LaunchIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                            <Tooltip
                                                title={
                                                    isFavorite
                                                        ? 'Remove from favorites'
                                                        : 'Add to favorites'
                                                }
                                            >
                                                <IconButton
                                                    onClick={() =>
                                                        handleFavoriteToggle(
                                                            thread._id
                                                        )
                                                    }
                                                    size="small"
                                                    sx={{
                                                        color: 'white',
                                                        bgcolor:
                                                            'rgba(255,255,255,0.2)',
                                                        '&:hover': {
                                                            bgcolor:
                                                                'rgba(255,255,255,0.3)'
                                                        },
                                                        transition: 'all 0.2s'
                                                    }}
                                                >
                                                    {isFavorite ? (
                                                        <StarRoundedIcon fontSize="small" />
                                                    ) : (
                                                        <StarBorderRoundedIcon fontSize="small" />
                                                    )}
                                                </IconButton>
                                            </Tooltip>
                                        </Stack>
                                    </Stack>
                                </Box>
                            </Card>
                            {thread?.file_type === 'Essay' ? (
                                <OriginAuthorStatementBar
                                    theme={theme}
                                    thread={thread}
                                    user={user}
                                />
                            ) : null}
                            <Card
                                sx={{
                                    borderRadius: 2,
                                    boxShadow: theme.shadows[1],
                                    border: `2px solid ${theme.palette.warning.main}`,
                                    overflow: 'hidden'
                                }}
                            >
                                <Box
                                    sx={{
                                        p: 1.5
                                    }}
                                >
                                    <Stack
                                        alignItems="center"
                                        direction="row"
                                        justifyContent="space-between"
                                    >
                                        <Stack
                                            alignItems="center"
                                            direction="row"
                                            spacing={1}
                                        >
                                            <WarningAmberIcon
                                                sx={{ fontSize: 20 }}
                                            />
                                            <Typography
                                                fontWeight="700"
                                                variant="body1"
                                            >
                                                {t('Requirements', {
                                                    ns: 'translation'
                                                })}
                                            </Typography>
                                        </Stack>
                                        <Stack direction="row" spacing={0.5}>
                                            {is_TaiGer_AdminAgent(user) &&
                                                thread.program_id && (
                                                    <Tooltip title="Update Requirements">
                                                        <IconButton
                                                            component={LinkDom}
                                                            size="small"
                                                            sx={{
                                                                color: 'white',
                                                                p: 0.5,
                                                                '&:hover': {
                                                                    bgcolor:
                                                                        'rgba(255,255,255,0.1)'
                                                                }
                                                            }}
                                                            target="_blank"
                                                            to={`${DEMO.SINGLE_PROGRAM_LINK(
                                                                thread.program_id._id.toString()
                                                            )}`}
                                                        >
                                                            <EditIcon
                                                                sx={{
                                                                    fontSize: 16
                                                                }}
                                                            />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                            <Button
                                                onClick={() =>
                                                    setRequirementsDialogOpen(
                                                        true
                                                    )
                                                }
                                                size="small"
                                                sx={{
                                                    color: 'white',
                                                    fontSize: '0.7rem',
                                                    minWidth: 'auto',
                                                    px: 1.5,
                                                    py: 0.5,
                                                    borderColor:
                                                        'rgba(255,255,255,0.5)',
                                                    '&:hover': {
                                                        borderColor: 'white',
                                                        bgcolor:
                                                            'rgba(255,255,255,0.1)'
                                                    }
                                                }}
                                                variant="outlined"
                                            >
                                                Read More
                                            </Button>
                                        </Stack>
                                    </Stack>
                                </Box>
                                <Box
                                    sx={{
                                        p: 2,
                                        maxHeight: 200,
                                        overflowY: 'auto',
                                        '&::-webkit-scrollbar': {
                                            width: '6px'
                                        },
                                        '&::-webkit-scrollbar-thumb': {
                                            backgroundColor:
                                                theme.palette.divider,
                                            borderRadius: '3px'
                                        }
                                    }}
                                >
                                    <RequirementsBlock
                                        isGeneralRL={isGeneralRL}
                                        thread={thread}
                                    />
                                </Box>
                            </Card>

                            <Card
                                sx={{
                                    borderRadius: 2,
                                    boxShadow: theme.shadows[1],
                                    border: `1px solid ${theme.palette.divider}`,
                                    overflow: 'hidden'
                                }}
                            >
                                <Box
                                    sx={{
                                        p: 1.5,
                                        borderBottom: `1px solid ${theme.palette.divider}`
                                    }}
                                >
                                    <Stack
                                        alignItems="center"
                                        direction="row"
                                        justifyContent="space-between"
                                    >
                                        <Stack
                                            alignItems="center"
                                            direction="row"
                                            spacing={1}
                                        >
                                            <InfoOutlinedIcon
                                                color="primary"
                                                fontSize="small"
                                            />
                                            <Typography
                                                fontWeight="600"
                                                variant="body2"
                                            >
                                                {t('Instructions')}
                                            </Typography>
                                        </Stack>
                                        <Button
                                            onClick={() =>
                                                setInstructionsDialogOpen(true)
                                            }
                                            size="small"
                                            sx={{
                                                fontSize: '0.7rem',
                                                minWidth: 'auto',
                                                px: 1.5,
                                                py: 0.5
                                            }}
                                            variant="text"
                                        >
                                            Read More
                                        </Button>
                                    </Stack>
                                </Box>
                                <Box
                                    sx={{
                                        p: 2,
                                        maxHeight: 200,
                                        overflowY: 'auto',
                                        '&::-webkit-scrollbar': {
                                            width: '6px'
                                        },
                                        '&::-webkit-scrollbar-thumb': {
                                            backgroundColor:
                                                theme.palette.divider,
                                            borderRadius: '3px'
                                        }
                                    }}
                                >
                                    <DescriptionBlock
                                        documentsthreadId={documentsthreadId}
                                        template_obj={template_obj}
                                        thread={thread}
                                    />
                                </Box>
                            </Card>

                            <Card
                                sx={{
                                    borderRadius: 2,
                                    boxShadow: theme.shadows[1],
                                    border: `1px solid ${theme.palette.divider}`
                                }}
                            >
                                <Box
                                    sx={{
                                        background: `linear-gradient(135deg, ${teamGradient.start} 0%, ${teamGradient.end} 100%)`,
                                        color: 'white',
                                        p: 1.5
                                    }}
                                >
                                    <Stack
                                        alignItems="center"
                                        direction="row"
                                        spacing={0.75}
                                    >
                                        <PersonIcon fontSize="small" />
                                        <Typography
                                            fontWeight="600"
                                            variant="subtitle1"
                                        >
                                            Your Team
                                        </Typography>
                                    </Stack>
                                </Box>

                                <Box sx={{ p: 2 }}>
                                    <Box sx={{ mb: 2 }}>
                                        <Typography
                                            color="text.secondary"
                                            sx={{
                                                fontSize: '0.7rem',
                                                textTransform: 'uppercase',
                                                letterSpacing: 0.5,
                                                mb: 0.75
                                            }}
                                            variant="overline"
                                        >
                                            {t('Agent', {
                                                ns: 'common'
                                            })}
                                        </Typography>
                                        <Stack
                                            direction="row"
                                            flexWrap="wrap"
                                            gap={0.75}
                                        >
                                            {agents.length > 0 ? (
                                                agents.map((agent, i) => (
                                                    <Tooltip
                                                        key={i}
                                                        title={`${agent.firstname}`}
                                                    >
                                                        {is_TaiGer_role(
                                                            user
                                                        ) ? (
                                                            <Chip
                                                                avatar={
                                                                    <Avatar
                                                                        src={
                                                                            agent.pictureUrl
                                                                        }
                                                                        {...stringAvatar(
                                                                            `${agent.firstname} ${agent.lastname}`
                                                                        )}
                                                                        sx={{
                                                                            bgcolor:
                                                                                theme
                                                                                    .palette
                                                                                    .primary
                                                                                    .main,
                                                                            color: 'white',
                                                                            fontSize:
                                                                                '0.65rem',
                                                                            width: 24,
                                                                            height: 24
                                                                        }}
                                                                    >
                                                                        {getInitials(
                                                                            agent.firstname,
                                                                            agent.lastname
                                                                        )}
                                                                    </Avatar>
                                                                }
                                                                clickable
                                                                component={
                                                                    LinkDom
                                                                }
                                                                label={`${agent.firstname}`}
                                                                size="small"
                                                                sx={{
                                                                    fontWeight: 500,
                                                                    fontSize:
                                                                        '0.8rem',
                                                                    height: 28,
                                                                    '&:hover': {
                                                                        bgcolor:
                                                                            'primary.50'
                                                                    }
                                                                }}
                                                                target="_blank"
                                                                to={`${DEMO.TEAM_AGENT_LINK(agent._id.toString())}`}
                                                                variant="outlined"
                                                            />
                                                        ) : (
                                                            <Chip
                                                                avatar={
                                                                    <Avatar
                                                                        src={
                                                                            agent.pictureUrl
                                                                        }
                                                                        {...stringAvatar(
                                                                            `${agent.firstname} ${agent.lastname}`
                                                                        )}
                                                                        sx={{
                                                                            bgcolor:
                                                                                theme
                                                                                    .palette
                                                                                    .primary
                                                                                    .main,
                                                                            color: 'white',
                                                                            fontSize:
                                                                                '0.65rem',
                                                                            width: 24,
                                                                            height: 24
                                                                        }}
                                                                    >
                                                                        {getInitials(
                                                                            agent.firstname,
                                                                            agent.lastname
                                                                        )}
                                                                    </Avatar>
                                                                }
                                                                label={`${agent.firstname}`}
                                                                size="small"
                                                                sx={{
                                                                    fontWeight: 500,
                                                                    fontSize:
                                                                        '0.8rem',
                                                                    height: 28
                                                                }}
                                                                variant="outlined"
                                                            />
                                                        )}
                                                    </Tooltip>
                                                ))
                                            ) : (
                                                <Typography
                                                    color="text.secondary"
                                                    sx={{ fontSize: '0.85rem' }}
                                                    variant="body2"
                                                >
                                                    No agents assigned
                                                </Typography>
                                            )}
                                        </Stack>
                                    </Box>

                                    <Divider sx={{ my: 1.5 }} />

                                    <Box>
                                        <Typography
                                            color="text.secondary"
                                            sx={{
                                                fontSize: '0.7rem',
                                                textTransform: 'uppercase',
                                                letterSpacing: 0.5,
                                                mb: 0.75
                                            }}
                                            variant="overline"
                                        >
                                            {thread.file_type === 'Essay'
                                                ? t('Essay Writer', {
                                                      ns: 'common'
                                                  })
                                                : t('Editor', {
                                                      ns: 'common'
                                                  })}
                                        </Typography>
                                        {[
                                            ...AGENT_SUPPORT_DOCUMENTS_A,
                                            FILE_TYPE_E.essay_required
                                        ].includes(thread.file_type) ? (
                                            thread?.outsourced_user_id?.length >
                                            0 ? (
                                                <Stack
                                                    direction="row"
                                                    flexWrap="wrap"
                                                    gap={0.75}
                                                >
                                                    {thread?.outsourced_user_id?.map(
                                                        (outsourcer) => (
                                                            <Tooltip
                                                                key={
                                                                    outsourcer._id
                                                                }
                                                                title={`${outsourcer.firstname} ${outsourcer.lastname}`}
                                                            >
                                                                {is_TaiGer_role(
                                                                    user
                                                                ) ? (
                                                                    <Chip
                                                                        avatar={
                                                                            <Avatar
                                                                                src={
                                                                                    outsourcer.pictureUrl
                                                                                }
                                                                                {...stringAvatar(
                                                                                    `${outsourcer.firstname} ${outsourcer.lastname}`
                                                                                )}
                                                                                sx={{
                                                                                    bgcolor:
                                                                                        theme
                                                                                            .palette
                                                                                            .secondary
                                                                                            .main,
                                                                                    color: 'white',
                                                                                    fontSize:
                                                                                        '0.65rem',
                                                                                    width: 24,
                                                                                    height: 24
                                                                                }}
                                                                            >
                                                                                {getInitials(
                                                                                    outsourcer.firstname,
                                                                                    outsourcer.lastname
                                                                                )}
                                                                            </Avatar>
                                                                        }
                                                                        clickable
                                                                        component={
                                                                            LinkDom
                                                                        }
                                                                        label={`${outsourcer.firstname}`}
                                                                        size="small"
                                                                        sx={{
                                                                            fontWeight: 500,
                                                                            fontSize:
                                                                                '0.8rem',
                                                                            height: 28,
                                                                            '&:hover':
                                                                                {
                                                                                    bgcolor:
                                                                                        'secondary.50'
                                                                                }
                                                                        }}
                                                                        target="_blank"
                                                                        to={`${DEMO.TEAM_EDITOR_LINK(
                                                                            outsourcer._id.toString()
                                                                        )}`}
                                                                        variant="outlined"
                                                                    />
                                                                ) : (
                                                                    <Chip
                                                                        avatar={
                                                                            <Avatar
                                                                                src={
                                                                                    outsourcer.pictureUrl
                                                                                }
                                                                                {...stringAvatar(
                                                                                    `${outsourcer.firstname} ${outsourcer.lastname}`
                                                                                )}
                                                                                sx={{
                                                                                    bgcolor:
                                                                                        theme
                                                                                            .palette
                                                                                            .secondary
                                                                                            .main,
                                                                                    color: 'white',
                                                                                    fontSize:
                                                                                        '0.65rem',
                                                                                    width: 24,
                                                                                    height: 24
                                                                                }}
                                                                            >
                                                                                {getInitials(
                                                                                    outsourcer.firstname,
                                                                                    outsourcer.lastname
                                                                                )}
                                                                            </Avatar>
                                                                        }
                                                                        label={`${outsourcer.firstname}`}
                                                                        size="small"
                                                                        sx={{
                                                                            fontWeight: 500,
                                                                            fontSize:
                                                                                '0.8rem',
                                                                            height: 28
                                                                        }}
                                                                        variant="outlined"
                                                                    />
                                                                )}
                                                            </Tooltip>
                                                        )
                                                    )}
                                                </Stack>
                                            ) : (
                                                <Typography
                                                    color="text.secondary"
                                                    sx={{
                                                        fontStyle: 'italic',
                                                        py: 0.5,
                                                        fontSize: '0.85rem'
                                                    }}
                                                    variant="body2"
                                                >
                                                    {[
                                                        ...AGENT_SUPPORT_DOCUMENTS_A
                                                    ].includes(thread.file_type)
                                                        ? 'If needed, editor can be added'
                                                        : 'To Be Assigned'}
                                                </Typography>
                                            )
                                        ) : null}
                                        {![
                                            ...AGENT_SUPPORT_DOCUMENTS_A,
                                            FILE_TYPE_E.essay_required
                                        ].includes(thread.file_type) &&
                                        editors.length > 0 ? (
                                            <Stack
                                                direction="row"
                                                flexWrap="wrap"
                                                gap={0.75}
                                            >
                                                {editors.map((editor, i) => (
                                                    <Tooltip
                                                        key={i}
                                                        title={`${editor.firstname} ${editor.lastname}`}
                                                    >
                                                        {is_TaiGer_role(
                                                            user
                                                        ) ? (
                                                            <Chip
                                                                avatar={
                                                                    <Avatar
                                                                        src={
                                                                            editor.pictureUrl
                                                                        }
                                                                        {...stringAvatar(
                                                                            `${editor.firstname} ${editor.lastname}`
                                                                        )}
                                                                        sx={{
                                                                            bgcolor:
                                                                                theme
                                                                                    .palette
                                                                                    .secondary
                                                                                    .main,
                                                                            color: 'white',
                                                                            fontSize:
                                                                                '0.65rem',
                                                                            width: 24,
                                                                            height: 24
                                                                        }}
                                                                    >
                                                                        {getInitials(
                                                                            editor.firstname,
                                                                            editor.lastname
                                                                        )}
                                                                    </Avatar>
                                                                }
                                                                clickable
                                                                component={
                                                                    LinkDom
                                                                }
                                                                label={`${editor.firstname}`}
                                                                size="small"
                                                                sx={{
                                                                    fontWeight: 500,
                                                                    fontSize:
                                                                        '0.8rem',
                                                                    height: 28,
                                                                    '&:hover': {
                                                                        bgcolor:
                                                                            'secondary.50'
                                                                    }
                                                                }}
                                                                target="_blank"
                                                                to={`${DEMO.TEAM_EDITOR_LINK(editor._id.toString())}`}
                                                                variant="outlined"
                                                            />
                                                        ) : (
                                                            <Chip
                                                                avatar={
                                                                    <Avatar
                                                                        src={
                                                                            editor.pictureUrl
                                                                        }
                                                                        {...stringAvatar(
                                                                            `${editor.firstname} ${editor.lastname}`
                                                                        )}
                                                                        sx={{
                                                                            bgcolor:
                                                                                theme
                                                                                    .palette
                                                                                    .secondary
                                                                                    .main,
                                                                            color: 'white',
                                                                            fontSize:
                                                                                '0.65rem',
                                                                            width: 24,
                                                                            height: 24
                                                                        }}
                                                                    >
                                                                        {getInitials(
                                                                            editor.firstname,
                                                                            editor.lastname
                                                                        )}
                                                                    </Avatar>
                                                                }
                                                                label={`${editor.firstname}`}
                                                                size="small"
                                                                sx={{
                                                                    fontWeight: 500,
                                                                    fontSize:
                                                                        '0.8rem',
                                                                    height: 28
                                                                }}
                                                                variant="outlined"
                                                            />
                                                        )}
                                                    </Tooltip>
                                                ))}
                                            </Stack>
                                        ) : null}
                                        {is_TaiGer_role(user) &&
                                        [
                                            ...AGENT_SUPPORT_DOCUMENTS_A,
                                            FILE_TYPE_E.essay_required
                                        ].includes(thread.file_type) ? (
                                            <Chip
                                                color="secondary"
                                                icon={<AddIcon />}
                                                onClick={startEditingEditor}
                                                size="small"
                                                sx={{ mt: 1, pl: 1 }}
                                            />
                                        ) : null}
                                    </Box>
                                </Box>
                            </Card>

                            {thread.program_id && (
                                <Card
                                    sx={{
                                        borderRadius: 2,
                                        boxShadow: theme.shadows[1],
                                        border: `1px solid ${theme.palette.divider}`
                                    }}
                                >
                                    <Box
                                        sx={{
                                            background: `linear-gradient(135deg, ${programGradient.start} 0%, ${programGradient.end} 100%)`,
                                            color: 'white',
                                            p: 1.5
                                        }}
                                    >
                                        <Stack
                                            alignItems="center"
                                            direction="row"
                                            spacing={0.75}
                                        >
                                            <SchoolIcon fontSize="small" />
                                            <Typography
                                                fontWeight="600"
                                                variant="subtitle1"
                                            >
                                                {t('Program Details')}
                                            </Typography>
                                        </Stack>
                                    </Box>
                                    <Box sx={{ p: 2 }}>
                                        <Stack spacing={2}>
                                            <Stack
                                                alignItems="center"
                                                direction="row"
                                                justifyContent="space-between"
                                            >
                                                <Stack
                                                    alignItems="center"
                                                    direction="row"
                                                    spacing={0.75}
                                                >
                                                    <AccessTimeIcon
                                                        color="action"
                                                        sx={{ fontSize: 18 }}
                                                    />
                                                    <Typography
                                                        color="text.secondary"
                                                        variant="body2"
                                                    >
                                                        {t('Semester', {
                                                            ns: 'common'
                                                        })}
                                                    </Typography>
                                                </Stack>
                                                <Typography
                                                    fontWeight="600"
                                                    variant="body2"
                                                >
                                                    {thread.program_id.semester}
                                                </Typography>
                                            </Stack>
                                            <Divider />
                                            <Stack
                                                alignItems="center"
                                                direction="row"
                                                justifyContent="space-between"
                                            >
                                                <Stack
                                                    alignItems="center"
                                                    direction="row"
                                                    spacing={0.75}
                                                >
                                                    <LanguageIcon
                                                        color="action"
                                                        sx={{ fontSize: 18 }}
                                                    />
                                                    <Typography
                                                        color="text.secondary"
                                                        variant="body2"
                                                    >
                                                        {t('Program Language', {
                                                            ns: 'common'
                                                        })}
                                                    </Typography>
                                                </Stack>
                                                <Typography
                                                    fontWeight="600"
                                                    variant="body2"
                                                >
                                                    {thread.program_id.lang}
                                                </Typography>
                                            </Stack>
                                        </Stack>
                                    </Box>
                                </Card>
                            )}

                            <Dialog
                                maxWidth="md"
                                onClose={() => setRequirementsDialogOpen(false)}
                                open={requirementsDialogOpen}
                                scroll="paper"
                            >
                                <DialogTitle>
                                    <Stack
                                        alignItems="center"
                                        direction="row"
                                        spacing={1.5}
                                    >
                                        <WarningAmberIcon
                                            color="warning"
                                            sx={{ fontSize: 28 }}
                                        />
                                        <Typography
                                            fontWeight="700"
                                            variant="h5"
                                        >
                                            {t('Requirements', {
                                                ns: 'translation'
                                            })}
                                        </Typography>
                                    </Stack>
                                </DialogTitle>
                                <DialogContent dividers>
                                    <RequirementsBlock
                                        template_obj={template_obj}
                                        thread={thread}
                                    />
                                </DialogContent>
                                <DialogActions>
                                    <Button
                                        onClick={() =>
                                            setRequirementsDialogOpen(false)
                                        }
                                        variant="contained"
                                    >
                                        Close
                                    </Button>
                                </DialogActions>
                            </Dialog>

                            <Dialog
                                maxWidth="md"
                                onClose={() => setInstructionsDialogOpen(false)}
                                open={instructionsDialogOpen}
                                scroll="paper"
                            >
                                <DialogTitle>
                                    <Stack
                                        alignItems="center"
                                        direction="row"
                                        spacing={1.5}
                                    >
                                        <InfoOutlinedIcon
                                            color="primary"
                                            sx={{ fontSize: 28 }}
                                        />
                                        <Typography
                                            fontWeight="700"
                                            variant="h5"
                                        >
                                            {t('Instructions')}
                                        </Typography>
                                    </Stack>
                                </DialogTitle>
                                <DialogContent dividers>
                                    <DescriptionBlock
                                        documentsthreadId={documentsthreadId}
                                        template_obj={template_obj}
                                        thread={thread}
                                    />
                                </DialogContent>
                                <DialogActions>
                                    <Button
                                        onClick={() =>
                                            setInstructionsDialogOpen(false)
                                        }
                                        variant="contained"
                                    >
                                        Close
                                    </Button>
                                </DialogActions>
                            </Dialog>

                            {thread.file_type === 'CV' && (
                                <Card
                                    sx={{
                                        borderRadius: 2,
                                        boxShadow: theme.shadows[1],
                                        border: `1px solid ${theme.palette.divider}`,
                                        overflow: 'hidden'
                                    }}
                                >
                                    <Box
                                        sx={{
                                            background: `linear-gradient(135deg, ${profileGradient.start} 0%, ${profileGradient.end} 100%)`,
                                            color: 'white',
                                            p: 1.5,
                                            textAlign: 'center'
                                        }}
                                    >
                                        <Typography
                                            fontWeight="600"
                                            variant="body2"
                                        >
                                            Profile Photo
                                        </Typography>
                                    </Box>
                                    <Box sx={{ p: 1.5 }}>
                                        <Box
                                            sx={{
                                                position: 'relative',
                                                width: '100%',
                                                paddingTop: '75%',
                                                bgcolor: 'grey.100',
                                                borderRadius: 1.5,
                                                overflow: 'hidden',
                                                border: `1px solid ${theme.palette.divider}`,
                                                boxShadow: theme.shadows[1]
                                            }}
                                        >
                                            <img
                                                alt="Profile"
                                                src={`${BASE_URL}/api/students/${thread.student_id._id}/files/Passport_Photo`}
                                                style={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover'
                                                }}
                                            />
                                        </Box>
                                        <Typography
                                            color="text.secondary"
                                            sx={{
                                                mt: 0.75,
                                                textAlign: 'center',
                                                fontSize: '0.65rem'
                                            }}
                                            variant="caption"
                                        >
                                            <Link
                                                component={LinkDom}
                                                sx={{ fontWeight: 600 }}
                                                to="/base-documents"
                                                underline="hover"
                                            >
                                                Upload
                                                <LaunchIcon
                                                    fontSize="inherit"
                                                    sx={{
                                                        ml: 0.2,
                                                        verticalAlign: 'middle'
                                                    }}
                                                />
                                            </Link>
                                        </Typography>
                                    </Box>
                                </Card>
                            )}

                            {!is_TaiGer_Student(user) && (
                                <Card
                                    sx={{
                                        borderRadius: 2,
                                        boxShadow: theme.shadows[1],
                                        border: `1px solid ${theme.palette.divider}`,
                                        overflow: 'hidden'
                                    }}
                                >
                                    <Box
                                        sx={{
                                            background: `linear-gradient(135deg, ${conflictGradient.start} 0%, ${conflictGradient.end} 100%)`,
                                            color: 'white',
                                            p: 1.5
                                        }}
                                    >
                                        <Stack
                                            alignItems="center"
                                            direction="row"
                                            justifyContent="center"
                                            spacing={0.5}
                                        >
                                            {conflict_list.length > 0 && (
                                                <WarningAmberIcon fontSize="small" />
                                            )}
                                            <Typography
                                                fontWeight="600"
                                                variant="body2"
                                            >
                                                {t('Conflict')}
                                            </Typography>
                                        </Stack>
                                    </Box>
                                    <Box sx={{ p: 2 }}>
                                        {conflict_list.length === 0 ? (
                                            <Box
                                                sx={{
                                                    textAlign: 'center',
                                                    py: 1.5
                                                }}
                                            >
                                                <CheckCircleIcon
                                                    color="success"
                                                    sx={{
                                                        fontSize: 32,
                                                        mb: 0.5
                                                    }}
                                                />
                                                <Typography
                                                    color="success.main"
                                                    fontWeight="600"
                                                    variant="caption"
                                                >
                                                    No Conflicts
                                                </Typography>
                                            </Box>
                                        ) : (
                                            <Stack spacing={0.75}>
                                                {conflict_list.map(
                                                    (conflict_student, j) => (
                                                        <Chip
                                                            clickable
                                                            color="warning"
                                                            component={LinkDom}
                                                            icon={
                                                                <WarningAmberIcon
                                                                    sx={{
                                                                        fontSize: 16
                                                                    }}
                                                                />
                                                            }
                                                            key={j}
                                                            label={`${conflict_student.firstname} ${conflict_student.lastname}`}
                                                            size="small"
                                                            sx={{
                                                                fontSize:
                                                                    '0.75rem',
                                                                height: 26
                                                            }}
                                                            to={`${DEMO.STUDENT_DATABASE_STUDENTID_LINK(
                                                                conflict_student._id.toString(),
                                                                DEMO.CVMLRL_HASH
                                                            )}`}
                                                            variant="outlined"
                                                        />
                                                    )
                                                )}
                                            </Stack>
                                        )}
                                    </Box>
                                </Card>
                            )}
                        </Stack>
                    </Box>
                </Grid>

                <Grid item lg={9} md={9} xs={12}>
                    <Box
                        sx={{
                            position: { md: 'sticky' },
                            top: { md: 8 },
                            maxHeight: { md: 'calc(100vh - 192px)' },
                            overflowY: { md: 'auto' },
                            '&::-webkit-scrollbar': {
                                width: '6px'
                            },
                            '&::-webkit-scrollbar-thumb': {
                                backgroundColor: theme.palette.divider,
                                borderRadius: '3px'
                            }
                        }}
                    >
                        {children}
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
};

export default InformationBlock;
