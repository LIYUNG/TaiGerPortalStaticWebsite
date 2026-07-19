import { Link as LinkDom, useParams } from 'react-router-dom';
import LaunchIcon from '@mui/icons-material/Launch';
import EventIcon from '@mui/icons-material/Event';
import {
    Alert,
    Box,
    Button,
    Card,
    Grid,
    IconButton,
    Link,
    ListItem,
    Stack,
    Typography
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { is_TaiGer_Student } from '@taiger-common/core';
import type { Application } from '@/api/types';
import type { IUser } from '@taiger-common/model';

import PendingEditorReplyCard from '../MainViewTab/RespondedThreads/PendingEditorReplyCard';
import StudentTaskList from '../MainViewTab/StudentTasks/StudentTaskList';
import {
    needGraduatedApplicantsButStudentNotGraduated,
    needGraduatedApplicantsPrograms
} from '../../Utils/util_functions';
import DEMO from '@store/constant';
import MyApplicationsPanel from './MyApplicationsPanel';
import UpcomingDeadlinesPanel from './UpcomingDeadlinesPanel';
import { appConfig } from '../../../config';
import ProgramLanguageNotMatchedBanner from '@components/Banner/ProgramLanguageNotMatchedBanner';
import EnglishScoreBelowRequirementBanner from '@components/Banner/EnglishScoreBelowRequirementBanner';
import EnglishCertificateExpiredBeforeDeadlineBanner from '@components/Banner/EnglishCertificateExpiredBeforeDeadlineBanner';
import { useApplicationStudent } from '@hooks/useApplicationStudent';
import { useAuth } from '@components/AuthProvider';
import Loading from '@components/Loading/Loading';

/**
 * Shared row height on desktop. Fixing it is what lets the cards in a row line
 * up and scroll internally, rather than the tallest one dictating how far down
 * the page everything else gets pushed. Unset on mobile, where a single column
 * should just flow.
 */
const PANEL_HEIGHT = 460;

interface StudentDashboardProps {
    isCoursesFilled: boolean;
}
const StudentDashboard = ({ isCoursesFilled }: StudentDashboardProps) => {
    const { user } = useAuth();
    const { t } = useTranslation();

    const { studentId: stdIdParam } = useParams();
    const studentId =
        user && is_TaiGer_Student(user as IUser) ? user._id : stdIdParam;
    const {
        data: fetchedStudent,
        archiv,
        isLoading: isLoadingApplications
    } = useApplicationStudent(studentId);
    // The prop seeds the view: the hook owns the application data, but falling
    // back to it keeps the panels rendering off the caller's copy if the query
    // resolves empty rather than blanking the dashboard.
    const student = fetchedStudent;

    if (isLoadingApplications) {
        return <Loading />;
    }

    const hasUpcomingAppointment = false;

    return (
        <>
            {archiv ? (
                <Card sx={{ p: 2 }}>
                    <Typography color="red" variant="h5">
                        Status: <b>Close</b> - Your {appConfig.companyName}{' '}
                        Portal Service is terminated.
                    </Typography>
                    <Typography color="red" variant="body1">
                        {t('acctount_deactivated_text', { ns: 'dashboard' })}
                    </Typography>
                </Card>
            ) : null}
            <Grid container spacing={1.5} sx={{ mt: 0 }}>
                {/* Notices live in one bounded strip. Each dismissible alert
                    used to own a full-width row, so a student with several of
                    them pushed the actual dashboard below the fold. The cap
                    scrolls rather than shrinks — alerts keep their normal
                    padding, since a squashed alert nobody can read is worse
                    than one that costs a little height. */}
                <Grid item xs={12}>
                    <Stack
                        spacing={1}
                        sx={{
                            maxHeight: { xs: 'none', md: 200 },
                            overflowY: { xs: 'visible', md: 'auto' },
                            pr: 0.5
                        }}
                    >
                        {student &&
                        needGraduatedApplicantsButStudentNotGraduated(
                            student
                        ) ? (
                            <Card sx={{ border: '2px solid red' }}>
                                <Alert severity="warning">
                                    {t(
                                        'Programs below are only for graduated applicants',
                                        { ns: 'common' }
                                    )}
                                </Alert>
                                {needGraduatedApplicantsPrograms(
                                    student.applications as Application[]
                                )?.map((app) => (
                                    <ListItem
                                        key={app.programId?._id?.toString()}
                                    >
                                        <Link
                                            component={LinkDom}
                                            target="_blank"
                                            to={DEMO.SINGLE_PROGRAM_LINK(
                                                app.programId?._id?.toString() ??
                                                    ''
                                            )}
                                        >
                                            {app.programId?.school}{' '}
                                            {app.programId?.program_name}{' '}
                                            {app.programId?.degree}{' '}
                                            {app.programId?.semester}
                                        </Link>
                                    </ListItem>
                                ))}
                            </Card>
                        ) : null}
                        <ProgramLanguageNotMatchedBanner student={student!} />
                        <EnglishScoreBelowRequirementBanner
                            student={student!}
                        />
                        <EnglishCertificateExpiredBeforeDeadlineBanner
                            student={
                                student as unknown as Record<string, unknown>
                            }
                        />
                    </Stack>
                </Grid>

                {/* Applications and deadlines lead: they are what the student
                    came for. Both rows fix their height on desktop so the cards
                    align and each scrolls internally, instead of the page
                    growing until everything is below the fold. */}
                <Grid
                    item
                    md={8}
                    sx={{ display: 'flex', height: { md: PANEL_HEIGHT } }}
                    xs={12}
                >
                    <MyApplicationsPanel student={student!} />
                </Grid>
                <Grid
                    item
                    md={4}
                    sx={{ display: 'flex', height: { md: PANEL_HEIGHT } }}
                    xs={12}
                >
                    <UpcomingDeadlinesPanel
                        applications={
                            (student?.applications ?? []) as Application[]
                        }
                        studentId={student?._id?.toString() ?? ''}
                    />
                </Grid>

                <Grid item md={8} sx={{ height: { md: PANEL_HEIGHT } }} xs={12}>
                    {/* StudentTaskList owns its own Card, so the scroll cap
                        goes on a wrapper rather than inside it. */}
                    <Box sx={{ height: '100%', overflowY: 'auto', pr: 0.5 }}>
                        <StudentTaskList
                            isCoursesFilled={isCoursesFilled}
                            student={student!}
                        />
                    </Box>
                </Grid>
                <Grid item md={4} sx={{ height: { md: PANEL_HEIGHT } }} xs={12}>
                    <Box sx={{ height: '100%', overflowY: 'auto', pr: 0.5 }}>
                        {appConfig.meetingEnable ? (
                            <Stack spacing={1.5}>
                                <Card sx={{ p: 2 }}>
                                    <Typography
                                        sx={{
                                            alignItems: 'center',
                                            display: 'flex',
                                            gap: 0.5,
                                            mb: 1
                                        }}
                                    >
                                        <EventIcon /> 時段預約
                                    </Typography>
                                    {hasUpcomingAppointment ? null : (
                                        <Typography
                                            sx={{ mb: 1 }}
                                            variant="body2"
                                        >
                                            想要一次密集討論？ 可以預訂顧問
                                            Office hour 時段討論。
                                            <Link
                                                color="inherit"
                                                component={LinkDom}
                                                target="_blank"
                                                to="https://taigerconsultancy-portal.com/docs/search/64fe21bcbc729bc024d14738"
                                            >
                                                {t('Instructions')}
                                                <IconButton>
                                                    <LaunchIcon fontSize="small" />
                                                </IconButton>
                                            </Link>
                                        </Typography>
                                    )}
                                    {student?.agents?.length !== 0 ? (
                                        <Link
                                            color="inherit"
                                            component={LinkDom}
                                            to={`${DEMO.EVENT_STUDENT_STUDENTID_LINK(
                                                student?._id?.toString() ?? ''
                                            )}?tab=timeslots`}
                                            underline="hover"
                                        >
                                            <Button
                                                color="primary"
                                                fullWidth
                                                size="small"
                                                variant="contained"
                                            >
                                                預約
                                            </Button>
                                        </Link>
                                    ) : (
                                        <span className="text-light">
                                            {t('Wait for Agent', {
                                                ns: 'common'
                                            })}
                                        </span>
                                    )}
                                </Card>
                                <PendingEditorReplyCard student={student!} />
                            </Stack>
                        ) : null}
                    </Box>
                </Grid>
            </Grid>
        </>
    );
};

export default StudentDashboard;
