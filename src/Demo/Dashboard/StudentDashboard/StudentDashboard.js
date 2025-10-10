import React, { useState, useMemo } from 'react';
import { Link as LinkDom, useParams } from 'react-router-dom';
import LaunchIcon from '@mui/icons-material/Launch';
import EventIcon from '@mui/icons-material/Event';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import AssignmentIcon from '@mui/icons-material/Assignment';
import {
    Alert,
    Box,
    Button,
    Card,
    Chip,
    Grid,
    LinearProgress,
    Link,
    Stack,
    Typography
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { is_TaiGer_Student, isProgramDecided } from '@taiger-common/core';

import RespondedThreads from '../MainViewTab/RespondedThreads/RespondedThreads';
import StudentTasksResponsive from '../MainViewTab/StudentTasks/StudentTasksResponsive';
import {
    check_academic_background_filled,
    check_application_preference_filled,
    check_languages_filled,
    check_applications_to_decided,
    is_all_uni_assist_vpd_uploaded,
    are_base_documents_missing,
    is_personal_data_filled,
    to_register_application_portals,
    all_applications_results_updated,
    has_admissions,
    needGraduatedApplicantsButStudentNotGraduated,
    needGraduatedApplicantsPrograms
} from '../../Utils/checking-functions';
import ErrorPage from '../../Utils/ErrorPage';
import { updateBanner } from '../../../api';
import DEMO from '../../../store/constant';
import ApplicationProgressCard from '../../../components/ApplicationProgressCard/ApplicationProgressCard';
import { appConfig } from '../../../config';
import ProgramLanguageNotMatchedBanner from '../../../components/Banner/ProgramLanguageNotMatchedBanner';
import EnglishCertificateExpiredBeforeDeadlineBanner from '../../../components/Banner/EnglishCertificateExpiredBeforeDeadlineBanner';
import { useQuery } from '@tanstack/react-query';
import { getApplicationStudentV2Query } from '../../../api/query';
import { useAuth } from '../../../components/AuthProvider';
import Loading from '../../../components/Loading/Loading';

const StudentDashboard = (props) => {
    const { user } = useAuth();
    const { t } = useTranslation();
    const [studentDashboardState, setStudentDashboardState] = useState({
        error: '',
        student: props.student,
        itemheight: 20,
        data: [],
        res_status: 0
    });
    const { studentId: stdIdParam } = useParams();
    console.log('stdIdParam', stdIdParam);
    const studentId = is_TaiGer_Student(user) ? user._id : stdIdParam;
    const { data: data, isLoading: isLoadingApplications } = useQuery(
        getApplicationStudentV2Query({ studentId })
    );

    // Calculate progress and pending tasks based on actual task checks
    const progressData = useMemo(() => {
        if (!data?.data?.data)
            return {
                completedSteps: 0,
                totalSteps: 0,
                pendingTasks: [],
                progressPercentage: 0
            };

        const student = data.data.data;
        const tasks = [];
        let totalTasksCount = 0;
        let completedTasksCount = 0;

        // 1. Profile completion (academic background, application preference, languages)
        totalTasksCount++;
        if (
            check_academic_background_filled(student.academic_background) &&
            check_application_preference_filled(
                student.application_preference
            ) &&
            check_languages_filled(student.academic_background)
        ) {
            completedTasksCount++;
        } else {
            tasks.push({
                key: 'profile',
                priority: 'high',
                title: t('Complete Your Profile', { ns: 'dashboard' }),
                description: t(
                    'Please complete Profile so that your agent can understand your situation',
                    { ns: 'dashboard' }
                ),
                link: DEMO.SURVEY_LINK,
                linkText: t('Go to Profile', { ns: 'common' })
            });
        }

        // 2. Courses (if graduated or pending graduation)
        if (
            props.isCoursesFilled !== undefined &&
            (student.academic_background?.university?.isGraduated ===
                'pending' ||
                student.academic_background?.university?.isGraduated === 'Yes')
        ) {
            totalTasksCount++;
            if (props.isCoursesFilled) {
                completedTasksCount++;
            } else {
                tasks.push({
                    key: 'courses',
                    priority: 'high',
                    title: t('My Courses', { ns: 'common' }),
                    description: t(
                        'Please complete My Courses table. The agent will provide you with course analysis and courses suggestion.',
                        { ns: 'courses' }
                    ),
                    link: DEMO.COURSES_LINK,
                    linkText: t('My Courses', { ns: 'common' })
                });
            }
        }

        // 3. Programs decided
        totalTasksCount++;
        if (check_applications_to_decided(student)) {
            completedTasksCount++;
        } else {
            tasks.push({
                key: 'programs',
                priority: 'high',
                title: t('Decide on Programs', { ns: 'dashboard' }),
                description: t(
                    "Please refer to the programs provided by the agent and visit the school's program website for detailed information. Complete the school selection before the start of the application season.",
                    { ns: 'courses' }
                ),
                link: DEMO.STUDENT_APPLICATIONS_LINK,
                linkText: t('View Programs', { ns: 'common' })
            });
        }

        // 4. Application results updated
        if (check_applications_to_decided(student)) {
            totalTasksCount++;
            if (all_applications_results_updated(student)) {
                completedTasksCount++;
            } else {
                tasks.push({
                    key: 'app_results',
                    priority: 'medium',
                    title: t('Application Results', { ns: 'common' }),
                    description: t(
                        'Please update your applications results to the corresponding program in this page below',
                        { ns: 'common' }
                    ),
                    link: DEMO.STUDENT_APPLICATIONS_LINK,
                    linkText: t('Update', { ns: 'common' })
                });
            }
        }

        // 5. Visa (if has admissions)
        if (has_admissions(student)) {
            totalTasksCount++;
            // Note: We don't have a check for visa completion, so this is always pending
            tasks.push({
                key: 'visa',
                priority: 'low',
                title: t('Visa', { ns: 'common' }),
                description: t(
                    'Please consider working on visa, if you decide the offer.',
                    { ns: 'visa' }
                ),
                link: DEMO.VISA_DOCS_LINK,
                linkText: t('Visa', { ns: 'common' })
            });
        }

        // 6. Uni-Assist (if enabled)
        if (appConfig.vpdEnable) {
            totalTasksCount++;
            if (is_all_uni_assist_vpd_uploaded(student)) {
                completedTasksCount++;
            } else {
                tasks.push({
                    key: 'uniassist',
                    priority: 'high',
                    title: 'Uni-Assist',
                    description: t(
                        'Please go to the Uni-Assist section, follow the instructions to complete',
                        { ns: 'courses' }
                    ),
                    link: DEMO.UNI_ASSIST_LINK,
                    linkText: t('Go to Uni-Assist', { ns: 'common' })
                });
            }
        }

        // 7. Personal data
        totalTasksCount++;
        if (is_personal_data_filled(student)) {
            completedTasksCount++;
        } else {
            tasks.push({
                key: 'personal_data',
                priority: 'high',
                title: t('Personal Data', { ns: 'common' }),
                description: t(
                    'Please be sure to update your Chinese and English names, as well as your date of birth information. This will affect the preparation of formal documents by the editor for you.',
                    { ns: 'courses' }
                ),
                link: DEMO.PROFILE,
                linkText: t('Profile', { ns: 'common' })
            });
        }

        // 8. Base documents
        totalTasksCount++;
        if (!are_base_documents_missing(student)) {
            completedTasksCount++;
        } else {
            tasks.push({
                key: 'basedocs',
                priority: 'high',
                title: t('Upload Required Documents', { ns: 'dashboard' }),
                description: t(
                    'Please upload documents as soon as possible. The agent needs them to understand your academic background.',
                    { ns: 'courses' }
                ),
                link: DEMO.BASE_DOCUMENTS_LINK,
                linkText: t('Upload Documents', { ns: 'common' })
            });
        }

        // 9. Portal registration
        totalTasksCount++;
        if (!to_register_application_portals(student)) {
            completedTasksCount++;
        } else {
            tasks.push({
                key: 'portals',
                priority: 'medium',
                title: t('Portals Management', { ns: 'common' }),
                description: t(
                    "Please go to each school's website to create an account and provide your login credentials. This will facilitate the agent in conducting pre-submission checks for you in the future.",
                    { ns: 'courses' }
                ),
                link: DEMO.PORTALS_MANAGEMENT_LINK,
                linkText: t('Portals Management', { ns: 'common' })
            });
        }

        // 10. Document threads - general docs (feedback from editor)
        let docThreadCount = 0;
        student.generaldocs_threads?.forEach((thread) => {
            if (
                !thread.isFinalVersion &&
                thread.latest_message_left_by_id !== student._id.toString()
            ) {
                docThreadCount++;
                tasks.push({
                    key: `docthread_general_${thread.doc_thread_id._id}`,
                    priority: 'high',
                    title:
                        t('Respond to Editor Feedback', { ns: 'dashboard' }) +
                        ` - ${thread.doc_thread_id.file_type}`,
                    description: t(
                        'Your editor has provided feedback on your document. Review and respond to move forward',
                        { ns: 'dashboard' }
                    ),
                    link: DEMO.DOCUMENT_MODIFICATION_LINK(
                        thread.doc_thread_id._id
                    ),
                    linkText: t('View Feedback', { ns: 'common' })
                });
            }
        });
        totalTasksCount += docThreadCount;

        // 11. Document threads - application specific
        let appDocThreadCount = 0;
        if (student.applications?.length > 0) {
            student.applications
                .filter((application) => isProgramDecided(application))
                .forEach((application) => {
                    application.doc_modification_thread?.forEach((thread) => {
                        if (
                            !thread.isFinalVersion &&
                            thread.latest_message_left_by_id !==
                                student._id.toString()
                        ) {
                            appDocThreadCount++;
                            tasks.push({
                                key: `docthread_app_${thread.doc_thread_id._id}`,
                                priority: 'high',
                                title:
                                    t('Respond to Editor Feedback', {
                                        ns: 'dashboard'
                                    }) + ` - ${thread.doc_thread_id.file_type}`,
                                description: `${application.programId.school} - ${application.programId.program_name}`,
                                link: DEMO.DOCUMENT_MODIFICATION_LINK(
                                    thread.doc_thread_id._id
                                ),
                                linkText: t('View Feedback', { ns: 'common' })
                            });
                        }
                    });
                });
        }
        totalTasksCount += appDocThreadCount;

        return {
            completedSteps: completedTasksCount,
            totalSteps: totalTasksCount,
            pendingTasks: tasks.sort((a, b) => {
                const priorityOrder = { high: 0, medium: 1, low: 2 };
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            }),
            progressPercentage:
                totalTasksCount > 0
                    ? Math.round((completedTasksCount / totalTasksCount) * 100)
                    : 0
        };
    }, [data, props.isCoursesFilled, t]);

    const removeBanner = (e, notification_key) => {
        e.preventDefault();
        const temp_student = data.data.data;
        temp_student.notification[`${notification_key}`] = true;
        setStudentDashboardState({ student: temp_student });
        updateBanner(notification_key).then(
            (resp) => {
                const { success } = resp.data;
                const { status } = resp;
                if (success) {
                    setStudentDashboardState({
                        ...studentDashboardState,
                        success: success,
                        res_status: status
                    });
                } else {
                    setStudentDashboardState({
                        ...studentDashboardState,
                        res_status: status
                    });
                }
            },
            (error) => {
                setStudentDashboardState({
                    ...studentDashboardState,
                    error,
                    res_status: 500
                });
            }
        );
    };

    if (isLoadingApplications) {
        return <Loading />;
    }

    const { res_status } = studentDashboardState;

    if (res_status >= 400) {
        return <ErrorPage res_status={res_status} />;
    }

    const hasUpcomingAppointment = false;
    const read_thread = <RespondedThreads student={data.data.data} />;

    const student_tasks = (
        <StudentTasksResponsive
            isCoursesFilled={props.isCoursesFilled}
            student={data.data.data}
        />
    );

    return (
        <>
            {data.archiv ? (
                <Card
                    sx={{
                        p: 2,
                        mb: 2,
                        borderLeft: '4px solid',
                        borderColor: 'error.main'
                    }}
                >
                    <Typography
                        color="error.main"
                        sx={{ fontWeight: 'bold', mb: 1 }}
                        variant="h5"
                    >
                        {t('Status', { ns: 'common' })}:{' '}
                        {t('Closed', { ns: 'common' })}
                    </Typography>
                    <Typography color="error.main" variant="body1">
                        {t('acctount_deactivated_text', { ns: 'dashboard' })}
                    </Typography>
                </Card>
            ) : null}

            {/* Progress Overview Section */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12}>
                    <Card
                        sx={{
                            p: 3,
                            background:
                                'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white'
                        }}
                    >
                        <Stack spacing={2}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}
                            >
                                <Typography
                                    sx={{ fontWeight: 'bold' }}
                                    variant="h5"
                                >
                                    {t('Your Application Journey', {
                                        ns: 'dashboard'
                                    })}
                                </Typography>
                                <Chip
                                    icon={<CheckCircleIcon />}
                                    label={`${progressData.progressPercentage}% ${t('Complete', { ns: 'common' })}`}
                                    sx={{
                                        bgcolor: 'white',
                                        color: '#667eea',
                                        fontWeight: 'bold'
                                    }}
                                />
                            </Box>
                            <Box>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        mb: 1
                                    }}
                                >
                                    <Typography variant="body2">
                                        {t('Progress', { ns: 'common' })}:{' '}
                                        {progressData.completedSteps}{' '}
                                        {t('of', { ns: 'common' })}{' '}
                                        {progressData.totalSteps}{' '}
                                        {t('steps completed', {
                                            ns: 'dashboard'
                                        })}
                                    </Typography>
                                    <Typography variant="body2">
                                        {progressData.pendingTasks.length}{' '}
                                        {t('tasks pending', {
                                            ns: 'dashboard'
                                        })}
                                    </Typography>
                                </Box>
                                <LinearProgress
                                    sx={{
                                        height: 10,
                                        borderRadius: 5,
                                        bgcolor: 'rgba(255,255,255,0.3)',
                                        '& .MuiLinearProgress-bar': {
                                            bgcolor: 'white'
                                        }
                                    }}
                                    value={progressData.progressPercentage}
                                    variant="determinate"
                                />
                            </Box>
                        </Stack>
                    </Card>
                </Grid>
            </Grid>

            {/* Informational Messages */}
            <Grid container spacing={2} sx={{ mt: 0 }}>
                {/* new agents assigned banner */}
                {data.data.data.notification &&
                !data.data.data.notification.isRead_new_agent_assigned ? (
                    <Grid item xs={12}>
                        <Alert
                            icon={<CheckCircleIcon />}
                            onClose={(e) =>
                                removeBanner(e, 'isRead_new_agent_assigned')
                            }
                            severity="success"
                        >
                            <Typography
                                sx={{ fontWeight: 'medium' }}
                                variant="body2"
                            >
                                {t('New agent is assigned to you')}
                            </Typography>
                        </Alert>
                    </Grid>
                ) : null}
                {/* new editors assigned banner */}
                {data.data.data.notification &&
                !data.data.data.notification.isRead_new_editor_assigned ? (
                    <Grid item xs={12}>
                        <Alert
                            icon={<CheckCircleIcon />}
                            onClose={(e) =>
                                removeBanner(e, 'isRead_new_editor_assigned')
                            }
                            severity="success"
                        >
                            <Typography
                                sx={{ fontWeight: 'medium' }}
                                variant="body2"
                            >
                                {t('New editor is assigned to you')}
                            </Typography>
                        </Alert>
                    </Grid>
                ) : null}
                {/* Special Warnings */}
                {needGraduatedApplicantsButStudentNotGraduated(
                    data.data.data
                ) && (
                    <Grid item xs={12}>
                        <Card
                            sx={{
                                borderLeft: '4px solid',
                                borderColor: 'error.main'
                            }}
                        >
                            <Alert icon={<WarningIcon />} severity="error">
                                <Typography
                                    sx={{ fontWeight: 'bold', mb: 1 }}
                                    variant="subtitle1"
                                >
                                    {t(
                                        'Programs below are only for graduated applicants',
                                        { ns: 'common' }
                                    )}
                                </Typography>
                                <Box component="ul" sx={{ m: 0, pl: 2 }}>
                                    {needGraduatedApplicantsPrograms(
                                        data.data.data.applications
                                    )?.map((app) => (
                                        <li key={app.programId._id.toString()}>
                                            <Link
                                                component={LinkDom}
                                                target="_blank"
                                                to={DEMO.SINGLE_PROGRAM_LINK(
                                                    app.programId._id.toString()
                                                )}
                                                underline="hover"
                                            >
                                                {app.programId.school}{' '}
                                                {app.programId.program_name}{' '}
                                                {app.programId.degree}{' '}
                                                {app.programId.semester}
                                            </Link>
                                        </li>
                                    ))}
                                </Box>
                            </Alert>
                        </Card>
                    </Grid>
                )}
                <Grid item xs={12}>
                    <ProgramLanguageNotMatchedBanner student={data.data.data} />
                </Grid>
                <Grid item xs={12}>
                    <EnglishCertificateExpiredBeforeDeadlineBanner
                        student={data.data.data}
                    />
                </Grid>
                <Grid item md={8} xs={12}>
                    <Card
                        sx={{
                            borderLeft: '4px solid',
                            borderColor: 'warning.main',
                            maxHeight: '600px',
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                    >
                        <Box
                            sx={{
                                p: 2,
                                borderBottom: '1px solid',
                                borderColor: 'divider',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                            }}
                        >
                            <AssignmentIcon sx={{ color: 'error.dark' }} />
                            <Box sx={{ flex: 1 }}>
                                <Typography
                                    sx={{
                                        fontWeight: 'bold',
                                        color: 'error.dark'
                                    }}
                                    variant="h6"
                                >
                                    {t('Action Required', { ns: 'common' })}
                                </Typography>
                                <Typography
                                    color="text.secondary"
                                    variant="body2"
                                >
                                    {t(
                                        'All tasks and document threads requiring attention',
                                        { ns: 'dashboard' }
                                    )}
                                </Typography>
                            </Box>
                        </Box>
                        <Box
                            sx={{
                                p: 2,
                                overflow: 'auto',
                                flexGrow: 1,
                                '&::-webkit-scrollbar': {
                                    width: '10px'
                                },
                                '&::-webkit-scrollbar-track': {
                                    backgroundColor: 'transparent'
                                },
                                '&::-webkit-scrollbar-thumb': {
                                    backgroundColor: 'rgba(110, 110, 110, 0.2)',
                                    borderRadius: '4px',
                                    '&:hover': {
                                        backgroundColor: 'rgba(0,0,0,0.3)'
                                    }
                                }
                            }}
                        >
                            {student_tasks}
                        </Box>
                    </Card>
                </Grid>
                <Grid item md={4} xs={12}>
                    <Stack spacing={2}>
                        {appConfig.meetingEnable && (
                            <Card
                                sx={{
                                    borderLeft: '4px solid'
                                }}
                            >
                                <Box
                                    sx={{
                                        p: 2,
                                        borderBottom: '1px solid',
                                        borderColor: 'divider'
                                    }}
                                >
                                    <Typography
                                        sx={{
                                            fontWeight: 'bold',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1
                                        }}
                                        variant="h6"
                                    >
                                        <EventIcon />{' '}
                                        {t('Schedule Appointment', {
                                            ns: 'dashboard'
                                        })}
                                    </Typography>
                                </Box>
                                <Box sx={{ p: 2 }}>
                                    {!hasUpcomingAppointment && (
                                        <Typography
                                            sx={{ mb: 2 }}
                                            variant="body2"
                                        >
                                            {t(
                                                'Want an intensive discussion? Book an office hour with your agent.',
                                                { ns: 'dashboard' }
                                            )}{' '}
                                            <Link
                                                component={LinkDom}
                                                sx={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: 0.5
                                                }}
                                                target="_blank"
                                                to="https://taigerconsultancy-portal.com/docs/search/64fe21bcbc729bc024d14738"
                                                underline="hover"
                                            >
                                                {t('Instructions')}
                                                <LaunchIcon fontSize="small" />
                                            </Link>
                                        </Typography>
                                    )}
                                    {data.data.data?.agents?.length !== 0 ? (
                                        <Button
                                            color="success"
                                            component={LinkDom}
                                            fullWidth
                                            startIcon={<EventIcon />}
                                            to={`${DEMO.EVENT_STUDENT_STUDENTID_LINK(
                                                data.data.data?._id?.toString()
                                            )}`}
                                            variant="contained"
                                        >
                                            {t('Book Appointment', {
                                                ns: 'dashboard'
                                            })}
                                        </Button>
                                    ) : (
                                        <Typography
                                            color="text.secondary"
                                            sx={{ textAlign: 'center' }}
                                            variant="body2"
                                        >
                                            {t('Wait for Agent', {
                                                ns: 'common'
                                            })}
                                        </Typography>
                                    )}
                                </Box>
                            </Card>
                        )}
                        <Card
                            sx={{
                                borderLeft: '4px solid',
                                borderColor: 'warning.main',
                                maxHeight: '600px',
                                display: 'flex',
                                flexDirection: 'column'
                            }}
                        >
                            <Box
                                sx={{
                                    p: 2,
                                    borderBottom: '1px solid',
                                    borderColor: 'divider'
                                }}
                            >
                                <Typography
                                    sx={{
                                        fontWeight: 'bold'
                                    }}
                                    variant="h6"
                                >
                                    {t('Pending Editor Response', {
                                        ns: 'dashboard'
                                    })}
                                </Typography>
                                <Typography
                                    color="text.secondary"
                                    variant="body2"
                                >
                                    {t(
                                        'Documents waiting for editor feedback',
                                        { ns: 'dashboard' }
                                    )}
                                </Typography>
                            </Box>
                            <Box
                                sx={{
                                    p: 2,
                                    overflow: 'auto',
                                    flexGrow: 1,
                                    '&::-webkit-scrollbar': {
                                        width: '10px'
                                    },
                                    '&::-webkit-scrollbar-track': {
                                        backgroundColor: 'transparent'
                                    },
                                    '&::-webkit-scrollbar-thumb': {
                                        backgroundColor: 'rgba(0,0,0,0.2)',
                                        borderRadius: '4px',
                                        '&:hover': {
                                            backgroundColor: 'rgba(0,0,0,0.3)'
                                        }
                                    }
                                }}
                            >
                                {read_thread}
                            </Box>
                        </Card>
                    </Stack>
                </Grid>
            </Grid>

            {/* Application Progress Cards */}
            {data.data.data.applications?.filter((app) => isProgramDecided(app))
                .length > 0 && (
                <Box sx={{ mt: 4 }}>
                    <Typography sx={{ mb: 2, fontWeight: 'bold' }} variant="h5">
                        {t('My Applications', { ns: 'common' })}
                    </Typography>
                    <Grid container spacing={2}>
                        {data.data.data.applications
                            ?.filter((app) => isProgramDecided(app))
                            .map((application, idx) => (
                                <Grid
                                    item
                                    key={idx}
                                    lg={3}
                                    md={4}
                                    sm={6}
                                    xs={12}
                                >
                                    <ApplicationProgressCard
                                        application={application}
                                        student={data.data.data}
                                    />
                                </Grid>
                            ))}
                    </Grid>
                </Box>
            )}
        </>
    );
};

export default StudentDashboard;
