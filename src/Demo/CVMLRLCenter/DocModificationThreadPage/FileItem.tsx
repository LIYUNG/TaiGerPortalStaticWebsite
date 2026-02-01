import React from 'react';
import { Link as LinkDom } from 'react-router-dom';
import { Card, Link, Box, Typography } from '@mui/material';
import { FileIcon, defaultStyles } from 'react-file-icon';
import PropTypes from 'prop-types';

import { BASE_URL } from '../../../api/request';

const FileItem = ({ message }) => {
    if (!message?.file || message.file.length === 0) {
        return null;
    }

    const filesInfo = message.file.map((file) => {
        const fileExtension = file.name.split('.').pop();
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
                        {message.user_id && (
                            <Typography
                                color="text.secondary"
                                sx={{ display: 'block', mt: 0.5 }}
                                variant="caption"
                            >
                                by {message.user_id.firstname}{' '}
                                {message.user_id.lastname}
                            </Typography>
                        )}
                    </Box>
                </Box>
            </Card>
        );
    });

    return filesInfo;
};

FileItem.propTypes = {
    message: PropTypes.shape({
        file: PropTypes.arrayOf(
            PropTypes.shape({
                name: PropTypes.string.isRequired,
                path: PropTypes.string.isRequired
            })
        ),
        user_id: PropTypes.shape({
            firstname: PropTypes.string,
            lastname: PropTypes.string
        })
    })
};

export default FileItem;
