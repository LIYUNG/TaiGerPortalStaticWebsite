import React, { useMemo, useState } from 'react';
import { Link as LinkDom } from 'react-router-dom';
import {
    Typography,
    Card,
    Link,
    Box,
    Grid,
    useTheme,
    Stack,
    Chip
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import LaunchIcon from '@mui/icons-material/Launch';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import { is_TaiGer_Student } from '@taiger-common/core';
import type {
    IUserWithId,
    IDocumentthreadPopulated,
    ITemplateWithId
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
    template_obj: ITemplateWithId | null;
    startEditingEditor: () => void;
    handleFavoriteToggle: (threadId: string) => void;
    thread: IDocumentthreadPopulated;
    user: IUserWithId;
    children: React.ReactNode;
}

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
}: InformationBlockProps) => {
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === 'dark';
    const { t } = useTranslation();
    const [requirementsDialogOpen, setRequirementsDialogOpen] = useState(false);
    const [instructionsDialogOpen, setInstructionsDialogOpen] = useState(false);

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
                            '&::-webkit-scrollbar': { width: '6px' },
                            '&::-webkit-scrollbar-thumb': {
                                backgroundColor: theme.palette.divider,
                                borderRadius: '3px'
                            }
                        }}
                    >
                        <Stack spacing={1}>
                            {thread.isFinalVersion ? <TopBar /> : null}

                            <DeadlineCard
                                deadline={deadline}
                                deadlineGradient={deadlineGradient}
                                handleFavoriteToggle={handleFavoriteToggle}
                                isFavorite={isFavorite}
                                thread={thread}
                                urgent={urgent}
                                user={user}
                            />

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
                                setRequirementsDialogOpen={
                                    setRequirementsDialogOpen
                                }
                                template_obj={template_obj}
                                thread={thread}
                                user={user}
                            />

                            <InstructionsSection
                                documentsthreadId={documentsthreadId}
                                instructionsDialogOpen={instructionsDialogOpen}
                                setInstructionsDialogOpen={
                                    setInstructionsDialogOpen
                                }
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
                            '&::-webkit-scrollbar': { width: '6px' },
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
