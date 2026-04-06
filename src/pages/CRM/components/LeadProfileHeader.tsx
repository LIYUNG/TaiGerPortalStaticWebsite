import { MouseEvent, useRef, useState } from 'react';
import {
    Box,
    Avatar,
    Chip,
    Link,
    Typography,
    Grid,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    IconButton,
    InputAdornment,
    Button,
    CircularProgress
} from '@mui/material';
import {
    Edit as EditIcon,
    Save as SaveIcon,
    Cancel as CancelIcon,
    PersonAdd as PersonAddIcon,
    Close as CloseIcon,
    Add as AddIcon,
    Female as FemaleIcon,
    Male as MaleIcon,
    Transgender as OtherGenderIcon
} from '@mui/icons-material';

import DealItem from '@pages/CRM/components/DealItem';
import { getDealId } from '@pages/CRM/components/statusUtils';
import {
    getLeadStatusLabel,
    getLeadStatusOptions
} from '@pages/CRM/constants/statusOptions';
import type { TFunction } from 'i18next';

type LeadLike = {
    fullName?: string;
    applicantRole?: string;
    gender?: string;
    closeLikelihood?: string | number;
    status?: string;
    userId?: string;
    salesNote?: string;
    salesRep?: { userId?: string; label?: string } | string;
    deals?: Record<string, unknown>[];
    tags?: unknown[];
    notes?: unknown[];
    [key: string]: unknown;
};

type StatusMutation = {
    isPending: boolean;
    variables?: { id?: string };
    mutate: (
        args: { id: string; status: string; closedAt?: string },
        opts?: { onSettled?: () => void }
    ) => void;
};

interface LeadProfileHeaderProps {
    lead: LeadLike;
    isMigratedLead: boolean;
    hasPortalUser: boolean;
    isEditing: boolean;
    formData: Record<string, unknown>;
    salesOptions: Array<{ userId: string; label: string }>;
    updateIsPending: boolean;
    hasUnsavedChanges: boolean;
    onEdit: () => void;
    onSave: () => void;
    onCancel: () => void;
    onFieldChange: (field: string, value: string | null) => void;
    onCreateUser: (lead: Record<string, unknown>) => void;
    onCreateDeal: () => void;
    onEditDeal: (deal: Record<string, unknown>) => void;
    onApplyTagsUpdate?: (nextTags: string[]) => Promise<void>;
    onDeleteTagById?: (tagId?: string) => Promise<void>;
    onApplyNotesUpdate?: (
        nextNotes: Array<{ id?: string; note: string; createdAt?: string }>
    ) => Promise<void>;
    updateStatusMutation: StatusMutation;
    openStatusMenu: (
        e: MouseEvent<HTMLElement>,
        deal: Record<string, unknown>
    ) => void;
    t: TFunction;
}

const LeadProfileHeader = ({
    lead,
    isMigratedLead,
    hasPortalUser,
    isEditing,
    formData,
    salesOptions,
    updateIsPending,
    hasUnsavedChanges,
    onEdit,
    onSave,
    onCancel,
    onFieldChange,
    onCreateUser,
    onCreateDeal,
    onEditDeal,
    onApplyTagsUpdate = async () => {},
    onDeleteTagById = async () => {},
    onApplyNotesUpdate = async () => {},
    updateStatusMutation,
    openStatusMenu,
    t
}: LeadProfileHeaderProps) => {
    const [tagDraft, setTagDraft] = useState('');
    const [showTagsEditor, setShowTagsEditor] = useState(false);
    const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
    const [editingNoteDraft, setEditingNoteDraft] = useState('');
    const [showNotesEditor, setShowNotesEditor] = useState(false);
    const [showAddNote, setShowAddNote] = useState(false);
    const [newNoteDraft, setNewNoteDraft] = useState('');
    const tagInputRef = useRef<HTMLInputElement | null>(null);

    const normalizeTagList = (value: unknown): string[] => {
        const raw = Array.isArray(value)
            ? value
            : typeof value === 'string'
              ? value.split(/[\n,]/)
              : [];

        const normalized = raw
            .map((t) =>
                t && typeof t === 'object'
                    ? (t as { tag?: string }).tag
                    : (t as string)
            )
            .map((t) => `${t ?? ''}`.trim())
            .filter((t) => t.length > 0);

        const seen = new Set<string>();
        return normalized.filter((tag) => {
            if (seen.has(tag)) return false;
            seen.add(tag);
            return true;
        });
    };

    const normalizeTagObjects = (
        value: unknown
    ): Array<{ id?: string; tag: string }> => {
        if (Array.isArray(value)) {
            return value
                .map((t) => {
                    if (t && typeof t === 'object') {
                        const obj = t as Record<string, unknown>;
                        return {
                            id: typeof obj.id === 'string' ? obj.id : undefined,
                            tag: `${obj.tag ?? ''}`.trim()
                        };
                    }
                    return { tag: `${t ?? ''}`.trim() };
                })
                .filter((t) => t.tag.length > 0);
        }

        if (typeof value === 'string') {
            const normalized = value.trim();
            return normalized.length > 0 ? [{ tag: normalized }] : [];
        }

        return [];
    };

    const normalizeNoteObjects = (
        value: unknown
    ): Array<{ id?: string; note: string; createdAt?: string }> => {
        if (Array.isArray(value)) {
            return value
                .map((n) => {
                    if (n && typeof n === 'object') {
                        const obj = n as Record<string, unknown>;
                        return {
                            id: typeof obj.id === 'string' ? obj.id : undefined,
                            note: `${obj.note ?? ''}`,
                            createdAt:
                                typeof obj.createdAt === 'string'
                                    ? obj.createdAt
                                    : undefined
                        };
                    }
                    return { note: `${n ?? ''}` };
                })
                .filter((n) => n.note.trim().length > 0);
        }

        if (typeof value === 'string') {
            const normalized = value;
            return normalized.trim().length > 0 ? [{ note: normalized }] : [];
        }

        return [];
    };

    const tagItems = normalizeTagObjects(lead?.tags ?? []);
    const noteItems = normalizeNoteObjects(lead?.notes ?? []);

    return (
        <Box
            sx={{
                mb: 3,
                display: 'flex',
                alignItems: 'center',
                flexDirection: 'column',
                p: 2,
                borderRadius: 1,
                backgroundColor: 'background.paper',
                boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                border: '1px solid',
                borderColor: 'divider'
            }}
        >
            {!isEditing ? (
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        width: '100%',
                        gap: 1.5
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            width: '100%',
                            gap: 2
                        }}
                    >
                        <Avatar
                            sx={{
                                bgcolor: 'primary.main',
                                width: 64,
                                height: 64,
                                fontSize: 20
                            }}
                        >
                            {(lead.fullName || '')
                                .split(' ')
                                .map((n: string) => n?.[0])
                                .filter(Boolean)
                                .slice(0, 2)
                                .join('') ||
                                (lead.fullName ? lead.fullName[0] : '?')}
                        </Avatar>
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                minWidth: 0
                            }}
                        >
                            <Typography
                                sx={{
                                    fontWeight: 600,
                                    color: 'text.primary',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                }}
                                variant="h5"
                            >
                                {lead.fullName || t('common.na', { ns: 'crm' })}
                            </Typography>
                            <Typography
                                sx={{
                                    color: 'text.secondary',
                                    mt: 0.25,
                                    display: 'flex',
                                    gap: 1,
                                    alignItems: 'center'
                                }}
                                variant="body2"
                            >
                                {lead.applicantRole || ''}
                            </Typography>
                        </Box>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                            }}
                        >
                            {lead.gender && (
                                <Box
                                    title={`${t('leads.gender', { ns: 'crm' })}: ${String(lead.gender).charAt(0).toUpperCase() + String(lead.gender).slice(1)}`}
                                >
                                    {(() => {
                                        const genderText = String(
                                            lead.gender || ''
                                        )
                                            .toLowerCase()
                                            .trim();
                                        const femaleKeywords = [
                                            '女',
                                            'female',
                                            'woman'
                                        ];
                                        const maleKeywords = [
                                            '男',
                                            'male',
                                            'man'
                                        ];
                                        if (
                                            femaleKeywords.some((k) =>
                                                genderText.includes(k)
                                            )
                                        )
                                            return (
                                                <FemaleIcon
                                                    sx={{
                                                        color: 'secondary.main',
                                                        fontSize: '1.6rem'
                                                    }}
                                                />
                                            );
                                        if (
                                            maleKeywords.some((k) =>
                                                genderText.includes(k)
                                            )
                                        )
                                            return (
                                                <MaleIcon
                                                    sx={{
                                                        color: 'info.main',
                                                        fontSize: '1.6rem'
                                                    }}
                                                />
                                            );
                                        return (
                                            <OtherGenderIcon
                                                sx={{
                                                    color: 'text.secondary',
                                                    fontSize: '1.6rem'
                                                }}
                                            />
                                        );
                                    })()}
                                </Box>
                            )}
                            {lead.closeLikelihood && (
                                <Chip
                                    label={
                                        lead.closeLikelihood === 'high'
                                            ? 'H'
                                            : lead.closeLikelihood === 'medium'
                                              ? 'M'
                                              : 'L'
                                    }
                                    size="small"
                                    sx={{
                                        bgcolor:
                                            lead.closeLikelihood === 'high'
                                                ? 'success.main'
                                                : lead.closeLikelihood ===
                                                    'medium'
                                                  ? 'warning.main'
                                                  : 'error.main',
                                        color: '#fff',
                                        fontWeight: '600'
                                    }}
                                    title={`${t('leads.closeLikelihood', { ns: 'crm' })}: ${(lead.closeLikelihood as string).charAt(0).toUpperCase() + (lead.closeLikelihood as string).slice(1)}`}
                                />
                            )}
                            <Chip
                                label={
                                    getLeadStatusLabel(
                                        lead.status as string | null | undefined
                                    ) ?? t('common.na', { ns: 'crm' })
                                }
                                size="small"
                                sx={{
                                    bgcolor:
                                        lead.status === 'converted'
                                            ? 'success.main'
                                            : lead.status === 'qualified'
                                              ? 'info.main'
                                              : lead.status === 'closed'
                                                ? 'error.main'
                                                : 'primary.main',
                                    color: '#fff',
                                    fontWeight: 600
                                }}
                            />
                        </Box>
                        {!isMigratedLead && (
                            <Box
                                sx={{
                                    ml: 'auto',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1
                                }}
                            >
                                <Typography
                                    sx={{
                                        color: 'text.secondary',
                                        backgroundColor: 'grey.100',
                                        px: 1,
                                        py: 0.25,
                                        borderRadius: '12px'
                                    }}
                                    variant="body2"
                                >
                                    {t('common.sales', { ns: 'crm' })}:{' '}
                                    {String(
                                        (
                                            lead?.salesRep as Record<
                                                string,
                                                unknown
                                            >
                                        )?.label ?? ''
                                    ) ||
                                        t('leads.unassigned', {
                                            ns: 'crm'
                                        })}
                                </Typography>
                                <IconButton onClick={onEdit} size="small">
                                    <EditIcon />
                                </IconButton>
                            </Box>
                        )}
                    </Box>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            width: '100%',
                            gap: 2
                        }}
                    >
                        {lead.applicantRole && (
                            <Typography
                                sx={{
                                    color: 'text.secondary',
                                    backgroundColor: 'grey.100',
                                    px: 1.5,
                                    py: 0.5,
                                    borderRadius: '16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.5,
                                    fontStyle: 'italic'
                                }}
                                variant="body2"
                            >
                                {lead.applicantRole as string}
                            </Typography>
                        )}
                        {hasPortalUser ? (
                            <Link
                                component="a"
                                href={`/student-database/${lead.userId}`}
                                sx={{
                                    display: 'inline-flex',
                                    alignItems: 'center'
                                }}
                                underline="hover"
                                variant="body2"
                            >
                                {t('common.studentProfile', { ns: 'crm' })}
                            </Link>
                        ) : !hasPortalUser &&
                          lead.status !== 'closed' &&
                          lead.status !== 'converted' ? (
                            <Button
                                color="primary"
                                onClick={() => onCreateUser(lead)}
                                size="small"
                                startIcon={<PersonAddIcon />}
                                variant="outlined"
                            >
                                {t('actions.createUserAccount', {
                                    ns: 'crm'
                                })}
                            </Button>
                        ) : null}
                        {!isMigratedLead && (
                            <Button
                                color="secondary"
                                onClick={onCreateDeal}
                                size="small"
                                variant="contained"
                            >
                                {t('actions.createDeal', { ns: 'crm' })}
                            </Button>
                        )}
                    </Box>
                    {(lead.salesNote as string)?.trim() && (
                        <Box sx={{ width: '100%' }}>
                            <Typography
                                sx={{
                                    color: 'text.secondary',
                                    textTransform: 'uppercase',
                                    letterSpacing: 0.4
                                }}
                                variant="caption"
                            >
                                {t('common.salesNote', { ns: 'crm' })}
                            </Typography>
                            <Box
                                sx={{
                                    mt: 0.5,
                                    p: 1,
                                    borderRadius: 1,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    bgcolor: 'grey.50',
                                    color: 'text.primary',
                                    whiteSpace: 'pre-wrap'
                                }}
                            >
                                <Typography variant="body2">
                                    {lead.salesNote as string}
                                </Typography>
                            </Box>
                        </Box>
                    )}
                    <Box
                        sx={{
                            width: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1.5
                        }}
                    >
                        <Box sx={{ width: '100%' }}>
                            {tagItems.length === 0 ? (
                                <Typography
                                    color="text.secondary"
                                    variant="body2"
                                >
                                    {t('common.noTagsYet', { ns: 'crm' })}
                                </Typography>
                            ) : (
                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: 1
                                    }}
                                >
                                    {tagItems.map((tagItem) => (
                                        <Chip
                                            key={tagItem.id || tagItem.tag}
                                            label={tagItem.tag}
                                            onDelete={
                                                showTagsEditor
                                                    ? () =>
                                                          onDeleteTagById(
                                                              tagItem.id
                                                          )
                                                    : undefined
                                            }
                                            size="small"
                                            sx={{
                                                bgcolor: 'grey.100',
                                                color: 'text.secondary',
                                                borderRadius: 999
                                            }}
                                            variant="outlined"
                                        />
                                    ))}
                                </Box>
                            )}

                            {showTagsEditor && (
                                <Box sx={{ mt: 1 }}>
                                    <TextField
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        aria-label="add tag"
                                                        onClick={async () => {
                                                            const nextTags =
                                                                normalizeTagList(
                                                                    [
                                                                        ...((lead?.tags as unknown[]) ||
                                                                            []),
                                                                        tagDraft
                                                                    ]
                                                                );
                                                            await onApplyTagsUpdate(
                                                                nextTags
                                                            );
                                                            setTagDraft('');
                                                        }}
                                                        size="small"
                                                        sx={{
                                                            color: 'text.primary'
                                                        }}
                                                    >
                                                        <AddIcon fontSize="small" />
                                                    </IconButton>
                                                </InputAdornment>
                                            )
                                        }}
                                        inputRef={tagInputRef}
                                        onChange={(e) =>
                                            setTagDraft(e.target.value)
                                        }
                                        onKeyDown={async (e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                const nextTags =
                                                    normalizeTagList([
                                                        ...((lead?.tags as unknown[]) ||
                                                            []),
                                                        tagDraft
                                                    ]);
                                                await onApplyTagsUpdate(
                                                    nextTags
                                                );
                                                setTagDraft('');
                                            }
                                        }}
                                        placeholder={t('common.add', {
                                            ns: 'crm'
                                        })}
                                        size="small"
                                        sx={{
                                            maxWidth: 360,
                                            mb: 1,
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 999,
                                                bgcolor: 'grey.50',
                                                pr: 0.5
                                            }
                                        }}
                                        value={tagDraft}
                                    />
                                </Box>
                            )}

                            <Box sx={{ mt: 1 }}>
                                <Button
                                    onClick={() => {
                                        setShowTagsEditor((prev) => {
                                            const next = !prev;
                                            if (!next) setTagDraft('');
                                            if (next) {
                                                setTimeout(() => {
                                                    tagInputRef.current?.focus();
                                                }, 0);
                                            }
                                            return next;
                                        });
                                    }}
                                    size="small"
                                    sx={{ textTransform: 'none' }}
                                    variant="text"
                                >
                                    {showTagsEditor
                                        ? t('common.done', {
                                              ns: 'crm'
                                          })
                                        : t('common.edit', {
                                              ns: 'crm'
                                          })}
                                </Button>
                            </Box>
                        </Box>
                        <Box sx={{ width: '100%' }}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    mb: 0.5
                                }}
                            >
                                <Typography
                                    sx={{
                                        color: 'text.secondary',
                                        textTransform: 'uppercase',
                                        letterSpacing: 0.4
                                    }}
                                    variant="caption"
                                >
                                    {t('common.notes', { ns: 'crm' })}
                                </Typography>
                                <Button
                                    onClick={() => {
                                        setShowNotesEditor((prev) => {
                                            const next = !prev;
                                            if (!next) {
                                                setShowAddNote(false);
                                                setEditingNoteId(null);
                                                setEditingNoteDraft('');
                                                setNewNoteDraft('');
                                            }
                                            return next;
                                        });
                                    }}
                                    size="small"
                                    sx={{ textTransform: 'none' }}
                                    variant="text"
                                >
                                    {showNotesEditor
                                        ? t('common.done', {
                                              ns: 'crm'
                                          })
                                        : t('common.edit', {
                                              ns: 'crm'
                                          })}
                                </Button>
                            </Box>
                            {noteItems.length === 0 && !showAddNote ? (
                                <Typography
                                    color="text.secondary"
                                    variant="body2"
                                >
                                    {t('common.noNotesYet', {
                                        ns: 'crm'
                                    })}
                                </Typography>
                            ) : (
                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 0.5
                                    }}
                                >
                                    {noteItems.map((note, idx) => (
                                        <Box
                                            key={note.id || `note-${idx}`}
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'flex-start',
                                                gap: 1,
                                                p: 1.25,
                                                border: '1px solid',
                                                borderColor: 'divider',
                                                borderRadius: 1,
                                                bgcolor: 'background.paper'
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: 0.5,
                                                    flex: 1
                                                }}
                                            >
                                                {editingNoteId === note.id ? (
                                                    <TextField
                                                        fullWidth
                                                        minRows={2}
                                                        multiline
                                                        onChange={(e) =>
                                                            setEditingNoteDraft(
                                                                e.target.value
                                                            )
                                                        }
                                                        value={editingNoteDraft}
                                                    />
                                                ) : (
                                                    <Typography
                                                        sx={{
                                                            whiteSpace:
                                                                'pre-wrap',
                                                            lineHeight: 1.6
                                                        }}
                                                        variant="body2"
                                                    >
                                                        {note.note}
                                                    </Typography>
                                                )}
                                                {note.createdAt && (
                                                    <Typography
                                                        color="text.secondary"
                                                        variant="caption"
                                                    >
                                                        {t(
                                                            'common.noteCreatedAt',
                                                            {
                                                                ns: 'crm'
                                                            }
                                                        )}{' '}
                                                        {new Date(
                                                            note.createdAt
                                                        ).toLocaleString()}
                                                    </Typography>
                                                )}
                                            </Box>
                                            {note.id && showNotesEditor && (
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        gap: 0.5
                                                    }}
                                                >
                                                    {editingNoteId ===
                                                    note.id ? (
                                                        <>
                                                            <IconButton
                                                                aria-label="save"
                                                                onClick={async () => {
                                                                    const nextNotes =
                                                                        normalizeNoteObjects(
                                                                            lead?.notes ||
                                                                                []
                                                                        ).map(
                                                                            (
                                                                                n
                                                                            ) =>
                                                                                n.id ===
                                                                                note.id
                                                                                    ? {
                                                                                          ...n,
                                                                                          note: editingNoteDraft
                                                                                      }
                                                                                    : n
                                                                        );
                                                                    await onApplyNotesUpdate(
                                                                        nextNotes
                                                                    );
                                                                    setEditingNoteId(
                                                                        null
                                                                    );
                                                                    setEditingNoteDraft(
                                                                        ''
                                                                    );
                                                                }}
                                                                size="small"
                                                                sx={{
                                                                    color: 'success.main',
                                                                    bgcolor:
                                                                        'success.50',
                                                                    border: '1px solid',
                                                                    borderColor:
                                                                        'success.100',
                                                                    '&:hover': {
                                                                        bgcolor:
                                                                            'success.100'
                                                                    }
                                                                }}
                                                            >
                                                                <SaveIcon />
                                                            </IconButton>
                                                            <IconButton
                                                                aria-label="cancel"
                                                                onClick={() => {
                                                                    setEditingNoteId(
                                                                        null
                                                                    );
                                                                    setEditingNoteDraft(
                                                                        ''
                                                                    );
                                                                }}
                                                                size="small"
                                                                sx={{
                                                                    color: 'text.secondary',
                                                                    bgcolor:
                                                                        'grey.50',
                                                                    border: '1px solid',
                                                                    borderColor:
                                                                        'divider',
                                                                    '&:hover': {
                                                                        bgcolor:
                                                                            'grey.100'
                                                                    }
                                                                }}
                                                            >
                                                                <CancelIcon />
                                                            </IconButton>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <IconButton
                                                                aria-label="edit"
                                                                onClick={() => {
                                                                    setEditingNoteId(
                                                                        note.id ||
                                                                            null
                                                                    );
                                                                    setEditingNoteDraft(
                                                                        note.note ||
                                                                            ''
                                                                    );
                                                                }}
                                                                size="small"
                                                                sx={{
                                                                    color: 'text.secondary',
                                                                    bgcolor:
                                                                        'transparent',
                                                                    border: '1px solid',
                                                                    borderColor:
                                                                        'transparent',
                                                                    '&:hover': {
                                                                        bgcolor:
                                                                            'action.hover',
                                                                        borderColor:
                                                                            'divider'
                                                                    }
                                                                }}
                                                            >
                                                                <EditIcon />
                                                            </IconButton>
                                                            <IconButton
                                                                aria-label="delete"
                                                                onClick={async () => {
                                                                    const nextNotes =
                                                                        normalizeNoteObjects(
                                                                            lead?.notes ||
                                                                                []
                                                                        ).filter(
                                                                            (
                                                                                n
                                                                            ) =>
                                                                                n.id !==
                                                                                note.id
                                                                        );
                                                                    await onApplyNotesUpdate(
                                                                        nextNotes
                                                                    );
                                                                }}
                                                                size="small"
                                                                sx={{
                                                                    color: 'text.secondary',
                                                                    bgcolor:
                                                                        'transparent',
                                                                    border: '1px solid',
                                                                    borderColor:
                                                                        'transparent',
                                                                    '&:hover': {
                                                                        bgcolor:
                                                                            'action.hover',
                                                                        borderColor:
                                                                            'divider',
                                                                        color: 'error.main'
                                                                    }
                                                                }}
                                                            >
                                                                <CloseIcon />
                                                            </IconButton>
                                                        </>
                                                    )}
                                                </Box>
                                            )}
                                        </Box>
                                    ))}
                                </Box>
                            )}
                            {showNotesEditor && !showAddNote && (
                                <Button
                                    onClick={() => setShowAddNote(true)}
                                    size="small"
                                    variant="text"
                                >
                                    {`${t('common.add', {
                                        ns: 'crm'
                                    })} ${t('common.notes', {
                                        ns: 'crm'
                                    })}`}
                                </Button>
                            )}
                            {showNotesEditor && showAddNote && (
                                <Box
                                    sx={{
                                        mt: 0.5,
                                        display: 'flex',
                                        gap: 1
                                    }}
                                >
                                    <TextField
                                        fullWidth
                                        minRows={2}
                                        multiline
                                        onChange={(e) =>
                                            setNewNoteDraft(e.target.value)
                                        }
                                        value={newNoteDraft}
                                    />
                                    <Button
                                        onClick={async () => {
                                            const trimmed =
                                                `${newNoteDraft}`.trim();
                                            if (!trimmed) return;
                                            const nextNotes =
                                                normalizeNoteObjects([
                                                    ...((lead?.notes as unknown[]) ||
                                                        []),
                                                    { note: trimmed }
                                                ]);
                                            await onApplyNotesUpdate(nextNotes);
                                            setNewNoteDraft('');
                                            setShowAddNote(false);
                                        }}
                                        variant="contained"
                                    >
                                        {t('common.add', { ns: 'crm' })}
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            setNewNoteDraft('');
                                            setShowAddNote(false);
                                        }}
                                        variant="text"
                                    >
                                        {t('common.cancel', {
                                            ns: 'crm'
                                        })}
                                    </Button>
                                </Box>
                            )}
                        </Box>
                    </Box>
                    {Array.isArray(lead?.deals) &&
                        (lead.deals as unknown[]).length > 0 && (
                            <Box sx={{ width: '100%' }}>
                                <Typography
                                    sx={{
                                        color: 'text.secondary',
                                        textTransform: 'uppercase',
                                        letterSpacing: 0.4
                                    }}
                                    variant="caption"
                                >
                                    {t('breadcrumbs.deals', { ns: 'crm' })}
                                </Typography>
                                <Box
                                    sx={{
                                        mt: 0.5,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 1
                                    }}
                                >
                                    {(
                                        lead.deals as Record<string, unknown>[]
                                    ).map(
                                        (
                                            deal: Record<string, unknown>,
                                            idx: number
                                        ) => {
                                            const id = getDealId(deal);
                                            const isUpdating =
                                                updateStatusMutation.isPending &&
                                                updateStatusMutation.variables
                                                    ?.id === id;
                                            const handleEditDeal = (
                                                d: Record<string, unknown>
                                            ) => {
                                                d.leadFullName = lead?.fullName;
                                                d.salesLabel = (
                                                    deal?.salesRep as Record<
                                                        string,
                                                        unknown
                                                    >
                                                )?.label;
                                                onEditDeal(d);
                                            };
                                            return (
                                                <Box
                                                    key={
                                                        String(id) ||
                                                        String(idx)
                                                    }
                                                >
                                                    <DealItem
                                                        deal={deal}
                                                        isUpdating={isUpdating}
                                                        onEditDeal={
                                                            handleEditDeal
                                                        }
                                                        onOpenStatusMenu={
                                                            openStatusMenu
                                                        }
                                                        t={t}
                                                    />
                                                </Box>
                                            );
                                        }
                                    )}
                                </Box>
                            </Box>
                        )}
                </Box>
            ) : (
                <Box
                    sx={{
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2
                    }}
                >
                    <Grid alignItems="center" container spacing={2}>
                        <Grid item md={3} xs={6}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}
                            >
                                {hasUnsavedChanges && (
                                    <Typography
                                        component="span"
                                        sx={{
                                            color: 'warning.main',
                                            fontSize: '0.75rem',
                                            fontWeight: 'normal',
                                            mb: 0.5
                                        }}
                                    >
                                        {t('common.unsavedChanges', {
                                            ns: 'crm'
                                        })}
                                    </Typography>
                                )}
                                <TextField
                                    fullWidth
                                    label={t('leads.fullName', {
                                        ns: 'crm'
                                    })}
                                    onChange={(e) =>
                                        onFieldChange(
                                            'fullName',
                                            e.target.value
                                        )
                                    }
                                    size="small"
                                    value={formData.fullName || ''}
                                    variant="outlined"
                                />
                            </Box>
                        </Grid>
                        <Grid item md={2} xs={6}>
                            <FormControl fullWidth size="small">
                                <InputLabel id="gender-select-label">
                                    {t('leads.gender', { ns: 'crm' })}
                                </InputLabel>
                                <Select
                                    label={t('leads.gender', { ns: 'crm' })}
                                    labelId="gender-select-label"
                                    onChange={(e) =>
                                        onFieldChange(
                                            'gender',
                                            String(e.target.value)
                                        )
                                    }
                                    value={formData.gender || ''}
                                >
                                    <MenuItem value="male">Male</MenuItem>
                                    <MenuItem value="female">Female</MenuItem>
                                    <MenuItem value="other">Other</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item md={3} xs={6}>
                            <TextField
                                fullWidth
                                label={t('leads.role', { ns: 'crm' })}
                                onChange={(e) =>
                                    onFieldChange(
                                        'applicantRole',
                                        e.target.value
                                    )
                                }
                                size="small"
                                value={formData.applicantRole || ''}
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item md={2} xs={6}>
                            <FormControl fullWidth size="small">
                                <InputLabel id="sales-rep-select-label">
                                    {t('leads.salesRep', { ns: 'crm' })}
                                </InputLabel>
                                <Select
                                    label={t('leads.salesRep', {
                                        ns: 'crm'
                                    })}
                                    labelId="sales-rep-select-label"
                                    onChange={(e) => {
                                        const selectedId = String(
                                            e.target.value || ''
                                        );
                                        const selected = salesOptions.find(
                                            (s: {
                                                userId: string;
                                                label: string;
                                            }) => s.userId === selectedId
                                        );
                                        onFieldChange(
                                            'salesUserId',
                                            selectedId
                                                ? selected?.userId || selectedId
                                                : null
                                        );
                                    }}
                                    value={formData?.salesUserId || ''}
                                >
                                    <MenuItem value="">
                                        {t('leads.unassigned', {
                                            ns: 'crm'
                                        })}
                                    </MenuItem>
                                    {salesOptions.map(
                                        (s: {
                                            userId: string;
                                            label: string;
                                        }) => (
                                            <MenuItem
                                                key={s.userId}
                                                value={s.userId}
                                            >
                                                {s.label}
                                            </MenuItem>
                                        )
                                    )}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid
                            item
                            md={2}
                            sx={{
                                display: 'flex',
                                justifyContent: 'flex-end',
                                alignItems: 'center'
                            }}
                            xs={6}
                        >
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <IconButton
                                    color="primary"
                                    disabled={updateIsPending}
                                    onClick={onSave}
                                    size="small"
                                >
                                    {updateIsPending ? (
                                        <CircularProgress size={20} />
                                    ) : (
                                        <SaveIcon />
                                    )}
                                </IconButton>
                                <IconButton
                                    disabled={updateIsPending}
                                    onClick={onCancel}
                                    size="small"
                                >
                                    <CancelIcon />
                                </IconButton>
                            </Box>
                        </Grid>
                        <Grid item md={3} xs={6}>
                            <FormControl fullWidth size="small">
                                <InputLabel id="status-select-label">
                                    {t('common.status', { ns: 'crm' })}
                                </InputLabel>
                                <Select
                                    label={t('common.status', {
                                        ns: 'crm'
                                    })}
                                    labelId="status-select-label"
                                    onChange={(e) =>
                                        onFieldChange(
                                            'status',
                                            String(e.target.value)
                                        )
                                    }
                                    value={formData.status || ''}
                                >
                                    {(() => {
                                        const options = [
                                            ...getLeadStatusOptions()
                                        ];
                                        const currentStatus =
                                            formData.status as
                                                | string
                                                | undefined;
                                        if (
                                            currentStatus &&
                                            !options.some(
                                                (o) => o.value === currentStatus
                                            )
                                        ) {
                                            options.push({
                                                value: currentStatus,
                                                label:
                                                    getLeadStatusLabel(
                                                        currentStatus
                                                    ) || currentStatus
                                            });
                                        }
                                        return options.map(
                                            (s: {
                                                value: string;
                                                label: string;
                                            }) => (
                                                <MenuItem
                                                    key={s.value}
                                                    value={s.value}
                                                >
                                                    {s.label}
                                                </MenuItem>
                                            )
                                        );
                                    })()}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item md={3} xs={12}>
                            <FormControl fullWidth size="small">
                                <InputLabel id="close-likelihood-select-label">
                                    {t('leads.closeLikelihood', {
                                        ns: 'crm'
                                    })}
                                </InputLabel>
                                <Select
                                    label={t('leads.closeLikelihood', {
                                        ns: 'crm'
                                    })}
                                    labelId="close-likelihood-select-label"
                                    onChange={(e) =>
                                        onFieldChange(
                                            'closeLikelihood',
                                            String(e.target.value)
                                        )
                                    }
                                    value={formData.closeLikelihood || ''}
                                >
                                    <MenuItem value="high">High</MenuItem>
                                    <MenuItem value="medium">Medium</MenuItem>
                                    <MenuItem value="low">Low</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label={t('common.salesNote', { ns: 'crm' })}
                                minRows={3}
                                multiline
                                onChange={(e) =>
                                    onFieldChange('salesNote', e.target.value)
                                }
                                size="small"
                                value={formData.salesNote || ''}
                                variant="outlined"
                            />
                        </Grid>
                        {Array.isArray(lead?.deals) &&
                            (lead.deals as unknown[]).length > 0 && (
                                <Grid item xs={12}>
                                    <Box sx={{ width: '100%' }}>
                                        <Typography
                                            sx={{
                                                color: 'text.secondary',
                                                textTransform: 'uppercase',
                                                letterSpacing: 0.4
                                            }}
                                            variant="caption"
                                        >
                                            {t('breadcrumbs.deals', {
                                                ns: 'crm'
                                            })}
                                        </Typography>
                                        <Box
                                            sx={{
                                                mt: 0.5,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: 1
                                            }}
                                        >
                                            {(
                                                lead.deals as Record<
                                                    string,
                                                    unknown
                                                >[]
                                            ).map(
                                                (
                                                    deal: Record<
                                                        string,
                                                        unknown
                                                    >,
                                                    idx: number
                                                ) => {
                                                    const id = getDealId(deal);
                                                    const isUpdating =
                                                        updateStatusMutation.isPending &&
                                                        updateStatusMutation
                                                            .variables?.id ===
                                                            id;
                                                    const handleEditDealItem = (
                                                        d: Record<
                                                            string,
                                                            unknown
                                                        >
                                                    ) => {
                                                        d.leadFullName =
                                                            lead?.fullName;
                                                        d.salesLabel = (
                                                            lead?.salesRep as Record<
                                                                string,
                                                                unknown
                                                            >
                                                        )?.label;
                                                        onEditDeal(d);
                                                    };
                                                    return (
                                                        <Box
                                                            key={
                                                                String(id) ||
                                                                String(idx)
                                                            }
                                                        >
                                                            <DealItem
                                                                deal={deal}
                                                                isUpdating={
                                                                    isUpdating
                                                                }
                                                                onEditDeal={
                                                                    handleEditDealItem
                                                                }
                                                                onOpenStatusMenu={
                                                                    openStatusMenu
                                                                }
                                                                t={t}
                                                            />
                                                        </Box>
                                                    );
                                                }
                                            )}
                                        </Box>
                                    </Box>
                                </Grid>
                            )}
                    </Grid>
                </Box>
            )}
        </Box>
    );
};

export default LeadProfileHeader;
