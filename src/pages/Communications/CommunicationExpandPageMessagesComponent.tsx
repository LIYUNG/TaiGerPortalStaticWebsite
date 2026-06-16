import { useEffect, useRef } from 'react';
import {
    Box,
    Card,
    Button,
    Grid,
    Typography,
    useMediaQuery,
    useTheme
} from '@mui/material';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { useTranslation } from 'react-i18next';

import MessageList from './MessageList';
import CommunicationThreadEditor from './CommunicationThreadEditor';
import { useAuth } from '@components/AuthProvider';
import useCommunications from '@hooks/useCommunications';
import type { IStudentResponse } from '@taiger-common/model';

interface CommunicationExpandPageMessagesComponentProps {
    data: unknown[];
    student: IStudentResponse;
}

const CommunicationExpandPageMessagesComponent = ({
    data,
    student
}: CommunicationExpandPageMessagesComponentProps) => {
    const { user } = useAuth();
    const { t } = useTranslation();
    const theme = useTheme();
    const ismobile = useMediaQuery(theme.breakpoints.down('md'));

    const {
        buttonDisabled,
        loadButtonDisabled,
        isDeleting,
        files,
        editorState,
        checkResult,
        accordionKeys,
        uppderaccordionKeys,
        upperThread,
        thread,
        count,
        handleLoadMessages,
        onDeleteSingleMessage,
        onFileChange,
        handleClickSave
    } = useCommunications({ data, student });

    // Auto-scroll to the newest message on first load and whenever a new message
    // is sent (the `thread` list grows). Loading OLDER messages only grows
    // `upperThread`, so it intentionally does not scroll away from what you read.
    const bottomRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ block: 'end' });
    }, [thread.length]);

    const isEmpty = upperThread.length === 0 && thread.length === 0;

    return (
        <Grid container>
            <Grid item xs={12}>
                <Button
                    color="secondary"
                    disabled={loadButtonDisabled}
                    fullWidth
                    onClick={handleLoadMessages}
                    size="small"
                    startIcon={<KeyboardArrowUpIcon />}
                    sx={{ mb: 1 }}
                    variant="text"
                >
                    {loadButtonDisabled
                        ? t('No more messages', {
                              ns: 'common',
                              defaultValue: 'No more messages'
                          })
                        : t('Load older messages', {
                              ns: 'common',
                              defaultValue: 'Load older messages'
                          })}
                </Button>
            </Grid>
            <Grid item xs={12}>
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
                        isTaiGerView={true}
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
                    isTaiGerView={true}
                    isUpperMessagList={false}
                    onDeleteSingleMessage={onDeleteSingleMessage}
                    student_id={student._id.toString()}
                    thread={thread}
                    user={user}
                />
                {/* Scroll anchor: keeps the newest message in view. */}
                <div ref={bottomRef} />
                {student.archiv !== true ? (
                    <Card
                        sx={{
                            borderRadius: 2,
                            padding: 2,
                            position: 'sticky',
                            bottom: 0,
                            zIndex: 1,
                            ...(!ismobile && {
                                width: '100%', // Make Drawer full width on small screens
                                maxWidth: '100vw'
                            }),
                            pt: 2,
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
                            count={count}
                            editorState={editorState}
                            files={files}
                            handleClickSave={handleClickSave}
                            onFileChange={onFileChange}
                            thread={thread}
                        />
                    </Card>
                ) : (
                    <Card>
                        {t(
                            'The service is finished. Therefore, it is readonly.'
                        )}
                    </Card>
                )}
            </Grid>
        </Grid>
    );
};

export default CommunicationExpandPageMessagesComponent;
