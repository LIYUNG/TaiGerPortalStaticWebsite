import React, { useMemo, useState } from 'react';
import { Link as LinkDom } from 'react-router-dom';
import {
    Typography,
    Card,
    Link,
    Box,
    Grid,
    useTheme,
    useMediaQuery,
    Stack,
    Chip,
    Drawer,
    IconButton,
    Tooltip
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import LaunchIcon from '@mui/icons-material/Launch';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';

import { is_TaiGer_role, is_TaiGer_Student } from '@taiger-common/core';
import type {
    IUserWithId,
    IDocumentthreadPopulated,
    ITemplateWithId,
    IStudentResponse,
    IProgramWithId
} from '@taiger-common/model';
import { useTranslation } from 'react-i18next';

import DEMO from '@store/constant';
import { BASE_URL } from '@/api';
import { TopBar } from '@components/TopBar/TopBar';
import OriginAuthorStatementBar from './OriginAuthorStatementBar';
import DeadlineCard from './DeadlineCard';
import RequirementsSection from './RequirementsSection';
import InstructionsSection from './InstructionsSection';
import TeamInformationCard from './TeamInformationCard';
import ProgramDetailsCard from './ProgramDetailsCard';
import { EssayDifficultyIndicator } from './EssayDifficultyIndicator';

interface InformationBlockProps {
    agents: IUserWithId[];
    deadline: string;
    editors: IUserWithId[];
    conflict_list: Array<{
        _id: { toString: () => string };
        firstname?: string;
        lastname?: string;
    }>;
    documentsthreadId: string;
    isFavorite: boolean;
    isGeneralRL: boolean;
    isWithdraw: boolean;
    template_obj: ITemplateWithId | null;
    startEditingEditor: () => void;
    handleFavoriteToggle: (threadId: string) => void;
    thread: IDocumentthreadPopulated;
    user: IUserWithId;
    /** Scrollable message list (the middle of the chat layout). */
    children: React.ReactNode;
    /** Optional composer/footer, pinned to the bottom of the discussion. */
    composer?: React.ReactNode;
    /**
     * Fill the parent's height and scroll the sidebar and message list
     * independently (app-shell embedded view). When false, the layout uses
     * viewport-relative heights (standalone page).
     */
    fillHeight?: boolean;
    /** Controlled open state for the mobile thread-details Drawer. */
    detailsOpen?: boolean;
    /** Close handler for the mobile thread-details Drawer. */
    onCloseDetails?: () => void;
}

const InformationBlock = ({
    agents,
    deadline,
    editors,
    conflict_list,
    documentsthreadId,
    isFavorite,
    isGeneralRL,
    isWithdraw,
    template_obj,
    startEditingEditor,
    handleFavoriteToggle,
    thread,
    user,
    children,
    composer,
    fillHeight = false,
    detailsOpen = false,
    onCloseDetails
}: InformationBlockProps) => {
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === 'dark';
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { t } = useTranslation();
    const [requirementsDialogOpen, setRequirementsDialogOpen] = useState(false);
    const [instructionsDialogOpen, setInstructionsDialogOpen] = useState(false);

    // Document title shown at the top of the details Drawer.
    const detailsProgram = thread?.program_id as IProgramWithId | undefined;
    const detailsFileType = String(
        (thread as { file_type?: string })?.file_type ?? ''
    );
    const detailsTitleLine1 = detailsProgram
        ? String(detailsProgram.school ?? '')
        : detailsFileType;
    const detailsTitleLine2 = detailsProgram
        ? `${detailsFileType} - ${detailsProgram.degree ?? ''} - ${detailsProgram.program_name ?? ''}`
        : '';

    const isDeadlineUrgent = () => {
        if (!deadline || deadline === 'No' || deadline === '-') return false;
        const deadlineDate = new Date(deadline);
        const today = new Date();
        const diffTime = deadlineDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 7 && diffDays >= 0;
    };

    const urgent = isDeadlineUrgent();

    const getGradientColors = useMemo(() => {
        const resolveColors = (colorType: string) => {
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

    const sidebarContent = (
        <Stack spacing={1}>
            {thread.isFinalVersion ? <TopBar /> : null}

            <DeadlineCard
                deadline={deadline}
                deadlineGradient={deadlineGradient}
                handleFavoriteToggle={handleFavoriteToggle}
                isFavorite={isFavorite}
                isWithdraw={isWithdraw}
                thread={thread}
                urgent={urgent}
                user={user}
            />

            {is_TaiGer_role(user) && thread?.file_type === 'Essay' && (
                <EssayDifficultyIndicator
                    essayDifficulty={
                        (thread.program_id as IProgramWithId).essay_difficulty
                    }
                />
            )}

            {thread?.file_type === 'Essay' ? (
                <OriginAuthorStatementBar
                    theme={theme}
                    thread={thread}
                    user={user}
                />
            ) : null}

            <RequirementsSection
                isGeneralRL={isGeneralRL}
                requirementsDialogOpen={requirementsDialogOpen}
                setRequirementsDialogOpen={setRequirementsDialogOpen}
                template_obj={template_obj}
                thread={thread}
                user={user}
            />

            <InstructionsSection
                documentsthreadId={documentsthreadId}
                instructionsDialogOpen={instructionsDialogOpen}
                setInstructionsDialogOpen={setInstructionsDialogOpen}
                template_obj={template_obj}
                thread={thread}
            />

            <TeamInformationCard
                agents={agents}
                editors={editors}
                startEditingEditor={startEditingEditor}
                teamGradient={teamGradient}
                thread={thread}
                user={user}
            />

            <ProgramDetailsCard
                programGradient={programGradient}
                thread={thread}
            />

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
                        <Typography fontWeight="600" variant="body2">
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
                                src={`${BASE_URL}/api/students/${(thread.student_id as IStudentResponse)._id}/files/Passport_Photo`}
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
                            <Typography fontWeight="600" variant="body2">
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
                                {conflict_list.map((conflict_student, j) => (
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
                                            fontSize: '0.75rem',
                                            height: 26
                                        }}
                                        to={`${DEMO.STUDENT_DATABASE_STUDENTID_LINK(
                                            conflict_student._id.toString(),
                                            DEMO.CVMLRL_HASH
                                        )}`}
                                        variant="outlined"
                                    />
                                ))}
                            </Stack>
                        )}
                    </Box>
                </Card>
            )}
        </Stack>
    );

    // Mobile: chat is the primary view; thread info lives in a right-anchored
    // Drawer opened from the Info icon in the tab bar (controlled by the parent),
    // so the user no longer scrolls past the info panel to reach the messages.
    if (isMobile) {
        return (
            <Box
                sx={
                    fillHeight
                        ? {
                              display: 'flex',
                              flexDirection: 'column',
                              height: '100%',
                              minHeight: 0
                          }
                        : undefined
                }
            >
                {/* Messages: the only scroll area when filling height. */}
                {fillHeight ? (
                    <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
                        {children}
                    </Box>
                ) : (
                    children
                )}
                {/* Composer: pinned to the bottom. */}
                {composer ? (
                    <Box
                        sx={
                            fillHeight
                                ? {
                                      flexShrink: 0,
                                      borderTop: 1,
                                      borderColor: 'divider',
                                      pt: 1
                                  }
                                : {
                                      position: 'sticky',
                                      bottom: 0,
                                      zIndex: 1,
                                      bgcolor: 'background.default',
                                      borderTop: 1,
                                      borderColor: 'divider',
                                      pt: 1
                                  }
                        }
                    >
                        {composer}
                    </Box>
                ) : null}
                <Drawer
                    anchor="right"
                    onClose={onCloseDetails}
                    open={detailsOpen}
                    sx={{
                        '& .MuiDrawer-paper': {
                            width: '100%',
                            maxWidth: 420,
                            bgcolor: 'background.default'
                        }
                    }}
                    variant="temporary"
                >
                    <Box
                        sx={{
                            alignItems: 'center',
                            borderBottom: 1,
                            borderColor: 'divider',
                            display: 'flex',
                            justifyContent: 'space-between',
                            gap: 1,
                            px: 2,
                            py: 1.5
                        }}
                    >
                        <Box sx={{ minWidth: 0 }}>
                            <Typography fontWeight="600" variant="h6">
                                {t('Thread details', {
                                    ns: 'common',
                                    defaultValue: 'Thread details'
                                })}
                            </Typography>
                            {detailsTitleLine1 ? (
                                <Typography
                                    fontWeight="bold"
                                    sx={{ overflowWrap: 'break-word' }}
                                    variant="body2"
                                >
                                    {detailsTitleLine1}
                                </Typography>
                            ) : null}
                            {detailsTitleLine2 ? (
                                <Typography
                                    color="text.secondary"
                                    sx={{
                                        display: 'block',
                                        overflowWrap: 'break-word'
                                    }}
                                    variant="caption"
                                >
                                    {detailsTitleLine2}
                                </Typography>
                            ) : null}
                        </Box>
                        <Tooltip title={t('Close', { ns: 'common' })}>
                            <IconButton
                                aria-label="close thread details"
                                onClick={onCloseDetails}
                            >
                                <CloseIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                    <Box sx={{ overflowY: 'auto', p: 1.5 }}>
                        {sidebarContent}
                    </Box>
                </Drawer>
            </Box>
        );
    }

    return (
        <Box sx={fillHeight ? { height: '100%', minHeight: 0 } : undefined}>
            <Grid
                container
                spacing={2.5}
                sx={
                    fillHeight
                        ? { height: '100%', flexWrap: 'nowrap' }
                        : undefined
                }
            >
                <Grid
                    item
                    lg={3}
                    md={3}
                    sx={
                        fillHeight
                            ? { height: '100%', minHeight: 0 }
                            : undefined
                    }
                    xs={12}
                >
                    <Box
                        sx={
                            fillHeight
                                ? {
                                      height: '100%',
                                      overflowY: 'auto',
                                      '&::-webkit-scrollbar': { width: '6px' },
                                      '&::-webkit-scrollbar-thumb': {
                                          backgroundColor:
                                              theme.palette.divider,
                                          borderRadius: '3px'
                                      }
                                  }
                                : {
                                      position: { md: 'sticky' },
                                      top: { md: 8 },
                                      maxHeight: { md: 'calc(100vh - 192px)' },
                                      overflowY: { md: 'auto' },
                                      '&::-webkit-scrollbar': { width: '6px' },
                                      '&::-webkit-scrollbar-thumb': {
                                          backgroundColor:
                                              theme.palette.divider,
                                          borderRadius: '3px'
                                      }
                                  }
                        }
                    >
                        {sidebarContent}
                    </Box>
                </Grid>

                <Grid
                    item
                    lg={9}
                    md={9}
                    sx={
                        fillHeight
                            ? { height: '100%', minHeight: 0 }
                            : undefined
                    }
                    xs={12}
                >
                    <Box
                        sx={
                            fillHeight
                                ? {
                                      height: '100%',
                                      display: 'flex',
                                      flexDirection: 'column',
                                      minHeight: 0
                                  }
                                : {
                                      position: { md: 'sticky' },
                                      top: { md: 8 },
                                      height: { md: 'calc(100vh - 192px)' },
                                      display: 'flex',
                                      flexDirection: 'column',
                                      minHeight: 0
                                  }
                        }
                    >
                        {/* Messages: the only scroll area, kept in the middle. */}
                        <Box
                            sx={{
                                flex: 1,
                                minHeight: 0,
                                overflowY: 'auto',
                                pr: 0.5,
                                '&::-webkit-scrollbar': { width: '6px' },
                                '&::-webkit-scrollbar-thumb': {
                                    backgroundColor: theme.palette.divider,
                                    borderRadius: '3px'
                                }
                            }}
                        >
                            {children}
                        </Box>
                        {/* Composer: pinned to the bottom. */}
                        {composer ? (
                            <Box
                                sx={{
                                    flexShrink: 0,
                                    pt: 1,
                                    borderTop: 1,
                                    borderColor: 'divider',
                                    bgcolor: 'background.default'
                                }}
                            >
                                {composer}
                            </Box>
                        ) : null}
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
};

export default InformationBlock;
