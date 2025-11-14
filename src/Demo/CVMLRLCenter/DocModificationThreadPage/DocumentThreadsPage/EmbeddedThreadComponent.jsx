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

import { getMessagThreadQuery } from '../../../../api/query';
import ErrorPage from '../../../Utils/ErrorPage';
import DocModificationThreadPage from '../DocModificationThreadPage';
import { APP_BAR_HEIGHT, stringAvatar } from '../../../../utils/contants';
import DEMO from '../../../../store/constant';
import { useTranslation } from 'react-i18next';
import ChildLoading from '../../../../components/Loading/ChildLoading';
import { useRef } from 'react';

export const EmbeddedThreadComponent = ({ setThreadId }) => {
    const { documentsthreadId } = useParams();
    const theme = useTheme();
    const ismobile = useMediaQuery(theme.breakpoints.down('md'));
    const scrollableRef = useRef(null);
    const { t } = useTranslation();

    const { data, isLoading, error } = useQuery(
        getMessagThreadQuery(documentsthreadId)
    );

    if (isLoading) {
        return <ChildLoading />;
    }
    if (error) {
        return <ErrorPage />;
    }
    const thread = data.data?.data;
    const deadline = data.data?.deadline;
    const agents = data.data?.agents;
    const conflict_list = data.data?.conflict_list;
    const editors = data.data?.editors;
    const threadAuditLog = data.data?.threadAuditLog;
    const similarThreads = data.data?.similarThreads;
    const studentName = `${thread.student_id.firstname} ${thread.student_id.lastname}`;
    const schoolName = thread.program_id?.school;
    const programName = thread.program_id?.program_name;
    const file_type = thread.file_type;
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
                                thread.student_id._id,
                                DEMO.PROFILE_HASH
                            )}
                            underline="none"
                        >
                            <Avatar
                                {...stringAvatar(studentName)}
                                src={thread.student_id?.pictureUrl}
                            />
                        </Link>
                    </Tooltip>
                    {thread.program_id ? (
                        <Box>
                            <Link
                                component={LinkDom}
                                title={schoolName}
                                to={DEMO.SINGLE_PROGRAM_LINK(
                                    thread.program_id._id
                                )}
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
