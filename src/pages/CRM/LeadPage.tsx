import { Navigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMemo, useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    Box,
    Breadcrumbs,
    Link,
    Typography,
    Grid,
    IconButton,
    Accordion,
    AccordionSummary,
    AccordionDetails
} from '@mui/material';
import {
    Edit as EditIcon,
    ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';

import { is_TaiGer_role } from '@taiger-common/core';
import type { IUser } from '@taiger-common/model';
import { getStudentQuery } from '@/api/query';
import { useLead } from '@hooks/useLead';
import { request } from '@/api';
import {
    appendCRMLeadTags,
    createCRMLeadNote,
    deleteCRMLeadNote,
    deleteCRMLeadTags,
    getCRMLead,
    updateCRMDeal,
    updateCRMLead,
    updateCRMLeadNote
} from '@/api';

import DEMO from '@store/constant';
import { appConfig } from '../../config';

import Loading from '@components/Loading/Loading';
import { useAuth } from '@components/AuthProvider';
import CreateUserFromLeadModal from '@pages/CRM/components/CreateUserFromLeadModal';
import DealModal from '@pages/CRM/components/DealModal';
import EditableCard from '@pages/CRM/components/EditableCard';
import { GenericCardContent } from '@pages/CRM/components/GenericCard';
import {
    getStudentCardConfigurations,
    getLeadCardConfigurations
} from '@pages/CRM/components/CardConfigurations';
import SimilarStudents from '@pages/CRM/components/SimilarStudents';
import StatusMenu from '@pages/CRM/components/StatusMenu';
import { getDealId, isTerminalStatus } from '@pages/CRM/components/statusUtils';
import LeadProfileHeader from '@pages/CRM/components/LeadProfileHeader';
import MeetingsList from '@pages/CRM/components/MeetingsList';
import type { SimilarUserMatchItem } from '@pages/CRM/components/SimilarStudents';
import type { CreateUserFromLeadLead } from '@pages/CRM/components/CreateUserFromLeadModal';
import { flattenObject } from '../Utils/util_functions';
import { TabTitle } from '../Utils/TabTitle';

type LeadTagObject = { id?: string; tag: string };
type LeadNoteObject = { id?: string; note: string; createdAt?: string };
type StatusMenuRow = { status?: string; [key: string]: unknown };
type StatusMenuState = {
    anchorEl: HTMLElement | null;
    row: StatusMenuRow | null;
};
type DealRecord = Record<string, unknown>;
type MeetingItem = {
    id: string;
    title: string;
    date: string;
    summary?: { gist?: string };
};

const LeadPage = () => {
    const { leadId } = useParams();
    const { t } = useTranslation();
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const { lead, isLoading: leadLoading } = useLead(leadId);

    TabTitle(`${t('common.lead', { ns: 'crm' })} - ${lead?.fullName}`);

    const hasPortalUser = !!lead?.userId;
    const isMigratedLead = lead?.status === 'migrated' && hasPortalUser;

    // lead.userId exists fetch student data
    const studentQueryOptions = hasPortalUser
        ? getStudentQuery(String(lead.userId))
        : {
              queryKey: ['student', lead?.userId],
              queryFn: async () => null,
              enabled: false
          };
    const { data: studentData, isLoading: studentLoading } =
        useQuery(studentQueryOptions);
    const student =
        (studentData as { data?: { data?: Record<string, unknown> } })?.data
            ?.data || {};
    const isLoading = leadLoading || (hasPortalUser && studentLoading);

    const [selectedLead, setSelectedLead] =
        useState<CreateUserFromLeadLead | null>(null);
    const [showCreateUserModal, setShowCreateUserModal] = useState(false);
    const [editingDeal, setEditingDeal] = useState<DealRecord | null>(null);
    const [showDealModal, setShowDealModal] = useState(false);
    const [statusMenu, setStatusMenu] = useState<StatusMenuState>({
        anchorEl: null,
        row: null
    });

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
    const [leadEditStates, setLeadEditStates] =
        useState<Record<string, boolean>>(initLeadEditStates);
    const [formData, setFormData] = useState<Record<string, unknown>>({});

    const { data: salesData } = useQuery({
        queryKey: ['crm/sales-reps'],
        queryFn: async () => {
            const res = await request.get('/api/crm/sales-reps');
            return res?.data?.data ?? res?.data ?? [];
        },
        enabled: Boolean(leadEditStates.personal),
        staleTime: 300000
    });
    const salesOptions = useMemo(
        () =>
            (salesData || []).map((s: Record<string, string>) => ({
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
            const changed = getChangedFields(
                (lead ?? {}) as Record<string, unknown>,
                (value ?? {}) as Record<string, unknown>
            );
            if (Object.keys(changed).length === 0) return;
            await updateLeadMutation.mutateAsync(changed);
        }
    });

    const getChangedFields = (
        orig: Record<string, unknown>,
        cur: Record<string, unknown>
    ) => {
        const out: Record<string, unknown> = {};
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
            const leadRecord = lead as unknown as Record<string, unknown>;
            setFormData(leadRecord);
            form.reset(leadRecord);
        }
    }, [lead, form]);

    const normalizeTagObjects = (value: unknown): LeadTagObject[] => {
        if (Array.isArray(value)) {
            return value
                .map((t) => {
                    if (t && typeof t === 'object') {
                        const obj = t as Record<string, unknown>;
                        const id =
                            typeof obj.id === 'string' ? obj.id : undefined;
                        return { id, tag: `${obj.tag ?? ''}`.trim() };
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

    const normalizeTagsInput = (value: unknown): string[] => {
        const raw = Array.isArray(value)
            ? value
            : typeof value === 'string'
              ? value.split(/[\n,]/)
              : [];

        const normalized = raw
            .map((t) =>
                t && typeof t === 'object' ? (t as LeadTagObject).tag : t
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

    const normalizeNotesInput = (value: unknown): LeadNoteObject[] => {
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

    const updateLeadMutation = useMutation({
        mutationFn: async (changed: Record<string, unknown>) => {
            if (!leadId) return null;

            const { tags, notes, ...rest } = changed || {};
            const tasks: Promise<unknown>[] = [];

            if (Object.keys(rest).length > 0) {
                tasks.push(updateCRMLead(leadId, rest));
            }

            if (tags !== undefined) {
                const normalizedTags = normalizeTagsInput(tags);
                const existingTagObjects = normalizeTagObjects(
                    lead?.tags ?? []
                );
                const existingTags = existingTagObjects.map((t) => t.tag);

                const addedTags = normalizedTags.filter(
                    (tag) => !existingTags.includes(tag)
                );
                const removedTagIds = existingTagObjects
                    .filter(
                        (t) => !normalizedTags.includes(t.tag) && Boolean(t.id)
                    )
                    .map((t) => t.id as string);

                if (removedTagIds.length > 0) {
                    tasks.push(deleteCRMLeadTags(leadId, removedTagIds));
                }
                if (addedTags.length > 0) {
                    tasks.push(appendCRMLeadTags(leadId, addedTags));
                }
            }

            if (notes !== undefined) {
                const normalizedNotes = normalizeNotesInput(notes);
                const existingNotes = normalizeNotesInput(lead?.notes ?? []);

                const existingById = new Map(
                    existingNotes
                        .filter((n) => Boolean(n.id))
                        .map((n) => [n.id as string, n])
                );
                const currentById = new Map(
                    normalizedNotes
                        .filter(
                            (n) =>
                                Boolean(n.id) &&
                                !String(n.id).startsWith('new-')
                        )
                        .map((n) => [n.id as string, n])
                );

                const addedNotes = normalizedNotes.filter(
                    (n) => !n.id || String(n.id).startsWith('new-')
                );
                const removedNotes = existingNotes.filter(
                    (n) => Boolean(n.id) && !currentById.has(n.id as string)
                );
                const updatedNotes = normalizedNotes.filter((n) => {
                    if (!n.id) return false;
                    const existing = existingById.get(n.id);
                    return Boolean(existing && existing.note !== n.note);
                });

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
                                updateCRMLeadNote(leadId, n.id as string, {
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
                                deleteCRMLeadNote(leadId, n.id as string)
                            )
                        )
                    );
                }
            }

            if (tasks.length === 0) return null;

            await Promise.all(tasks);
            const refreshed = await getCRMLead(leadId);
            return refreshed?.data ?? refreshed;
        },
        onSuccess: (updated) => {
            if (!updated) return;
            queryClient.setQueryData(['crm/lead', leadId], (old) => {
                if (!old) return old;
                if (typeof old === 'object' && old !== null) {
                    return {
                        ...(old as Record<string, unknown>),
                        ...(updated as Record<string, unknown>)
                    };
                }
                return updated;
            });
            queryClient.invalidateQueries({
                queryKey: ['crm/lead', leadId]
            });
        }
    });

    const applyTagsUpdate = async (nextTags: string[]) => {
        await updateLeadMutation.mutateAsync({ tags: nextTags });
    };

    const deleteTagById = async (tagId?: string) => {
        if (!tagId || !leadId) return;
        await deleteCRMLeadTags(leadId, [tagId]);
        await queryClient.invalidateQueries({ queryKey: ['crm/lead', leadId] });
    };

    const applyNotesUpdate = async (nextNotes: LeadNoteObject[]) => {
        await updateLeadMutation.mutateAsync({ notes: nextNotes });
    };

    const handleEdit = (cardId: string) => {
        setLeadEditStates((p) => ({ ...p, [cardId]: true }));
        if (lead && Object.keys(lead).length) {
            const leadRecord = lead as unknown as Record<string, unknown>;
            setFormData(leadRecord);
            form.reset(leadRecord);
        }
    };
    const handleCancel = (cardId: string) => {
        setLeadEditStates((p) => ({ ...p, [cardId]: false }));
        const leadRecord = (lead ?? {}) as unknown as Record<string, unknown>;
        setFormData(leadRecord);
        form.reset(leadRecord);
    };
    const handleSave = async (cardId: string) => {
        const changed = getChangedFields(
            (lead ?? {}) as unknown as Record<string, unknown>,
            formData
        );
        if (Object.keys(changed).length === 0) {
            setLeadEditStates((p) => ({ ...p, [cardId]: false }));
            return;
        }
        await updateLeadMutation.mutateAsync(changed);
        setLeadEditStates((p) => ({ ...p, [cardId]: false }));
    };
    const handleFieldChange = (field: string, value: string | null) => {
        setFormData((p) => ({ ...p, [field]: value }));
        form.setFieldValue(field, value);
    };
    const hasUnsavedChanges = (cardId: string) => {
        const changed = getChangedFields(
            (lead ?? {}) as unknown as Record<string, unknown>,
            formData
        );
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

    const handleCreateUser = (leadData: Record<string, unknown>) => {
        setSelectedLead(leadData);
        setShowCreateUserModal(true);
    };
    const handleCloseCreateUserModal = () => {
        setShowCreateUserModal(false);
        setSelectedLead(null);
    };
    const handleUserCreated = async (userData?: Record<string, string>) => {
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
        queryClient.invalidateQueries({
            queryKey: ['crm/lead', leadId]
        });
    };

    const closeDealModal = () => {
        setShowDealModal(false);
        setEditingDeal(null);
    };
    const handleEditDeal = (deal: Record<string, unknown>) => {
        setEditingDeal(deal);
        setShowDealModal(true);
    };

    const meetingsForList: MeetingItem[] = Array.isArray(lead?.meetings)
        ? (lead.meetings as Record<string, unknown>[])
              .map((m) => ({
                  id: String(m.id ?? ''),
                  title: String(m.title ?? m.leadFullName ?? 'N/A'),
                  date: String(m.date ?? m.dateTime ?? ''),
                  summary:
                      m.summary && typeof m.summary === 'object'
                          ? ({
                                gist: String(
                                    (m.summary as Record<string, unknown>)
                                        .gist ?? ''
                                )
                            } as { gist?: string })
                          : undefined
              }))
              .filter((m) => m.id && m.date)
        : [];

    const similarUsersForList: SimilarUserMatchItem[] = Array.isArray(
        lead?.leadSimilarUsers
    )
        ? (lead.leadSimilarUsers as Record<string, unknown>[])
              .map((u) => ({
                  mongoId: String(u.mongoId ?? u.id ?? ''),
                  reason: typeof u.reason === 'string' ? u.reason : undefined
              }))
              .filter((u) => u.mongoId.length > 0)
        : [];

    const openStatusMenu = (
        e: React.MouseEvent<HTMLElement>,
        deal: StatusMenuRow
    ) => {
        if (isTerminalStatus(String(deal?.status ?? ''))) return;
        setStatusMenu({ anchorEl: e.currentTarget, row: deal });
    };
    const closeStatusMenu = () => setStatusMenu({ anchorEl: null, row: null });
    const updateStatusMutation = useMutation<
        { ok: true },
        Error,
        { id: string; status: string; closedAt?: string }
    >({
        mutationFn: async ({ id, status, closedAt }) => {
            await updateCRMDeal(id, {
                status,
                ...(status === 'closed' && closedAt ? { closedAt } : {})
            });
            return { ok: true };
        },
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: ['crm/lead', leadId] })
    });
    // Note: status changes are handled in StatusMenu onChoose

    if (!user || !is_TaiGer_role(user as IUser))
        return <Navigate to={`${DEMO.DASHBOARD_LINK}`} />;
    if (isLoading) return <Loading />;

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
                        {lead?.fullName}
                    </Typography>
                </Breadcrumbs>
            </Box>
            {!lead && (
                <Typography color="text.secondary" variant="body1">
                    {t('common.leadNotFound', { ns: 'crm' })}
                </Typography>
            )}
            {lead && (
                <>
                    <LeadProfileHeader
                        lead={lead}
                        isMigratedLead={isMigratedLead}
                        hasPortalUser={hasPortalUser}
                        isEditing={leadEditStates.personal}
                        formData={formData}
                        salesOptions={salesOptions}
                        updateIsPending={updateLeadMutation.isPending}
                        hasUnsavedChanges={hasUnsavedChanges('personal')}
                        onEdit={() => handleEdit('personal')}
                        onSave={() => handleSave('personal')}
                        onCancel={() => handleCancel('personal')}
                        onFieldChange={handleFieldChange}
                        onCreateUser={handleCreateUser}
                        onCreateDeal={() => {
                            setEditingDeal(null);
                            setShowDealModal(true);
                        }}
                        onEditDeal={handleEditDeal}
                        onApplyNotesUpdate={applyNotesUpdate}
                        onApplyTagsUpdate={applyTagsUpdate}
                        onDeleteTagById={deleteTagById}
                        updateStatusMutation={updateStatusMutation}
                        openStatusMenu={openStatusMenu}
                        t={t}
                    />
                    <MeetingsList meetings={meetingsForList} t={t} />
                    <SimilarStudents
                        leadId={leadId}
                        similarUsers={similarUsersForList}
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
                                        <Grid
                                            item
                                            key={config.id}
                                            {...config.gridSize}
                                        >
                                            <EditableCard
                                                disableEdit={hasPortalUser}
                                                editContent={<></>}
                                                isEditing={false}
                                                onCancel={() => {}}
                                                onEdit={() => {}}
                                                onSave={() => {}}
                                                title={config.title}
                                                viewContent={
                                                    <GenericCardContent
                                                        config={config}
                                                        formData={
                                                            formData as Record<
                                                                string,
                                                                string
                                                            >
                                                        }
                                                        isEditing={false}
                                                        lead={flattenObject(
                                                            student
                                                        )}
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
                                        {leadCardConfigurations.map(
                                            (config) => (
                                                <Grid
                                                    item
                                                    key={config.id}
                                                    {...config.gridSize}
                                                >
                                                    <EditableCard
                                                        disableEdit={
                                                            hasPortalUser
                                                        }
                                                        editContent={
                                                            <GenericCardContent
                                                                config={config}
                                                                formData={
                                                                    formData as Record<
                                                                        string,
                                                                        string
                                                                    >
                                                                }
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
                                                            leadEditStates[
                                                                config.id
                                                            ]
                                                        }
                                                        isLoading={
                                                            updateLeadMutation.isPending
                                                        }
                                                        onCancel={() =>
                                                            handleCancel(
                                                                config.id
                                                            )
                                                        }
                                                        onEdit={() =>
                                                            handleEdit(
                                                                config.id
                                                            )
                                                        }
                                                        onSave={() =>
                                                            handleSave(
                                                                config.id
                                                            )
                                                        }
                                                        title={config.title}
                                                        viewContent={
                                                            <GenericCardContent
                                                                config={config}
                                                                formData={
                                                                    formData as Record<
                                                                        string,
                                                                        string
                                                                    >
                                                                }
                                                                isEditing={
                                                                    false
                                                                }
                                                                lead={lead}
                                                                onFieldChange={
                                                                    handleFieldChange
                                                                }
                                                            />
                                                        }
                                                    />
                                                </Grid>
                                            )
                                        )}
                                    </Grid>
                                ) : (
                                    <Typography
                                        color="text.secondary"
                                        variant="body1"
                                    >
                                        {t('common.loadingLeadInfo', {
                                            ns: 'crm'
                                        })}
                                    </Typography>
                                )}
                            </AccordionDetails>
                        </Accordion>
                    )}

                    {/* ------------ Modals ------------ */}
                    <CreateUserFromLeadModal
                        lead={selectedLead || {}}
                        onClose={handleCloseCreateUserModal}
                        onSuccess={handleUserCreated}
                        open={showCreateUserModal}
                    />
                    <DealModal
                        deal={editingDeal}
                        lockLeadSelect={true}
                        lockSalesUserSelect={Boolean(
                            (lead?.salesRep as { userId?: string } | undefined)
                                ?.userId
                        )}
                        onClose={closeDealModal}
                        onCreated={() =>
                            queryClient.invalidateQueries({
                                queryKey: ['crm/lead', leadId]
                            })
                        }
                        onUpdated={() =>
                            queryClient.invalidateQueries({
                                queryKey: ['crm/lead', leadId]
                            })
                        }
                        open={showDealModal}
                        preselectedLeadId={leadId}
                        preselectedSalesUserId={
                            ((lead?.salesRep as { userId?: string } | undefined)
                                ?.userId || undefined) as string | undefined
                        }
                    />
                    <StatusMenu
                        anchorEl={statusMenu.anchorEl}
                        currentStatus={statusMenu.row?.status}
                        onChoose={(s: string) => {
                            const id = getDealId(statusMenu.row);
                            updateStatusMutation.mutate(
                                { id: String(id), status: s },
                                { onSettled: () => closeStatusMenu() }
                            );
                        }}
                        onClose={closeStatusMenu}
                    />
                </>
            )}
        </Box>
    );
};

export default LeadPage;
