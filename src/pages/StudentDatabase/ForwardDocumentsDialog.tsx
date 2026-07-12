/**
 * Forward a student's documents by email.
 *
 * Lets a staff user attach the latest CV / ML / RL (and related) files from the
 * student's document threads and base "My Documents", then send them to other
 * TaiGer staff (To / Cc / Bcc). Recipients are chosen from the team member list
 * and submitted as **user ids** — the backend resolves and authorizes the
 * emails, so the client never sends raw addresses.
 *
 * When opened for a specific `application`, the dialog defaults to that
 * application's documents plus the shared general documents (CV, Others,
 * Recommendation_Letter_A/B, Form_A/B) and pre-fills a subject + message.
 */
import { useMemo, useState } from 'react';
import {
    Alert,
    Autocomplete,
    Box,
    Button,
    Checkbox,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControlLabel,
    TextField,
    Typography
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { useTranslation } from 'react-i18next';
import { PROFILE_NAME } from '@taiger-common/core';
import type { IUserWithId } from '@taiger-common/model';

import { forwardStudentDocuments } from '@/api';
import { useTeamMembers } from '@hooks/useTeamMembers';
import { useSnackBar } from '@contexts/use-snack-bar';

/** Minimal thread shape used here (doc_thread_id is the populated thread). */
interface ForwardDocThread {
    doc_thread_id?: {
        _id?: { toString(): string } | string;
        file_type?: string;
    };
}

interface ForwardProgram {
    _id?: { toString(): string } | string;
    school?: string;
    program_name?: string;
    degree?: string;
    semester?: string;
}

export interface ForwardApplication {
    _id?: { toString(): string } | string;
    doc_modification_thread?: ForwardDocThread[];
    programId?: ForwardProgram;
}

interface ForwardProfileItem {
    name: string;
    path?: string;
}

export interface ForwardDocumentsStudent {
    _id: string | { toString(): string };
    firstname?: string;
    lastname?: string;
    profile?: ForwardProfileItem[];
    generaldocs_threads?: ForwardDocThread[];
    applications?: ForwardApplication[];
}

export interface ForwardDocumentsDialogProps {
    open: boolean;
    onClose: () => void;
    student: ForwardDocumentsStudent;
    /** When provided, the dialog is scoped to this application. */
    application?: ForwardApplication;
}

interface ThreadOption {
    id: string;
    fileType: string;
    group: string;
}

interface CollectLabels {
    general: string;
    applicationFallback: string;
}

// General documents to default-attach alongside a specific application.
const SCOPED_GENERAL_FILE_TYPES = [
    'CV',
    'Others',
    'Recommendation_Letter_A',
    'Recommendation_Letter_B',
    'Form_A',
    'Form_B'
];

const idToString = (value: { toString(): string } | string | undefined) =>
    value == null ? '' : value.toString();

// CV / ML / RL only (used in the unscoped/global mode). Covers variants such as
// CV_US, RL_A, RL_B, etc.
const isForwardableFileType = (fileType?: string) =>
    !!fileType && /CV|ML|RL/i.test(fileType);

const programGroupLabel = (
    program: ForwardProgram | undefined,
    fallback: string
) => {
    if (!program) return fallback;
    const label =
        `${program.school ?? ''} ${program.program_name ?? ''}`.trim();
    return label || fallback;
};

// Pure, reused by both the render memo and the initial-state computation.
const collectThreadOptions = (
    student: ForwardDocumentsStudent,
    application: ForwardApplication | undefined,
    labels: CollectLabels
): ThreadOption[] => {
    const options: ThreadOption[] = [];
    const seen = new Set<string>();
    const push = (
        thread: ForwardDocThread,
        group: string,
        allow?: (fileType?: string) => boolean
    ) => {
        const id = idToString(thread?.doc_thread_id?._id);
        const fileType = thread?.doc_thread_id?.file_type;
        if (!id || seen.has(id) || !fileType) return;
        if (allow && !allow(fileType)) return;
        seen.add(id);
        options.push({ id, fileType, group });
    };

    if (application) {
        // Scoped: the listed general documents + this application's documents.
        (student.generaldocs_threads ?? []).forEach((thread) =>
            push(thread, labels.general, (fileType) =>
                SCOPED_GENERAL_FILE_TYPES.includes(fileType ?? '')
            )
        );
        const group = programGroupLabel(
            application.programId,
            labels.applicationFallback
        );
        (application.doc_modification_thread ?? []).forEach((thread) =>
            push(thread, group)
        );
        return options;
    }

    // Unscoped: all general + all applications, CV/ML/RL only.
    (student.generaldocs_threads ?? []).forEach((thread) =>
        push(thread, labels.general, isForwardableFileType)
    );
    (student.applications ?? []).forEach((app) => {
        const group = programGroupLabel(
            app.programId,
            labels.applicationFallback
        );
        (app.doc_modification_thread ?? []).forEach((thread) =>
            push(thread, group, isForwardableFileType)
        );
    });
    return options;
};

const ForwardDocumentsDialog = ({
    open,
    onClose,
    student,
    application
}: ForwardDocumentsDialogProps) => {
    const { t } = useTranslation();
    const { setMessage, setSeverity, setOpenSnackbar } = useSnackBar();
    const { teams, isLoading: isTeamsLoading } = useTeamMembers();

    const studentId = idToString(student._id);
    const studentName = `${student.firstname ?? ''} ${
        student.lastname ?? ''
    }`.trim();
    const programLabel = application
        ? programGroupLabel(application.programId, '')
        : '';

    const labels = useMemo<CollectLabels>(
        () => ({
            general: t('General Documents', { ns: 'common' }),
            applicationFallback: t('Application', { ns: 'common' })
        }),
        [t]
    );

    const baseDocuments = useMemo(
        () =>
            (student.profile ?? [])
                .filter((doc) => doc?.name && doc?.path)
                .map((doc) => ({
                    name: doc.name,
                    label:
                        (PROFILE_NAME as Record<string, string>)[doc.name] ??
                        doc.name
                })),
        [student.profile]
    );
    const baseDocumentNamesAll = useMemo(
        () => baseDocuments.map((doc) => doc.name),
        [baseDocuments]
    );

    const threadOptions = useMemo<ThreadOption[]>(
        () => collectThreadOptions(student, application, labels),
        [student, application, labels]
    );

    const [recipients, setRecipients] = useState<IUserWithId[]>([]);
    const [cc, setCc] = useState<IUserWithId[]>([]);
    const [bcc, setBcc] = useState<IUserWithId[]>([]);
    // All existing base ("My Documents") files are attached by default; the user
    // can deselect any.
    const [selectedBaseNames, setSelectedBaseNames] =
        useState<string[]>(baseDocumentNamesAll);
    // Scoped mode defaults to all of the application's + general documents.
    const [selectedThreadIds, setSelectedThreadIds] = useState<string[]>(() =>
        application
            ? collectThreadOptions(student, application, {
                  general: 'General Documents',
                  applicationFallback: 'Application'
              }).map((option) => option.id)
            : []
    );
    const [subject, setSubject] = useState(() =>
        application
            ? `${studentName}${programLabel ? ` - ${programLabel}` : ''} - ${t(
                  'Documents',
                  { ns: 'common' }
              )}`.trim()
            : ''
    );
    // The email already renders an Application table + file list, so the default
    // note stays short and does not repeat the program details here.
    const [message, setMessage_] = useState(() =>
        application
            ? `Please find attached the documents for ${studentName}.`
            : ''
    );
    const [isSending, setIsSending] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    // Documents with no uploaded file, awaiting the user's acknowledgement.
    const [missingDocs, setMissingDocs] = useState<string[]>([]);

    const toggle = (
        values: string[],
        value: string,
        setter: (next: string[]) => void
    ) => {
        setter(
            values.includes(value)
                ? values.filter((v) => v !== value)
                : [...values, value]
        );
    };

    const hasRecipients = recipients.length > 0;
    const hasDocuments =
        selectedBaseNames.length > 0 || selectedThreadIds.length > 0;
    const canSend = hasRecipients && hasDocuments && !isSending && !!studentId;

    const handleSend = async (confirmMissing = false) => {
        if (!canSend) return;
        setIsSending(true);
        setErrorMsg('');
        try {
            const res = await forwardStudentDocuments(studentId, {
                recipientIds: recipients.map((u) => idToString(u._id)),
                ccIds: cc.map((u) => idToString(u._id)),
                bccIds: bcc.map((u) => idToString(u._id)),
                threadIds: selectedThreadIds,
                baseDocumentNames: selectedBaseNames,
                subject: subject.trim(),
                message: message.trim(),
                program: application?.programId
                    ? {
                          school: application.programId.school,
                          program_name: application.programId.program_name,
                          degree: application.programId.degree,
                          semester: application.programId.semester
                      }
                    : undefined,
                confirmMissing
            });
            const data = res?.data;
            // Some selected documents have no file — ask the user to acknowledge
            // before sending, so they are never unaware of the omission.
            if (data?.status === 'missing_documents') {
                setMissingDocs(data.missing ?? []);
                return;
            }
            const skippedCount = data?.skipped?.length ?? 0;
            setSeverity('success');
            setMessage(
                skippedCount > 0
                    ? t('Documents forwarded, some omitted', {
                          ns: 'common',
                          count: skippedCount
                      })
                    : t('Documents forwarded', {
                          ns: 'common',
                          count: data?.attachmentCount ?? 0
                      })
            );
            setOpenSnackbar(true);
            onClose();
        } catch (error: unknown) {
            const err = error as {
                response?: { data?: { message?: string } };
                message?: string;
            };
            const messageText =
                err?.response?.data?.message ??
                err?.message ??
                t('Failed to forward documents', { ns: 'common' });
            // Keep the dialog open and show the reason inline (e.g. which
            // documents have no file, or that the size limit was exceeded) so
            // the user can adjust the selection before retrying.
            setErrorMsg(messageText);
            setSeverity('error');
            setMessage(messageText);
            setOpenSnackbar(true);
        } finally {
            setIsSending(false);
        }
    };

    const recipientLabel = (option: IUserWithId) =>
        `${option.lastname ?? ''} ${option.firstname ?? ''}${
            option.email ? ` (${option.email})` : ''
        }`.trim();

    const renderRecipientField = (
        label: string,
        value: IUserWithId[],
        onChange: (value: IUserWithId[]) => void,
        required?: boolean
    ) => (
        <Autocomplete
            disabled={isSending}
            getOptionLabel={recipientLabel}
            isOptionEqualToValue={(option, val) =>
                idToString(option._id) === idToString(val._id)
            }
            loading={isTeamsLoading}
            multiple
            onChange={(_e, next) => onChange(next)}
            options={teams}
            renderInput={(params) => (
                <TextField {...params} label={label} required={required} />
            )}
            size="small"
            value={value}
        />
    );

    return (
        <>
            <Dialog
                fullWidth
                maxWidth="sm"
                onClose={isSending ? undefined : onClose}
                open={open}
            >
                <DialogTitle>
                    {t('Forward documents', { ns: 'common' })}
                    {studentName ? ` — ${studentName}` : ''}
                    {programLabel ? ` · ${programLabel}` : ''}
                </DialogTitle>
                <DialogContent dividers>
                    {errorMsg && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {errorMsg}
                        </Alert>
                    )}
                    {renderRecipientField(
                        t('To (agents)', { ns: 'common' }),
                        recipients,
                        setRecipients,
                        true
                    )}
                    <Box sx={{ height: 12 }} />
                    {renderRecipientField(t('Cc', { ns: 'common' }), cc, setCc)}
                    <Box sx={{ height: 12 }} />
                    {renderRecipientField(
                        t('Bcc', { ns: 'common' }),
                        bcc,
                        setBcc
                    )}

                    <Divider sx={{ my: 2 }} />

                    {baseDocuments.length > 0 && (
                        <>
                            <Typography
                                sx={{ fontWeight: 600 }}
                                variant="subtitle2"
                            >
                                {t('Base documents', { ns: 'common' })}
                            </Typography>
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    ml: 1
                                }}
                            >
                                {baseDocuments.map((doc) => (
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={selectedBaseNames.includes(
                                                    doc.name
                                                )}
                                                disabled={isSending}
                                                onChange={() =>
                                                    toggle(
                                                        selectedBaseNames,
                                                        doc.name,
                                                        setSelectedBaseNames
                                                    )
                                                }
                                                size="small"
                                            />
                                        }
                                        key={doc.name}
                                        label={doc.label}
                                    />
                                ))}
                            </Box>
                        </>
                    )}

                    <Typography
                        sx={{ fontWeight: 600, mt: 1 }}
                        variant="subtitle2"
                    >
                        {t('Documents', { ns: 'common' })}
                    </Typography>
                    {threadOptions.length > 0 ? (
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                ml: 1
                            }}
                        >
                            {threadOptions.map((option) => (
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={selectedThreadIds.includes(
                                                option.id
                                            )}
                                            disabled={isSending}
                                            onChange={() =>
                                                toggle(
                                                    selectedThreadIds,
                                                    option.id,
                                                    setSelectedThreadIds
                                                )
                                            }
                                            size="small"
                                        />
                                    }
                                    key={option.id}
                                    label={`${option.fileType} — ${option.group}`}
                                />
                            ))}
                        </Box>
                    ) : (
                        <Typography color="text.secondary" variant="body2">
                            {t('No documents available', { ns: 'common' })}
                        </Typography>
                    )}

                    <Divider sx={{ my: 2 }} />

                    <TextField
                        disabled={isSending}
                        fullWidth
                        label={t('Subject', { ns: 'common' })}
                        onChange={(e) => setSubject(e.target.value)}
                        size="small"
                        sx={{ mb: 1.5 }}
                        value={subject}
                    />
                    <TextField
                        disabled={isSending}
                        fullWidth
                        label={t('Message', { ns: 'common' })}
                        minRows={3}
                        multiline
                        onChange={(e) => setMessage_(e.target.value)}
                        size="small"
                        value={message}
                    />
                </DialogContent>
                <DialogActions>
                    <Button
                        color="secondary"
                        disabled={isSending}
                        onClick={onClose}
                        variant="outlined"
                    >
                        {t('Cancel', { ns: 'common' })}
                    </Button>
                    <Button
                        color="primary"
                        disabled={!canSend}
                        onClick={() => handleSend()}
                        startIcon={
                            isSending ? (
                                <CircularProgress size={18} />
                            ) : (
                                <SendIcon />
                            )
                        }
                        variant="contained"
                    >
                        {t('Send', { ns: 'common' })}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                fullWidth
                maxWidth="xs"
                onClose={isSending ? undefined : () => setMissingDocs([])}
                open={missingDocs.length > 0}
            >
                <DialogTitle>
                    {t('Some documents have no file', { ns: 'common' })}
                </DialogTitle>
                <DialogContent dividers>
                    <Alert severity="warning" sx={{ mb: 1 }}>
                        {t(
                            'The following documents have no uploaded file and will NOT be included in the email:',
                            { ns: 'common' }
                        )}
                    </Alert>
                    <Box component="ul" sx={{ pl: 3, my: 1 }}>
                        {missingDocs.map((doc) => (
                            <li key={doc}>
                                <Typography variant="body2">{doc}</Typography>
                            </li>
                        ))}
                    </Box>
                    <Typography variant="body2">
                        {t('Do you want to send the email without them?', {
                            ns: 'common'
                        })}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button
                        color="secondary"
                        disabled={isSending}
                        onClick={() => setMissingDocs([])}
                        variant="outlined"
                    >
                        {t('Go back', { ns: 'common' })}
                    </Button>
                    <Button
                        color="primary"
                        disabled={isSending}
                        onClick={() => {
                            setMissingDocs([]);
                            handleSend(true);
                        }}
                        startIcon={
                            isSending ? (
                                <CircularProgress size={18} />
                            ) : (
                                <SendIcon />
                            )
                        }
                        variant="contained"
                    >
                        {t('Send anyway', { ns: 'common' })}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default ForwardDocumentsDialog;
