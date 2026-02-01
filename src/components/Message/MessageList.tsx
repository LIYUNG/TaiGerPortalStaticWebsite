import React, { useState } from 'react';
import { Box, Stack, Typography, Button } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import MessageCard, { type ThreadMessage } from './MessageCard';

export interface MessageThread {
    messages?: ThreadMessage[];
}

export interface MessageListProps {
    thread?: MessageThread;
    isLoaded: boolean;
    documentsthreadId: string;
    apiPrefix: string;
    onDeleteSingleMessage: (e: React.MouseEvent, messageId: string) => void;
    handleClickSave?: (
        e: React.MouseEvent,
        editorState: { time?: number; blocks?: unknown[] }
    ) => void;
}

const MessageList = (props: MessageListProps) => {
    const messageCount = props.thread?.messages?.length ?? 0;
    const [visibleMessageCount, setVisibleMessageCount] = useState(2);

    const handleLoadMore = () => {
        setVisibleMessageCount((prevCount) =>
            Math.min(prevCount + 5, messageCount)
        );
    };

    const messagesToShow =
        props.thread?.messages?.slice(-visibleMessageCount) ?? [];
    const hasMoreMessages = messageCount > visibleMessageCount;

    const thread = messagesToShow.map((message, i) => {
        const originalIndex = messageCount - visibleMessageCount + i;
        return (
            <MessageCard
                apiPrefix={props.apiPrefix}
                documentsthreadId={props.documentsthreadId}
                handleClickSave={props.handleClickSave}
                isLoaded={props.isLoaded}
                key={message._id}
                message={message}
                onDeleteSingleMessage={props.onDeleteSingleMessage}
            />
        );
    });

    return (
        <Box sx={{ mt: 1 }}>
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
                        Load {Math.min(5, messageCount - visibleMessageCount)}{' '}
                        more message
                        {Math.min(5, messageCount - visibleMessageCount) > 1
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
                        <Typography color="text.secondary" variant="body2">
                            No messages yet. Start the conversation!
                        </Typography>
                    </Box>
                )}
            </Stack>
        </Box>
    );
};

export default MessageList;
