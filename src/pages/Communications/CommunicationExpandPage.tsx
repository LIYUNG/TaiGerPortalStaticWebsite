import React, { useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link as LinkDom, Navigate, useParams } from 'react-router-dom';
import {
    Avatar,
    Box,
    Grid,
    Typography,
    ListItem,
    useMediaQuery,
    useTheme,
    Drawer,
    IconButton,
    CircularProgress,
    Menu,
    Link,
    Stack,
    Tooltip,
    MenuItem
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import { is_TaiGer_role } from '@taiger-common/core';
import type {
    IStudentResponse,
    IAgentWithId,
    IEditorWithId
} from '@taiger-common/model';

import { WidgetExportMessagePDF } from '@/api';
import { TabTitle } from '../Utils/TabTitle';
import DEMO from '@store/constant';
import { useAuth } from '@components/AuthProvider';
import Loading from '@components/Loading/Loading';
import {
    convertDate,
    convertDateUXFriendly,
    stringAvatar
} from '@utils/contants';
import ChatList from '@components/ChatList';
import { FetchStudentLayer } from '../StudentDatabase/FetchStudentLayer';
import CommunicationExpandPageMessagesComponent from './CommunicationExpandPageMessagesComponent';
import { truncateText } from '../Utils/util_functions';
import { getCommunicationQuery } from '@/api/query';
import ChildLoading from '@components/Loading/ChildLoading';

interface StudentDetailModalProps {
    open: boolean;
    anchorStudentDetailEl: HTMLElement | null;
    dropdownId: string;
    handleStudentDetailModalClose: (event: React.SyntheticEvent) => void;
}

interface AgentsEditorsModalProps {
    open: boolean;
    student: IStudentResponse | undefined;
    agentsEditorsDropdownId: string;
    anchorAgentsEditorsEl: HTMLElement | null;
    handleAgentsEditorsStudentDetailModalClose: (
        event: React.SyntheticEvent
    ) => void;
}

interface DateProps {
    date: string | Date;
}

interface TopBarProps {
    isLoading: boolean;
    isExportingMessageDisabled: boolean;
    ismobile: boolean;
    handleDrawerClose: () => void;
    student: IStudentResponse;
    student_name_english: string | false;
    student_id: string | undefined;
    agentsEditorsDropdownId: string;
    handleAgentsEditorsModalOpen: (
        event: React.MouseEvent<HTMLElement>
    ) => void;
    handleExportMessages: (event: React.MouseEvent<HTMLElement>) => void;
    dropdownId: string;
    handleStudentDetailModalOpen: (
        event: React.MouseEvent<HTMLElement>
    ) => void;
    handleAgentsEditorsModalClose: (event: React.SyntheticEvent) => void;
    isAgentsEditorsModalOpen: boolean;
}

const StudentDetailModal = ({
    open,
    anchorStudentDetailEl,
    dropdownId,
    handleStudentDetailModalClose
}: StudentDetailModalProps) => (
    <Menu
        anchorEl={anchorStudentDetailEl}
        anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
        id={dropdownId}
        onClose={handleStudentDetailModalClose}
        open={open}
        sx={{
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            height: window.innerHeight
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
    >
        <ListItem sx={{ py: 1 }}>
            <Box
                alignItems="center"
                display="flex"
                justifyContent="space-between"
            >
                <Box>
                    <FetchStudentLayer />
                </Box>
            </Box>
        </ListItem>
    </Menu>
);

const AgentsEditorsModal = ({
    open,
    student,
    agentsEditorsDropdownId,
    anchorAgentsEditorsEl,
    handleAgentsEditorsStudentDetailModalClose
}: AgentsEditorsModalProps) => (
    <Menu
        anchorEl={anchorAgentsEditorsEl}
        anchorOrigin={{ horizontal: 'right', vertical: 60 }}
        id={agentsEditorsDropdownId}
        onClose={handleAgentsEditorsStudentDetailModalClose}
        open={open}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
    >
        {student?.agents?.map((agent: IAgentWithId) => (
            <MenuItem key={agent._id}>
                {agent.firstname} {agent.lastname}
            </MenuItem>
        ))}
        {student?.editors?.map((editor: IEditorWithId) => (
            <MenuItem key={editor._id}>
                {editor.firstname} {editor.lastname}
            </MenuItem>
        ))}
    </Menu>
);

const MemorizedStudentDetailModal = React.memo(StudentDetailModal);

const LastLoginRelativeTime = ({ date }: DateProps) => {
    return <>{convertDateUXFriendly(date)}</>;
};

const LastLoginAbsoluteTime = ({ date }: DateProps) => {
    return <>{convertDate(date)}</>;
};

const LastLoginTime = ({ date }: DateProps) => {
    const [view, setView] = useState(false);
    const { t } = useTranslation();

    return (
        <Typography
            color="text.secondary"
            onClick={() => setView(!view)}
            sx={{ ml: 1 }}
            title={t('Last Login', { ns: 'auth' })}
            variant="body2"
        >
            {view ? (
                <LastLoginAbsoluteTime date={date} />
            ) : (
                <LastLoginRelativeTime date={date} />
            )}
        </Typography>
    );
};

const TopBar = ({
    isLoading,
    isExportingMessageDisabled,
    ismobile,
    handleDrawerClose,
    student,
    student_name_english,
    student_id,
    agentsEditorsDropdownId,
    handleAgentsEditorsModalOpen,
    handleExportMessages,
    dropdownId,
    handleStudentDetailModalOpen,
    handleAgentsEditorsModalClose,
    isAgentsEditorsModalOpen
}: TopBarProps) => {
    const { t } = useTranslation();
    return (
        !isLoading && (
            <Box
                className="sticky-top"
                sx={{
                    my: 1,
                    display: 'flex'
                }}
            >
                <Box
                    sx={{
                        display: 'flex'
                    }}
                >
                    {ismobile ? (
                        <IconButton
                            aria-label="open drawer"
                            color="inherit"
                            edge="start"
                            onClick={(e) => handleDrawerClose(e)}
                            style={{ marginLeft: '4px' }}
                        >
                            <ArrowBackIcon />
                        </IconButton>
                    ) : null}
                    <Avatar
                        {...stringAvatar(student_name_english)}
                        src={student?.pictureUrl}
                    />
                    <Box>
                        <Link
                            component={LinkDom}
                            to={DEMO.STUDENT_DATABASE_STUDENTID_LINK(
                                student_id,
                                DEMO.PROFILE_HASH
                            )}
                        >
                            <Typography
                                fontWeight="bold"
                                sx={{ ml: 1 }}
                                variant="body1"
                            >
                                {truncateText(student_name_english, 24)}
                            </Typography>
                        </Link>
                        <LastLoginTime date={student.lastLoginAt} />
                    </Box>
                </Box>
                <Box sx={{ flexGrow: 1 }} />
                <Box sx={{ mr: 2, md: 'flex' }}>
                    <Stack
                        alignItems="center"
                        direction="row"
                        justifyContent="flex-end"
                        spacing={1}
                    >
                        <Tooltip title={t('Agents Editors', { ns: 'common' })}>
                            <IconButton
                                aria-controls={agentsEditorsDropdownId}
                                aria-haspopup="true"
                                aria-label="open-more-1"
                                color="inherit"
                                edge="end"
                                onClick={handleAgentsEditorsModalOpen}
                            >
                                <PeopleAltIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={t('Export messages', { ns: 'common' })}>
                            <IconButton
                                aria-controls={dropdownId}
                                aria-haspopup="true"
                                aria-label="open-more"
                                color="inherit"
                                disabled={isExportingMessageDisabled}
                                edge="end"
                                onClick={handleExportMessages}
                            >
                                {isExportingMessageDisabled ? (
                                    <CircularProgress size={16} />
                                ) : (
                                    <FileDownloadIcon />
                                )}
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={t('More', { ns: 'common' })}>
                            <IconButton
                                aria-controls={dropdownId}
                                aria-haspopup="true"
                                aria-label="open-more"
                                color="inherit"
                                edge="end"
                                onClick={handleStudentDetailModalOpen}
                            >
                                <MoreVertIcon />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                </Box>
                <AgentsEditorsModal
                    agentsEditorsDropdownId={agentsEditorsDropdownId}
                    anchorAgentsEditorsEl={isAgentsEditorsModalOpen}
                    handleAgentsEditorsStudentDetailModalClose={
                        handleAgentsEditorsModalClose
                    }
                    open={isAgentsEditorsModalOpen}
                    student={student}
                />
            </Box>
        )
    );
};

const CommunicationExpandPage = () => {
    const { studentId } = useParams();
    const { user } = useAuth();
    const theme = useTheme();
    const ismobile = useMediaQuery(theme.breakpoints.down('md'));
    const { data, isLoading } = useQuery(getCommunicationQuery(studentId));
    const student = data?.student;
    const thread = data?.data;
    const APP_BAR_HEIGHT = 64;

    const [open, setOpen] = useState(ismobile);
    const [anchorStudentDetailEl, setAnchorStudentDetailEl] =
        useState<HTMLElement | null>(null);
    const [anchorAgentsEditorsEl, setAnchorAgentsEditorsEl] =
        useState<HTMLElement | null>(null);
    const isStudentDetailModalOpen = Boolean(anchorStudentDetailEl);
    const isAgentsEditorsModalOpen = Boolean(anchorAgentsEditorsEl);
    const [isExportingMessageDisabled, setIsExportingMessageDisabled] =
        useState(false);
    const scrollableRef = useRef<HTMLDivElement>(null);
    const scrollToBottom = () => {
        if (scrollableRef.current) {
            scrollableRef.current.scrollTop =
                scrollableRef.current.scrollHeight;
        }
    };

    const handleDrawerOpen = (e: React.MouseEvent<HTMLElement>) => {
        e.stopPropagation();
        setOpen(true);
    };

    const handleStudentDetailModalOpen = (
        event: React.MouseEvent<HTMLElement>
    ) => {
        event.stopPropagation();
        setAnchorStudentDetailEl(event.currentTarget);
    };

    const handleAgentsEditorsModalOpen = (
        event: React.MouseEvent<HTMLElement>
    ) => {
        setAnchorAgentsEditorsEl(event.currentTarget);
    };

    const handleExportMessages = async (
        event: React.MouseEvent<HTMLElement>
    ) => {
        event.stopPropagation();
        setIsExportingMessageDisabled(true);
        const downloadBlob = (blob: Blob, filename: string) => {
            // Create a URL for the Blob data
            const url = window.URL.createObjectURL(blob);

            // Create a temporary link element
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename); // Set the download attribute with a filename

            // Append the link to the body
            document.body.appendChild(link);

            // Programmatically click the link to trigger the download
            link.click();

            // Clean up by removing the link and revoking the URL
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        };
        const resp = await WidgetExportMessagePDF(studentId);
        const blob = resp.data;
        downloadBlob(blob, 'exported_file.pdf');
        setIsExportingMessageDisabled(false);
    };

    const handleStudentDetailModalClose = (event: React.SyntheticEvent) => {
        event.stopPropagation();
        setAnchorStudentDetailEl(null);
    };

    const handleAgentsEditorsModalClose = (event: React.SyntheticEvent) => {
        event.stopPropagation();
        setAnchorAgentsEditorsEl(null);
    };

    const handleDrawerClose = () => {
        setOpen(false);
    };

    const agentsEditorsDropdownId = 'primary-agents-editors-modal';

    const dropdownId = 'primary-student-modal';

    scrollToBottom();

    const student_name =
        !isLoading &&
        `${student.firstname} ${student.lastname} ${
            student.firstname_chinese ? student.firstname_chinese : ''
        } ${student.lastname_chinese ? student.lastname_chinese : ''}`;
    const student_name_english =
        !isLoading && `${student.firstname} ${student.lastname}`;

    TabTitle(`${student_name}`);
    if (!is_TaiGer_role(user)) {
        return <Navigate to={`${DEMO.DASHBOARD_LINK}`} />;
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
            <Grid container spacing={0}>
                <Grid
                    item
                    md="auto" // Let it auto-size on medium screens and up
                    sx={{
                        maxHeight: `calc(100vh - ${APP_BAR_HEIGHT}px)`,
                        overflowY: 'auto',
                        display: { xs: 'none', md: 'flex' }
                    }}
                    xs={12} // Full width on extra small screens
                >
                    <Box
                        sx={{
                            maxWidth: '300px' // Responsive width
                        }}
                    >
                        <ChatList embedded student_id={studentId} />
                    </Box>
                </Grid>
                <Grid item md xs={12}>
                    {ismobile ? (
                        <Drawer
                            anchor="right"
                            open={open}
                            sx={{
                                flexShrink: 0,
                                '& .MuiDrawer-paper': {
                                    width: '100%', // Make Drawer full width on small screens
                                    maxWidth: '100vw'
                                }
                            }}
                            variant="temporary"
                        >
                            <TopBar
                                agentsEditorsDropdownId={
                                    agentsEditorsDropdownId
                                }
                                handleAgentsEditorsModalClose={
                                    handleAgentsEditorsModalClose
                                }
                                handleAgentsEditorsModalOpen={
                                    handleAgentsEditorsModalOpen
                                }
                                handleDrawerClose={handleDrawerClose}
                                handleExportMessages={handleExportMessages}
                                handleStudentDetailModalOpen={
                                    handleStudentDetailModalOpen
                                }
                                isAgentsEditorsModalOpen={
                                    isAgentsEditorsModalOpen
                                }
                                isExportingMessageDisabled={
                                    isExportingMessageDisabled
                                }
                                isLoading={isLoading}
                                ismobile={ismobile}
                                student={student}
                                student_id={studentId}
                                student_name_english={student_name_english}
                            />
                            {studentId ? (
                                isLoading ? (
                                    <Loading />
                                ) : (
                                    <Box
                                        ref={scrollableRef}
                                        sx={{
                                            height: `calc(100vh - ${APP_BAR_HEIGHT - 8}px)`, // Subtract header
                                            overflowY: 'auto'
                                        }}
                                    >
                                        <CommunicationExpandPageMessagesComponent
                                            data={thread}
                                            student={student}
                                            student_id={studentId}
                                        />
                                    </Box>
                                )
                            ) : null}
                        </Drawer>
                    ) : null}
                    {!ismobile && studentId ? (
                        isLoading ? (
                            <ChildLoading />
                        ) : (
                            <Box>
                                <TopBar
                                    agentsEditorsDropdownId={
                                        agentsEditorsDropdownId
                                    }
                                    handleAgentsEditorsModalClose={
                                        handleAgentsEditorsModalClose
                                    }
                                    handleAgentsEditorsModalOpen={
                                        handleAgentsEditorsModalOpen
                                    }
                                    handleDrawerClose={handleDrawerClose}
                                    handleExportMessages={handleExportMessages}
                                    handleStudentDetailModalOpen={
                                        handleStudentDetailModalOpen
                                    }
                                    isAgentsEditorsModalOpen={
                                        isAgentsEditorsModalOpen
                                    }
                                    isExportingMessageDisabled={
                                        isExportingMessageDisabled
                                    }
                                    isLoading={isLoading}
                                    ismobile={ismobile}
                                    student={student}
                                    student_id={studentId}
                                    student_name_english={student_name_english}
                                />
                                <Box
                                    ref={scrollableRef}
                                    style={{
                                        height: `calc(100vh - ${APP_BAR_HEIGHT + 60}px)`, // Subtract header
                                        overflowY:
                                            'auto' /* Enable vertical scrolling */
                                    }}
                                >
                                    <CommunicationExpandPageMessagesComponent
                                        data={thread}
                                        student={student}
                                        student_id={studentId}
                                    />
                                </Box>
                            </Box>
                        )
                    ) : null}
                    {!studentId ? <Typography>Empty</Typography> : null}
                    {ismobile ? (
                        <Box
                            onClick={(e) => handleDrawerOpen(e)}
                            sx={{
                                display: { md: 'flex' },
                                maxHeight: `calc(100vh - ${APP_BAR_HEIGHT}px)`,
                                overflow: 'auto' // Prevent parent scroll
                            }}
                        >
                            <ChatList embedded student_id={studentId} />
                        </Box>
                    ) : null}
                </Grid>
                <Box sx={{ marginLeft: 0 }}>
                    <MemorizedStudentDetailModal
                        anchorStudentDetailEl={anchorStudentDetailEl}
                        dropdownId={dropdownId}
                        handleStudentDetailModalClose={
                            handleStudentDetailModalClose
                        }
                        open={isStudentDetailModalOpen}
                    />
                </Box>
            </Grid>
        </Box>
    );
};

export default CommunicationExpandPage;
