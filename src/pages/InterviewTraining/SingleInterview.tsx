import React, { useState, useMemo, type MouseEvent } from 'react';
import type { AxiosResponse } from 'axios';
import type { GetInterviewResponse } from '@taiger-common/model';
import { Link as LinkDom, useLocation, useParams } from 'react-router-dom';
import {
    Card,
    Link,
    Button,
    Typography,
    Avatar,
    CircularProgress,
    Breadcrumbs,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Tabs,
    Tab,
    Box,
    Stack,
    useTheme,
    Alert,
    Paper,
    Fade,
    Grid
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { is_TaiGer_role } from '@taiger-common/core';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle as CheckCircleIcon } from '@mui/icons-material';

import ErrorPage from '../Utils/ErrorPage';
import {
    SubmitMessageWithAttachment,
    deleteAMessageInThread,
    deleteInterview,
    updateInterview
} from '@/api';
import { getInterviewQuery } from '@/api/query';
import { TabTitle } from '../Utils/TabTitle';
import DEMO from '@store/constant';
import Loading from '@components/Loading/Loading';
import {
    stringAvatar,
    THREAD_REVERSED_TABS,
    THREAD_TABS
} from '@utils/contants';
import { useAuth } from '@components/AuthProvider';
import { appConfig } from '../../config';
import MessageList from '@components/Message/MessageList';
import DocThreadEditor from '@components/Message/DocThreadEditor';
import { a11yProps, CustomTabPanel } from '@components/Tabs';
import Audit from '../Audit';
import { InterviewFeedback } from './InterviewFeedback';
import InterviewMetadataSidebar from './components/InterviewMetadataSidebar';
import { useSnackBar } from '@/contexts/use-snack-bar';

const SingleInterview = () => {
    const { interview_id } = useParams();
    const { user } = useAuth();
    const { t } = useTranslation();
    const { hash } = useLocation();
    const theme = useTheme();
    const queryClient = useQueryClient();
    const isDarkMode = theme.palette.mode === 'dark';
    const { setMessage, setSeverity, setOpenSnackbar } = useSnackBar();

    // State management
    const [value, setValue] = useState(THREAD_TABS[hash.replace('#', '')] || 0);
    const [file, setFile] = useState(null);
    const [editorInputState, setEditorInputState] = useState({
        time: new Date(),
        blocks: []
    });
    const [accordionKeys, setAccordionKeys] = useState([]);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [closeDialogOpen, setCloseDialogOpen] = useState(false);

    // Fetch interview data with useQuery
    const {
        data: interviewData,
        isLoading,
        isError,
        error
    } = useQuery({
        ...getInterviewQuery(interview_id),
        onSuccess: (response: AxiosResponse<GetInterviewResponse>) => {
            if (response.data.success && response.data.data) {
                const messagesLength =
                    response.data.data.thread_id?.messages?.length || 0;
                setAccordionKeys(
                    new Array(messagesLength)
                        .fill(undefined)
                        .map((_x: undefined, i: number) =>
                            i === messagesLength - 1 ? i : -1
                        )
                );
            }
        }
    });

    // Mutations
    const submitMessageMutation = useMutation({
        mutationFn: ({
            threadId,
            studentId,
            formData
        }: {
            threadId: string;
            studentId: string;
            formData: FormData;
        }) => SubmitMessageWithAttachment(threadId, studentId, formData),
        onSuccess: () => {
            queryClient.invalidateQueries(['interviews', interview_id]);
            setEditorInputState({ time: new Date(), blocks: [] });
            setFile(null);
        },
        onError: (error: Error) => {
            console.log('error', error);
            setOpenSnackbar(true);
            setSeverity('error');
            setMessage(error?.message || 'Failed to send message');
        }
    });

    const deleteMessageMutation = useMutation({
        mutationFn: ({
            threadId,
            messageId
        }: {
            threadId: string;
            messageId: string;
        }) => deleteAMessageInThread(threadId, messageId),
        onSuccess: () => {
            queryClient.invalidateQueries(['interviews', interview_id]);
        },
        onError: (error: Error) => {
            setSeverity('error');
            setMessage(error?.message || 'Failed to delete message');
            setOpenSnackbar(true);
        }
    });

    const updateInterviewMutation = useMutation({
        mutationFn: ({
            interviewId,
            payload
        }: {
            interviewId: string;
            payload: Record<string, unknown>;
        }) => updateInterview(interviewId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries(['interviews', interview_id]);
            setCloseDialogOpen(false);
        },
        onError: (error: Error) => {
            setSeverity('error');
            setMessage(error?.message || 'Failed to update interview');
            setOpenSnackbar(true);
        }
    });

    const deleteInterviewMutation = useMutation({
        mutationFn: (interviewId: string) => deleteInterview(interviewId),
        onSuccess: () => {
            setDeleteDialogOpen(false);
        },
        onError: (error: Error) => {
            setSeverity('error');
            setMessage(error?.message || 'Failed to delete interview');
            setOpenSnackbar(true);
        }
    });

    // Handlers
    const handleClickSave = (
        e: MouseEvent<HTMLElement>,
        editorState: unknown
    ) => {
        const message = JSON.stringify(editorState);
        const formData = new FormData();

        if (file) {
            file.forEach((f: File) => formData.append('files', f));
        }
        formData.append('message', message);

        submitMessageMutation.mutate({
            threadId: interview?.thread_id?._id.toString(),
            studentId: interview?.student_id?._id.toString(),
            formData
        });
    };

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        const fileNum = e.target.files?.length ?? 0;
        if (fileNum <= 3) {
            if (e.target.files) {
                setFile(Array.from(e.target.files));
            }
        } else {
            setSeverity('error');
            setMessage('You can only select up to 3 files.');
            setOpenSnackbar(true);
        }
    };

    const singleExpandtHandler = (idx: number) => {
        const newAccordionKeys = [...accordionKeys];
        newAccordionKeys[idx] = newAccordionKeys[idx] !== idx ? idx : -1;
        setAccordionKeys(newAccordionKeys);
    };

    const onDeleteSingleMessage = (message_id: string) => {
        deleteMessageMutation.mutate({
            threadId: interview?.thread_id?._id.toString(),
            messageId: message_id
        });
    };

    const handleToggleInterviewStatus = () => {
        updateInterviewMutation.mutate({
            interviewId: interview._id.toString(),
            payload: { isClosed: !interview.isClosed }
        });
    };

    const handleDeleteInterview = () => {
        deleteInterviewMutation.mutate(interview._id.toString());
    };

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
        window.location.hash = THREAD_REVERSED_TABS[newValue];
    };

    const openDeleteDocModalWindow = (e: MouseEvent<HTMLElement>) => {
        e.stopPropagation();
        setDeleteDialogOpen(true);
    };

    const handleInterviewUpdate = () => {
        queryClient.invalidateQueries(['interviews', interview_id]);
    };

    // Memoized values
    const interview = useMemo(() => {
        return interviewData?.data?.data;
    }, [interviewData]);

    const interviewAuditLog = useMemo(() => {
        return interviewData?.data?.interviewAuditLog || [];
    }, [interviewData]);

    const interview_name = useMemo(() => {
        if (!interview) return '';
        return `${interview.student_id.firstname} ${interview.student_id.lastname} - ${interview.program_id.school} ${interview.program_id.program_name} ${interview.program_id.degree} ${interview.program_id.semester}`;
    }, [interview]);

    // Loading and error states
    if (isLoading) {
        return <Loading />;
    }

    if (isError) {
        return <ErrorPage res_status={error?.response?.status || 500} />;
    }

    if (!interview && deleteInterviewMutation.isSuccess) {
        const successGradient = isDarkMode
            ? {
                  start: theme.palette.success.dark,
                  end: theme.palette.success.main
              }
            : {
                  start: theme.palette.success.light,
                  end: theme.palette.success.main
              };

        return (
            <Fade in timeout={600}>
                <Paper
                    elevation={0}
                    sx={{
                        p: 4,
                        textAlign: 'center',
                        background: `linear-gradient(135deg, ${successGradient.start} 0%, ${successGradient.end} 100%)`,
                        color: 'white',
                        borderRadius: 2
                    }}
                >
                    <CheckCircleIcon sx={{ fontSize: 64, mb: 2 }} />
                    <Typography variant="h5">
                        {t('Interview deleted successfully!')}
                    </Typography>
                </Paper>
            </Fade>
        );
    }

    if (!interview) {
        return <ErrorPage res_status={404} />;
    }

    TabTitle(`Interview: ${interview_name}`);

    return (
        <Box>
            {/* Breadcrumbs */}
            <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
                <Link
                    color="inherit"
                    component={LinkDom}
                    to={`${DEMO.DASHBOARD_LINK}`}
                    underline="hover"
                >
                    {appConfig.companyName}
                </Link>
                <Link
                    color="inherit"
                    component={LinkDom}
                    to={`${DEMO.INTERVIEW_LINK}`}
                    underline="hover"
                >
                    {is_TaiGer_role(user)
                        ? t('All Interviews', { ns: 'interviews' })
                        : t('My Interviews', { ns: 'interviews' })}
                </Link>
                <Typography color="text.primary">{interview_name}</Typography>
            </Breadcrumbs>

            {/* Tabs */}
            <Paper
                elevation={0}
                sx={{ borderRadius: 2, overflow: 'hidden', mb: 3 }}
            >
                <Tabs
                    aria-label="interview tabs"
                    indicatorColor="primary"
                    onChange={handleChange}
                    scrollButtons="auto"
                    sx={{
                        bgcolor: theme.palette.background.paper,
                        borderBottom: 1,
                        borderColor: 'divider'
                    }}
                    value={value}
                    variant="scrollable"
                >
                    <Tab
                        label={t('discussion-thread', { ns: 'common' })}
                        {...a11yProps(value, 0)}
                    />
                    {is_TaiGer_role(user) && (
                        <Tab
                            label={t('History', { ns: 'common' })}
                            {...a11yProps(value, 1)}
                        />
                    )}
                    <Tab
                        label={t('Audit', { ns: 'common' })}
                        {...a11yProps(value, is_TaiGer_role(user) ? 2 : 1)}
                    />
                </Tabs>

                {/* Discussion Thread Tab */}
                <CustomTabPanel index={0} value={value}>
                    <Box sx={{ p: 2 }}>
                        <Grid container spacing={2.5}>
                            {/* Left Sidebar: Interview Metadata */}
                            <Grid item lg={3} md={4} xs={12}>
                                <InterviewMetadataSidebar
                                    interview={interview}
                                    onInterviewUpdate={handleInterviewUpdate}
                                    openDeleteDocModalWindow={
                                        openDeleteDocModalWindow
                                    }
                                    theme={theme}
                                />
                            </Grid>

                            {/* Right Content Area: Messages & Chat ONLY */}
                            <Grid item lg={9} md={8} xs={12}>
                                <Box
                                    sx={{
                                        position: { md: 'sticky' },
                                        top: { md: 8 },
                                        maxHeight: {
                                            md: 'calc(100vh - 220px)'
                                        },
                                        overflowY: { md: 'auto' },
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
                                    {/* Messages List */}
                                    <MessageList
                                        accordionKeys={accordionKeys}
                                        apiPrefix="/api/document-threads"
                                        documentsthreadId={interview.thread_id?._id?.toString()}
                                        isLoaded={true}
                                        onDeleteSingleMessage={
                                            onDeleteSingleMessage
                                        }
                                        singleExpandtHandler={
                                            singleExpandtHandler
                                        }
                                        thread={interview.thread_id}
                                        user={user}
                                    />

                                    {/* Message Input */}
                                    {user.archiv !== true ? (
                                        <Card
                                            elevation={0}
                                            sx={{
                                                borderRadius: 2,
                                                border: `2px solid ${
                                                    interview.isClosed
                                                        ? theme.palette.divider
                                                        : theme.palette.primary
                                                              .main
                                                }`,
                                                mt: 2,
                                                overflow: 'hidden',
                                                transition: 'all 0.3s',
                                                '&:hover': {
                                                    boxShadow:
                                                        interview.isClosed
                                                            ? 0
                                                            : theme.shadows[4]
                                                }
                                            }}
                                        >
                                            {interview.isClosed ? (
                                                <Box
                                                    sx={{
                                                        p: 3,
                                                        bgcolor: isDarkMode
                                                            ? 'rgba(255,255,255,0.05)'
                                                            : theme.palette
                                                                  .grey[50],
                                                        textAlign: 'center'
                                                    }}
                                                >
                                                    <CheckCircleIcon
                                                        color="success"
                                                        sx={{
                                                            fontSize: 48,
                                                            mb: 1
                                                        }}
                                                    />
                                                    <Typography variant="body1">
                                                        {t(
                                                            'This interview is closed.'
                                                        )}
                                                    </Typography>
                                                </Box>
                                            ) : (
                                                <>
                                                    {/* Header */}
                                                    <Box
                                                        sx={{
                                                            background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
                                                            color: theme.palette
                                                                .primary
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
                                                                src={
                                                                    user?.pictureUrl
                                                                }
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
                                                                    {
                                                                        user.firstname
                                                                    }{' '}
                                                                    {
                                                                        user.lastname
                                                                    }
                                                                </Typography>
                                                                <Typography
                                                                    sx={{
                                                                        fontSize:
                                                                            '0.7rem',
                                                                        opacity: 0.9
                                                                    }}
                                                                    variant="caption"
                                                                >
                                                                    {t(
                                                                        'Write your reply'
                                                                    )}
                                                                </Typography>
                                                            </Box>
                                                        </Stack>
                                                    </Box>
                                                    <Box sx={{ p: 2 }}>
                                                        <DocThreadEditor
                                                            buttonDisabled={
                                                                submitMessageMutation.isLoading
                                                            }
                                                            checkResult={[]}
                                                            editorState={
                                                                editorInputState
                                                            }
                                                            file={file}
                                                            handleClickSave={
                                                                handleClickSave
                                                            }
                                                            onFileChange={
                                                                onFileChange
                                                            }
                                                            thread={
                                                                interview.thread_id
                                                            }
                                                        />
                                                    </Box>
                                                </>
                                            )}
                                        </Card>
                                    ) : (
                                        <Alert
                                            severity="info"
                                            sx={{ mt: 2, borderRadius: 2 }}
                                        >
                                            <Typography variant="body1">
                                                {t(
                                                    'Your service is finished. Therefore, you are in read only mode.'
                                                )}
                                            </Typography>
                                        </Alert>
                                    )}

                                    {/* Action Button for TaiGer Roles */}
                                    {is_TaiGer_role(user) && (
                                        <Button
                                            color={
                                                interview.isClosed
                                                    ? 'secondary'
                                                    : 'success'
                                            }
                                            disabled={
                                                updateInterviewMutation.isLoading
                                            }
                                            fullWidth
                                            onClick={() =>
                                                setCloseDialogOpen(true)
                                            }
                                            size="large"
                                            sx={{
                                                mt: 2,
                                                py: 1.5,
                                                fontWeight: 600
                                            }}
                                            variant={
                                                interview.isClosed
                                                    ? 'outlined'
                                                    : 'contained'
                                            }
                                        >
                                            {updateInterviewMutation.isLoading ? (
                                                <CircularProgress size={24} />
                                            ) : interview.isClosed ? (
                                                t('Mark as open')
                                            ) : (
                                                t('Mark as finished')
                                            )}
                                        </Button>
                                    )}
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>
                </CustomTabPanel>

                {/* History Tab */}
                {is_TaiGer_role(user) && (
                    <CustomTabPanel index={1} value={value}>
                        <Box sx={{ p: 3 }}>
                            <InterviewFeedback interview={interview} />
                        </Box>
                    </CustomTabPanel>
                )}

                {/* Audit Tab */}
                <CustomTabPanel
                    index={is_TaiGer_role(user) ? 2 : 1}
                    value={value}
                >
                    <Box sx={{ p: 3 }}>
                        <Audit audit={interviewAuditLog} />
                    </Box>
                </CustomTabPanel>
            </Paper>

            {/* Toggle Interview Status Dialog */}
            <Dialog
                maxWidth="sm"
                onClose={() => setCloseDialogOpen(false)}
                open={closeDialogOpen}
            >
                <DialogTitle>{t('Warning', { ns: 'common' })}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {t('Do you want to set')}{' '}
                        <strong>
                            {t('Interview for')}{' '}
                            {interview.student_id.firstname}{' '}
                            {interview.student_id.lastname}{' '}
                            {interview.program_id.school}{' '}
                            {interview.program_id.program_name}{' '}
                            {interview.program_id.degree}{' '}
                            {interview.program_id.semester}
                        </strong>{' '}
                        {t('as')}{' '}
                        <strong>
                            {interview.isClosed ? t('open') : t('closed')}
                        </strong>
                        ?
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button
                        color="secondary"
                        onClick={() => setCloseDialogOpen(false)}
                        variant="outlined"
                    >
                        {t('No', { ns: 'common' })}
                    </Button>
                    <Button
                        color="primary"
                        disabled={updateInterviewMutation.isLoading}
                        onClick={handleToggleInterviewStatus}
                        variant="contained"
                    >
                        {updateInterviewMutation.isLoading ? (
                            <CircularProgress size={24} />
                        ) : (
                            t('Yes', { ns: 'common' })
                        )}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Interview Dialog */}
            <Dialog
                maxWidth="sm"
                onClose={() => setDeleteDialogOpen(false)}
                open={deleteDialogOpen}
            >
                <DialogTitle sx={{ color: 'error.main' }}>
                    {t('Warning', { ns: 'common' })}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {t('Do you want to delete the interview request of')}{' '}
                        <strong>
                            {interview.program_id.school}{' '}
                            {interview.program_id.program_name}
                        </strong>
                        ?
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button
                        color="secondary"
                        onClick={() => setDeleteDialogOpen(false)}
                        variant="outlined"
                    >
                        {t('No', { ns: 'common' })}
                    </Button>
                    <Button
                        color="error"
                        disabled={deleteInterviewMutation.isLoading}
                        onClick={handleDeleteInterview}
                        variant="contained"
                    >
                        {deleteInterviewMutation.isLoading ? (
                            <CircularProgress size={24} />
                        ) : (
                            t('Yes', { ns: 'common' })
                        )}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default SingleInterview;
