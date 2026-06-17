import {
    useRef,
    useState,
    useCallback,
    type ChangeEvent,
    type MouseEvent
} from 'react';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { is_TaiGer_role } from '@taiger-common/core';
import {
    Button,
    IconButton,
    Tooltip,
    Typography,
    Box,
    Stack,
    CircularProgress
} from '@mui/material';
import i18next from 'i18next';

import { useAuth } from '../AuthProvider';
import ComposeEditor from '../EditorJs/ComposeEditor';
import type { ComposeEditorRef } from '../EditorJs/ComposeEditor';
import type { OutputData } from '@editorjs/editorjs';

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
    const composeRef = useRef<ComposeEditorRef>(null);
    const [hasContent, setHasContent] = useState(false);
    const [isSending, setIsSending] = useState(false);

    const canSend = Boolean(hasContent && !buttonDisabled && !readOnly);

    const handleAttachClick = () => {
        if (readOnly) return;
        document.getElementById('doc-thread-file-input')?.click();
    };

    const handleSend = useCallback(
        async (e: MouseEvent<HTMLElement>) => {
            if (isSending) return;
            const content = composeRef.current?.getValue();
            if (!content?.blocks?.length) return;
            setIsSending(true);
            // Clear optimistically so the message isn't duplicated with the
            // pending entry shown in the list.
            composeRef.current?.reset();
            setHasContent(false);
            try {
                await Promise.resolve(
                    handleClickSave(e, content as EditorStateData)
                );
            } catch {
                // Send failed — restore the text so the user doesn't lose it.
                composeRef.current?.restore(content);
                setHasContent(true);
            } finally {
                setIsSending(false);
            }
        },
        [isSending, handleClickSave]
    );

    const getValidationIcon = (value: boolean | undefined) => {
        if (value === undefined) {
            return <WarningAmberIcon color="warning" fontSize="small" />;
        }
        return value ? (
            <CheckCircleIcon color="success" fontSize="small" />
        ) : (
            <ErrorOutlineIcon color="error" fontSize="small" />
        );
    };

    const fileList = file ?? [];
    const fileLength = Array.isArray(fileList) ? fileList.length : 0;

    return (
        <Box
            sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                bgcolor: 'background.paper',
                px: 1.5,
                py: 1,
                transition: 'border-color 0.15s',
                '&:focus-within': { borderColor: 'primary.main' }
            }}
        >
            {/* Editor: capped height with internal scroll so it stays compact. */}
            <Box
                sx={{
                    maxHeight: 210,
                    overflowY: 'auto',
                    // EditorJS reserves wide right padding for its inline
                    // toolbar; trim it so the scrollbar sits flush.
                    '& .codex-editor__redactor': { pb: '0 !important' },
                    '& .ce-block__content, & .ce-toolbar__content': {
                        maxWidth: 'unset'
                    }
                }}
            >
                <ComposeEditor
                    ref={composeRef}
                    defaultHeight={0}
                    holder="doc-thread-editor"
                    imageEnable={true}
                    initialValue={editorState ?? undefined}
                    readOnly={readOnly}
                    thread={
                        thread as
                            | { _id: string; student_id: { _id: string } }
                            | undefined
                    }
                    onContentChange={(value) =>
                        setHasContent(
                            Boolean(value?.blocks && value.blocks.length > 0)
                        )
                    }
                />
            </Box>

            {/* Naming checker: attached files + validation results (TaiGer only). */}
            {user != null &&
            is_TaiGer_role(user) &&
            fileLength > 0 &&
            !readOnly ? (
                <Box sx={{ mt: 1 }}>
                    {fileList.map((fl, i) => {
                        const fileChecks = (
                            checkResult as
                                | Record<string, CheckResultItem>[]
                                | undefined
                        )?.[i];
                        return (
                            <Box
                                key={`${fl.name}${i}`}
                                sx={{
                                    overflowWrap: 'break-word',
                                    wordBreak: 'break-word'
                                }}
                            >
                                <Stack
                                    alignItems="center"
                                    direction="row"
                                    spacing={0.5}
                                >
                                    <AttachFileIcon fontSize="inherit" />
                                    <Typography variant="body2">
                                        {fl.name}
                                    </Typography>
                                </Stack>
                                {fileChecks != null ? (
                                    <Stack spacing={0.25} sx={{ ml: 2 }}>
                                        {Object.keys(fileChecks).map((ky) => {
                                            const item = fileChecks[ky];
                                            return (
                                                <Stack
                                                    alignItems="center"
                                                    direction="row"
                                                    key={item?.text}
                                                    spacing={0.5}
                                                >
                                                    {getValidationIcon(
                                                        item?.value
                                                    )}
                                                    <Typography variant="body2">
                                                        {item?.text}
                                                        {item?.hasMetadata ? (
                                                            <Typography
                                                                color="primary"
                                                                component="span"
                                                                sx={{ ml: 0.5 }}
                                                            >
                                                                <strong>
                                                                    {
                                                                        item?.metaData
                                                                    }
                                                                </strong>
                                                            </Typography>
                                                        ) : null}
                                                    </Typography>
                                                </Stack>
                                            );
                                        })}
                                    </Stack>
                                ) : null}
                            </Box>
                        );
                    })}
                </Box>
            ) : null}

            {/* Compact action row: attach on the left, send on the right. */}
            <Box
                sx={{
                    alignItems: 'center',
                    display: 'flex',
                    gap: 0.5,
                    mt: 0.5
                }}
            >
                <Tooltip
                    placement="top"
                    title={i18next.t('Attach files', {
                        ns: 'common',
                        defaultValue: 'Attach files'
                    })}
                >
                    <span>
                        <input
                            accept=".pdf,.docx,.jpg,.jpeg,.png,.xlsx"
                            disabled={readOnly}
                            id="doc-thread-file-input"
                            multiple
                            onChange={onFileChange}
                            style={{ display: 'none' }}
                            type="file"
                        />
                        <IconButton
                            aria-label="attach file"
                            color="primary"
                            component="span"
                            disabled={readOnly}
                            onClick={handleAttachClick}
                            size="small"
                        >
                            <AttachFileIcon fontSize="small" />
                        </IconButton>
                    </span>
                </Tooltip>
                {fileLength > 0 ? (
                    <Typography color="text.secondary" variant="caption">
                        {`${fileLength} file${fileLength > 1 ? 's' : ''}`}
                    </Typography>
                ) : null}
                <Box sx={{ flex: 1 }} />
                <Tooltip
                    placement="top"
                    title={
                        !canSend || isSending
                            ? readOnly
                                ? (readOnlyTooltip ??
                                  i18next.t(
                                      'Program is locked. Contact an agent to unlock this task.',
                                      { ns: 'common' }
                                  ))
                                : i18next.t(
                                      'Please write some text to improve the communication and understanding.'
                                  )
                            : ''
                    }
                >
                    <span>
                        <Button
                            color="primary"
                            disabled={!canSend || isSending}
                            onClick={canSend ? handleSend : undefined}
                            startIcon={
                                isSending ? (
                                    <CircularProgress
                                        color="inherit"
                                        size={18}
                                    />
                                ) : (
                                    <SendIcon />
                                )
                            }
                            variant="contained"
                        >
                            {i18next.t('Send', { ns: 'common' })}
                        </Button>
                    </span>
                </Tooltip>
            </Box>
        </Box>
    );
};

export default DocThreadEditor;
