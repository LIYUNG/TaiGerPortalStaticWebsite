import React from 'react';
import {
    Card,
    CardContent,
    Typography,
    IconButton,
    Box,
    CircularProgress
} from '@mui/material';
import {
    Edit as EditIcon,
    Save as SaveIcon,
    Cancel as CancelIcon
} from '@mui/icons-material';

const EditableCard = ({
    title,
    isEditing,
    onEdit,
    onSave,
    onCancel,
    viewContent,
    editContent,
    isLoading = false,
    hasUnsavedChanges = false,
    gridProps = {}
}) => {
    return (
        <Card sx={{ height: '100%', ...gridProps.sx }}>
            <CardContent>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 2
                    }}
                >
                    <Typography color="primary" gutterBottom variant="h6">
                        {title}
                        {isEditing && hasUnsavedChanges && (
                            <Typography
                                component="span"
                                sx={{
                                    ml: 1,
                                    color: 'warning.main',
                                    fontSize: '0.8rem',
                                    fontWeight: 'normal'
                                }}
                            >
                                • Unsaved changes
                            </Typography>
                        )}
                    </Typography>
                    {!isEditing ? (
                        <IconButton onClick={onEdit} size="small">
                            <EditIcon />
                        </IconButton>
                    ) : (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton
                                color="primary"
                                disabled={isLoading}
                                onClick={onSave}
                                size="small"
                            >
                                {isLoading ? (
                                    <CircularProgress size={20} />
                                ) : (
                                    <SaveIcon />
                                )}
                            </IconButton>
                            <IconButton
                                disabled={isLoading}
                                onClick={onCancel}
                                size="small"
                            >
                                <CancelIcon />
                            </IconButton>
                        </Box>
                    )}
                </Box>

                {!isEditing ? viewContent : editContent}
            </CardContent>
        </Card>
    );
};

export default EditableCard;
