import {
    useCallback,
    useEffect,
    useLayoutEffect,
    useRef,
    useState
} from 'react';
import {
    Alert,
    Box,
    Card,
    Button,
    CircularProgress,
    Grid,
    Typography,
    useMediaQuery,
    useTheme
} from '@mui/material';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardDoubleArrowDownIcon from '@mui/icons-material/KeyboardDoubleArrowDown';
import { useTranslation } from 'react-i18next';

import type { RefObject } from 'react';

import MessageList from './MessageList';
import ChatSearch from './ChatSearch';
import CommunicationThreadEditor from './CommunicationThreadEditor';
import { useAuth } from '@components/AuthProvider';
import useCommunications from '@hooks/useCommunications';
import useChatScroll from '@hooks/useChatScroll';
import {
    getCommunicationThreadContext,
    getAdjacentCommunicationMessages
} from '@/api';
import type { IStudentResponse } from '@taiger-common/model';
import type { ThreadMessage } from '@components/Message/MessageCard';

// Scroll a message into view and briefly flash it (the "jump to message" cue).
const flashMessage = (messageId: string) => {
    const el = document.getElementById(`communication-message-${messageId}`);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const original = el.style.backgroundColor;
    el.style.transition = 'background-color 0.4s';
    el.style.backgroundColor = 'rgba(255, 213, 79, 0.45)';
    window.setTimeout(() => {
        el.style.backgroundColor = original;
    }, 1700);
};

interface CommunicationExpandPageMessagesComponentProps {
    data: unknown[];
    student: IStudentResponse;
    // The scrollable pane (owned by CommunicationExpandPage) — used to pin the
    // live thread to the newest message and to load older messages on scroll-up.
    scrollContainerRef: RefObject<HTMLDivElement | null>;
}

const CommunicationExpandPageMessagesComponent = ({
    data,
    student,
    scrollContainerRef
}: CommunicationExpandPageMessagesComponentProps) => {
    const { user } = useAuth();
    const { t } = useTranslation();
    const theme = useTheme();
    const ismobile = useMediaQuery(theme.breakpoints.down('md'));

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
        count,
        handleLoadMessages,
        onDeleteSingleMessage,
        onFileChange,
        handleClickSave
    } = useCommunications({ data, student });

    // Anchor used by "Jump to latest" (exitContext) to return to the newest
    // message. Live-thread auto-scroll / scroll-up loading is handled by
    // useChatScroll below.
    const bottomRef = useRef<HTMLDivElement>(null);

    // ── Instagram-style "jump to message" (context mode) ─────────────────────
    // When a search result is clicked we fetch a window of messages centered on
    // it and show that slice (with a "Jump to latest" bar) instead of the live
    // thread, scrolling to + flashing the target.
    const [contextMessages, setContextMessages] = useState<
        ThreadMessage[] | null
    >(null);
    const [contextTargetId, setContextTargetId] = useState<string | null>(null);
    const [contextLoading, setContextLoading] = useState(false);
    const [contextHasOlder, setContextHasOlder] = useState(false);
    const [contextHasNewer, setContextHasNewer] = useState(false);
    const [contextLoadingMore, setContextLoadingMore] = useState<
        'before' | 'after' | null
    >(null);
    // Distance-from-bottom captured before a prepend so we can restore the
    // scroll position (Messenger-style: loading older doesn't jump the view).
    const prependAnchorRef = useRef<number | null>(null);

    const studentId = student._id.toString();

    const handleJumpToMessage = useCallback(
        (messageId: string) => {
            setContextLoading(true);
            getCommunicationThreadContext(studentId, messageId)
                .then((resp) => {
                    setContextMessages(
                        (resp.data.data ?? []) as ThreadMessage[]
                    );
                    setContextTargetId(resp.data.targetId ?? messageId);
                    setContextHasOlder(Boolean(resp.data.hasOlder));
                    setContextHasNewer(Boolean(resp.data.hasNewer));
                })
                .catch(() => {
                    setContextMessages(null);
                    setContextTargetId(null);
                })
                .finally(() => setContextLoading(false));
        },
        [studentId]
    );

    // Load an older chunk (scroll up) and prepend it, preserving scroll position.
    const loadOlderContext = useCallback(() => {
        setContextMessages((current) => {
            const first = current?.[0];
            if (!first) return current;
            prependAnchorRef.current =
                document.documentElement.scrollHeight - window.scrollY;
            setContextLoadingMore('before');
            getAdjacentCommunicationMessages(studentId, first._id, 'before')
                .then((resp) => {
                    const more = (resp.data.data ?? []) as ThreadMessage[];
                    if (more.length > 0) {
                        setContextMessages((prev) =>
                            prev ? [...more, ...prev] : more
                        );
                    }
                    setContextHasOlder(Boolean(resp.data.hasMore));
                })
                .finally(() => setContextLoadingMore(null));
            return current;
        });
    }, [studentId]);

    // Load a newer chunk (scroll down) and append it.
    const loadNewerContext = useCallback(() => {
        setContextMessages((current) => {
            const last = current?.[current.length - 1];
            if (!last) return current;
            setContextLoadingMore('after');
            getAdjacentCommunicationMessages(studentId, last._id, 'after')
                .then((resp) => {
                    const more = (resp.data.data ?? []) as ThreadMessage[];
                    if (more.length > 0) {
                        setContextMessages((prev) =>
                            prev ? [...prev, ...more] : more
                        );
                    }
                    setContextHasNewer(Boolean(resp.data.hasMore));
                })
                .finally(() => setContextLoadingMore(null));
            return current;
        });
    }, [studentId]);

    // After a prepend, keep the previously-visible message in place.
    useLayoutEffect(() => {
        if (prependAnchorRef.current == null) return;
        window.scrollTo(
            0,
            document.documentElement.scrollHeight - prependAnchorRef.current
        );
        prependAnchorRef.current = null;
    }, [contextMessages]);

    const exitContext = useCallback(() => {
        setContextMessages(null);
        setContextTargetId(null);
        setContextHasOlder(false);
        setContextHasNewer(false);
        window.setTimeout(
            () => bottomRef.current?.scrollIntoView({ block: 'end' }),
            50
        );
    }, []);

    // Scroll to + flash the target ONLY on the initial jump (when the target id
    // changes) — not when older/newer chunks are loaded into the same view.
    useEffect(() => {
        if (!contextTargetId) return;
        const timer = window.setTimeout(
            () => flashMessage(contextTargetId),
            120
        );
        return () => window.clearTimeout(timer);
    }, [contextTargetId]);

    const inContext = contextMessages !== null;
    const isEmpty = upperThread.length === 0 && thread.length === 0;

    // Live-thread chat scroll: open at the newest message and load older
    // messages when the reader scrolls to the top. Disabled in context mode,
    // which has its own (search-slice) navigation.
    useChatScroll({
        scrollRef: scrollContainerRef,
        threadLength: thread.length,
        upperThreadLength: upperThread.length,
        loadOlder: handleLoadMessages,
        canLoadOlder: !loadButtonDisabled && !inContext
    });

    return (
        <Grid container>
            <Grid item xs={12}>
                <Box
                    sx={{
                        alignItems: 'center',
                        bgcolor: 'background.default',
                        display: 'flex',
                        justifyContent: 'flex-end',
                        position: 'sticky',
                        top: 0,
                        zIndex: 3,
                        py: 0.5,
                        mb: 0.5
                    }}
                >
                    <ChatSearch
                        onResultClick={handleJumpToMessage}
                        studentId={studentId}
                    />
                </Box>
            </Grid>
            {contextLoading ? (
                <Grid item xs={12}>
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            py: 2
                        }}
                    >
                        <CircularProgress size={20} />
                    </Box>
                </Grid>
            ) : null}
            {inContext ? (
                // ── Context view: the search-result slice ────────────────────
                <Grid item xs={12}>
                    <Alert
                        action={
                            <Button
                                color="inherit"
                                onClick={exitContext}
                                size="small"
                                startIcon={<KeyboardDoubleArrowDownIcon />}
                            >
                                {t('Jump to latest', {
                                    ns: 'common',
                                    defaultValue: 'Jump to latest'
                                })}
                            </Button>
                        }
                        severity="info"
                        sx={{ mb: 1 }}
                    >
                        {t('Showing a search result', {
                            ns: 'common',
                            defaultValue: 'Showing a search result'
                        })}
                    </Alert>
                    {contextHasOlder ? (
                        <Button
                            disabled={contextLoadingMore === 'before'}
                            fullWidth
                            onClick={loadOlderContext}
                            size="small"
                            startIcon={
                                contextLoadingMore === 'before' ? (
                                    <CircularProgress size={14} />
                                ) : (
                                    <KeyboardArrowUpIcon />
                                )
                            }
                            sx={{ mb: 1 }}
                            variant="text"
                        >
                            {t('Load older messages', {
                                ns: 'common',
                                defaultValue: 'Load older messages'
                            })}
                        </Button>
                    ) : null}
                    <MessageList
                        accordionKeys={[]}
                        isDeleting={isDeleting}
                        isTaiGerView={true}
                        isUpperMessagList={false}
                        onDeleteSingleMessage={onDeleteSingleMessage}
                        student_id={studentId}
                        thread={contextMessages as ThreadMessage[]}
                        user={user}
                    />
                    {contextHasNewer ? (
                        <Button
                            disabled={contextLoadingMore === 'after'}
                            fullWidth
                            onClick={loadNewerContext}
                            size="small"
                            startIcon={
                                contextLoadingMore === 'after' ? (
                                    <CircularProgress size={14} />
                                ) : (
                                    <KeyboardArrowDownIcon />
                                )
                            }
                            sx={{ mt: 1 }}
                            variant="text"
                        >
                            {t('Load newer messages', {
                                ns: 'common',
                                defaultValue: 'Load newer messages'
                            })}
                        </Button>
                    ) : null}
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            mt: 1
                        }}
                    >
                        <Button
                            onClick={exitContext}
                            size="small"
                            startIcon={<KeyboardDoubleArrowDownIcon />}
                            variant="outlined"
                        >
                            {t('Jump to latest', {
                                ns: 'common',
                                defaultValue: 'Jump to latest'
                            })}
                        </Button>
                    </Box>
                </Grid>
            ) : (
                <>
                    <Grid item xs={12}>
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
                                    {t(
                                        'No messages yet. Start the conversation.',
                                        {
                                            ns: 'common',
                                            defaultValue:
                                                'No messages yet. Start the conversation.'
                                        }
                                    )}
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
                </>
            )}
        </Grid>
    );
};

export default CommunicationExpandPageMessagesComponent;
