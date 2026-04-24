import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
    Avatar,
    Box,
    Button,
    IconButton,
    Link,
    Stack,
    Tooltip,
    Typography,
    useMediaQuery,
    useTheme
} from '@mui/material';
import { Link as LinkDom } from 'react-router-dom';
import MessageIcon from '@mui/icons-material/Message';
import { is_TaiGer_AdminAgent } from '@taiger-common/core';

import { getMessagThreadQuery } from '@/api/query';
import ErrorPage from '../../../Utils/ErrorPage';
import DocModificationThreadPage from '../DocModificationThreadPage';
import { APP_BAR_HEIGHT, stringAvatar } from '@utils/contants';
import DEMO from '@store/constant';
import { useTranslation } from 'react-i18next';
import Loading from '@components/Loading/Loading';
import { useRef } from 'react';
import { useAuth } from '@components/AuthProvider';
import {
    GetMessagesThreadResponse,
    IProgramWithId,
    IStudentResponseDef
} from '@taiger-common/model';

export const EmbeddedThreadComponent = ({
    setThreadId
}: {
    setThreadId: (threadId: string | null) => void;
}) => {
    const { documentsthreadId } = useParams();
    const theme = useTheme();
    const { user } = useAuth();
    const ismobile = useMediaQuery(theme.breakpoints.down('md'));
    const scrollableRef = useRef(null);
    const { t } = useTranslation();

    const { data, isLoading, error } = useQuery<GetMessagesThreadResponse>(
        getMessagThreadQuery(documentsthreadId ?? '')
    );

    if (isLoading) {
        return <Loading variant="child" />;
    }
    if (error) {
        return <ErrorPage />;
    }
    const response = data?.data as unknown as GetMessagesThreadResponse;
    const thread = response.data;
    const deadline = response.deadline;
    const agents = response.agents;
    const conflict_list = response.conflict_list;
    const editors = response.editors;
    const threadAuditLog = response.threadAuditLog;
    const similarThreads = response.similarThreads;
    const student = thread?.student_id as IStudentResponseDef;
    const studentName = `${student?.firstname} ${student?.lastname}`;
    const program = thread?.program_id as IProgramWithId;
    const schoolName = program?.school;
    const programName = program?.program_name;
    const file_type = thread?.file_type;
    return (
        <>
            <Box
                className="sticky-top"
                sx={{
                    my: 1,
                    justifyContent: 'space-between',
                    display: 'flex',
                    overflow: 'hidden' // Prevents components from expanding too much
                }}
            >
                <Stack
                    alignItems="center"
                    direction="row"
                    spacing={0}
                    sx={{ minWidth: 0, flexShrink: 1, overflow: 'hidden' }} // Prevents breaking layout
                >
                    {ismobile ? (
                        <IconButton
                            aria-label="open drawer"
                            color="inherit"
                            edge="start"
                            onClick={() => setThreadId(null)}
                            style={{ marginLeft: '4px' }}
                        >
                            <ArrowBackIcon />
                        </IconButton>
                    ) : null}
                    <Tooltip title={studentName}>
                        <Link
                            component={LinkDom}
                            to={DEMO.STUDENT_DATABASE_STUDENTID_LINK(
                                student?._id,
                                DEMO.PROFILE_HASH
                            )}
                            underline="none"
                        >
                            <Avatar
                                {...stringAvatar(studentName)}
                                src={student?.pictureUrl}
                            />
                        </Link>
                    </Tooltip>
                    {program ? (
                        <Box>
                            <Link
                                component={LinkDom}
                                title={schoolName}
                                to={DEMO.SINGLE_PROGRAM_LINK(program?._id)}
                            >
                                <Typography
                                    fontWeight="bold"
                                    sx={{
                                        ml: 1,
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        display: 'block',
                                        textOverflow: 'ellipsis'
                                    }}
                                    variant="body1"
                                >
                                    {schoolName}
                                </Typography>
                            </Link>
                            <Typography
                                fontWeight="bold"
                                sx={{
                                    ml: 1,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    display: 'block',
                                    textOverflow: 'ellipsis'
                                }}
                                variant="body2"
                            >
                                {programName} - {file_type}
                            </Typography>
                        </Box>
                    ) : (
                        <Typography
                            fontWeight="bold"
                            sx={{ mx: 1 }}
                            variant="body1"
                        >
                            {file_type}
                        </Typography>
                    )}
                </Stack>
                <Stack alignItems="center" direction="row" spacing={2}>
                    {is_TaiGer_AdminAgent(user) ? (
                        <Link
                            color="inherit"
                            component={LinkDom}
                            sx={{ mr: 1 }}
                            to={`${DEMO.COMMUNICATIONS_TAIGER_MODE_LINK(
                                student?._id
                            )}`}
                            underline="hover"
                        >
                            <Button
                                color="primary"
                                size="small"
                                startIcon={<MessageIcon />}
                                variant="contained"
                            >
                                <b>{t('Message', { ns: 'common' })}</b>
                            </Button>
                        </Link>
                    ) : null}
                    <Button
                        color="primary"
                        component={LinkDom}
                        size="small"
                        to={`/document-modification/${documentsthreadId}`}
                        variant="contained"
                    >
                        {t('Switch View', { ns: 'common' })}
                    </Button>
                </Stack>
            </Box>
            <Box
                sx={{
                    height: `calc(100vh - ${APP_BAR_HEIGHT + APP_BAR_HEIGHT}px)`, // Subtract header
                    overflowY: 'auto'
                }}
            >
                <DocModificationThreadPage
                    agents={agents}
                    conflictList={conflict_list}
                    deadline={deadline}
                    editors={editors}
                    scrollableRef={scrollableRef}
                    similarThreads={similarThreads}
                    threadProps={thread}
                    threadauditLog={threadAuditLog}
                />
            </Box>
        </>
    );
};
