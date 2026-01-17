import { Navigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMemo, useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    Box,
    Avatar,
    Chip,
    Breadcrumbs,
    Link,
    Typography,
    Grid,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    IconButton,
    Button,
    CircularProgress,
    Accordion,
    AccordionSummary,
    AccordionDetails
} from '@mui/material';
import {
    Edit as EditIcon,
    Save as SaveIcon,
    Cancel as CancelIcon,
    PersonAdd as PersonAddIcon,
    Event as EventIcon,
    Close as CloseIcon,
    Female as FemaleIcon,
    Male as MaleIcon,
    Transgender as OtherGenderIcon,
    ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';

import { is_TaiGer_role } from '@taiger-common/core';
import { getCRMLeadQuery, getStudentQuery } from '../../api/query';
import { request } from '../../api/request';
import {
    getCRMLead,
    createCRMLeadNote,
    appendCRMLeadTags,
    deleteCRMLeadTags,
    updateCRMLeadNote,
    deleteCRMLeadNote,
    updateCRMDeal,
    updateCRMLead
} from '../../api';

import DEMO from '../../store/constant';
import { appConfig } from '../../config';

import Loading from '../../components/Loading/Loading';
import { useAuth } from '../../components/AuthProvider';
import CreateUserFromLeadModal from './components/CreateUserFromLeadModal';
import DealModal from './components/DealModal';
import EditableCard from './components/EditableCard';
import { GenericCardContent } from './components/GenericCard';
import {
    getStudentCardConfigurations,
    getLeadCardConfigurations
} from './components/CardConfigurations';
import DealItem from './components/DealItem';
import SimilarStudents from './components/SimilarStudents';
import StatusMenu from './components/StatusMenu';
import { getDealId, isTerminalStatus } from './components/statusUtils';
import { sanitizeMeetingTitle } from './components/meetingUtils';
import { flattenObject } from '../Utils/checking-functions';
import { TabTitle } from '../Utils/TabTitle';

const LeadPage = () => {
    const { leadId } = useParams();
    const { t } = useTranslation();
    const { user } = useAuth();
    const queryClient = useQueryClient();

    if (!is_TaiGer_role(user))
        return <Navigate to={`${DEMO.DASHBOARD_LINK}`} />;

    const leadQueryOptions = getCRMLeadQuery(leadId);
    const { data, isLoading: leadLoading } = useQuery(leadQueryOptions);
    const lead = data?.data?.data || {};

    TabTitle(`${t('common.lead', { ns: 'crm' })} - ${lead.fullName}`);

    const hasPortalUser = !!lead?.userId;
    const isMigratedLead = lead?.status === 'migrated' && hasPortalUser;

    const studentQueryOptions = hasPortalUser
        ? getStudentQuery(lead.userId)
        : {
              queryKey: ['student', lead?.userId],
              queryFn: async () => null,
              enabled: false
          };
    const { data: studentData, isLoading: studentLoading } =
        useQuery(studentQueryOptions);
    const student = studentData?.data?.data || {};
    const isLoading = leadLoading || (hasPortalUser && studentLoading);

    const [selectedLead, setSelectedLead] = useState(null);
    const [showCreateUserModal, setShowCreateUserModal] = useState(false);
    const [editingDeal, setEditingDeal] = useState(null);
    const [showDealModal, setShowDealModal] = useState(false);
    const [statusMenu, setStatusMenu] = useState({ anchorEl: null, row: null });
    const [showTagsEditor, setShowTagsEditor] = useState(false);
    const [tagDraft, setTagDraft] = useState('');
    const [editingNoteId, setEditingNoteId] = useState(null);
    const [editingNoteDraft, setEditingNoteDraft] = useState('');
    const [showAddNote, setShowAddNote] = useState(false);
    const [newNoteDraft, setNewNoteDraft] = useState('');

    const leadCardConfigurations = getLeadCardConfigurations(t);
    const studentCardConfigurations = getStudentCardConfigurations(t);
    const initLeadEditStates = useMemo(
        () =>
            leadCardConfigurations.reduce(
                (acc, c) => ({ ...acc, [c.id]: false }),
                {}
            ),
        [leadCardConfigurations]
    );
    const [leadEditStates, setLeadEditStates] = useState(initLeadEditStates);
    const [formData, setFormData] = useState({});

    const { data: salesData } = useQuery({
        queryKey: ['crm/sales-reps'],
        queryFn: async () => {
            const res = await request.get('/api/crm/sales-reps');
            return res?.data?.data ?? res?.data ?? [];
        },
        enabled: !!leadEditStates?.personal,
        staleTime: 300000
    });
    const salesOptions = useMemo(
        () =>
            (salesData || []).map((s) => ({
                userId: s.userId || s.value,
                label:
                    s.label ||
                    s.name ||
                    s.fullName ||
                    t('common.unknown', { ns: 'crm' })
            })),
        [salesData, t]
    );

    const form = useForm({
        defaultValues: formData,
        onSubmit: async ({ value }) => {
            const changed = getChangedFields(lead, value);
            if (Object.keys(changed).length === 0) return;
            await updateLeadMutation.mutateAsync(changed);
        }
    });

    const getChangedFields = (orig, cur) => {
        const out = {};
        Object.keys(cur).forEach((k) => {
            if (
                [
                    'createdAt',
                    'updatedAt',
                    'meetings',
                    'id',
                    '_tagDraft',
                    '_noteDraft'
                ].includes(k)
            )
                return;
            const ov = orig[k];
            const cv = cur[k];
            const bothObj =
                ov && typeof ov === 'object' && cv && typeof cv === 'object';
            if (bothObj) {
                if (JSON.stringify(ov) !== JSON.stringify(cv)) out[k] = cv;
            } else if ((ov ?? '') !== (cv ?? '')) out[k] = cv;
        });
        return out;
    };

    useMemo(() => {
        if (lead && Object.keys(lead).length) {
            setFormData(lead);
            form.reset(lead);
        }
    }, [lead]);

    const normalizeTagsInput = (value) => {
        const raw = Array.isArray(value)
            ? value
            : typeof value === 'string'
              ? value.split(/[,\n]/)
              : [];

        const normalized = raw
            .map((t) => (t && typeof t === 'object' ? t.tag : t))
            .map((t) => `${t}`.trim())
            .filter((t) => t.length > 0);

        const seen = new Set();
        return normalized.filter((tag) => {
            if (seen.has(tag)) return false;
            seen.add(tag);
            return true;
        });
    };

    const normalizeNotesInput = (value) => {
        if (Array.isArray(value)) {
            return value
                .map((n) => (typeof n === 'object' ? n : { note: n }))
                .map((n) => ({
                    ...n,
                    note: `${n?.note ?? ''}`
                }))
                .filter((n) => n.note.trim().length > 0);
        }

        if (typeof value === 'string') {
            const normalized = `${value}`;
            return normalized.trim().length > 0 ? [{ note: normalized }] : [];
        }

        return [];
    };

    const updateLeadMutation = useMutation({
        mutationFn: async (changed) => {
            const { tags, notes, ...rest } = changed || {};
            const tasks = [];

            if (Object.keys(rest).length > 0) {
                tasks.push(updateCRMLead(leadId, rest));
            }

            if (tags !== undefined) {
                const normalizedTags = normalizeTagsInput(tags);
                const existingTagObjects = normalizeTagObjects(
                    lead?.tags || []
                );
                const existingTags = existingTagObjects.map((t) => t.tag);
                const addedTags = normalizedTags.filter(
                    (tag) => !existingTags.includes(tag)
                );
                const removedTagIds = existingTagObjects
                    .filter((t) => !normalizedTags.includes(t.tag))
                    .map((t) => t.id)
                    .filter(Boolean);

                if (removedTagIds.length > 0) {
                    tasks.push(deleteCRMLeadTags(leadId, removedTagIds));
                }
                if (addedTags.length > 0) {
                    tasks.push(appendCRMLeadTags(leadId, addedTags));
                }
            }

            if (notes !== undefined) {
                const normalizedNotes = normalizeNotesInput(notes);
                const existingNotes = normalizeNotesInput(lead?.notes || []);
                const existingById = new Map(
                    existingNotes.filter((n) => n.id).map((n) => [n.id, n])
                );
                const currentById = new Map(
                    normalizedNotes
                        .filter((n) => n.id && !String(n.id).startsWith('new-'))
                        .map((n) => [n.id, n])
                );

                const addedNotes = normalizedNotes.filter(
                    (n) => !n.id || String(n.id).startsWith('new-')
                );
                const removedNotes = existingNotes.filter(
                    (n) => n.id && !currentById.has(n.id)
                );
                const updatedNotes = normalizedNotes.filter(
                    (n) =>
                        n.id &&
                        existingById.has(n.id) &&
                        existingById.get(n.id).note !== n.note
                );

                if (addedNotes.length > 0) {
                    tasks.push(
                        createCRMLeadNote(leadId, {
                            notes: addedNotes.map((n) => n.note)
                        })
                    );
                }

                if (updatedNotes.length > 0) {
                    tasks.push(
                        Promise.all(
                            updatedNotes.map((n) =>
                                updateCRMLeadNote(leadId, n.id, {
                                    note: n.note
                                })
                            )
                        )
                    );
                }

                if (removedNotes.length > 0) {
                    tasks.push(
                        Promise.all(
                            removedNotes.map((n) =>
                                deleteCRMLeadNote(leadId, n.id)
                            )
                        )
                    );
                }
            }

            if (tasks.length === 0) return null;

            await Promise.all(tasks);
            const refreshed = await getCRMLead(leadId);
            return refreshed?.data?.data ?? refreshed?.data ?? refreshed;
        },
        onSuccess: (updated) => {
            if (!updated) return;
            queryClient.setQueryData(['crm/lead', leadId], (old) => {
                if (!old) return old;
                return {
                    ...old,
                    data: {
                        ...old.data,
                        data: { ...old.data.data, ...updated }
                    }
                };
            });
            queryClient.invalidateQueries(['crm-lead', leadId]);
        }
    });

    const applyTagsUpdate = async (nextTags) => {
        await updateLeadMutation.mutateAsync({ tags: nextTags });
    };

    const deleteTagById = async (tagId) => {
        if (!tagId) return;
        await deleteCRMLeadTags(leadId, [tagId]);
        queryClient.invalidateQueries(['crm/lead', leadId]);
    };

    const applyNotesUpdate = async (nextNotes) => {
        await updateLeadMutation.mutateAsync({ notes: nextNotes });
    };

    const handleEdit = (cardId) => {
        setLeadEditStates((p) => ({ ...p, [cardId]: true }));
        if (lead && Object.keys(lead).length) {
            setFormData(lead);
            form.reset(lead);
        }
    };
    const handleCancel = (cardId) => {
        setLeadEditStates((p) => ({ ...p, [cardId]: false }));
        setFormData(lead);
        form.reset(lead);
    };
    const handleSave = async (cardId) => {
        const changed = getChangedFields(lead, formData);
        if (Object.keys(changed).length === 0) {
            setLeadEditStates((p) => ({ ...p, [cardId]: false }));
            return;
        }
        await updateLeadMutation.mutateAsync(changed);
        setLeadEditStates((p) => ({ ...p, [cardId]: false }));
    };
    const handleFieldChange = (field, value) => {
        setFormData((p) => ({ ...p, [field]: value }));
        form.setFieldValue(field, value);
    };

    const normalizeTagList = (value) => {
        const raw = Array.isArray(value)
            ? value
            : typeof value === 'string'
              ? value.split(/[\n,]/)
              : [];

        const normalized = raw
            .map((t) => (t && typeof t === 'object' ? t.tag : t))
            .map((t) => `${t}`.trim())
            .filter((t) => t.length > 0);

        const seen = new Set();
        return normalized.filter((tag) => {
            if (seen.has(tag)) return false;
            seen.add(tag);
            return true;
        });
    };

    const normalizeTagObjects = (value) => {
        if (Array.isArray(value)) {
            return value
                .map((t) =>
                    t && typeof t === 'object'
                        ? { id: t.id, tag: t.tag }
                        : { tag: t }
                )
                .map((t) => ({
                    ...t,
                    tag: `${t?.tag ?? ''}`.trim()
                }))
                .filter((t) => t.tag.length > 0);
        }

        if (typeof value === 'string') {
            const normalized = `${value}`.trim();
            return normalized.length > 0 ? [{ tag: normalized }] : [];
        }

        return [];
    };

    const normalizeNoteObjects = (value) => {
        if (Array.isArray(value)) {
            return value
                .map((n) => (typeof n === 'object' ? n : { note: n }))
                .map((n) => ({
                    ...n,
                    note: `${n?.note ?? ''}`
                }))
                .filter((n) => n.note.trim().length > 0);
        }

        if (typeof value === 'string') {
            const normalized = `${value}`;
            return normalized.trim().length > 0 ? [{ note: normalized }] : [];
        }

        return [];
    };

    const hasUnsavedChanges = (cardId) => {
        const changed = getChangedFields(lead, formData);
        const cfg = leadCardConfigurations.find((c) => c.id === cardId);
        if (!cfg) return false;
        const fields = [
            ...(cfg.fields ? cfg.fields.map((f) => f.key) : []),
            ...(cfg.sections
                ? cfg.sections.flatMap((s) => s.fields.map((f) => f.key))
                : [])
        ];
        return fields.some((f) =>
            Object.prototype.hasOwnProperty.call(changed, f)
        );
    };

    const handleCreateUser = (leadData) => {
        setSelectedLead(leadData);
        setShowCreateUserModal(true);
    };
    const handleCloseCreateUserModal = () => {
        setShowCreateUserModal(false);
        setSelectedLead(null);
    };
    const handleUserCreated = async (userData) => {
        const newUserId = userData?.newUser;
        if (newUserId) {
            try {
                await updateLeadMutation.mutateAsync({
                    userId: newUserId,
                    status: 'converted'
                });
            } catch {
                alert(
                    'User created, but failed to update lead. Please refresh.'
                );
            }
        }
        queryClient.invalidateQueries(['crm/lead', leadId]);
    };

    const closeDealModal = () => {
        setShowDealModal(false);
        setEditingDeal(null);
    };
    const handleEditDeal = (deal) => {
        setEditingDeal(deal);
        setShowDealModal(true);
    };

    const openStatusMenu = (e, deal) => {
        if (isTerminalStatus(deal?.status)) return;
        setStatusMenu({ anchorEl: e.currentTarget, row: deal });
    };
    const closeStatusMenu = () => setStatusMenu({ anchorEl: null, row: null });
    const updateStatusMutation = useMutation({
        mutationFn: async ({ id, status, closedAt }) => {
            await updateCRMDeal(id, {
                status,
                ...(status === 'closed' && closedAt ? { closedAt } : {})
            });
            return { ok: true };
        },
        onSuccess: () => queryClient.invalidateQueries(['crm/lead', leadId])
    });
    // Note: status changes are handled in StatusMenu onChoose

    if (isLoading) return <Loading />;

    // If the lead endpoint explicitly returned 404, redirect to lead list
    if (!leadLoading && data?.status === 404)
        return <Navigate replace to="/crm/leads" />;

    return (
        <Box>
            <Box sx={{ mb: 3 }}>
                <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 1.5 }}>
                    <Link
                        color="inherit"
                        component="a"
                        href={`${DEMO.DASHBOARD_LINK}`}
                        underline="hover"
                    >
                        {appConfig.companyName}
                    </Link>
                    <Link
                        color="inherit"
                        component="a"
                        href="/crm"
                        underline="hover"
                    >
                        {t('breadcrumbs.crm', { ns: 'crm' })}
                    </Link>
                    <Link
                        color="inherit"
                        component="a"
                        href="/crm/leads"
                        underline="hover"
                    >
                        {t('breadcrumbs.leads', { ns: 'crm' })}
                    </Link>
                    <Typography color="text.primary">
                        {lead.fullName}
                    </Typography>
                </Breadcrumbs>
            </Box>
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
                {!leadEditStates.personal ? (
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
                                    .map((n) => n?.[0])
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
                                    {lead.fullName ||
                                        t('common.na', { ns: 'crm' })}
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
                                                : lead.closeLikelihood ===
                                                    'medium'
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
                                        title={`${t('leads.closeLikelihood', { ns: 'crm' })}: ${lead.closeLikelihood.charAt(0).toUpperCase() + lead.closeLikelihood.slice(1)}`}
                                    />
                                )}
                                <Chip
                                    label={
                                        lead.status
                                            ? lead.status
                                                  .charAt(0)
                                                  .toUpperCase() +
                                              lead.status.slice(1)
                                            : t('common.na', { ns: 'crm' })
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
                                        {lead?.salesRep?.label ||
                                            t('leads.unassigned', {
                                                ns: 'crm'
                                            })}
                                    </Typography>
                                    <IconButton
                                        onClick={() => handleEdit('personal')}
                                        size="small"
                                    >
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
                                    {lead.applicantRole}
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
                                    onClick={() => handleCreateUser(lead)}
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
                                    onClick={() => {
                                        setEditingDeal(null);
                                        setShowDealModal(true);
                                    }}
                                    size="small"
                                    variant="contained"
                                >
                                    {t('actions.createDeal', { ns: 'crm' })}
                                </Button>
                            )}
                        </Box>
                        {lead.salesNote?.trim() && (
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
                                        {lead.salesNote}
                                    </Typography>
                                </Box>
                            </Box>
                        )}
                        {(Array.isArray(lead?.tags) ||
                            Array.isArray(lead?.notes)) && (
                            <Box
                                sx={{
                                    width: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 1.5
                                }}
                            >
                                <Box sx={{ width: '100%' }}>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'flex-end'
                                        }}
                                    >
                                        <Button
                                            onClick={() =>
                                                setShowTagsEditor(
                                                    (prev) => !prev
                                                )
                                            }
                                            size="small"
                                            variant="text"
                                        >
                                            {showTagsEditor
                                                ? t('common.done', {
                                                      ns: 'crm'
                                                  })
                                                : normalizeTagList(
                                                        lead?.tags || []
                                                    ).length === 0
                                                  ? t('common.add', {
                                                        ns: 'crm'
                                                    })
                                                  : t('common.edit', {
                                                        ns: 'crm'
                                                    })}
                                        </Button>
                                    </Box>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            flexWrap: 'wrap',
                                            gap: 1
                                        }}
                                    >
                                        {normalizeTagObjects(
                                            lead?.tags || []
                                        ).map((tagItem) => (
                                            <Chip
                                                key={tagItem.id || tagItem.tag}
                                                label={`#${tagItem.tag}`}
                                                onDelete={
                                                    showTagsEditor
                                                        ? () =>
                                                              deleteTagById(
                                                                  tagItem.id
                                                              )
                                                        : undefined
                                                }
                                                size="small"
                                                sx={{
                                                    bgcolor: 'grey.100',
                                                    color: 'text.secondary'
                                                }}
                                                variant="outlined"
                                            />
                                        ))}
                                    </Box>
                                    {showTagsEditor && (
                                        <Box
                                            sx={{
                                                mt: 1,
                                                display: 'flex',
                                                gap: 1
                                            }}
                                        >
                                            <TextField
                                                fullWidth
                                                label={t('common.tags', {
                                                    ns: 'crm'
                                                })}
                                                onChange={(e) =>
                                                    setTagDraft(e.target.value)
                                                }
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        const nextTags =
                                                            normalizeTagList([
                                                                ...(lead?.tags ||
                                                                    []),
                                                                tagDraft
                                                            ]);
                                                        applyTagsUpdate(
                                                            nextTags
                                                        );
                                                        setTagDraft('');
                                                    }
                                                }}
                                                size="small"
                                                value={tagDraft}
                                            />
                                            <Button
                                                onClick={() => {
                                                    const nextTags =
                                                        normalizeTagList([
                                                            ...(lead?.tags ||
                                                                []),
                                                            tagDraft
                                                        ]);
                                                    applyTagsUpdate(nextTags);
                                                    setTagDraft('');
                                                }}
                                                variant="contained"
                                            >
                                                {t('common.add', { ns: 'crm' })}
                                            </Button>
                                        </Box>
                                    )}
                                </Box>
                                <Box sx={{ width: '100%' }}>
                                    {normalizeNoteObjects(lead?.notes || [])
                                        .length > 0 && (
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
                                    )}
                                    <Box
                                        sx={{
                                            mt: 0.5,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 0.5
                                        }}
                                    >
                                        {normalizeNoteObjects(
                                            lead?.notes || []
                                        ).map((note, idx) => (
                                            <Box
                                                key={note.id || `note-${idx}`}
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'flex-start',
                                                    gap: 1
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
                                                        • {note.note}
                                                    </Typography>
                                                )}
                                                {note.id && (
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
                                                                    onClick={() => {
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
                                                                        applyNotesUpdate(
                                                                            nextNotes
                                                                        );
                                                                        setEditingNoteId(
                                                                            null
                                                                        );
                                                                        setEditingNoteDraft(
                                                                            ''
                                                                        );
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
                                                                            note.id
                                                                        );
                                                                        setEditingNoteDraft(
                                                                            note.note ||
                                                                                ''
                                                                        );
                                                                    }}
                                                                >
                                                                    <EditIcon />
                                                                </IconButton>
                                                                <IconButton
                                                                    aria-label="delete"
                                                                    onClick={() => {
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
                                                                        applyNotesUpdate(
                                                                            nextNotes
                                                                        );
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
                                        <Box
                                            sx={{
                                                mt: 0.5,
                                                display: 'flex',
                                                gap: 1
                                            }}
                                        >
                                            {showAddNote ? (
                                                <>
                                                    <TextField
                                                        fullWidth
                                                        minRows={2}
                                                        multiline
                                                        onChange={(e) =>
                                                            setNewNoteDraft(
                                                                e.target.value
                                                            )
                                                        }
                                                        value={newNoteDraft}
                                                    />
                                                    <Button
                                                        onClick={() => {
                                                            const trimmed =
                                                                `${newNoteDraft}`.trim();
                                                            if (!trimmed)
                                                                return;
                                                            const nextNotes =
                                                                normalizeNoteObjects(
                                                                    [
                                                                        ...(lead?.notes ||
                                                                            []),
                                                                        {
                                                                            note: trimmed
                                                                        }
                                                                    ]
                                                                );
                                                            applyNotesUpdate(
                                                                nextNotes
                                                            );
                                                            setNewNoteDraft('');
                                                            setShowAddNote(
                                                                false
                                                            );
                                                        }}
                                                        variant="contained"
                                                    >
                                                        {t('common.add', {
                                                            ns: 'crm'
                                                        })}
                                                    </Button>
                                                    <Button
                                                        onClick={() => {
                                                            setNewNoteDraft('');
                                                            setShowAddNote(
                                                                false
                                                            );
                                                        }}
                                                        variant="text"
                                                    >
                                                        {t('common.cancel', {
                                                            ns: 'crm'
                                                        })}
                                                    </Button>
                                                </>
                                            ) : (
                                                <Button
                                                    onClick={() =>
                                                        setShowAddNote(true)
                                                    }
                                                    size="small"
                                                    variant="text"
                                                >
                                                    {t('common.add', {
                                                        ns: 'crm'
                                                    })}
                                                </Button>
                                            )}
                                        </Box>
                                    </Box>
                                </Box>
                            </Box>
                        )}
                        {Array.isArray(lead?.deals) &&
                            lead.deals.length > 0 && (
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
                                        {lead.deals.map((deal, idx) => {
                                            const id = getDealId(deal);
                                            const isUpdating =
                                                updateStatusMutation.isPending &&
                                                updateStatusMutation.variables
                                                    ?.id === id;
                                            const onEditDeal = (d) => {
                                                d.leadFullName = lead?.fullName;
                                                d.salesLabel =
                                                    deal?.salesRep?.label;
                                                handleEditDeal(d);
                                            };
                                            return (
                                                <Box key={id || idx}>
                                                    <DealItem
                                                        deal={deal}
                                                        isUpdating={isUpdating}
                                                        onEditDeal={onEditDeal}
                                                        onOpenStatusMenu={
                                                            openStatusMenu
                                                        }
                                                        t={t}
                                                    />
                                                </Box>
                                            );
                                        })}
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
                                    {hasUnsavedChanges('personal') && (
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
                                            handleFieldChange(
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
                                            handleFieldChange(
                                                'gender',
                                                e.target.value
                                            )
                                        }
                                        value={formData.gender || ''}
                                    >
                                        <MenuItem value="male">Male</MenuItem>
                                        <MenuItem value="female">
                                            Female
                                        </MenuItem>
                                        <MenuItem value="other">Other</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item md={3} xs={6}>
                                <TextField
                                    fullWidth
                                    label={t('leads.role', { ns: 'crm' })}
                                    onChange={(e) =>
                                        handleFieldChange(
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
                                            const selectedId = e.target.value;
                                            const selected = salesOptions.find(
                                                (s) => s.userId === selectedId
                                            );
                                            handleFieldChange(
                                                'salesUserId',
                                                selectedId
                                                    ? selected?.userId
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
                                        {salesOptions.map((s) => (
                                            <MenuItem
                                                key={s.userId}
                                                value={s.userId}
                                            >
                                                {s.label}
                                            </MenuItem>
                                        ))}
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
                                        disabled={updateLeadMutation.isPending}
                                        onClick={() => handleSave('personal')}
                                        size="small"
                                    >
                                        {updateLeadMutation.isPending ? (
                                            <CircularProgress size={20} />
                                        ) : (
                                            <SaveIcon />
                                        )}
                                    </IconButton>
                                    <IconButton
                                        disabled={updateLeadMutation.isPending}
                                        onClick={() => handleCancel('personal')}
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
                                            handleFieldChange(
                                                'status',
                                                e.target.value
                                            )
                                        }
                                        value={formData.status || ''}
                                    >
                                        <MenuItem value="open">Open</MenuItem>
                                        <MenuItem value="not-qualified">
                                            Not Qualified
                                        </MenuItem>
                                        <MenuItem value="closed">
                                            Closed
                                        </MenuItem>
                                        <MenuItem value="converted">
                                            Converted
                                        </MenuItem>
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
                                            handleFieldChange(
                                                'closeLikelihood',
                                                e.target.value
                                            )
                                        }
                                        value={formData.closeLikelihood || ''}
                                    >
                                        <MenuItem value="high">High</MenuItem>
                                        <MenuItem value="medium">
                                            Medium
                                        </MenuItem>
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
                                        handleFieldChange(
                                            'salesNote',
                                            e.target.value
                                        )
                                    }
                                    size="small"
                                    value={formData.salesNote || ''}
                                    variant="outlined"
                                />
                            </Grid>
                            {Array.isArray(lead?.deals) &&
                                lead.deals.length > 0 && (
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
                                                {lead.deals.map((deal, idx) => {
                                                    const id = getDealId(deal);
                                                    const isUpdating =
                                                        updateStatusMutation.isPending &&
                                                        updateStatusMutation
                                                            .variables?.id ===
                                                            id;
                                                    const onEditDeal = (d) => {
                                                        d.leadFullName =
                                                            lead?.fullName;
                                                        d.salesLabel =
                                                            lead?.salesRep?.label;
                                                        handleEditDeal(d);
                                                    };
                                                    return (
                                                        <Box key={id || idx}>
                                                            <DealItem
                                                                deal={deal}
                                                                isUpdating={
                                                                    isUpdating
                                                                }
                                                                onEditDeal={
                                                                    onEditDeal
                                                                }
                                                                onOpenStatusMenu={
                                                                    openStatusMenu
                                                                }
                                                                t={t}
                                                            />
                                                        </Box>
                                                    );
                                                })}
                                            </Box>
                                        </Box>
                                    </Grid>
                                )}
                        </Grid>
                    </Box>
                )}
            </Box>
            {lead?.meetings && lead.meetings.length > 0 && (
                <Box sx={{ mb: 4 }}>
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1.5
                        }}
                    >
                        {lead.meetings.map((meeting) => (
                            <Box
                                key={meeting.id}
                                sx={{
                                    p: 2,
                                    borderLeft: '4px solid',
                                    borderLeftColor: 'primary.main',
                                    backgroundColor: 'grey.50',
                                    borderRadius: '0 4px 4px 0',
                                    '&:hover': {
                                        backgroundColor: 'grey.100',
                                        transition: 'background-color 0.2s ease'
                                    },
                                    position: 'relative'
                                }}
                            >
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1.5
                                    }}
                                >
                                    <EventIcon
                                        color="primary"
                                        sx={{
                                            fontSize: '1.1rem',
                                            flexShrink: 0
                                        }}
                                    />
                                    <Typography
                                        sx={{
                                            display: 'flex',
                                            flexWrap: 'wrap',
                                            gap: 2,
                                            alignItems: 'center',
                                            lineHeight: 1.6,
                                            flex: 1
                                        }}
                                        variant="body1"
                                    >
                                        <Box
                                            component="span"
                                            sx={{
                                                fontWeight: 'bold',
                                                color: 'text.primary'
                                            }}
                                        >
                                            <Link
                                                component="a"
                                                href={`/crm/meetings/${meeting.id}`}
                                                sx={{
                                                    color: 'inherit',
                                                    fontWeight: 'inherit'
                                                }}
                                                underline="hover"
                                            >
                                                {sanitizeMeetingTitle(
                                                    meeting.title
                                                ) || 'N/A'}
                                            </Link>
                                        </Box>
                                        <Box
                                            component="span"
                                            sx={{
                                                color: 'text.secondary',
                                                fontSize: '0.9rem'
                                            }}
                                        >
                                            {new Date(
                                                meeting.date
                                            ).toLocaleDateString()}
                                        </Box>
                                        <Box
                                            component="span"
                                            sx={{
                                                flex: 1,
                                                minWidth: '300px',
                                                color: 'text.primary'
                                            }}
                                        >
                                            {meeting.summary?.gist ||
                                                t('common.noSummary', {
                                                    ns: 'crm'
                                                })}
                                        </Box>
                                    </Typography>
                                </Box>
                            </Box>
                        ))}
                    </Box>
                </Box>
            )}
            <SimilarStudents
                leadId={leadId}
                similarUsers={lead?.leadSimilarUsers}
            />
            {/* Student data */}
            {hasPortalUser && (
                <Accordion
                    defaultExpanded={hasPortalUser}
                    disableGutters
                    elevation={0}
                    square
                    sx={{
                        backgroundColor: 'transparent',
                        boxShadow: 'none',
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        '&:before': { display: 'none' }
                    }}
                >
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        sx={{
                            '& .MuiAccordionSummary-content': {
                                alignItems: 'center',
                                gap: 1
                            }
                        }}
                    >
                        <Typography sx={{ flexGrow: 1 }} variant="h6">
                            {`${t('common.studentDetails', { ns: 'crm' })}  (${t('readOnly', { ns: 'common' })})`}
                        </Typography>

                        <IconButton
                            aria-label="Edit student survey"
                            component="a"
                            href={`/student-database/${lead.userId}#survey`}
                            onClick={(e) => e.stopPropagation()}
                            size="small"
                        >
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Grid container spacing={3} sx={{ pb: 5 }}>
                            {studentCardConfigurations.map((config) => (
                                <Grid item key={config.id} {...config.gridSize}>
                                    <EditableCard
                                        disableEdit={hasPortalUser}
                                        title={config.title}
                                        viewContent={
                                            <GenericCardContent
                                                config={config}
                                                isEditing={false}
                                                lead={flattenObject(student)}
                                                onFieldChange={
                                                    handleFieldChange
                                                }
                                            />
                                        }
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    </AccordionDetails>
                </Accordion>
            )}

            {!isMigratedLead && (
                <Accordion
                    defaultExpanded={!hasPortalUser}
                    disableGutters
                    elevation={0}
                    square
                    sx={{
                        backgroundColor: 'transparent',
                        boxShadow: 'none',
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        '&:before': { display: 'none' }
                    }}
                >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h6">
                            {t('common.leadDetails', { ns: 'crm' })}
                            {hasPortalUser
                                ? ` (${t('readOnly', { ns: 'common' })})`
                                : ''}
                        </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        {lead && Object.keys(lead).length > 0 ? (
                            <Grid container spacing={3} sx={{ pb: 5 }}>
                                {leadCardConfigurations.map((config) => (
                                    <Grid
                                        item
                                        key={config.id}
                                        {...config.gridSize}
                                    >
                                        <EditableCard
                                            disableEdit={hasPortalUser}
                                            editContent={
                                                <GenericCardContent
                                                    config={config}
                                                    formData={formData}
                                                    isEditing={true}
                                                    lead={lead}
                                                    onFieldChange={
                                                        handleFieldChange
                                                    }
                                                />
                                            }
                                            hasUnsavedChanges={hasUnsavedChanges(
                                                config.id
                                            )}
                                            isEditing={
                                                leadEditStates[config.id]
                                            }
                                            isLoading={
                                                updateLeadMutation.isPending
                                            }
                                            onCancel={() =>
                                                handleCancel(config.id)
                                            }
                                            onEdit={() => handleEdit(config.id)}
                                            onSave={() => handleSave(config.id)}
                                            title={config.title}
                                            viewContent={
                                                <GenericCardContent
                                                    config={config}
                                                    formData={formData}
                                                    isEditing={false}
                                                    lead={lead}
                                                    onFieldChange={
                                                        handleFieldChange
                                                    }
                                                />
                                            }
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                        ) : (
                            <Typography color="text.secondary" variant="body1">
                                {t('common.loadingLeadInfo', { ns: 'crm' })}
                            </Typography>
                        )}
                    </AccordionDetails>
                </Accordion>
            )}

            {/* ------------ Modals ------------ */}
            <CreateUserFromLeadModal
                lead={selectedLead}
                onClose={handleCloseCreateUserModal}
                onSuccess={handleUserCreated}
                open={showCreateUserModal}
            />
            <DealModal
                deal={editingDeal}
                lockLeadSelect={true}
                lockSalesUserSelect={lead?.salesRep?.userId ?? false}
                onClose={closeDealModal}
                onCreated={() =>
                    queryClient.invalidateQueries(['crm/lead', leadId])
                }
                onUpdated={() =>
                    queryClient.invalidateQueries(['crm/lead', leadId])
                }
                open={showDealModal}
                preselectedLeadId={leadId}
                preselectedSalesUserId={lead?.salesRep?.userId || null}
            />
            <StatusMenu
                anchorEl={statusMenu.anchorEl}
                currentStatus={statusMenu.row?.status}
                onChoose={(s) => {
                    const id = getDealId(statusMenu.row);
                    updateStatusMutation.mutate(
                        { id, status: s },
                        { onSettled: () => closeStatusMenu() }
                    );
                }}
                onClose={closeStatusMenu}
            />
        </Box>
    );
};

export default LeadPage;
