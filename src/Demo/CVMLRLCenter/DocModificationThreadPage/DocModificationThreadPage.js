import React, { useEffect, useState } from 'react';
import { Link as LinkDom, useLocation, useParams } from 'react-router-dom';
import ArticleIcon from '@mui/icons-material/Article'; // Using Article icon for thread links

// import jsPDF from 'jspdf';
import DownloadIcon from '@mui/icons-material/Download';
import LaunchIcon from '@mui/icons-material/Launch';
import { green, grey } from '@mui/material/colors';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import HelpIcon from '@mui/icons-material/Help';
import StarBorderRoundedIcon from '@mui/icons-material/StarBorderRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import ChatIcon from '@mui/icons-material/Chat';
import FolderIcon from '@mui/icons-material/Folder';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import HistoryIcon from '@mui/icons-material/History';
import EventIcon from '@mui/icons-material/Event';
import PersonIcon from '@mui/icons-material/Person';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LanguageIcon from '@mui/icons-material/Language';
import SchoolIcon from '@mui/icons-material/School';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import {
    Typography,
    Button,
    FormControlLabel,
    Checkbox,
    Card,
    Link,
    Box,
    CircularProgress,
    Grid,
    useTheme,
    Avatar,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Stack,
    Tabs,
    Tab,
    Chip,
    Divider,
    Tooltip
} from '@mui/material';
import { pdfjs } from 'react-pdf'; // Library for rendering PDFs
import {
    is_TaiGer_AdminAgent,
    is_TaiGer_Student,
    is_TaiGer_role
} from '@taiger-common/core';
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

import DocThreadEditor from '../../../components/Message/DocThreadEditor';
import ErrorPage from '../../Utils/ErrorPage';
import ModalMain from '../../Utils/ModalHandler/ModalMain';
import {
    stringAvatar,
    templatelist,
    THREAD_REVERSED_TABS,
    THREAD_TABS
} from '../../../utils/contants';
import {
    AGENT_SUPPORT_DOCUMENTS_A,
    FILE_TYPE_E,
    LinkableNewlineText,
    getRequirement,
    readDOCX,
    readPDF,
    readXLSX,
    toogleItemInArray
} from '../../Utils/checking-functions';
import { BASE_URL } from '../../../api/request';
import {
    SubmitMessageWithAttachment,
    deleteAMessageInThread,
    SetFileAsFinal,
    updateEssayWriter,
    putOriginAuthorConfirmedByStudent,
    putThreadFavorite
} from '../../../api';
import { TabTitle } from '../../Utils/TabTitle';
import DEMO from '../../../store/constant';
import FilesList from './FilesList';
import { appConfig } from '../../../config';
import { useAuth } from '../../../components/AuthProvider';
import EditEssayWritersSubpage from '../../Dashboard/MainViewTab/StudDocsOverview/EditEssayWritersSubpage';
import { TopBar } from '../../../components/TopBar/TopBar';
import MessageList from '../../../components/Message/MessageList';
import DocumentCheckingResultModal from './DocumentCheckingResultModal';
import { a11yProps, CustomTabPanel } from '../../../components/Tabs';
import Audit from '../../Audit';
import i18next from 'i18next';
import { useSnackBar } from '../../../contexts/use-snack-bar';

const DescriptionBlock = ({ thread, template_obj, documentsthreadId }) => {
    const { user } = useAuth();
    const theme = useTheme();

    return (
        <Stack spacing={2}>
            {template_obj ? (
                <>
                    {/* Main Instruction */}
                    <Box
                        sx={{
                            p: 1.5,
                            bgcolor: theme.palette.info.lighter || 'info.50',
                            borderLeft: `3px solid ${theme.palette.info.main}`
                        }}
                    >
                        <Typography variant="body2">
                            {thread.file_type === 'CV'
                                ? i18next.t('cv-instructions', { ns: 'cvmlrl' })
                                : i18next.t('please-fill-template', {
                                      tenant: appConfig.companyName
                                  })}
                        </Typography>
                    </Box>

                    {/* Documentation Link */}
                    <Button
                        color="info"
                        component={LinkDom}
                        fullWidth
                        size="small"
                        startIcon={<ArticleIcon />}
                        to={`${DEMO.CV_ML_RL_DOCS_LINK}`}
                        variant="outlined"
                    >
                        View Documentation
                    </Button>

                    {/* Template Downloads */}
                    <Box>
                        <Typography
                            color="text.secondary"
                            gutterBottom
                            sx={{
                                fontSize: '0.75rem',
                                textTransform: 'uppercase',
                                letterSpacing: 0.5
                            }}
                            variant="overline"
                        >
                            {i18next.t('Download template')}
                        </Typography>
                        <Stack spacing={1}>
                            {template_obj.prop.includes('RL') ||
                            template_obj.alias.includes('Recommendation') ? (
                                <>
                                    {/* Professor Template */}
                                    <Button
                                        color="secondary"
                                        component="a"
                                        fullWidth
                                        href={`${BASE_URL}/api/account/files/template/${'RL_academic_survey_lock'}`}
                                        rel="noopener noreferrer"
                                        size="small"
                                        startIcon={<DownloadIcon />}
                                        target="_blank"
                                        variant="contained"
                                    >
                                        {i18next.t('Professor')} Template
                                    </Button>
                                    {/* Supervisor Template */}
                                    <Button
                                        color="secondary"
                                        component="a"
                                        fullWidth
                                        href={`${BASE_URL}/api/account/files/template/${`RL_employer_survey_lock`}`}
                                        rel="noopener noreferrer"
                                        size="small"
                                        startIcon={<DownloadIcon />}
                                        target="_blank"
                                        variant="contained"
                                    >
                                        {i18next.t('Supervisor')} Template
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button
                                        color="secondary"
                                        component="a"
                                        fullWidth
                                        href={`${BASE_URL}/api/account/files/template/${template_obj.prop}`}
                                        rel="noopener noreferrer"
                                        size="small"
                                        startIcon={<DownloadIcon />}
                                        target="_blank"
                                        variant="contained"
                                    >
                                        Download Template
                                    </Button>
                                    {/* Editor Helper (TaiGer roles only) */}
                                    {is_TaiGer_role(user) && (
                                        <Button
                                            color="info"
                                            component={LinkDom}
                                            fullWidth
                                            size="small"
                                            to={`${DEMO.DOCUMENT_MODIFICATION_INPUT_LINK(
                                                documentsthreadId
                                            )}`}
                                            variant="outlined"
                                        >
                                            Editor Helper
                                        </Button>
                                    )}
                                </>
                            )}
                        </Stack>
                    </Box>
                </>
            ) : (
                <Box
                    sx={{
                        p: 1.5,
                        borderLeft: `3px solid ${theme.palette.grey[400]}`
                    }}
                >
                    <Typography variant="body2">
                        {thread.file_type === 'Portfolio'
                            ? 'Please upload the portfolio in Microsoft Word form here so that your Editor can help you for the text modification'
                            : thread.file_type === 'Supplementary_Form'
                              ? '請填好這個 program 的 Supplementory Form，並在這討論串夾帶該檔案 (通常為 .xls, xlsm, .pdf 檔) 上傳。'
                              : thread.file_type === 'Curriculum_Analysis'
                                ? '請填好這個 program 的 Curriculum Analysis，並在這討論串夾帶該檔案 (通常為 .xls, xlsm, .pdf 檔) 上傳。'
                                : '-'}
                    </Typography>
                </Box>
            )}
        </Stack>
    );
};

const RequirementsBlock = ({ thread, template_obj }) => {
    const theme = useTheme();

    if (thread.program_id) {
        return (
            <Box
                sx={{
                    '& a': {
                        color: theme.palette.primary.main,
                        fontWeight: 500
                    }
                }}
            >
                <LinkableNewlineText text={getRequirement(thread)} />
            </Box>
        );
    }

    if (thread.file_type === 'CV') {
        return (
            <Stack spacing={1.5}>
                <Box
                    sx={{
                        p: 1.5,
                        bgcolor: theme.palette.warning.lighter || 'warning.50',
                        borderLeft: `3px solid ${theme.palette.warning.main}`
                    }}
                >
                    <Typography variant="body2">
                        {i18next.t('cv-requirements-1', { ns: 'cvmlrl' })}
                        {` `}
                        <b>
                            {i18next.t('cv-requirements-1.1', { ns: 'cvmlrl' })}
                        </b>
                    </Typography>
                </Box>

                <Box
                    sx={{
                        p: 1.5,
                        bgcolor: theme.palette.info.lighter || 'info.50',
                        borderLeft: `3px solid ${theme.palette.warning.main}`
                    }}
                >
                    <Typography variant="body2">
                        {i18next.t('cv-requirements-2', { ns: 'cvmlrl' })}
                    </Typography>
                    <Typography variant="body2">
                        {i18next.t('cv-reminder-1', { ns: 'cvmlrl' })}
                    </Typography>
                </Box>
                <Box
                    sx={{
                        p: 1.5,
                        bgcolor: theme.palette.info.lighter || 'info.50',
                        borderRadius: 1
                    }}
                >
                    <Typography variant="body2">
                        {i18next.t('cv-reminder-2', { ns: 'cvmlrl' })}
                    </Typography>
                </Box>
            </Stack>
        );
    }

    if (
        template_obj?.prop.includes('RL') ||
        template_obj?.alias.includes('Recommendation')
    ) {
        return (
            <Box
                sx={{
                    p: 1.5,
                    bgcolor: theme.palette.warning.lighter || 'warning.50',
                    borderRadius: 1,
                    borderLeft: `3px solid ${theme.palette.warning.main}`
                }}
            >
                <Typography variant="body2">
                    {i18next.t('rl-requirements-1', { ns: 'cvmlrl' })}
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ textAlign: 'center', py: 2 }}>
            <Typography color="text.secondary" variant="body2">
                {i18next.t('No', { ns: 'common' })}
            </Typography>
        </Box>
    );
};

const InformationBlock = ({
    agents,
    deadline,
    editors,
    conflict_list,
    documentsthreadId,
    isFavorite,
    template_obj,
    startEditingEditor,
    handleFavoriteToggle,
    thread,
    user,
    children
}) => {
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === 'dark';
    const [requirementsDialogOpen, setRequirementsDialogOpen] = useState(false);
    const [instructionsDialogOpen, setInstructionsDialogOpen] = useState(false);

    // Helper function to get initials for avatar
    const getInitials = (firstname, lastname) => {
        return `${firstname?.charAt(0) || ''}${lastname?.charAt(0) || ''}`.toUpperCase();
    };

    // Calculate if deadline is approaching (within 7 days)
    const isDeadlineUrgent = () => {
        if (!deadline || deadline === 'No' || deadline === '-') return false;
        const deadlineDate = new Date(deadline);
        const today = new Date();
        const diffTime = deadlineDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 7 && diffDays >= 0;
    };

    const urgent = isDeadlineUrgent();

    // Theme-aware gradient colors
    const getGradientColors = (colorType) => {
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
        } else {
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
        }
    };

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
                {/* Left Sidebar: All Metadata - Sticky */}
                <Grid item lg={3} md={3} xs={12}>
                    <Box
                        sx={{
                            position: { md: 'sticky' },
                            top: { md: 16 },
                            maxHeight: { md: 'calc(100vh - 32px)' },
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
                        <Stack spacing={2}>
                            {/* Deadline & Favorite Card */}
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
                                                i18next.t('Deadline', {
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

                            {/* Team Card */}
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
                                    {/* Agents */}
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
                                            {i18next.t('Agent', {
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
                                                        title={`${agent.firstname} ${agent.lastname}`}
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
                                                                label={`${agent.firstname} ${agent.lastname}`}
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
                                                                label={`${agent.firstname} ${agent.lastname}`}
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

                                    {/* Editors */}
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
                                                ? i18next.t('Essay Writer', {
                                                      ns: 'common'
                                                  })
                                                : i18next.t('Editor', {
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
                                                                        label={`${outsourcer.firstname} ${outsourcer.lastname}`}
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
                                                                        label={`${outsourcer.firstname} ${outsourcer.lastname}`}
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
                                                                label={`${editor.firstname} ${editor.lastname}`}
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
                                                                label={`${editor.firstname} ${editor.lastname}`}
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
                                            <Button
                                                color="secondary"
                                                onClick={startEditingEditor}
                                                size="small"
                                                startIcon={
                                                    <AddIcon
                                                        sx={{ fontSize: 16 }}
                                                    />
                                                }
                                                sx={{
                                                    mt: 1,
                                                    fontSize: '0.8rem',
                                                    py: 0.5
                                                }}
                                                variant="contained"
                                            >
                                                {thread.file_type === 'Essay'
                                                    ? i18next.t(
                                                          'Add Essay Writer'
                                                      )
                                                    : i18next.t('Add Editor')}
                                            </Button>
                                        ) : null}
                                    </Box>
                                </Box>
                            </Card>

                            {/* Program Details Card */}
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
                                                Program Details
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
                                                        {i18next.t('Semester', {
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
                                                        {i18next.t(
                                                            'Program Language',
                                                            { ns: 'common' }
                                                        )}
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

                            {/* Requirements Card - MOST IMPORTANT */}
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
                                                {i18next.t('Requirements')}
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
                                        template_obj={template_obj}
                                        thread={thread}
                                    />
                                </Box>
                            </Card>

                            {/* Instructions Card */}
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
                                                {i18next.t('Instructions')}
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

                            {/* Requirements Dialog */}
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
                                            {i18next.t('Requirements')}
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

                            {/* Instructions Dialog */}
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
                                            {i18next.t('Instructions')}
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

                            {/* Profile Photo (CV only) - Compact */}
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

                            {/* Conflicts in Sidebar (for non-students) */}
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
                                                {i18next.t('Conflict')}
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

                {/* Main Content Area: Messages & Reply */}
                <Grid item lg={9} md={9} xs={12}>
                    {children}
                </Grid>
            </Grid>
        </Box>
    );
};
const OriginAuthorStatementBar = ({
    thread,
    student_name,
    docName,
    theme,
    user
}) => {
    const [openOriginAuthorModal, setOpenOriginAuthorModal] = useState(false);
    const [originAuthorConfirmed, setOriginAuthorConfirmed] = useState(
        thread?.isOriginAuthorDeclarationConfirmedByStudent
    );
    const [isLoading, setIsLoading] = useState(false);
    const [originAuthorCheckboxConfirmed, setOriginAuthorCheckboxConfirmed] =
        useState(false);

    const postOriginAuthorConfirmed = (checked) => {
        setOriginAuthorConfirmed(checked);
        setIsLoading(true);
        putOriginAuthorConfirmedByStudent(
            thread._id,
            thread.student_id._id,
            originAuthorCheckboxConfirmed
        ).then(
            (resp) => {
                const { success } = resp.data;
                if (success) {
                    setOriginAuthorConfirmed(true);
                }
            },
            () => {}
        );
    };

    const student_name_zh = `${thread.student_id.lastname_chinese}${thread.student_id.firstname_chinese}`;

    return (
        <Box className="sticky-top">
            <Stack alignItems="center" direction="row" spacing={1}>
                {originAuthorConfirmed ? (
                    <>
                        <CheckCircleIcon
                            size={18}
                            style={{ color: green[500] }}
                            title="Agree"
                        />
                        <Typography variant="body1">
                            {i18next.t('confirmDocument', {
                                ns: 'documents',
                                studentName: student_name,
                                studentNameZh: student_name_zh,
                                docName
                            })}
                            <span
                                onClick={() =>
                                    setOpenOriginAuthorModal(
                                        !openOriginAuthorModal
                                    )
                                }
                                style={{
                                    color: theme.palette.primary.main,
                                    cursor: 'pointer'
                                }}
                            >
                                {i18next.t('Read More')}
                            </span>
                        </Typography>
                    </>
                ) : (
                    <>
                        <HelpIcon size={18} style={{ color: grey[400] }} />
                        <Typography variant="body1">
                            {i18next.t('notConfirmDocument', {
                                ns: 'documents',
                                studentName: student_name,
                                studentNameZh: student_name_zh,
                                docName
                            })}
                            &nbsp;
                            <span
                                onClick={() =>
                                    setOpenOriginAuthorModal(
                                        !openOriginAuthorModal
                                    )
                                }
                                style={{
                                    color: theme.palette.primary.main,
                                    cursor: 'pointer'
                                }}
                            >
                                {i18next.t('Read More')}
                            </span>
                        </Typography>
                    </>
                )}
            </Stack>
            <Dialog
                aria-labelledby="modal-orginal-declaration"
                onClose={() => {}}
                open={
                    (thread.file_type === 'Essay' &&
                        is_TaiGer_Student(user) &&
                        !originAuthorConfirmed) ||
                    openOriginAuthorModal
                }
            >
                <DialogTitle>
                    {i18next.t('Warning', { ns: 'common' })}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        <Typography sx={{ my: 2 }} variant="body1">
                            {i18next.t('hello-students', {
                                ns: 'common',
                                tenant: appConfig.companyName
                            })}
                        </Typography>
                        <Typography sx={{ my: 2 }} variant="body1">
                            {i18next.t(
                                'essay-responsibility-declaration-content',
                                {
                                    ns: 'common',
                                    tenant: appConfig.companyFullName
                                }
                            )}
                        </Typography>
                        <Typography sx={{ my: 2 }} variant="body1">
                            {i18next.t(
                                'essay-responsibility-declaration-signature',
                                {
                                    ns: 'common',
                                    tenant: appConfig.companyFullName
                                }
                            )}
                        </Typography>
                    </DialogContentText>
                    {is_TaiGer_Student(user) ? (
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={
                                        originAuthorCheckboxConfirmed ||
                                        thread.isOriginAuthorDeclarationConfirmedByStudent
                                    }
                                    disabled={
                                        thread.isOriginAuthorDeclarationConfirmedByStudent
                                    }
                                    onChange={() =>
                                        setOriginAuthorCheckboxConfirmed(
                                            !originAuthorCheckboxConfirmed
                                        )
                                    }
                                />
                            }
                            label={`${i18next.t(
                                'i-declare-without-help-of-ai',
                                {
                                    ns: 'common',
                                    studentFullName: `${student_name} ${student_name_zh}`,
                                    docName: docName
                                }
                            )}`}
                            sx={{ my: 2 }}
                        />
                    ) : null}
                    <br />
                    {is_TaiGer_Student(user) ? (
                        thread?.isOriginAuthorDeclarationConfirmedByStudent ? (
                            <Button
                                color="primary"
                                fullWidth
                                onClick={() =>
                                    setOpenOriginAuthorModal(
                                        !openOriginAuthorModal
                                    )
                                }
                                sx={{ mr: 2 }}
                                variant="contained"
                            >
                                {i18next.t('Close', { ns: 'common' })}
                            </Button>
                        ) : (
                            <Button
                                color="primary"
                                disabled={!originAuthorCheckboxConfirmed}
                                fullWidth
                                onClick={() =>
                                    postOriginAuthorConfirmed(
                                        originAuthorCheckboxConfirmed
                                    )
                                }
                                sx={{ mr: 2 }}
                                variant="contained"
                            >
                                {isLoading ? (
                                    <CircularProgress />
                                ) : (
                                    i18next.t('I Agree', { ns: 'common' })
                                )}
                            </Button>
                        )
                    ) : (
                        <Button
                            color="primary"
                            fullWidth
                            onClick={() =>
                                setOpenOriginAuthorModal(!openOriginAuthorModal)
                            }
                            sx={{ mr: 2 }}
                            variant="contained"
                        >
                            {i18next.t('Close', { ns: 'common' })}
                        </Button>
                    )}
                </DialogContent>
            </Dialog>
        </Box>
    );
};

const DocModificationThreadPage = ({
    agents,
    conflictList,
    deadline,
    editors,
    threadProps,
    similarThreads,
    scrollableRef,
    threadauditLog
}) => {
    const { user } = useAuth();
    const theme = useTheme();
    const { documentsthreadId } = useParams();
    const { setMessage, setSeverity, setOpenSnackbar } = useSnackBar();
    const [docModificationThreadPageState, setDocModificationThreadPageState] =
        useState({
            error: '',
            file: null,
            threadAuditLog: threadauditLog,
            showEditorPage: false,
            isSubmissionLoaded: true,
            isLoaded: true,
            thread: threadProps,
            buttonDisabled: false,
            editorState: {},
            expand: true,
            editors: editors,
            isSubmitting: false,
            agents: agents,
            conflict_list: conflictList,
            deadline: deadline,
            SetAsFinalFileModel: false,
            accordionKeys: [0], // to expand all]
            res_status: 0,
            res_modal_status: 0,
            res_modal_message: ''
        });
    const [checkResult, setCheckResult] = useState([]);
    const { hash } = useLocation();
    const [value, setValue] = useState(THREAD_TABS[hash.replace('#', '')] || 0);
    useEffect(() => {
        setDocModificationThreadPageState((prevState) => ({
            ...prevState,
            thread: threadProps
        }));
    }, [documentsthreadId]);
    useEffect(() => {
        if (scrollableRef?.current) {
            setTimeout(() => {
                scrollableRef.current.scrollTo({
                    top: scrollableRef.current.scrollHeight,
                    behavior: 'smooth'
                });
            }, 100);
        }
    }, []);

    const closeSetAsFinalFileModelWindow = () => {
        setDocModificationThreadPageState((prevState) => ({
            ...prevState,
            SetAsFinalFileModel: false
        }));
    };

    const handleChange = (event, newValue) => {
        setValue(newValue);
        window.location.hash = THREAD_REVERSED_TABS[newValue];
    };

    const onFileChange = (e) => {
        e.preventDefault();
        const file_num = e.target.files.length;
        if (file_num <= 3) {
            if (!e.target.files) {
                return;
            }
            if (!is_TaiGer_role(user)) {
                setDocModificationThreadPageState((prevState) => ({
                    ...prevState,
                    file: Array.from(e.target.files)
                }));
                return;
            }
            // Ensure a file is selected
            // TODO: make array
            const checkPromises = Array.from(e.target.files).map((file) => {
                const extension = file.name.split('.').pop().toLowerCase();
                const studentName =
                    docModificationThreadPageState.thread.student_id.firstname;

                if (extension === 'pdf') {
                    return readPDF(file, studentName);
                } else if (extension === 'docx') {
                    return readDOCX(file, studentName);
                } else if (extension === 'xlsx') {
                    return readXLSX(file, studentName);
                } else {
                    return Promise.resolve({});
                }
            });
            Promise.all(checkPromises)
                .then((results) => {
                    setCheckResult(results);
                    setDocModificationThreadPageState((prevState) => ({
                        ...prevState,
                        file: Array.from(e.target.files)
                    }));
                })
                .catch((error) => {
                    setDocModificationThreadPageState((prevState) => ({
                        ...prevState,
                        res_modal_message: error,
                        res_modal_status: 500
                    }));
                });
        } else {
            setDocModificationThreadPageState((prevState) => ({
                ...prevState,
                res_modal_message: 'You can only select up to 3 files.',
                res_modal_status: 423
            }));
        }
    };

    const ConfirmError = () => {
        setDocModificationThreadPageState((prevState) => ({
            ...prevState,
            res_modal_status: 0,
            res_modal_message: ''
        }));
    };

    const handleClickSave = (e, editorState) => {
        e.preventDefault();
        setDocModificationThreadPageState((prevState) => ({
            ...prevState,
            buttonDisabled: true
        }));
        var message = JSON.stringify(editorState);
        const formData = new FormData();

        if (docModificationThreadPageState.file) {
            docModificationThreadPageState.file.forEach((file) => {
                formData.append('files', file);
            });
        }

        formData.append('message', message);

        SubmitMessageWithAttachment(
            documentsthreadId,
            docModificationThreadPageState.thread.student_id._id,
            formData
        ).then(
            (resp) => {
                const { success, data } = resp.data;
                const { status } = resp;
                if (success) {
                    setDocModificationThreadPageState((prevState) => ({
                        ...prevState,
                        success,
                        file: null,
                        editorState: {},
                        thread: {
                            ...docModificationThreadPageState.thread,
                            messages: data?.messages
                        },
                        isLoaded: true,
                        buttonDisabled: false,
                        accordionKeys: [
                            ...docModificationThreadPageState.accordionKeys,
                            data.messages.length - 1
                        ],
                        res_modal_status: status
                    }));
                } else {
                    // TODO: what if data is oversize? data type not match?
                    const { message } = resp.data;
                    setDocModificationThreadPageState((prevState) => ({
                        ...prevState,
                        isLoaded: true,
                        buttonDisabled: false,
                        res_modal_message: message,
                        res_modal_status: status
                    }));
                }
            },
            (error) => {
                setDocModificationThreadPageState((prevState) => ({
                    ...prevState,
                    isLoaded: true,
                    error,
                    res_modal_status: 500,
                    res_modal_message: ''
                }));
            }
        );
        setDocModificationThreadPageState((prevState) => ({
            ...prevState,
            in_edit_mode: false
        }));
    };

    // function generatePDF() {
    //     const doc = new jsPDF();

    //     // Styled text
    //     doc.setFont('times');
    //     // doc.setFontStyle('italic');
    //     doc.setFontSize(16);
    //     doc.text('Styled Text Content', 10, 20);

    //     // Timestamp
    //     const timestamp = new Date().toLocaleString();
    //     doc.setFontSize(12);
    //     doc.text(`Timestamp: ${timestamp}`, 10, 40);

    //     // Signature
    //     doc.setFontSize(14);
    //     doc.text('Signature:', 10, 60);

    //     // Output
    //     doc.save('document.pdf');
    // }

    const handleAsFinalFile = (
        doc_thread_id,
        student_id,
        program_id,
        isFinalVersion,
        application_id
    ) => {
        setDocModificationThreadPageState((prevState) => ({
            ...prevState,
            doc_thread_id,
            student_id,
            program_id,
            application_id,
            isFinalVersion,
            SetAsFinalFileModel: true
        }));
    };

    const ConfirmSetAsFinalFileHandler = (e) => {
        e.preventDefault();
        setDocModificationThreadPageState((prevState) => ({
            ...prevState,
            isSubmissionLoaded: false // false to reload everything
        }));

        SetFileAsFinal(
            docModificationThreadPageState.doc_thread_id,
            docModificationThreadPageState.student_id,
            docModificationThreadPageState.application_id
        ).then(
            (resp) => {
                const { data, success } = resp.data;
                const { status } = resp;
                if (success) {
                    setDocModificationThreadPageState((prevState) => ({
                        ...prevState,
                        isSubmissionLoaded: true,
                        thread: {
                            ...prevState.thread,
                            isFinalVersion: data.isFinalVersion,
                            updatedAt: data.updatedAt
                        },
                        success: success,
                        SetAsFinalFileModel: false,
                        res_modal_status: status
                    }));
                    setSeverity('success');
                    setMessage(
                        data.isFinalVersion
                            ? 'Thread closed successfully!'
                            : 'Thread opened successfully!'
                    );
                    setOpenSnackbar(true);
                } else {
                    const { message } = resp.data;
                    setDocModificationThreadPageState((prevState) => ({
                        ...prevState,
                        isLoaded: true,
                        isSubmissionLoaded: true,
                        res_modal_message: message,
                        res_modal_status: status
                    }));
                }
            },
            (error) => {
                setDocModificationThreadPageState((prevState) => ({
                    ...prevState,
                    isLoaded: true,
                    error,
                    res_modal_status: 500,
                    res_modal_message: ''
                }));
            }
        );
    };

    const onDeleteSingleMessage = (e, message_id) => {
        e.preventDefault();
        setDocModificationThreadPageState((prevState) => ({
            ...prevState,
            isLoaded: false
        }));
        deleteAMessageInThread(documentsthreadId, message_id).then(
            (resp) => {
                const { success } = resp.data;
                const { status } = resp;
                if (success) {
                    // TODO: remove that message
                    var new_messages = [
                        ...docModificationThreadPageState.thread.messages
                    ];
                    let idx =
                        docModificationThreadPageState.thread.messages.findIndex(
                            (message) => message._id.toString() === message_id
                        );
                    if (idx !== -1) {
                        new_messages.splice(idx, 1);
                    }
                    setDocModificationThreadPageState((prevState) => ({
                        ...prevState,
                        success,
                        isLoaded: true,
                        thread: {
                            ...docModificationThreadPageState.thread,
                            messages: new_messages
                        },
                        buttonDisabled: false,
                        res_modal_status: status
                    }));
                    setSeverity('success');
                    setMessage('Message deleted successfully!');
                    setOpenSnackbar(true);
                } else {
                    // TODO: what if data is oversize? data type not match?
                    const { message } = resp.data;
                    setDocModificationThreadPageState((prevState) => ({
                        ...prevState,
                        isLoaded: true,
                        buttonDisabled: false,
                        res_modal_message: message,
                        res_modal_status: status
                    }));
                }
            },
            (error) => {
                setDocModificationThreadPageState((prevState) => ({
                    ...prevState,
                    isLoaded: true,
                    error,
                    res_modal_status: 500,
                    res_modal_message: ''
                }));
            }
        );
        setDocModificationThreadPageState((prevState) => ({
            ...prevState,
            in_edit_mode: false
        }));
    };

    const setEditorModalhide = () => {
        setDocModificationThreadPageState((prevState) => ({
            ...prevState,
            showEditorPage: false
        }));
    };

    const startEditingEditor = () => {
        setDocModificationThreadPageState((prevState) => ({
            ...prevState,
            subpage: 2,
            showEditorPage: true
        }));
    };

    const submitUpdateEssayWriterlist = (
        e,
        updateEssayWriterList,
        essayDocumentThread_id
    ) => {
        e.preventDefault();
        setDocModificationThreadPageState((prevState) => ({
            ...prevState,
            isSubmitting: true
        }));
        updateEssayWriter(updateEssayWriterList, essayDocumentThread_id).then(
            (resp) => {
                const { data, success } = resp.data;
                const { status } = resp;
                if (success) {
                    let essays_temp = {
                        ...docModificationThreadPageState.thread
                    };
                    essays_temp.outsourced_user_id = data.outsourced_user_id; // data is single student updated
                    setDocModificationThreadPageState((prevState) => ({
                        ...prevState,
                        isLoaded: true, //false to reload everything
                        isSubmitting: false,
                        thread: essays_temp,
                        success: success,
                        updateEditorList: [],
                        res_modal_status: status
                    }));
                    setEditorModalhide();
                    setSeverity('success');
                    setMessage('Essay Writer assigned successfully!');
                    setOpenSnackbar(true);
                } else {
                    const { message } = resp.data;
                    setDocModificationThreadPageState((prevState) => ({
                        ...prevState,
                        isLoaded: true,
                        res_modal_message: message,
                        res_modal_status: status
                    }));
                }
            },
            (error) => {
                setSeverity('error');
                setMessage(
                    error.message || 'An error occurred. Please try again.'
                );
                setOpenSnackbar(true);
            }
        );
    };

    const handleFavoriteToggle = (id) => {
        // Make sure flag_by_user_id is an array

        setDocModificationThreadPageState((prevState) => ({
            ...prevState,
            thread: {
                ...prevState.thread,
                flag_by_user_id: toogleItemInArray(
                    docModificationThreadPageState.thread?.flag_by_user_id,
                    user._id.toString()
                )
            }
        }));
        putThreadFavorite(id).then(
            (resp) => {
                const { success } = resp.data;
                const { status } = resp;
                if (success) {
                    setSeverity('success');
                    setMessage(
                        isFavorite
                            ? 'Removed from favorite successfully!'
                            : 'Added to favorite successfully!'
                    );
                    setOpenSnackbar(true);
                } else {
                    setDocModificationThreadPageState((prevState) => ({
                        ...prevState,
                        res_status: status
                    }));
                }
            },
            (error) => {
                setDocModificationThreadPageState((prevState) => ({
                    ...prevState,
                    error,
                    res_status: 500
                }));
            }
        );
    };

    const {
        isSubmissionLoaded,
        conflict_list,
        threadAuditLog,
        thread,
        res_status,
        res_modal_status,
        res_modal_message
    } = docModificationThreadPageState;

    if (res_status >= 400) {
        return <ErrorPage res_status={res_status} />;
    }

    // Only CV, ML RL has instructions and template.
    let template_obj = templatelist.find(
        ({ prop, alias }) =>
            prop.includes(thread.file_type.split('_')[0]) ||
            alias.includes(thread.file_type.split('_')[0])
    );
    let docName;
    const student_name = `${thread.student_id.firstname} ${thread.student_id.lastname}`;

    if (thread.program_id) {
        const { school, degree, program_name } = thread.program_id;
        docName = `${school} - ${degree} - ${program_name} ${thread.file_type}`;
    } else {
        docName = thread.file_type;
    }

    const isFavorite = thread.flag_by_user_id?.includes(user._id.toString());
    TabTitle(`${student_name} ${docName}`);
    return (
        <Box>
            {thread?.file_type === 'Essay' ? (
                <OriginAuthorStatementBar
                    docName={docName}
                    student_name={student_name}
                    theme={theme}
                    thread={thread}
                    user={user}
                />
            ) : null}
            {/* TODO */}
            {/* {false ? <button onClick={generatePDF}>Generate PDF</button> : null} */}

            {docModificationThreadPageState.thread.isFinalVersion ? (
                <TopBar />
            ) : null}
            <Tabs
                aria-label="basic tabs example"
                indicatorColor="primary"
                onChange={handleChange}
                scrollButtons="auto"
                value={value}
                variant="scrollable"
            >
                <Tab
                    icon={<ChatIcon />}
                    label={i18next.t('discussion-thread', { ns: 'common' })}
                    {...a11yProps(value, 0)}
                    sx={{
                        fontWeight: value === 0 ? 'bold' : 'normal' // Bold for selected tab
                    }}
                />
                <Tab
                    icon={<FolderIcon />}
                    label={i18next.t('files', { ns: 'common' })}
                    {...a11yProps(value, 1)}
                    sx={{
                        fontWeight: value === 1 ? 'bold' : 'normal' // Bold for selected tab
                    }}
                />
                {is_TaiGer_role(user) ? (
                    <Tab
                        icon={<LibraryBooksIcon />}
                        label={`${i18next.t('Database', { ns: 'common' })} (${similarThreads?.length || 0})`}
                        {...a11yProps(value, 2)}
                        sx={{
                            fontWeight: value === 2 ? 'bold' : 'normal' // Bold for selected tab
                        }}
                    />
                ) : null}
                <Tab
                    icon={<HistoryIcon />}
                    label={i18next.t('Audit', { ns: 'common' })}
                    {...a11yProps(value, is_TaiGer_role(user) ? 3 : 2)}
                    sx={{
                        fontWeight:
                            value === (is_TaiGer_role(user) ? 3 : 2)
                                ? 'bold'
                                : 'normal' // Bold for selected tab
                    }}
                />
            </Tabs>
            <CustomTabPanel index={0} value={value}>
                <InformationBlock
                    agents={docModificationThreadPageState.agents}
                    conflict_list={conflict_list}
                    deadline={docModificationThreadPageState.deadline}
                    documentsthreadId={documentsthreadId}
                    editors={docModificationThreadPageState.editors}
                    handleFavoriteToggle={handleFavoriteToggle}
                    isFavorite={isFavorite}
                    startEditingEditor={startEditingEditor}
                    template_obj={template_obj}
                    thread={docModificationThreadPageState.thread}
                    user={user}
                >
                    <MessageList
                        accordionKeys={
                            docModificationThreadPageState.accordionKeys
                        }
                        apiPrefix="/api/document-threads"
                        documentsthreadId={documentsthreadId}
                        isLoaded={docModificationThreadPageState.isLoaded}
                        onDeleteSingleMessage={onDeleteSingleMessage}
                        thread={thread}
                        user={user}
                    />
                    {user.archiv !== true ? (
                        <Card
                            sx={{
                                borderRadius: 2,
                                border: `1px solid ${theme.palette.divider}`,
                                boxShadow: theme.shadows[1],
                                overflow: 'hidden',
                                mt: 1,
                                transition: 'all 0.3s',
                                '&:hover': {
                                    boxShadow: theme.shadows[3],
                                    borderColor: theme.palette.primary.main
                                }
                            }}
                        >
                            {thread.isFinalVersion ? (
                                <Box
                                    sx={{
                                        p: 3,
                                        textAlign: 'center'
                                    }}
                                >
                                    <CheckCircleIcon
                                        color="success"
                                        sx={{ fontSize: 48, mb: 1 }}
                                    />
                                    <Typography
                                        color="text.secondary"
                                        variant="body1"
                                    >
                                        {i18next.t('thread-close')}
                                    </Typography>
                                </Box>
                            ) : (
                                <>
                                    {/* Header */}
                                    <Box
                                        sx={{
                                            background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
                                            color: theme.palette.primary
                                                .contrastText,
                                            p: 1.5
                                        }}
                                    >
                                        <Stack
                                            alignItems="center"
                                            direction="row"
                                            spacing={1.5}
                                        >
                                            <Avatar
                                                {...stringAvatar(
                                                    `${user.firstname} ${user.lastname}`
                                                )}
                                                src={user?.pictureUrl}
                                                sx={{
                                                    width: 36,
                                                    height: 36,
                                                    border: '2px solid white'
                                                }}
                                            />
                                            <Box>
                                                <Typography
                                                    fontWeight="600"
                                                    variant="body2"
                                                >
                                                    {user.firstname}{' '}
                                                    {user.lastname}
                                                </Typography>
                                                <Typography
                                                    sx={{
                                                        fontSize: '0.7rem',
                                                        opacity: 0.9
                                                    }}
                                                    variant="caption"
                                                >
                                                    Write a reply
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </Box>

                                    {/* Editor Content */}
                                    <Box
                                        sx={{
                                            p: 2,
                                            overflowWrap: 'break-word'
                                        }}
                                    >
                                        <DocThreadEditor
                                            buttonDisabled={
                                                docModificationThreadPageState.buttonDisabled
                                            }
                                            checkResult={checkResult}
                                            doc_title="docModificationThreadPageState.doc_title"
                                            editorState={
                                                docModificationThreadPageState.editorState
                                            }
                                            file={
                                                docModificationThreadPageState.file
                                            }
                                            handleClickSave={handleClickSave}
                                            onFileChange={onFileChange}
                                            thread={thread}
                                        />
                                    </Box>
                                </>
                            )}
                        </Card>
                    ) : (
                        <Card
                            sx={{
                                borderRadius: 2,
                                border: `1px solid ${theme.palette.divider}`,
                                mt: 2,
                                p: 3,
                                textAlign: 'center',
                                bgcolor: 'grey.50'
                            }}
                        >
                            <CancelOutlinedIcon
                                color="disabled"
                                sx={{ fontSize: 48, mb: 1 }}
                            />
                            <Typography color="text.secondary" variant="body1">
                                Your service is finished. Therefore, you are in
                                read-only mode.
                            </Typography>
                        </Card>
                    )}
                    {is_TaiGer_role(user) ? (
                        !thread.isFinalVersion ? (
                            <Button
                                color="success"
                                fullWidth
                                onClick={() =>
                                    handleAsFinalFile(
                                        thread._id,
                                        thread.student_id._id,
                                        thread.program_id,
                                        thread.isFinalVersion,
                                        thread.application_id
                                    )
                                }
                                sx={{ mt: 2 }}
                                variant="contained"
                            >
                                {isSubmissionLoaded ? (
                                    i18next.t('Mark as finished')
                                ) : (
                                    <CircularProgress />
                                )}
                            </Button>
                        ) : (
                            <Button
                                color="secondary"
                                fullWidth
                                onClick={() =>
                                    handleAsFinalFile(
                                        thread._id,
                                        thread.student_id._id,
                                        thread.program_id,
                                        thread.isFinalVersion,
                                        thread.application_id
                                    )
                                }
                                sx={{ mt: 2 }}
                                variant="outlined"
                            >
                                {isSubmissionLoaded ? (
                                    i18next.t('Mark as open')
                                ) : (
                                    <CircularProgress />
                                )}
                            </Button>
                        )
                    ) : null}
                </InformationBlock>
            </CustomTabPanel>
            <CustomTabPanel index={1} value={value}>
                <Box sx={{ px: 2, py: 1 }}>
                    <Typography sx={{ mb: 1 }} variant="h6">
                        {i18next.t('Files Overview', { ns: 'common' })}
                    </Typography>
                    <Typography
                        color="text.secondary"
                        sx={{ mb: 2 }}
                        variant="body2"
                    >
                        {i18next.t(
                            'All files shared in this thread are listed below.',
                            { ns: 'common' }
                        )}
                    </Typography>
                </Box>
                <FilesList thread={thread} />
            </CustomTabPanel>
            {is_TaiGer_role(user) ? (
                <CustomTabPanel index={2} value={value}>
                    {similarThreads && similarThreads?.length > 0 ? (
                        <Stack spacing={1.5} sx={{ mx: 2 }}>
                            {similarThreads.map((t) => (
                                <Card
                                    key={t._id}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        gap: 2,
                                        p: 2,
                                        borderRadius: 2,
                                        transition: 'all 0.2s',
                                        '&:hover': {
                                            backgroundColor: 'action.hover'
                                        }
                                    }}
                                >
                                    <Link
                                        component={LinkDom}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1.5,
                                            flex: 1,
                                            textDecoration: 'none'
                                        }}
                                        target="_blank"
                                        to={DEMO.DOCUMENT_MODIFICATION_LINK(
                                            t._id
                                        )}
                                    >
                                        <ArticleIcon
                                            sx={{ color: 'primary.main' }}
                                        />
                                        <Box sx={{ flex: 1 }}>
                                            <Typography
                                                fontWeight="bold"
                                                variant="subtitle1"
                                            >
                                                {`${t.student_id?.firstname} ${t.student_id?.lastname}`}
                                            </Typography>
                                            <Typography
                                                color="text.secondary"
                                                variant="body2"
                                            >
                                                {`${t.application_id?.application_year} - ${t.file_type}`}
                                            </Typography>
                                        </Box>
                                    </Link>
                                    {t.application_id?.admission === 'O' ? (
                                        <Chip
                                            color="success"
                                            icon={
                                                <CheckCircleIcon
                                                    sx={{
                                                        color: 'inherit !important'
                                                    }}
                                                />
                                            }
                                            label="Admitted"
                                            size="small"
                                            sx={{
                                                fontWeight: 'bold',
                                                minWidth: 100
                                            }}
                                        />
                                    ) : t.application_id?.admission === 'X' ? (
                                        <Chip
                                            color="error"
                                            icon={
                                                <CancelOutlinedIcon
                                                    sx={{
                                                        color: 'inherit !important'
                                                    }}
                                                />
                                            }
                                            label="Rejected"
                                            size="small"
                                            sx={{
                                                fontWeight: 'bold',
                                                minWidth: 100
                                            }}
                                        />
                                    ) : (
                                        <Chip
                                            color="default"
                                            icon={
                                                <HelpIcon
                                                    sx={{
                                                        color: 'inherit !important'
                                                    }}
                                                />
                                            }
                                            label="Pending"
                                            size="small"
                                            sx={{
                                                fontWeight: 'bold',
                                                minWidth: 100
                                            }}
                                            variant="outlined"
                                        />
                                    )}
                                </Card>
                            ))}
                        </Stack>
                    ) : (
                        <Typography sx={{ m: 2 }} variant="text.secondary">
                            {i18next.t('No similar threads found', {
                                ns: 'common'
                            })}
                        </Typography>
                    )}
                </CustomTabPanel>
            ) : null}
            <CustomTabPanel index={is_TaiGer_role(user) ? 3 : 2} value={value}>
                <Audit audit={threadAuditLog} />
            </CustomTabPanel>

            <DocumentCheckingResultModal
                docName={docName}
                file_type={thread.file_type}
                isFinalVersion={thread.isFinalVersion}
                isSubmissionLoaded={
                    docModificationThreadPageState.isSubmissionLoaded
                }
                onClose={closeSetAsFinalFileModelWindow}
                onConfirm={(e) => ConfirmSetAsFinalFileHandler(e)}
                open={docModificationThreadPageState.SetAsFinalFileModel}
                student_name={student_name}
                thread_id={thread._id}
                title={i18next.t('Warning', { ns: 'common' })}
            />
            {is_TaiGer_role(user) &&
            docModificationThreadPageState.showEditorPage ? (
                <EditEssayWritersSubpage
                    actor={
                        [FILE_TYPE_E.essay_required].includes(thread.file_type)
                            ? 'Essay Writer'
                            : 'Editor'
                    }
                    editors={docModificationThreadPageState.editors}
                    essayDocumentThread={thread}
                    isSubmitting={docModificationThreadPageState.isSubmitting}
                    onHide={setEditorModalhide}
                    setmodalhide={setEditorModalhide}
                    show={docModificationThreadPageState.showEditorPage}
                    submitUpdateEssayWriterlist={submitUpdateEssayWriterlist}
                />
            ) : null}
            {res_modal_status >= 400 ? (
                <ModalMain
                    ConfirmError={ConfirmError}
                    res_modal_message={res_modal_message}
                    res_modal_status={res_modal_status}
                />
            ) : null}
        </Box>
    );
};

export default DocModificationThreadPage;
