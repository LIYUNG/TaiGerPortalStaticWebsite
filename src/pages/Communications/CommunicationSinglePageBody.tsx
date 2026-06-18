import { useRef } from 'react';
import { Link as LinkDom } from 'react-router-dom';
import LaunchIcon from '@mui/icons-material/Launch';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import {
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Box,
    Card,
    Button,
    CircularProgress,
    Link,
    Typography,
    List,
    ListItem,
    Breadcrumbs
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { is_TaiGer_Student, is_TaiGer_role } from '@taiger-common/core';

import MessageList from './MessageList';
import CommunicationThreadEditor from './CommunicationThreadEditor';
import { TabTitle } from '../Utils/TabTitle';
import DEMO from '@store/constant';
import { appConfig } from '../../config';
import { useAuth } from '@components/AuthProvider';
import { TopBar } from '@components/TopBar/TopBar';
import useCommunications from '@hooks/useCommunications';
import useChatScroll from '@hooks/useChatScroll';
import i18next from 'i18next';
import type {
    IUserWithId,
    IStudentResponse,
    ICommunicationWithId
} from '@taiger-common/model';

interface InformationBlockChatProps {
    user: IUserWithId | null;
    student: IStudentResponse;
}

const InformationBlockChat = ({ user, student }: InformationBlockChatProps) => {
    return (
        <Box>
            {appConfig.companyName}
            顧問皆位於中歐時區，無法及時回復，為確保有
            <b>效率溝通</b>，留言時請注意以下幾點：
            <List>
                <ListItem>
                    <Typography sx={{ display: 'flex' }}>
                        1. 請把
                        <Link
                            component={LinkDom}
                            fontWeight="bold"
                            sx={{ display: 'flex' }}
                            target="_blank"
                            to={
                                is_TaiGer_Student(user)
                                    ? `${DEMO.SURVEY_LINK}`
                                    : `${DEMO.STUDENT_DATABASE_STUDENTID_LINK(
                                          student._id?.toString(),
                                          DEMO.SURVEY_HASH
                                      )}`
                            }
                        >
                            {i18next.t('Profile', { ns: 'common' })}{' '}
                            <LaunchIcon fontSize="small" />
                        </Link>
                        填好，
                        <Link
                            component={LinkDom}
                            fontWeight="bold"
                            sx={{ display: 'flex' }}
                            target="_blank"
                            to={
                                is_TaiGer_Student(user)
                                    ? `${DEMO.BASE_DOCUMENTS_LINK}`
                                    : `${DEMO.STUDENT_DATABASE_STUDENTID_LINK(
                                          student._id?.toString(),
                                          DEMO.PROFILE_HASH
                                      )}`
                            }
                        >
                            {i18next.t('My Documents', {
                                ns: 'common'
                            })}{' '}
                            <LaunchIcon fontSize="small" />
                        </Link>
                        ，文件有的都盡量先掃描上傳，
                        <Link
                            component={LinkDom}
                            fontWeight="bold"
                            sx={{ display: 'flex' }}
                            target="_blank"
                            to={`${DEMO.COURSES_LINK}/${student._id?.toString()}`}
                        >
                            {i18next.t('My Courses', { ns: 'common' })}{' '}
                            <LaunchIcon fontSize="small" />
                        </Link>
                        課程填好，之後 Agent 在回答問題時比較能掌握狀況。
                    </Typography>
                </ListItem>
                <ListItem>
                    2. 描述你的問題，請盡量一次列出所有問題，顧問可以一次回答。
                </ListItem>
                <ListItem>3. 你想要完成事項。</ListItem>
                <ListItem>
                    註：或想一次處理，請準備好所有問題，並和顧問約時間通話。
                </ListItem>
                <ListItem>
                    {appConfig.companyName}{' '}
                    顧問平時的工作時段位於美國或歐洲時區，因此可能無法立即回覆您的訊息，敬請諒解。依據您的問題複雜度，顧問將會在一至五個工作日內回覆您。因此，請在訊息來往時保持有效率的溝通，以確保迅速解決問題。
                    顧問隨時需要了解您的進展情況，為了避免不必要的來回詢問學生資料進度，為此，請務必將您在TaiGer
                    Portal平台上的個人資訊保持最新，以確保訊息的準確性。
                </ListItem>
            </List>
        </Box>
    );
};
interface CommunicationSinglePageBodyProps {
    loadedData: {
        data: ICommunicationWithId[];
        student: IStudentResponse;
    };
}

const CommunicationSinglePageBody = ({
    loadedData
}: CommunicationSinglePageBodyProps) => {
    const { data, student } = loadedData;
    const { user } = useAuth();
    const { t } = useTranslation();
    const {
        buttonDisabled,
        loadButtonDisabled,
        isLoadingOlder,
        isDeleting,
        files,
        editorState,
        checkResult,
        accordionKeys,
        uppderaccordionKeys,
        upperThread,
        thread,
        handleLoadMessages,
        onDeleteSingleMessage,
        onFileChange,
        handleClickSave
    } = useCommunications({ data, student });

    // The messages live in their own scrollable pane (`messagesRef`) so the chat
    // opens pinned to the newest message and loads older messages as the reader
    // scrolls up — see useChatScroll. The compose box sits OUTSIDE this pane, so
    // the pane's height depends only on the messages, keeping scroll behaviour
    // exact (unaffected by EditorJS initialising asynchronously below it).
    const messagesRef = useRef<HTMLDivElement>(null);

    useChatScroll({
        scrollRef: messagesRef,
        threadLength: thread.length,
        upperThreadLength: upperThread.length,
        loadOlder: handleLoadMessages,
        canLoadOlder: !loadButtonDisabled
    });

    const student_name = `${student.firstname} ${student.lastname}`;
    const isEmpty = upperThread.length === 0 && thread.length === 0;
    // const template_input = JSON.parse(
    //   `{"time":1689452160435,"blocks":[{"id":"WHsFbpmWmH","type":"paragraph","data":{"text":"<b>我的問題：</b>"}},{"id":"F8K_f07R8l","type":"paragraph","data":{"text":"&lt;Example&gt; 我想選課，不知道下學期要選什麼"}},{"id":"yYUL0bYWSB","type":"paragraph","data":{"text":"<b>我想和顧問討論</b>："}},{"id":"wJu56jmAKC","type":"paragraph","data":{"text":"&lt;Example&gt; 課程符合度最佳化"}}],"version":"2.27.2"}`
    // );
    TabTitle(`Chat: ${student_name}`);

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                height: 'calc(100vh - 112px)',
                minHeight: 0
            }}
        >
            {/* Header — breadcrumbs, advisors, instructions, load (fixed) */}
            <Box sx={{ flexShrink: 0 }}>
                {student?.archiv ? <TopBar /> : null}
                <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 1 }}>
                    <Link
                        color="inherit"
                        component={LinkDom}
                        to={`${DEMO.DASHBOARD_LINK}`}
                        underline="hover"
                    >
                        {appConfig.companyName}
                    </Link>
                    {is_TaiGer_role(user) ? (
                        <Link
                            color="inherit"
                            component={LinkDom}
                            to={`${DEMO.STUDENT_DATABASE_STUDENTID_LINK(
                                student._id.toString(),
                                DEMO.PROFILE_HASH
                            )}`}
                            underline="hover"
                        >
                            {student_name}
                        </Link>
                    ) : null}
                    <Typography color="text.primary">
                        {t('Message', { ns: 'common' })}
                    </Typography>
                </Breadcrumbs>

                {/* Advisors — a compact line so the chat stays front and center. */}
                {student?.agents?.length ? (
                    <Typography
                        color="text.secondary"
                        sx={{ mb: 1 }}
                        variant="body2"
                    >
                        {t('Agents', { ns: 'common' })}:{' '}
                        {student.agents.map((agent, i) => (
                            <Link
                                component={LinkDom}
                                key={i}
                                sx={{ mr: 1 }}
                                to={`${DEMO.TEAM_AGENT_PROFILE_LINK(agent._id.toString())}`}
                            >
                                {`${agent.firstname} ${agent.lastname}`}
                            </Link>
                        ))}
                    </Typography>
                ) : null}

                {/* The instruction block is long; collapse it by default so the
                    conversation is the focus. */}
                <Accordion
                    disableGutters
                    sx={{
                        mb: 1,
                        borderRadius: 2,
                        '&:before': { display: 'none' }
                    }}
                    variant="outlined"
                >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <InfoOutlinedIcon
                            fontSize="small"
                            sx={{ color: 'text.secondary', mr: 1 }}
                        />
                        <Typography>{t('Instructions')}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <InformationBlockChat student={student} user={user} />
                    </AccordionDetails>
                </Accordion>

                <Button
                    color="secondary"
                    disabled={loadButtonDisabled}
                    fullWidth
                    onClick={handleLoadMessages}
                    size="small"
                    startIcon={
                        isLoadingOlder ? (
                            <CircularProgress size={14} />
                        ) : (
                            <KeyboardArrowUpIcon />
                        )
                    }
                    sx={{ mb: 1 }}
                    variant="text"
                >
                    {isLoadingOlder
                        ? t('Loading…', {
                              ns: 'common',
                              defaultValue: 'Loading…'
                          })
                        : loadButtonDisabled
                          ? t('No more messages', {
                                ns: 'common',
                                defaultValue: 'No more messages'
                            })
                          : t('Load older messages', {
                                ns: 'common',
                                defaultValue: 'Load older messages'
                            })}
                </Button>
            </Box>

            {/* Messages — the only scroll area */}
            <Box
                ref={messagesRef}
                sx={{
                    flex: 1,
                    minHeight: 0,
                    overflowY: 'auto',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    p: 1,
                    bgcolor: 'background.paper'
                }}
            >
                {isEmpty ? (
                    <Box
                        sx={{
                            alignItems: 'center',
                            color: 'text.secondary',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1,
                            justifyContent: 'center',
                            py: 6
                        }}
                    >
                        <ChatBubbleOutlineIcon fontSize="large" />
                        <Typography variant="body2">
                            {t('No messages yet. Start the conversation.', {
                                ns: 'common',
                                defaultValue:
                                    'No messages yet. Start the conversation.'
                            })}
                        </Typography>
                    </Box>
                ) : null}
                {upperThread.length > 0 ? (
                    <MessageList
                        accordionKeys={uppderaccordionKeys}
                        isDeleting={isDeleting}
                        isUpperMessagList={true}
                        onDeleteSingleMessage={onDeleteSingleMessage}
                        student_id={student._id.toString()}
                        thread={upperThread}
                        user={user}
                    />
                ) : null}
                <MessageList
                    accordionKeys={accordionKeys}
                    isDeleting={isDeleting}
                    isUpperMessagList={false}
                    onDeleteSingleMessage={onDeleteSingleMessage}
                    student_id={student._id.toString()}
                    thread={thread}
                    user={user}
                />
            </Box>

            {/* Compose — pinned to the bottom (fixed) */}
            {student.archiv !== true ? (
                <Card
                    sx={{
                        flexShrink: 0,
                        borderRadius: 2,
                        p: 2,
                        mt: 1,
                        '& .MuiAvatar-root': {
                            width: 32,
                            height: 32,
                            ml: -0.5,
                            mr: 1
                        }
                    }}
                >
                    <CommunicationThreadEditor
                        buttonDisabled={buttonDisabled}
                        checkResult={checkResult}
                        editorState={editorState}
                        files={files}
                        handleClickSave={handleClickSave}
                        onFileChange={onFileChange}
                        studentFirstname={student.firstname}
                        studentId={student._id?.toString()}
                        thread={thread}
                    />
                </Card>
            ) : (
                <Card sx={{ flexShrink: 0, mt: 1, p: 2 }}>
                    {t('The service is finished. Therefore, it is readonly.')}
                </Card>
            )}
        </Box>
    );
};

export default CommunicationSinglePageBody;
