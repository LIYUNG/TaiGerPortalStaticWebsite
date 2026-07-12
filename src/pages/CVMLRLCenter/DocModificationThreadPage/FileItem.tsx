import { Link as LinkDom } from 'react-router-dom';
import { Card, Link, Box, Typography } from '@mui/material';
import { FileIcon, defaultStyles } from 'react-file-icon';

import { BASE_URL } from '@/api';
import type { DocumentThreadResponse } from '@/api/types';

/** A single message of a document thread, as returned by the API. */
export type FileItemMessage = NonNullable<
    DocumentThreadResponse['messages']
>[number];

export interface FileItemProps {
    message: FileItemMessage;
}

const FileItem = ({ message }: FileItemProps) => {
    if (!message?.file || message.file.length === 0) {
        return null;
    }

    // user_id is only populated with the author's details on some endpoints.
    const author =
        typeof message.user_id === 'object' ? message.user_id : undefined;

    const filesInfo = message.file.map((file) => {
        const fileExtension = file.name.split('.').pop() ?? '';
        const normalizedPath = file.path.replace(/\\/g, '/');
        const fileUrl = `${BASE_URL}/api/document-threads/${normalizedPath}`;

        return (
            <Card key={file.path || file.name} sx={{ p: 1.5, mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                        sx={{
                            width: 24,
                            height: 24,
                            display: 'flex',
                            flexShrink: 0
                        }}
                    >
                        <FileIcon
                            extension={fileExtension}
                            {...defaultStyles[fileExtension]}
                        />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Link
                            aria-label={`Download ${file.name}`}
                            component={LinkDom}
                            rel="noopener noreferrer"
                            sx={{
                                display: 'block',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                            }}
                            target="_blank"
                            to={fileUrl}
                            underline="hover"
                        >
                            {file.name}
                        </Link>
                        {author && (
                            <Typography
                                color="text.secondary"
                                sx={{ display: 'block', mt: 0.5 }}
                                variant="caption"
                            >
                                by {author.firstname} {author.lastname}
                            </Typography>
                        )}
                    </Box>
                </Box>
            </Card>
        );
    });

    return filesInfo;
};

export default FileItem;
