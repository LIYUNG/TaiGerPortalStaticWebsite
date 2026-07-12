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
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { is_TaiGer_AdminAgent } from '@taiger-common/core';

import { getMessagThreadQuery } from '@/api/query';
import ErrorPage from '../../../Utils/ErrorPage';
import DocModificationThreadPage from '../DocModificationThreadPage';
import ProgramDrawer from '@pages/Program/ProgramDrawer';
import { stringAvatar } from '@utils/contants';
import DEMO from '@store/constant';
import { useTranslation } from 'react-i18next';
import Loading from '@components/Loading/Loading';
import { useRef, useState } from 'react';
import { useAuth } from '@components/AuthProvider';

/** Body of GET /api/document-threads/:id (getMessagThreadQuery is untyped). */
interface ThreadQueryResponse {
    data: {
        success: boolean;
        data?: Record<string, unknown>;
        agents?: unknown[];
        conflict_list?: unknown[];
        editors?: unknown[];
        deadline?: unknown;
        threadAuditLog?: unknown[];
        similarThreads?: unknown[];
    };
}

export const EmbeddedThreadComponent = ({
    setThreadId
}: {
    setThreadId?: (threadId: string | null) => void;
}) => {
    const { documentsthreadId } = useParams();
    const theme = useTheme();
    const { user } = useAuth();
    const ismobile = useMediaQuery(theme.breakpoints.down('md'));
    const scrollableRef = useRef(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [programDrawerOpen, setProgramDrawerOpen] = useState(false);
    const { t } = useTranslation();

    const { data, isLoading, error } = useQuery(
        getMessagThreadQuery(documentsthreadId ?? '')
    );

    if (isLoading) {
        return <Loading variant="child" />;
    }
    if (error) {
        return <ErrorPage />;
    }
    const responseData = data as ThreadQueryResponse | undefined;
    const thread = (responseData?.data?.data ?? {}) as Record<string, unknown>;
    const deadline = responseData?.data?.deadline;
    const agents = responseData?.data?.agents;
    const conflict_list = responseData?.data?.conflict_list;
    const editors = responseData?.data?.editors;
    const threadAuditLog = responseData?.data?.threadAuditLog;
    const similarThreads = responseData?.data?.similarThreads;
    const studentId = thread.student_id as Record<string, unknown> | undefined;
    const programId = thread.program_id as Record<string, unknown> | undefined;
    const studentDbId = studentId?._id ? String(studentId._id) : '';
    const studentName = `${studentId?.firstname} ${studentId?.lastname}`;
    const schoolName = programId?.school ? String(programId.school) : '';
    const programName = programId?.program_name
        ? String(programId.program_name)
        : '';
    const file_type = thread.file_type ? String(thread.file_type) : '';
    const programDbId = programId?._id ? String(programId._id) : '';
    return (
        <Box
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
            }}
        >
            <Box
                className="sticky-top"
                sx={{
                    flexShrink: 0,
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
                            onClick={() => setThreadId?.(null)}
                            style={{ marginLeft: '4px' }}
                        >
                            <ArrowBackIcon />
                        </IconButton>
                    ) : null}
                    <Tooltip title={studentName}>
                        <Link
                            component={LinkDom}
                            to={DEMO.STUDENT_DATABASE_STUDENTID_LINK(
                                studentDbId,
                                DEMO.PROFILE_HASH
                            )}
                            underline="none"
                        >
                            <Avatar
                                {...stringAvatar(studentName)}
                                src={
                                    studentId?.pictureUrl
                                        ? String(studentId.pictureUrl)
                                        : undefined
                                }
                            />
                        </Link>
                    </Tooltip>
                    {programId ? (
                        <Box
                            onClick={
                                ismobile && programDbId
                                    ? () => setProgramDrawerOpen(true)
                                    : undefined
                            }
                            sx={{
                                minWidth: 0,
                                ...(ismobile &&
                                    programDbId && {
                                        cursor: 'pointer',
                                        '&:active': { opacity: 0.7 }
                                    })
                            }}
                        >
                            {ismobile ? (
                                <Typography
                                    color="primary"
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
                            ) : (
                                <Link
                                    component={LinkDom}
                                    title={schoolName}
                                    to={DEMO.SINGLE_PROGRAM_LINK(programDbId)}
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
                            )}
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
                <Stack alignItems="center" direction="row" spacing={1}>
                    {/* Thread details — opens the info Drawer on mobile. */}
                    {ismobile ? (
                        <Tooltip
                            title={t('Thread details', {
                                ns: 'common',
                                defaultValue: 'Thread details'
                            })}
                        >
                            <IconButton
                                aria-label="thread details"
                                color="primary"
                                onClick={() => setDetailsOpen(true)}
                                size="small"
                            >
                                <InfoOutlinedIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    ) : null}
                    {user != null && is_TaiGer_AdminAgent(user) ? (
                        <Link
                            color="inherit"
                            component={LinkDom}
                            to={`${DEMO.COMMUNICATIONS_TAIGER_MODE_LINK(
                                studentDbId
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
                    flex: 1,
                    minHeight: 0,
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                <DocModificationThreadPage
                    agents={agents}
                    conflictList={conflict_list}
                    deadline={deadline}
                    detailsOpen={detailsOpen}
                    editors={editors}
                    onCloseDetails={() => setDetailsOpen(false)}
                    scrollableRef={scrollableRef}
                    similarThreads={similarThreads}
                    threadProps={thread}
                    threadauditLog={threadAuditLog}
                />
            </Box>
            {programDbId ? (
                <ProgramDrawer
                    onClose={() => setProgramDrawerOpen(false)}
                    open={programDrawerOpen}
                    programId={programDbId}
                />
            ) : null}
        </Box>
    );
};
