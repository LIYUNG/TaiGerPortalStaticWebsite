import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Tooltip,
    Typography
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { is_TaiGer_Agent, is_TaiGer_role } from '@taiger-common/core';
import type { IUser } from '@taiger-common/model';
import { useParams } from 'react-router-dom';

import ComposeEditor from '@components/EditorJs/ComposeEditor';
import type { ComposeEditorRef } from '@components/EditorJs/ComposeEditor';
import type { OutputData } from '@editorjs/editorjs';
import { useAuth } from '@components/AuthProvider';
import FilePreview from '@components/FilePreview/FilePreview';
import { CVMLRL_DOC_PRECHECK_STATUS_E } from '@utils/contants';
import { readDOCX, readPDF, readXLSX } from '@pages/Utils/util_functions';
import { useSnackBar } from '@contexts/use-snack-bar';
import { TaiGerChatAssistant } from '@/api';
import type { CommunicationDraftFile } from '@/api/apis';
import useCommunicationDraft from '@hooks/useCommunicationDraft';
import { appConfig } from '../../config';

export interface CheckResultItem {
    text: string;
    value?: boolean;
    hasMetadata?: boolean;
    metaData?: React.ReactNode;
}

export interface CommunicationThreadEditorProps {
    buttonDisabled?: boolean;
    editorState: unknown;
    handleClickSave?: (
        e: React.MouseEvent,
        editorState: OutputData,
        files?: Array<{ name: string; path: string }>
    ) => Promise<unknown> | void;
    thread: unknown;
    files?: Array<{ name: string; path?: string }>;
    count?: number;
    checkResult?: Array<Record<string, CheckResultItem>>;
    onFileChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    /** Student first name — used by the agent attachment naming pre-check. */
    studentFirstname?: string;
    /**
     * Conversation student id. Prefer this prop — the embedded/expand views
     * render the editor outside a `:studentId` route, so `useParams()` is empty
     * there and the draft (text + attachments) would otherwise be disabled.
     */
    studentId?: string;
}

const CommunicationThreadEditor = (props: CommunicationThreadEditorProps) => {
    const { t } = useTranslation();
    const { studentId: routeStudentId } = useParams();
    // Prefer the prop; fall back to the route, then to the thread's student id —
    // so the draft (text + attachments) works in every view the editor renders.
    const threadStudentId =
        props.thread && typeof props.thread === 'object'
            ? (
                  props.thread as {
                      student_id?: { _id?: { toString(): string } | string };
                  }
              ).student_id?._id?.toString()
            : undefined;
    const studentId = props.studentId ?? routeStudentId ?? threadStudentId;
    const { handleClickSave } = props;

    const { user } = useAuth();
    const { setMessage, setSeverity, setOpenSnackbar } = useSnackBar();
    const composeRef = useRef<ComposeEditorRef>(null);
    // Ref (not a hardcoded id) so multiple editors on a page don't collide on
    // `getElementById('file-input')` — which silently broke the attach button.
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [hasContent, setHasContent] = useState(false);
    // Agent attachment naming pre-check results, keyed by the file's S3 path.
    const [checkResultByPath, setCheckResultByPath] = useState<
        Record<string, Record<string, CheckResultItem>>
    >({});
    // Preview popup for a staged draft attachment (same as sent-message files).
    const [preview, setPreview] = useState<{
        open: boolean;
        apiFilePath: string;
        fileName: string;
    }>({ open: false, apiFilePath: '', fileName: '' });

    const openPreview = (file: CommunicationDraftFile) => {
        if (!studentId) return;
        const storageName = file.path.split('/').pop() ?? file.name;
        setPreview({
            open: true,
            apiFilePath: `/api/communications/${studentId}/chat/${storageName}?name=${encodeURIComponent(
                file.name
            )}`,
            fileName: file.name
        });
    };
    const closePreview = () => setPreview((prev) => ({ ...prev, open: false }));
    const [streamingData, setStreamingData] = useState({
        data: '',
        isGenerating: false
    });
    const [isSending, setIsSending] = useState(false);

    // ── Server-side draft (Slack-style: continue an unsent message later) ──
    const {
        draft,
        draftFiles,
        isAttaching,
        isDraftLoaded,
        status,
        saveDraft,
        attachFiles,
        removeFile,
        invalidateDraft,
        resetDraftCache
    } = useCommunicationDraft(studentId);
    // Path of the staged attachment currently being unattached (for its spinner).
    const [deletingPath, setDeletingPath] = useState<string | null>(null);

    const handleRemoveFile = async (path: string) => {
        if (deletingPath) return;
        setDeletingPath(path);
        try {
            await removeFile(path);
        } catch (error: unknown) {
            const err = error as {
                response?: { data?: { message?: string } };
                message?: string;
            };
            setSeverity('error');
            setMessage(
                err?.response?.data?.message ??
                    err?.message ??
                    t('Failed to remove file.', {
                        ns: 'common',
                        defaultValue: 'Failed to remove file.'
                    })
            );
            setOpenSnackbar(true);
        } finally {
            setDeletingPath(null);
        }
    };
    // Normalized (blocks-only, ignores EditorJS `time`) snapshot of what's been
    // persisted, so re-emitting the same content (e.g. the restore echo or the
    // initial empty editor) doesn't trigger a redundant save/delete.
    const lastSavedBlocksRef = useRef<string>('[]');
    // The student id whose draft is currently applied to the editor. Drives the
    // single sync effect below; `undefined` until the first draft is applied.
    const appliedStudentRef = useRef<string | undefined>(undefined);

    // Keep the editor's content in sync with the active student's saved draft.
    //
    // This is ONE effect on purpose. Splitting "clear on student change" and
    // "restore when the draft loads" into two effects raced: the clear mutates
    // the editor value asynchronously (a remount) while the restore read it back
    // via rAF, so depending on frame timing the restore saw the *previous*
    // student's content, decided the editor was "not empty", and skipped — which
    // is why a draft sometimes only appeared after switching away and back.
    //
    // Here a single rAF (which also waits for the ComposeEditor ref on a fresh
    // mount) does the whole decision atomically:
    //   • Student switch  → always replace the editor with the new student's
    //     draft (or clear it), since it still holds the previous student's text.
    //   • First load for a student → only fill an empty editor, so we don't
    //     clobber text the user already started typing before the draft arrived.
    useEffect(() => {
        if (!studentId || !isDraftLoaded) return;
        if (appliedStudentRef.current === studentId) return;

        let raf = 0;
        const apply = () => {
            const editor = composeRef.current;
            if (!editor) {
                raf = window.requestAnimationFrame(apply); // ref not ready yet
                return;
            }
            const prevApplied = appliedStudentRef.current;
            const switched =
                prevApplied !== undefined && prevApplied !== studentId;
            appliedStudentRef.current = studentId;

            // On a switch the editor holds the previous student's content, so we
            // can't gate on isEmpty() (it would never be empty) — always replace.
            // On the first application, preserve any text the user already typed.
            if (switched || editor.isEmpty()) {
                if (draft) {
                    lastSavedBlocksRef.current = JSON.stringify(
                        draft.blocks ?? []
                    );
                    editor.restore(draft);
                    setHasContent(Boolean(draft.blocks?.length));
                } else {
                    lastSavedBlocksRef.current = '[]';
                    editor.reset();
                    setHasContent(false);
                }
            }
        };
        raf = window.requestAnimationFrame(apply);
        return () => window.cancelAnimationFrame(raf);
    }, [studentId, isDraftLoaded, draft]);

    const handleContentChange = useCallback(
        (value: OutputData) => {
            setHasContent(Boolean(value?.blocks && value.blocks.length > 0));
            const blocksKey = JSON.stringify(value?.blocks ?? []);
            if (blocksKey !== lastSavedBlocksRef.current) {
                lastSavedBlocksRef.current = blocksKey;
                saveDraft(value);
            }
        },
        [saveDraft]
    );

    const handleSend = useCallback(
        async (e: React.MouseEvent) => {
            if (isSending) return;
            const content = composeRef.current?.getValue();
            if (!content?.blocks?.length) return;
            setIsSending(true);

            // Capture the staged attachments before the optimistic clear so the
            // pending message row can render them.
            const filesToSend = draftFiles.map((f) => ({
                name: f.name,
                path: f.path
            }));

            // Optimistic: clear the composer + its staged attachments at once so
            // it feels instant (the server moves the draft files onto the
            // message and deletes the draft as a unit).
            composeRef.current?.reset();
            setHasContent(false);
            lastSavedBlocksRef.current = '[]';
            resetDraftCache();

            try {
                await handleClickSave?.(e, content, filesToSend);
                // Confirm the (now-deleted) draft from the server.
                invalidateDraft();
            } catch {
                // Send failed → roll back: restore the text and the staged
                // attachments (the draft was NOT consumed server-side). The
                // mutation's own onError surfaces the error message.
                composeRef.current?.restore(content);
                lastSavedBlocksRef.current = JSON.stringify(
                    content.blocks ?? []
                );
                setHasContent(Boolean(content.blocks?.length));
                invalidateDraft();
            } finally {
                setIsSending(false);
            }
        },
        [
            isSending,
            handleClickSave,
            invalidateDraft,
            resetDraftCache,
            draftFiles
        ]
    );

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleAttach = useCallback(
        async (e: React.ChangeEvent<HTMLInputElement>) => {
            // Copy the File refs into a stable array BEFORE resetting the input —
            // setting `value = ''` empties `e.target.files` (and the live
            // FileList we'd otherwise still be holding), so reading it after the
            // reset yields zero files.
            const selected = Array.from(e.target.files ?? []);
            e.target.value = '';
            if (selected.length === 0) return;
            if (!studentId) {
                setSeverity('error');
                setMessage(
                    t('Cannot attach: conversation not loaded yet.', {
                        ns: 'common',
                        defaultValue:
                            'Cannot attach: conversation not loaded yet.'
                    })
                );
                setOpenSnackbar(true);
                return;
            }
            if (draftFiles.length + selected.length > 3) {
                setSeverity('error');
                setMessage(
                    t('You can only attach up to 3 files.', {
                        ns: 'common',
                        defaultValue: 'You can only attach up to 3 files.'
                    })
                );
                setOpenSnackbar(true);
                return;
            }

            // Upload first so a pre-check hiccup can never block the attach.
            let created: CommunicationDraftFile[] = [];
            try {
                created = await attachFiles(selected);
            } catch (error: unknown) {
                const err = error as {
                    response?: { data?: { message?: string } };
                    message?: string;
                };
                setSeverity('error');
                setMessage(
                    err?.response?.data?.message ??
                        err?.message ??
                        t('Failed to attach file. Please try again.', {
                            ns: 'common',
                            defaultValue:
                                'Failed to attach file. Please try again.'
                        })
                );
                setOpenSnackbar(true);
                return;
            }

            // Agent-only naming pre-check (best-effort): read the file contents
            // and validate against the student's name + document conventions.
            if (created.length && is_TaiGer_role(user as IUser)) {
                const studentName = props.studentFirstname ?? '';
                try {
                    const results = (await Promise.all(
                        selected.map((file) => {
                            const ext = file.name
                                .split('.')
                                .pop()
                                ?.toLowerCase();
                            if (ext === 'pdf')
                                return readPDF(file, studentName);
                            if (ext === 'docx')
                                return readDOCX(file, studentName);
                            if (ext === 'xlsx')
                                return readXLSX(file, studentName);
                            return Promise.resolve({});
                        })
                    )) as Array<Record<string, CheckResultItem>>;
                    setCheckResultByPath((prev) => {
                        const next = { ...prev };
                        created.forEach((file, i) => {
                            if (results[i]) next[file.path] = results[i];
                        });
                        return next;
                    });
                } catch {
                    // Pre-check is advisory only — ignore its failures.
                }
            }
        },
        [
            attachFiles,
            draftFiles.length,
            studentId,
            user,
            props.studentFirstname,
            t,
            setMessage,
            setSeverity,
            setOpenSnackbar
        ]
    );

    const onSubmit = async () => {
        setStreamingData((prev) => ({ ...prev, isGenerating: true }));
        const response = await TaiGerChatAssistant('abc', studentId ?? '');
        const reader = response.body
            ?.pipeThrough(new TextDecoderStream())
            .getReader();
        if (!reader) {
            setStreamingData((prev) => ({ ...prev, isGenerating: false }));
            return;
        }
        let data = '';
        while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            data += value;
            setStreamingData((prev) => ({ ...prev, data }));
        }
        setStreamingData((prev) => ({ ...prev, data, isGenerating: false }));
    };
    const sendDisabled = !hasContent || props.buttonDisabled || isSending;

    return (
        <>
            <Box
                sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    bgcolor: 'background.paper',
                    px: 1.5,
                    py: 1,
                    transition: 'border-color 0.15s',
                    '&:focus-within': { borderColor: 'primary.main' },
                    // Dynamic height: the composer grows with the text while
                    // focused (up to the larger cap), and shrinks back to a
                    // compact height when focus leaves.
                    '&:focus-within .compose-scroll': { maxHeight: 240 }
                }}
            >
                <Box
                    className="compose-scroll"
                    sx={{
                        maxHeight: 96,
                        overflowY: 'auto',
                        transition: 'max-height 0.2s ease',
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
                        holder="communication-thread-editor"
                        imageEnable={false}
                        initialValue={
                            props.editorState &&
                            typeof props.editorState === 'object' &&
                            'blocks' in (props.editorState as object)
                                ? (props.editorState as OutputData)
                                : undefined
                        }
                        readOnly={false}
                        thread={
                            props.thread as
                                | { _id: string; student_id: { _id: string } }
                                | undefined
                        }
                        onContentChange={handleContentChange}
                    />
                </Box>

                {/* Staged draft attachments (upload-on-attach). Each can be
                    unattached, which deletes it from S3 and the draft. */}
                {draftFiles.length > 0 ? (
                    <Box sx={{ mt: 1 }}>
                        {draftFiles.map((fl) => (
                            <Box
                                key={fl.path}
                                sx={{
                                    alignItems: 'center',
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: 0.5,
                                    wordBreak: 'break-word',
                                    overflowWrap: 'break-word',
                                    opacity: deletingPath === fl.path ? 0.5 : 1,
                                    transition: 'opacity 0.15s'
                                }}
                            >
                                <AttachFileIcon
                                    color="action"
                                    fontSize="inherit"
                                />
                                <Tooltip
                                    placement="top"
                                    title={t('Preview', {
                                        ns: 'common',
                                        defaultValue: 'Preview'
                                    })}
                                >
                                    <Typography
                                        onClick={() => openPreview(fl)}
                                        sx={{
                                            flex: 1,
                                            cursor: 'pointer',
                                            textDecoration: 'underline'
                                        }}
                                        variant="body2"
                                    >
                                        {fl.name}
                                    </Typography>
                                </Tooltip>
                                <Tooltip
                                    placement="top"
                                    title={t('Remove', {
                                        ns: 'common',
                                        defaultValue: 'Remove'
                                    })}
                                >
                                    <IconButton
                                        aria-label="remove file"
                                        disabled={deletingPath === fl.path}
                                        onClick={() =>
                                            void handleRemoveFile(fl.path)
                                        }
                                        size="small"
                                    >
                                        {deletingPath === fl.path ? (
                                            <CircularProgress size={14} />
                                        ) : (
                                            <CloseIcon fontSize="inherit" />
                                        )}
                                    </IconButton>
                                </Tooltip>
                                {/* Agent naming pre-check results for this file */}
                                {checkResultByPath[fl.path]
                                    ? Object.keys(
                                          checkResultByPath[fl.path]
                                      ).map((ky) => {
                                          const item =
                                              checkResultByPath[fl.path][ky];
                                          return (
                                              <Typography
                                                  key={item.text}
                                                  sx={{
                                                      flexBasis: '100%',
                                                      ml: 3
                                                  }}
                                                  variant="caption"
                                              >
                                                  {item.value === undefined
                                                      ? CVMLRL_DOC_PRECHECK_STATUS_E.WARNING_SYMBOK
                                                      : item.value
                                                        ? CVMLRL_DOC_PRECHECK_STATUS_E.OK_SYMBOL
                                                        : CVMLRL_DOC_PRECHECK_STATUS_E.NOT_OK_SYMBOL}
                                                  {item.text}
                                                  {item.hasMetadata
                                                      ? item.metaData
                                                      : null}
                                              </Typography>
                                          );
                                      })
                                    : null}
                            </Box>
                        ))}
                    </Box>
                ) : null}

                {/* Compact action row: attach + AI assist on the left, send on the right */}
                <Box
                    sx={{
                        alignItems: 'center',
                        display: 'flex',
                        gap: 0.5,
                        mt: 0.5
                    }}
                >
                    <Tooltip placement="top" title={t('Attach files')}>
                        <span>
                            <input
                                multiple
                                onChange={handleAttach}
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                type="file"
                            />
                            <IconButton
                                aria-label="attach file"
                                color="primary"
                                component="span"
                                disabled={isAttaching}
                                onClick={handleClick}
                                size="small"
                            >
                                {isAttaching ? (
                                    <CircularProgress size={18} />
                                ) : (
                                    <AttachFileIcon fontSize="small" />
                                )}
                            </IconButton>
                        </span>
                    </Tooltip>
                    {appConfig.AIEnable && is_TaiGer_role(user as IUser) ? (
                        <Tooltip
                            placement="top"
                            title={t('AI assist', {
                                ns: 'common',
                                defaultValue: 'AI assist'
                            })}
                        >
                            <span>
                                <IconButton
                                    color="primary"
                                    disabled={streamingData.isGenerating}
                                    onClick={onSubmit}
                                    size="small"
                                >
                                    {streamingData.isGenerating ? (
                                        <CircularProgress size={18} />
                                    ) : (
                                        <AutoFixHighIcon fontSize="small" />
                                    )}
                                </IconButton>
                            </span>
                        </Tooltip>
                    ) : null}
                    {status === 'saving' || status === 'saved' ? (
                        <Typography
                            color="text.secondary"
                            sx={{ ml: 0.5 }}
                            variant="caption"
                        >
                            {status === 'saving'
                                ? t('Saving draft…', {
                                      ns: 'common',
                                      defaultValue: 'Saving draft…'
                                  })
                                : t('Draft saved', {
                                      ns: 'common',
                                      defaultValue: 'Draft saved'
                                  })}
                        </Typography>
                    ) : null}
                    <Box sx={{ flex: 1 }} />
                    <Tooltip
                        placement="top"
                        title={
                            sendDisabled && !isSending
                                ? t(
                                      'Please write some text to improve the communication and understanding.'
                                  )
                                : ''
                        }
                    >
                        <span>
                            <Button
                                color="primary"
                                disabled={sendDisabled}
                                onClick={!sendDisabled ? handleSend : undefined}
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
                                {t('Send', { ns: 'common' })}
                            </Button>
                        </span>
                    </Tooltip>
                </Box>
            </Box>

            {/* AI assistant streamed suggestion (agents only) */}
            {is_TaiGer_Agent(user as IUser) && streamingData.data ? (
                <Box
                    sx={{
                        mt: 1,
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: 'action.hover'
                    }}
                >
                    <Typography
                        color="text.secondary"
                        sx={{ display: 'block', mb: 0.5 }}
                        variant="caption"
                    >
                        {t('AI assist', {
                            ns: 'common',
                            defaultValue: 'AI assist'
                        })}
                    </Typography>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {streamingData.data}
                    </ReactMarkdown>
                </Box>
            ) : null}

            {/* Preview a staged attachment before sending (same popup as
                sent-message attachments). */}
            <Dialog
                fullWidth
                maxWidth="xl"
                onClose={closePreview}
                open={preview.open}
            >
                <DialogTitle>{preview.fileName}</DialogTitle>
                <FilePreview
                    apiFilePath={preview.apiFilePath}
                    path={preview.fileName}
                />
                <DialogContent />
                <DialogActions>
                    <Button
                        onClick={closePreview}
                        size="small"
                        variant="outlined"
                    >
                        {t('Close', { ns: 'common' })}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default CommunicationThreadEditor;
