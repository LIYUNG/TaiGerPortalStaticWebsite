import React, { useState } from 'react';
import { Box, Stack, Typography, Button } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import MessageCard from './MessageCard';

const MessageList = (props) => {
    const messageCount = props.thread?.messages?.length || 0;
    const [visibleMessageCount, setVisibleMessageCount] = useState(2);

    const handleLoadMore = () => {
        setVisibleMessageCount((prevCount) =>
            Math.min(prevCount + 5, messageCount)
        );
    };

    // Get the last N messages based on visibleMessageCount
    const messagesToShow =
        props.thread?.messages?.slice(-visibleMessageCount) || [];
    const hasMoreMessages = messageCount > visibleMessageCount;

    const thread = messagesToShow.map((message, i) => {
        const originalIndex = messageCount - visibleMessageCount + i;
        return (
            <MessageCard
                accordionKeys={props.accordionKeys}
                apiPrefix={props.apiPrefix}
                documentsthreadId={props.documentsthreadId}
                id={message._id}
                idx={originalIndex}
                isFirst={originalIndex === 0}
                isLast={originalIndex === messageCount - 1}
                isLoaded={props.isLoaded}
                key={message._id}
                message={message}
                onDeleteSingleMessage={props.onDeleteSingleMessage}
                singleExpandtHandler={props.singleExpandtHandler}
                user={props.user}
            />
        );
    });

    return (
        <Box sx={{ mt: 1 }}>
            {/* Load More Button */}
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

            {/* Messages Stack */}
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
