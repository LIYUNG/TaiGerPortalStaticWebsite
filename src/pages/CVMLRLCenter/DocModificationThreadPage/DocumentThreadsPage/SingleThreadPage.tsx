import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link as LinkDom, useParams } from 'react-router-dom';
import {
    Avatar,
    Box,
    Button,
    IconButton,
    Link,
    Tooltip,
    Typography,
    useMediaQuery,
    useTheme
} from '@mui/material';
import { is_TaiGer_AdminAgent, is_TaiGer_Student } from '@taiger-common/core';
import type { IUser } from '@taiger-common/model';
import { useTranslation } from 'react-i18next';
import MessageIcon from '@mui/icons-material/Message';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

import { getMessagThreadQuery } from '@/api/query';
import Loading from '@components/Loading/Loading';
import DocModificationThreadPage from '../DocModificationThreadPage';
import ErrorPage from '../../../Utils/ErrorPage';
import DEMO from '@store/constant';
import { APP_BAR_HEIGHT, stringAvatar } from '@utils/contants';
import { appConfig } from '../../../../config';
import { BreadcrumbsNavigation } from '@components/BreadcrumbsNavigation/BreadcrumbsNavigation';
import { useAuth } from '@components/AuthProvider';
import ProgramDrawer from '@pages/Program/ProgramDrawer';

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

const SingleThreadPage = () => {
    const { documentsthreadId } = useParams();
    const { user } = useAuth();
    const { t } = useTranslation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [programDrawerOpen, setProgramDrawerOpen] = useState(false);
    const { data, isLoading, error } = useQuery(
        getMessagThreadQuery(documentsthreadId ?? '')
    );

    if (isLoading) {
        return <Loading />;
    }
    const responseData = data as ThreadQueryResponse | undefined;
    if (error || !responseData?.data?.success) {
        return <ErrorPage res_status={404} />;
    }
    const thread = responseData.data?.data as Record<string, unknown>;
    const agents = responseData.data?.agents;
    const conflict_list = responseData.data?.conflict_list;
    const editors = responseData.data?.editors;
    const deadline = responseData.data?.deadline;
    const threadAuditLog = responseData.data?.threadAuditLog;
    const similarThreads = responseData.data?.similarThreads;

    const studentId = thread?.student_id as Record<string, unknown> | undefined;
    const student_name = `${studentId?.firstname ?? ''} ${studentId?.lastname ?? ''}`;
    const studentAvatar = stringAvatar(student_name);
    // const student_name_zh = `${studentId?.lastname_chinese}${studentId?.firstname_chinese}`;
    const programId = thread?.program_id as Record<string, unknown> | undefined;
    const programDbId = programId?._id ? String(programId._id) : '';
    const fileType = String(thread?.file_type ?? '');
    const school = programId?.school ? String(programId.school) : '';
    const degree = programId?.degree ? String(programId.degree) : '';
    const programName = programId?.program_name
        ? String(programId.program_name)
        : '';
    // Desktop breadcrumb label.
    const docName = programId
        ? `${school} - ${degree} - ${programName} ${fileType}`
        : fileType;
    // Mobile title: school on the first line, file type · degree · program on
    // the second (mirrors the /doc-communications header).
    const titleLine1 = programId ? school : fileType;
    const titleLine2 = programId
        ? `${fileType} - ${degree} - ${programName}`
        : '';

    return (
        <Box
            sx={{
                // Cancel the app's <Main> padding so the thread is full-bleed,
                // and bound the height so the tabs/header stay fixed while only
                // the message list scrolls (matches the /doc-communications view).
                marginLeft: '-24px',
                marginRight: '-18px',
                marginTop: '-24px',
                marginBottom: '-24px',
                height: `calc(100vh - ${APP_BAR_HEIGHT}px)`,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
            }}
        >
            <Box
                sx={{
                    flexShrink: 0,
                    alignItems: 'center',
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 1,
                    px: 2,
                    py: 1,
                    borderBottom: 1,
                    borderColor: 'divider'
                }}
            >
                {/* Student avatar — links to the student profile page. */}
                <Tooltip title={student_name}>
                    <Link
                        component={LinkDom}
                        sx={{ flexShrink: 0, display: 'inline-flex' }}
                        to={DEMO.STUDENT_DATABASE_STUDENTID_LINK(
                            String(studentId?._id ?? ''),
                            DEMO.PROFILE_HASH
                        )}
                        underline="none"
                    >
                        <Avatar
                            src={studentId?.pictureUrl as string | undefined}
                            sx={{ ...studentAvatar.sx, width: 36, height: 36 }}
                        >
                            {studentAvatar.children}
                        </Avatar>
                    </Link>
                </Tooltip>
                {isMobile ? (
                    /* Mobile: a compact two-line title replaces the breadcrumb.
                       When a program exists, tapping it opens the program Drawer. */
                    <Box
                        onClick={
                            programDbId
                                ? () => setProgramDrawerOpen(true)
                                : undefined
                        }
                        sx={{
                            minWidth: 0,
                            flex: 1,
                            overflow: 'hidden',
                            ...(programDbId && {
                                cursor: 'pointer',
                                '&:active': { opacity: 0.7 }
                            })
                        }}
                    >
                        <Tooltip title={titleLine1}>
                            <Typography
                                color={programDbId ? 'primary' : undefined}
                                fontWeight="bold"
                                noWrap
                                variant="body2"
                            >
                                {titleLine1}
                            </Typography>
                        </Tooltip>
                        {titleLine2 ? (
                            <Tooltip title={titleLine2}>
                                <Typography
                                    color="text.secondary"
                                    noWrap
                                    sx={{ display: 'block' }}
                                    variant="caption"
                                >
                                    {titleLine2}
                                </Typography>
                            </Tooltip>
                        ) : null}
                    </Box>
                ) : (
                    /* Desktop: breadcrumb on a single truncating line. */
                    <Box
                        sx={{
                            minWidth: 0,
                            flex: 1,
                            overflow: 'hidden',
                            '& .MuiBreadcrumbs-ol': { flexWrap: 'nowrap' },
                            '& .MuiBreadcrumbs-li': {
                                minWidth: 0,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }
                        }}
                    >
                        <BreadcrumbsNavigation
                            items={[
                                {
                                    label: appConfig.companyName,
                                    link: DEMO.DASHBOARD_LINK
                                },
                                {
                                    label: student_name,
                                    link: DEMO.STUDENT_DATABASE_STUDENTID_LINK(
                                        String(studentId?._id ?? ''),
                                        DEMO.CVMLRL_HASH
                                    )
                                },
                                {
                                    label: docName
                                }
                            ]}
                        />
                    </Box>
                )}
                <Box
                    sx={{
                        display: 'flex',
                        flexShrink: 0,
                        alignItems: 'center',
                        gap: 1
                    }}
                >
                    {/* Thread details — opens the info Drawer on mobile. */}
                    {isMobile ? (
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
                    {!is_TaiGer_Student(user as IUser) ? (
                        <>
                            {is_TaiGer_AdminAgent(user as IUser) ? (
                                isMobile ? (
                                    <Tooltip
                                        title={t('Message', { ns: 'common' })}
                                    >
                                        <IconButton
                                            color="primary"
                                            component={LinkDom}
                                            size="small"
                                            to={`${DEMO.COMMUNICATIONS_TAIGER_MODE_LINK(
                                                String(studentId?._id ?? '')
                                            )}`}
                                        >
                                            <MessageIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                ) : (
                                    <Button
                                        color="primary"
                                        component={LinkDom}
                                        size="small"
                                        startIcon={<MessageIcon />}
                                        to={`${DEMO.COMMUNICATIONS_TAIGER_MODE_LINK(
                                            String(studentId?._id ?? '')
                                        )}`}
                                        variant="contained"
                                    >
                                        {t('Message', { ns: 'common' })}
                                    </Button>
                                )
                            ) : null}
                            {isMobile ? (
                                <Tooltip
                                    title={t('Switch View', { ns: 'common' })}
                                >
                                    <IconButton
                                        color="primary"
                                        component={LinkDom}
                                        size="small"
                                        to={`/doc-communications/${documentsthreadId}`}
                                    >
                                        <SwapHorizIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            ) : (
                                <Button
                                    color="primary"
                                    component={LinkDom}
                                    size="small"
                                    startIcon={<SwapHorizIcon />}
                                    to={`/doc-communications/${documentsthreadId}`}
                                    variant="contained"
                                >
                                    {t('Switch View', { ns: 'common' })}
                                </Button>
                            )}
                        </>
                    ) : null}
                </Box>
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
                    fillHeight
                    onCloseDetails={() => setDetailsOpen(false)}
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

export default SingleThreadPage;
