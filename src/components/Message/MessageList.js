import React from 'react';
import { Box, Stack, Typography } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';

import MessageCard from './MessageCard';

const MessageList = (props) => {
    const messageCount = props.thread?.messages?.length || 0;

    const thread = props.thread?.messages?.map((message, i) => (
        <MessageCard
            accordionKeys={props.accordionKeys}
            apiPrefix={props.apiPrefix}
            documentsthreadId={props.documentsthreadId}
            id={message._id}
            idx={i}
            isFirst={i === 0}
            isLast={i === messageCount - 1}
            isLoaded={props.isLoaded}
            key={i}
            message={message}
            onDeleteSingleMessage={props.onDeleteSingleMessage}
            singleExpandtHandler={props.singleExpandtHandler}
            user={props.user}
        />
    ));

    return (
        <Box sx={{ mt: 1 }}>
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
