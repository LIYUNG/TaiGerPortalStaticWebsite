import { useState, useEffect, Fragment } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { useQuery } from '@tanstack/react-query';
import {
    Box,
    Checkbox,
    Divider,
    InputBase,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Grid,
    Typography,
    Stack,
    useTheme,
    useMediaQuery,
    Drawer,
    IconButton,
    Chip
} from '@mui/material';
import {
    Search as SearchIcon,
    FiberManualRecord as FiberManualRecordIcon
} from '@mui/icons-material';

import { useAuth } from '../../../../components/AuthProvider';
import { is_TaiGer_role } from '@taiger-common/core';
import DEMO from '../../../../store/constant';
import {
    FILE_OK_SYMBOL,
    FILE_MISSING_SYMBOL,
    convertDateUXFriendly,
    APP_BAR_HEIGHT
} from '../../../../utils/contants';
import {
    getMyStudentThreadMetrics,
    getThreadsByStudent
} from '../../../../api';
import { EmbeddedThreadComponent } from './EmbeddedThreadComponent';
import ChildLoading from '../../../../components/Loading/ChildLoading';
import { APPROVAL_COUNTRIES } from '../../../Utils/checking-functions';
import { useTranslation } from 'react-i18next';

const categories = {
    General: [
        'CV',
        'Recommendation_Letter_A',
        'Recommendation_Letter_B',
        'Recommendation_Letter_C'
    ],
    RL: ['RL_A', 'RL_B', 'RL_C'],
    ML: ['ML'],
    Essay: ['Essay'],
    Others: [
        'Interview',
        'Others',
        'Internship_Form',
        'Scholarship_Form',
        'Portfolio'
    ],
    Agents: ['Supplementary_Form', 'Curriculum_Analysis']
};

const getCategory = (fileType) => {
    for (const [category, types] of Object.entries(categories)) {
        if (types.includes(fileType)) {
            return category;
        }
    }
    return 'Others'; // Default category if not found
};

const getStudentMetricsQuery = () => ({
    queryKey: ['myStudentThreadMetrics'],
    queryFn: async () => {
        // await new Promise((resolve) => setTimeout(resolve, 10000));
        return await getMyStudentThreadMetrics();
    },
    staleTime: 1000 * 60, // 1 minutes
    cacheTime: 10 * 60 * 1000 // 10 minutes
});

const getThreadByStudentQuery = (studentId) => ({
    queryKey: ['threadsByStudent', studentId],
    queryFn: async () => {
        // await new Promise((resolve) => setTimeout(resolve, 10000));
        return await getThreadsByStudent(studentId);
    },
    enabled: !!studentId,
    staleTime: 1000 * 60, // 1 minutes
    cacheTime: 10 * 60 * 1000 // 10 minutes
});

const StudentItem = ({ student, selectedStudentId, onClick }) => {
    const theme = useTheme();
    const isStudentComplete =
        student?.threadCount === student?.completeThreadCount;
    const highlightItem = !isStudentComplete && student.needToReply;
    return (
        <ListItem
            disablePadding
            sx={{
                py: 1,
                backgroundColor: !highlightItem
                    ? theme.palette.background.default
                    : theme.palette.action.disabled,
                '&:hover': {
                    backgroundColor: theme.palette.action.hover // Set a different color on hover if needed
                },
                transition: 'background-color 0.3s ease-in-out',
                color: !highlightItem
                    ? theme.palette.text.primary
                    : theme.palette.text.secondary,
                width: '100%'
            }}
        >
            <ListItemButton onClick={onClick} sx={{ paddingY: 0 }}>
                <Stack
                    alignItems="center"
                    direction="row"
                    spacing={1}
                    sx={{ width: '100%' }}
                >
                    {isStudentComplete ? FILE_OK_SYMBOL : FILE_MISSING_SYMBOL}
                    <ListItemText
                        primary={
                            <Typography
                                style={{
                                    fontWeight:
                                        student?._id?.toString() ===
                                        selectedStudentId?.toString()
                                            ? 900
                                            : 'normal'
                                }}
                                variant="body1"
                            >
                                {`${student.firstname} ${student.lastname}`}
                            </Typography>
                        }
                        secondary={`
                            ${student?.completeThreadCount}/${student?.threadCount}
                            (${student?.application_preference?.expected_application_date || '-'}
                            ${student?.application_preference?.expected_application_semester || '-'})`}
                    />
                    {highlightItem ? (
                        <FiberManualRecordIcon
                            fontSize="tiny"
                            title="Not Reply Yet"
                        />
                    ) : null}
                </Stack>
            </ListItemButton>
        </ListItem>
    );
};

const ThreadItem = ({ thread, onClick }) => {
    const theme = useTheme();
    const { t } = useTranslation();
    const isFinal = thread?.isFinalVersion;
    const programName = thread?.program_id
        ? `${thread?.program_id?.school} - ${thread?.program_id?.program_name}`
        : '';
    const notRepliedByUser =
        thread.messages?.[0]?.user_id?._id === thread?.student_id;
    const highlightItem = !isFinal && notRepliedByUser;

    // Check if program is from non-approval country
    const programCountry = thread?.program_id?.country;
    const isNonApprovalCountry = programCountry
        ? !APPROVAL_COUNTRIES.includes(String(programCountry).toLowerCase())
        : false;

    return (
        <ListItem
            disablePadding
            sx={{
                backgroundColor: !highlightItem
                    ? theme.palette.background.default
                    : theme.palette.action.disabled,
                '&:hover': {
                    backgroundColor: theme.palette.action.hover // Set a different color on hover if needed
                },
                transition: 'background-color 0.3s ease-in-out',
                color: !highlightItem
                    ? theme.palette.text.primary
                    : theme.palette.text.secondary,
                width: '100%'
            }}
        >
            <ListItemButton
                onClick={onClick}
                sx={{ paddingY: 0 }}
                title={`${programName} - ${convertDateUXFriendly(thread.updatedAt)}`}
            >
                <Stack
                    alignItems="center"
                    direction="row"
                    spacing={1}
                    sx={{ width: '100%' }}
                >
                    {isFinal ? FILE_OK_SYMBOL : FILE_MISSING_SYMBOL}
                    <ListItemText
                        primary={
                            <Typography
                                sx={{
                                    fontStyle: isFinal ? 'italic' : 'normal',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                }}
                            >
                                {`${thread.file_type} - ${convertDateUXFriendly(thread.updatedAt)}`}
                            </Typography>
                        }
                        secondary={
                            <Stack
                                alignItems="center"
                                direction="row"
                                spacing={0.5}
                            >
                                {thread?.program_id ? (
                                    <Typography
                                        sx={{
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis'
                                        }}
                                        variant="body2"
                                    >
                                        {programName}
                                    </Typography>
                                ) : null}
                                {isNonApprovalCountry ? (
                                    <Chip
                                        color="warning"
                                        label={t('Lack of experience country', {
                                            ns: 'common'
                                        })}
                                        size="small"
                                        variant="outlined"
                                    />
                                ) : null}
                            </Stack>
                        }
                    />

                    {highlightItem ? (
                        <FiberManualRecordIcon
                            fontSize="tiny"
                            title="Not Reply Yet"
                        />
                    ) : null}
                </Stack>
            </ListItemButton>
        </ListItem>
    );
};

const StudentsList = ({
    students,
    studentId,
    handleOnClickStudent,
    studentMetricsIsLoading,
    setStudentSearchTerm,
    studentSearchTerm
}) => {
    return studentMetricsIsLoading ? (
        <ChildLoading />
    ) : (
        <>
            <Stack alignItems="center" direction="row" spacing={1}>
                <SearchIcon />
                <InputBase
                    onChange={(e) => setStudentSearchTerm(e.target.value)}
                    value={studentSearchTerm}
                />
            </Stack>
            <List>
                {students
                    ?.filter((student) => {
                        return (
                            `${student?.firstname} ${student?.lastname}`
                                .toLowerCase()
                                .includes(studentSearchTerm.toLowerCase()) ||
                            `${student?.application_preference?.expected_application_semester}`?.includes(
                                String(studentSearchTerm)
                            ) ||
                            `${student?.application_preference?.expected_application_date}`?.includes(
                                String(studentSearchTerm)
                            )
                        );
                    })
                    ?.sort((a, b) => {
                        const isAcompleted =
                            a.threadCount === a.completeThreadCount;
                        const isBcompleted =
                            b.threadCount === b.completeThreadCount;
                        if (a.needToReply !== b.needToReply) {
                            return a.needToReply ? -1 : 1;
                        }
                        if (isAcompleted !== isBcompleted) {
                            return isAcompleted ? 1 : -1;
                        }
                        return a.firstname.localeCompare(b.firstname);
                    })
                    ?.map((student) => (
                        <StudentItem
                            key={student._id}
                            onClick={() => {
                                handleOnClickStudent(student._id);
                                window.scrollTo({
                                    top: 0,
                                    behavior: 'smooth'
                                });
                            }}
                            selectedStudentId={studentId}
                            student={student}
                        />
                    ))}
            </List>
        </>
    );
};

const ThreadsList = ({
    studentThreadIsLoading,
    showAllThreads,
    sortedThreads,
    onChange,
    currentCategory,
    handleOnClickThread
}) => {
    return (
        <Box>
            {studentThreadIsLoading ? <ChildLoading /> : null}
            <Checkbox
                checked={showAllThreads}
                disabled={sortedThreads.every(
                    (thread) => thread?.isFinalVersion
                )}
                onChange={() => onChange(!showAllThreads)}
            />{' '}
            Show completed threads
            <List>
                {sortedThreads
                    ?.filter(
                        (thread) => showAllThreads || !thread?.isFinalVersion
                    )
                    ?.map((thread) => {
                        const category = getCategory(thread.file_type);
                        const showCategoryLabel = category !== currentCategory;
                        currentCategory = category;

                        return (
                            <Fragment key={thread._id}>
                                {showCategoryLabel ? (
                                    <Divider
                                        sx={{
                                            paddingX: 3,
                                            paddingY: 1
                                        }}
                                        textAlign="center"
                                    >
                                        {category}
                                    </Divider>
                                ) : null}
                                <ThreadItem
                                    onClick={() => {
                                        handleOnClickThread(thread._id);
                                    }}
                                    thread={thread}
                                />
                            </Fragment>
                        );
                    })}
            </List>
        </Box>
    );
};

const DocumentCommunicationExpandPage = () => {
    const { documentsthreadId } = useParams();
    const theme = useTheme();
    const ismobile = useMediaQuery(theme.breakpoints.down('md'));
    const navigate = useNavigate();

    const { user } = useAuth();
    const [showAllThreads, setShowAllThreads] = useState(true);
    const [studentId, setStudentId] = useState(null);
    const [studentName, setStudentName] = useState(null);
    const [threadId, setThreadId] = useState(documentsthreadId || null);
    const [studentSearchTerm, setStudentSearchTerm] = useState('');

    const {
        data: studentMetricsData,
        isLoading: studentMetricsIsLoading,
        isError: studentMetricsIsError,
        error: studentMetricsError
    } = useQuery(getStudentMetricsQuery());

    const { students = [] } = studentMetricsData?.data?.data || {};

    const { data: studentThreadsData, isLoading: studentThreadIsLoading } =
        useQuery(getThreadByStudentQuery(studentId));
    const studentThreads = studentThreadsData?.data?.threads || [];
    useEffect(() => {
        if (!threadId) {
            return;
        }
        navigate(`/doc-communications/${threadId}`, { replace: true });
        // get student id by thread id

        const student = students?.find((student) =>
            student?.threads?.includes(threadId)
        );
        const {
            _id: studentId = null,
            firstname = '',
            lastname = ''
        } = student || { _id: '', firstname: '', lastname: '' };
        setStudentId(studentId);
        setStudentName(`${firstname} ${lastname}`);
    }, [students, threadId, navigate]);

    useEffect(() => {
        if (!studentId) {
            return;
        }
        // const firstThreadId = students?.find(
        //     (student) => student._id === studentId
        // )?.threads?.[0];
        // setThreadId(firstThreadId);
    }, [studentId]);

    const handleOnClickStudent = (id) => {
        if (id === studentId) {
            return;
        }
        setStudentId(id);
        setThreadId(null);
    };

    const handleOnClickThread = (id) => {
        setThreadId(id);
    };

    const sortedThreads = studentThreads
        ?.filter((thread) => thread?.student_id?._id.toString() === studentId)
        ?.sort((a, b) => {
            const categoryA = getCategory(a.file_type);
            const categoryB = getCategory(b.file_type);
            if (categoryA === categoryB) {
                if (a.file_type === b.file_type) {
                    // Sort by isFinalVersion, false first then true
                    return a.isFinalVersion - b.isFinalVersion;
                }
                return a.file_type.localeCompare(b.file_type);
            }
            return (
                Object.keys(categories).indexOf(categoryA) -
                Object.keys(categories).indexOf(categoryB)
            );
        });

    const currentCategory = '';

    if (!is_TaiGer_role(user)) {
        return <Navigate to={`${DEMO.DASHBOARD_LINK}`} />;
    }

    if (studentMetricsIsError) {
        return studentMetricsError;
    }

    return (
        <Box
            style={{
                marginLeft: '-24px',
                marginRight: '-18px',
                marginTop: '-24px',
                marginBottom: '-24px'
            }}
        >
            {!ismobile ? (
                <Grid container spacing={0}>
                    <Grid
                        item
                        md="auto"
                        sx={{
                            maxHeight: `calc(100vh - ${APP_BAR_HEIGHT}px)`,
                            overflowY: 'auto',
                            display: { xs: 'none', md: 'flex' },
                            flexShrink: 0 // Prevents shrinking too much
                        }}
                        xs={12}
                    >
                        <Box
                            sx={{
                                maxWidth: '300px' // Responsive width
                            }}
                        >
                            <StudentsList
                                handleOnClickStudent={handleOnClickStudent}
                                setStudentSearchTerm={setStudentSearchTerm}
                                studentId={studentId}
                                studentMetricsIsLoading={
                                    studentMetricsIsLoading
                                }
                                studentSearchTerm={studentSearchTerm}
                                students={students}
                            />
                        </Box>
                    </Grid>
                    <Grid
                        item
                        md="auto"
                        sx={{
                            maxHeight: `calc(100vh - ${APP_BAR_HEIGHT}px)`,
                            overflowY: 'auto',
                            display: { xs: 'none', md: 'flex' },
                            flexShrink: 0, // Prevents shrinking too much
                            minWidth: '220px' // Ensures sidebar stays readable
                        }}
                        xs={12}
                    >
                        <Box
                            sx={{
                                maxWidth: '240px'
                            }}
                        >
                            <ThreadsList
                                currentCategory={currentCategory}
                                handleOnClickThread={handleOnClickThread}
                                onChange={setShowAllThreads}
                                showAllThreads={showAllThreads}
                                sortedThreads={sortedThreads}
                                studentThreadIsLoading={studentThreadIsLoading}
                            />
                        </Box>
                    </Grid>
                    {threadId ? (
                        <Grid
                            item
                            md
                            sx={{
                                flexGrow: 1, // Takes up remaining space
                                minWidth: 0 // Prevents it from forcing wrap
                            }}
                        >
                            <EmbeddedThreadComponent />
                        </Grid>
                    ) : null}
                </Grid>
            ) : null}
            {ismobile ? (
                <>
                    <StudentsList
                        handleOnClickStudent={handleOnClickStudent}
                        setStudentSearchTerm={setStudentSearchTerm}
                        studentId={studentId}
                        studentMetricsIsLoading={studentMetricsIsLoading}
                        studentSearchTerm={studentSearchTerm}
                        students={students}
                    />

                    <Drawer
                        anchor="right"
                        open={studentId ? true : false}
                        sx={{
                            flexShrink: 0,
                            '& .MuiDrawer-paper': {
                                width: '100%', // Make Drawer full width on small screens
                                maxWidth: '100vw'
                            }
                        }}
                        variant="temporary"
                    >
                        <Box
                            className="sticky-top"
                            sx={{
                                my: 1,
                                display: 'flex'
                            }}
                        >
                            <Stack
                                alignItems="center"
                                direction="row"
                                spacing={1}
                            >
                                <IconButton
                                    aria-label="open drawer"
                                    color="inherit"
                                    edge="start"
                                    onClick={() => setStudentId(null)}
                                    style={{ marginLeft: '4px' }}
                                >
                                    <ArrowBackIcon />
                                </IconButton>
                                <Typography>{studentName}</Typography>
                            </Stack>
                        </Box>
                        <Box
                            sx={{
                                height: `calc(100vh - ${APP_BAR_HEIGHT}px)`, // Subtract header
                                overflowY: 'auto'
                            }}
                        >
                            <ThreadsList
                                currentCategory={currentCategory}
                                handleOnClickThread={handleOnClickThread}
                                onChange={setShowAllThreads}
                                showAllThreads={showAllThreads}
                                sortedThreads={sortedThreads}
                                studentThreadIsLoading={studentThreadIsLoading}
                            />
                        </Box>
                    </Drawer>
                    <Drawer
                        anchor="right"
                        data-testid="navbar_drawer_component"
                        open={studentId && threadId ? true : false}
                        sx={{
                            flexShrink: 0,
                            '& .MuiDrawer-paper': {
                                width: '100%', // Make Drawer full width on small screens
                                maxWidth: '100vw'
                            }
                        }}
                        variant="temporary"
                    >
                        <EmbeddedThreadComponent setThreadId={setThreadId} />
                    </Drawer>
                </>
            ) : null}
        </Box>
    );
};

export default DocumentCommunicationExpandPage;
