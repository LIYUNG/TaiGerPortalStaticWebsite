import React, { useEffect, useState } from 'react';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { is_TaiGer_role } from '@taiger-common/core';
import {
    Button,
    TextField,
    Tooltip,
    Typography,
    Box,
    Stack,
    Alert,
    Chip,
    useTheme
} from '@mui/material';
import i18next from 'i18next';

import { useAuth } from '../AuthProvider';
import EditorSimple from '../EditorJs/EditorSimple';

const DocThreadEditor = ({
    editorState,
    thread,
    file,
    buttonDisabled,
    handleClickSave,
    checkResult,
    onFileChange
}) => {
    const { user } = useAuth();
    let [statedata, setStatedata] = useState({
        editorState: editorState
    });
    useEffect(() => {
        setStatedata((state) => ({
            ...state,
            editorState: editorState
        }));
    }, [editorState]);

    const handleEditorChange = (content) => {
        setStatedata((state) => ({
            ...state,
            editorState: content
        }));
    };

    const theme = useTheme();
    const isDarkMode = theme.palette.mode === 'dark';
    const hasContent =
        statedata.editorState.blocks && statedata.editorState.blocks.length > 0;
    const canSend = hasContent && !buttonDisabled;

    const getValidationIcon = (value) => {
        if (value === undefined) {
            return <WarningAmberIcon color="warning" sx={{ fontSize: 18 }} />;
        }
        return value ? (
            <CheckCircleIcon color="success" sx={{ fontSize: 18 }} />
        ) : (
            <ErrorOutlineIcon color="error" sx={{ fontSize: 18 }} />
        );
    };

    return (
        <Stack spacing={2}>
            {/* Editor Area */}
            <Box
                sx={{
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 1.5,
                    minHeight: 200,
                    bgcolor: 'background.paper',
                    transition: 'all 0.2s',
                    '&:focus-within': {
                        borderColor: theme.palette.primary.main,
                        boxShadow: `0 0 0 1px ${theme.palette.primary.main}`
                    }
                }}
            >
                <Box sx={{ p: 2 }}>
                    <EditorSimple
                        defaultHeight={0}
                        editorState={editorState}
                        handleEditorChange={handleEditorChange}
                        holder="editorjs"
                        imageEnable={true}
                        readOnly={false}
                        setStatedata={setStatedata}
                        thread={thread}
                    />
                </Box>
            </Box>

            {/* File Validation Results (TaiGer roles only) */}
            {is_TaiGer_role(user) && file?.length > 0 && (
                <Box>
                    <Typography
                        color="text.secondary"
                        gutterBottom
                        sx={{
                            fontSize: '0.75rem',
                            textTransform: 'uppercase',
                            letterSpacing: 0.5
                        }}
                        variant="overline"
                    >
                        File Validation Results
                    </Typography>
                    <Stack spacing={1.5}>
                        {file.map((fl, i) => (
                            <Box key={`${fl.name}${i}`}>
                                <Chip
                                    icon={<AttachFileIcon />}
                                    label={fl.name}
                                    size="small"
                                    sx={{ mb: 1 }}
                                    variant="outlined"
                                />
                                {checkResult?.length > 0 && checkResult[i] && (
                                    <Stack spacing={0.5} sx={{ ml: 1 }}>
                                        {Object.keys(checkResult[i]).map(
                                            (ky) => (
                                                <Stack
                                                    alignItems="center"
                                                    direction="row"
                                                    key={
                                                        checkResult[i][ky].text
                                                    }
                                                    spacing={1}
                                                >
                                                    {getValidationIcon(
                                                        checkResult[i][ky].value
                                                    )}
                                                    <Typography variant="body2">
                                                        {
                                                            checkResult[i][ky]
                                                                .text
                                                        }
                                                        {checkResult[i][ky]
                                                            .hasMetadata && (
                                                            <Typography
                                                                color="primary"
                                                                component="span"
                                                                sx={{
                                                                    ml: 0.5,
                                                                    fontWeight: 500
                                                                }}
                                                            >
                                                                {
                                                                    checkResult[
                                                                        i
                                                                    ][ky]
                                                                        .metaData
                                                                }
                                                            </Typography>
                                                        )}
                                                    </Typography>
                                                </Stack>
                                            )
                                        )}
                                    </Stack>
                                )}
                            </Box>
                        ))}
                    </Stack>
                </Box>
            )}

            {/* File Upload Section */}
            <Box>
                <Box
                    sx={{
                        position: 'relative',
                        border: `2px dashed ${theme.palette.divider}`,
                        borderRadius: 1.5,
                        p: 2,
                        textAlign: 'center',
                        bgcolor: isDarkMode
                            ? 'rgba(255,255,255,0.05)'
                            : 'grey.50',
                        transition: 'all 0.2s',
                        '&:hover': {
                            borderColor: theme.palette.primary.main,
                            bgcolor: isDarkMode
                                ? 'rgba(144, 202, 249, 0.08)'
                                : 'primary.lighter',
                            borderStyle: 'solid'
                        }
                    }}
                >
                    <TextField
                        fullWidth
                        inputProps={{
                            multiple: true,
                            accept: '.pdf,.docx,.jpg,.jpeg,.png'
                        }}
                        onChange={(e) => onFileChange(e)}
                        sx={{
                            '& .MuiInputBase-root': {
                                cursor: 'pointer'
                            }
                        }}
                        type="file"
                        variant="standard"
                    />
                    {!file?.length && (
                        <Stack
                            alignItems="center"
                            spacing={1}
                            sx={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                pointerEvents: 'none',
                                width: '100%'
                            }}
                        >
                            <AttachFileIcon
                                color="action"
                                sx={{ fontSize: 32 }}
                            />
                            <Typography color="text.secondary" variant="body2">
                                Click to attach files
                            </Typography>
                        </Stack>
                    )}
                </Box>

                {/* File Restrictions Info */}
                <Alert
                    icon={<InfoOutlinedIcon fontSize="small" />}
                    severity="info"
                    sx={{ mt: 1 }}
                    variant="outlined"
                >
                    <Typography variant="caption">
                        Max 3 files • Supported: PDF, DOCX, JPG • Max 2MB total
                    </Typography>
                </Alert>
            </Box>

            {/* Send Button */}
            <Stack
                alignItems="center"
                direction="row"
                justifyContent="space-between"
            >
                <Typography color="text.secondary" variant="caption">
                    {file?.length > 0 &&
                        `${file.length} file${file.length > 1 ? 's' : ''} attached`}
                </Typography>
                {!canSend ? (
                    <Tooltip
                        placement="top"
                        title={i18next.t(
                            'Please write some text to improve the communication and understanding.'
                        )}
                    >
                        <span>
                            <Button
                                color="primary"
                                disabled
                                size="large"
                                startIcon={<SendIcon />}
                                sx={{ minWidth: 120 }}
                                variant="contained"
                            >
                                {i18next.t('Send', { ns: 'common' })}
                            </Button>
                        </span>
                    </Tooltip>
                ) : (
                    <Button
                        color="primary"
                        onClick={(e) =>
                            handleClickSave(e, statedata.editorState)
                        }
                        size="large"
                        startIcon={<SendIcon />}
                        sx={{ minWidth: 120 }}
                        variant="contained"
                    >
                        {i18next.t('Send', { ns: 'common' })}
                    </Button>
                )}
            </Stack>
        </Stack>
    );
};

export default DocThreadEditor;
