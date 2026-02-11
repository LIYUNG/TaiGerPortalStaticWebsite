import { useEffect, useState, type ChangeEvent, type MouseEvent } from 'react';
import { Dispatch } from 'react';
import { SetStateAction } from 'react';
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
import { OutputData } from '@editorjs/editorjs';

export interface EditorStateData {
    time?: number;
    blocks?: unknown[];
}

export interface CheckResultItem {
    text: string;
    value?: boolean;
    hasMetadata?: boolean;
    metaData?: string;
}

export interface DocThreadEditorProps {
    editorState: OutputData;
    thread?: unknown;
    file?: File[] | { name: string }[];
    buttonDisabled?: boolean;
    handleClickSave: (
        e: MouseEvent<HTMLElement>,
        editorState: EditorStateData
    ) => void;
    checkResult?: Record<string, CheckResultItem>[];
    onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
    readOnly?: boolean;
    readOnlyTooltip?: string;
}

const DocThreadEditor = ({
    editorState,
    thread,
    file,
    buttonDisabled,
    handleClickSave,
    checkResult,
    onFileChange,
    readOnly = false,
    readOnlyTooltip
}: DocThreadEditorProps) => {
    const { user } = useAuth();
    const [statedata, setStatedata] = useState<{
        editorState: EditorStateData;
    }>({
        editorState: editorState ?? { time: 0, blocks: [] }
    });

    useEffect(() => {
        const nextEditorState = editorState ?? { time: 0, blocks: [] };
        queueMicrotask(() => {
            setStatedata((state) => ({
                ...state,
                editorState: nextEditorState
            }));
        });
    }, [editorState]);

    const handleEditorChange = (content: EditorStateData) => {
        setStatedata((state) => ({
            ...state,
            editorState: content
        }));
    };

    const theme = useTheme();
    const isDarkMode = theme.palette.mode === 'dark';
    const hasContent =
        statedata.editorState?.blocks != null &&
        statedata.editorState.blocks.length > 0;
    const canSend = Boolean(hasContent && !buttonDisabled && !readOnly);

    const getValidationIcon = (value: boolean | undefined) => {
        if (value === undefined) {
            return <WarningAmberIcon color="warning" sx={{ fontSize: 18 }} />;
        }
        return value ? (
            <CheckCircleIcon color="success" sx={{ fontSize: 18 }} />
        ) : (
            <ErrorOutlineIcon color="error" sx={{ fontSize: 18 }} />
        );
    };

    const fileList = file ?? [];
    const fileLength = Array.isArray(fileList) ? fileList.length : 0;

    return (
        <Stack spacing={2}>
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
                        readOnly={readOnly}
                        setStatedata={
                            setStatedata as Dispatch<
                                SetStateAction<{
                                    editorState: EditorStateData;
                                }>
                            >
                        }
                        thread={thread}
                    />
                </Box>
            </Box>

            {is_TaiGer_role(user) && fileLength > 0 && !readOnly && (
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
                        {fileList.map((fl, i) => (
                            <Box key={`${fl.name}${i}`}>
                                <Chip
                                    icon={<AttachFileIcon />}
                                    label={fl.name}
                                    size="small"
                                    sx={{ mb: 1 }}
                                    variant="outlined"
                                />
                                {checkResult != null &&
                                    checkResult.length > 0 &&
                                    checkResult[i] != null && (
                                        <Stack spacing={0.5} sx={{ ml: 1 }}>
                                            {Object.keys(checkResult[i]).map(
                                                (ky) => (
                                                    <Stack
                                                        alignItems="center"
                                                        direction="row"
                                                        key={
                                                            (
                                                                checkResult[
                                                                    i
                                                                ] as Record<
                                                                    string,
                                                                    CheckResultItem
                                                                >
                                                            )[ky]?.text
                                                        }
                                                        spacing={1}
                                                    >
                                                        {getValidationIcon(
                                                            (
                                                                checkResult[
                                                                    i
                                                                ] as Record<
                                                                    string,
                                                                    CheckResultItem
                                                                >
                                                            )[ky]?.value
                                                        )}
                                                        <Typography variant="body2">
                                                            {
                                                                (
                                                                    checkResult[
                                                                        i
                                                                    ] as Record<
                                                                        string,
                                                                        CheckResultItem
                                                                    >
                                                                )[ky]?.text
                                                            }
                                                            {(
                                                                checkResult[
                                                                    i
                                                                ] as Record<
                                                                    string,
                                                                    CheckResultItem
                                                                >
                                                            )[ky]
                                                                ?.hasMetadata && (
                                                                <Typography
                                                                    color="primary"
                                                                    component="span"
                                                                    sx={{
                                                                        ml: 0.5,
                                                                        fontWeight: 500
                                                                    }}
                                                                >
                                                                    {
                                                                        (
                                                                            checkResult[
                                                                                i
                                                                            ] as Record<
                                                                                string,
                                                                                CheckResultItem
                                                                            >
                                                                        )[ky]
                                                                            ?.metaData
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
                        ...(readOnly
                            ? {
                                  opacity: 0.6,
                                  pointerEvents: 'none'
                              }
                            : {
                                  '&:hover': {
                                      borderColor: theme.palette.primary.main,
                                      bgcolor: isDarkMode
                                          ? 'rgba(144, 202, 249, 0.08)'
                                          : 'primary.lighter',
                                      borderStyle: 'solid'
                                  }
                              })
                    }}
                >
                    <TextField
                        disabled={readOnly}
                        fullWidth
                        inputProps={{
                            multiple: true,
                            accept: '.pdf,.docx,.jpg,.jpeg,.png,.xlsx'
                        }}
                        onChange={onFileChange}
                        sx={{
                            '& .MuiInputBase-root': {
                                cursor: 'pointer'
                            }
                        }}
                        type="file"
                        variant="standard"
                    />
                    {fileLength === 0 && !readOnly && (
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

                {!readOnly ? (
                    <Alert
                        icon={<InfoOutlinedIcon fontSize="small" />}
                        severity="info"
                        sx={{ mt: 1 }}
                        variant="outlined"
                    >
                        <Typography variant="caption">
                            Max 3 files • Supported: PDF, DOCX, JPG • Max 2MB
                            total
                        </Typography>
                    </Alert>
                ) : null}
            </Box>

            <Stack
                alignItems="center"
                direction="row"
                justifyContent="space-between"
            >
                <Typography color="text.secondary" variant="caption">
                    {fileLength > 0 &&
                        `${fileLength} file${fileLength > 1 ? 's' : ''} attached`}
                </Typography>
                {!canSend ? (
                    <Tooltip
                        placement="top"
                        title={
                            readOnly
                                ? (readOnlyTooltip ??
                                  i18next.t(
                                      'Program is locked. Contact an agent to unlock this task.',
                                      { ns: 'common' }
                                  ))
                                : i18next.t(
                                      'Please write some text to improve the communication and understanding.'
                                  )
                        }
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
