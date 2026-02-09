import { Box, Typography } from '@mui/material';

import FileItem from './FileItem';
import type { DocumentThreadResponse } from '../../../api/types';

export interface FilesListProps {
    thread: DocumentThreadResponse | null;
}

const FilesList = ({ thread }: FilesListProps) => {
    if (!thread?.messages || thread.messages.length === 0) {
        return (
            <Box sx={{ px: 2, py: 3, textAlign: 'center' }}>
                <Typography color="text.secondary" variant="body2">
                    No messages found in this thread.
                </Typography>
            </Box>
        );
    }

    // Filter messages that have files
    const messagesWithFiles = thread.messages.filter(
        (message) => message?.file && message.file.length > 0
    );

    if (messagesWithFiles.length === 0) {
        return (
            <Box sx={{ px: 2, py: 3, textAlign: 'center' }}>
                <Typography color="text.secondary" variant="body2">
                    No files have been uploaded yet.
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ px: 2 }}>
            {messagesWithFiles.map((message) => (
                <FileItem key={message._id} message={message} />
            ))}
        </Box>
    );
};

export default FilesList;
