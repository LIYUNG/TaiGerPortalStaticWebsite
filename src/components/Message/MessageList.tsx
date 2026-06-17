import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Box, Stack, Typography, Button } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import MessageCard, { type ThreadMessage } from './MessageCard';
import Loading from '../Loading/Loading';
import useChatScroll from '@hooks/useChatScroll';

export interface MessageThread {
    messages?: ThreadMessage[];
}

export interface MessageListProps {
    thread?: MessageThread;
    isLoaded: boolean;
    documentsthreadId: string;
    apiPrefix: string;
    onDeleteSingleMessage: (messageId: string) => void;
    handleClickSave?: (
        e: React.MouseEvent,
        editorState: { time?: number; blocks?: unknown[] }
    ) => void;
    /**
     * Chat-style behaviour: pin to the newest message and auto-reveal the next
     * page of already-loaded older messages as the reader scrolls to the top.
     * Opt-in so other consumers keep the plain "Load more" button behaviour.
     */
    autoLoadOnScrollUp?: boolean;
    /** Id of the message currently being deleted — that card shows a spinner. */
    deletingMessageId?: string | null;
    /** Id of an optimistic message being sent — that card shows a spinner. */
    pendingMessageId?: string | null;
}

const INITIAL_VISIBLE_COUNT = 2;
const LOAD_STEP = 5;

// Nearest scrollable ancestor of the message list — the pane the chat-scroll
// hook pins and watches. Falls back to the document scroller (window scroll).
const getScrollParent = (node: HTMLElement | null): HTMLDivElement | null => {
    let el: HTMLElement | null = node?.parentElement ?? null;
    while (el) {
        const overflowY = window.getComputedStyle(el).overflowY;
        if (overflowY === 'auto' || overflowY === 'scroll') {
            return el as HTMLDivElement;
        }
        el = el.parentElement;
    }
    return (document.scrollingElement as HTMLDivElement | null) ?? null;
};

const MessageList = (props: MessageListProps) => {
    const messageCount = props.thread?.messages?.length ?? 0;
    const [visibleMessageCount, setVisibleMessageCount] = useState(
        INITIAL_VISIBLE_COUNT
    );
    const scrollRef = useRef<HTMLDivElement | null>(null);

    const handleLoadMore = useCallback(() => {
        setVisibleMessageCount((prevCount) =>
            Math.min(prevCount + LOAD_STEP, messageCount)
        );
    }, [messageCount]);

    const messagesToShow =
        props.thread?.messages?.slice(-visibleMessageCount) ?? [];
    const hasMoreMessages = messageCount > visibleMessageCount;

    // Resolve the scroll pane on mount (only when the feature is enabled) so the
    // hook below stays inert for non-opt-in consumers.
    const setRootRef = useCallback(
        (node: HTMLDivElement | null) => {
            scrollRef.current =
                props.autoLoadOnScrollUp && node ? getScrollParent(node) : null;
        },
        [props.autoLoadOnScrollUp]
    );

    useChatScroll({
        scrollRef,
        threadLength: messageCount,
        upperThreadLength: messagesToShow.length,
        loadOlder: handleLoadMore,
        canLoadOlder: Boolean(props.autoLoadOnScrollUp) && hasMoreMessages
    });

    // When a new message is appended (e.g. the optimistic pending message), keep
    // the pane pinned to the bottom across the async editor render so the whole
    // new message is shown — not left partially under the composer.
    const prevMessageCountRef = useRef(messageCount);
    useEffect(() => {
        const grew = messageCount > prevMessageCountRef.current;
        prevMessageCountRef.current = messageCount;
        if (!grew || !props.autoLoadOnScrollUp) return;
        const el = scrollRef.current;
        if (!el) return;
        const pinToBottom = () => {
            el.scrollTop = el.scrollHeight;
        };
        pinToBottom();
        // Re-pin as the new message's editor content renders and grows the pane.
        const timers = [120, 300, 600, 900].map((delay) =>
            window.setTimeout(pinToBottom, delay)
        );
        return () => timers.forEach((id) => window.clearTimeout(id));
    }, [messageCount, props.autoLoadOnScrollUp]);

    const thread = messagesToShow.map((message) => {
        return (
            <MessageCard
                apiPrefix={props.apiPrefix}
                documentsthreadId={props.documentsthreadId}
                handleClickSave={props.handleClickSave}
                isDeleting={
                    props.deletingMessageId != null &&
                    String(message._id) === String(props.deletingMessageId)
                }
                isPending={
                    props.pendingMessageId != null &&
                    String(message._id) === String(props.pendingMessageId)
                }
                isLoaded={props.isLoaded}
                key={message._id}
                message={message}
                onDeleteSingleMessage={props.onDeleteSingleMessage}
            />
        );
    });

    return (
        <Box ref={setRootRef} sx={{ mt: 1 }}>
            {!props.isLoaded ? (
                // Single loader for the whole list while a mutation is in flight
                // (deleting a message). Rendering it here — rather than in every
                // MessageCard — avoids stacking one loader per visible message.
                <Loading variant="child" />
            ) : (
                <>
                    {hasMoreMessages && (
                        <Box sx={{ mb: 2, textAlign: 'center' }}>
                            <Button
                                onClick={handleLoadMore}
                                startIcon={<ExpandMoreIcon />}
                                sx={{
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    px: 3
                                }}
                                variant="outlined"
                            >
                                Load{' '}
                                {Math.min(
                                    5,
                                    messageCount - visibleMessageCount
                                )}{' '}
                                more message
                                {Math.min(
                                    5,
                                    messageCount - visibleMessageCount
                                ) > 1
                                    ? 's'
                                    : ''}{' '}
                                ({messageCount - visibleMessageCount} older)
                            </Button>
                        </Box>
                    )}

                    <Stack spacing={1.5}>
                        {messageCount > 0 ? (
                            thread
                        ) : (
                            <Box sx={{ textAlign: 'center', py: 4 }}>
                                <ChatIcon
                                    color="disabled"
                                    sx={{ fontSize: 48, mb: 1 }}
                                />
                                <Typography
                                    color="text.secondary"
                                    variant="body2"
                                >
                                    No messages yet. Start the conversation!
                                </Typography>
                            </Box>
                        )}
                    </Stack>
                </>
            )}
        </Box>
    );
};

export default MessageList;
