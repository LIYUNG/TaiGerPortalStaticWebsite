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
import { getStudentQuery } from '@/api/query';
import { useLead } from '@hooks/useLead';
import { request } from '@/api';
import { updateCRMDeal } from '@/api';

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
import { flattenObject } from '../Utils/util_functions';
import { TabTitle } from '../Utils/TabTitle';

const LeadPage = () => {
    const { leadId } = useParams();
    const { t } = useTranslation();
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const { lead, isLoading: leadLoading, data: leadData } = useLead(leadId);

    TabTitle(`${t('common.lead', { ns: 'crm' })} - ${lead.fullName}`);

    const hasPortalUser = !!lead?.userId;
    const isMigratedLead = lead?.status === 'migrated' && hasPortalUser;

    // lead.userId exists fetch student data
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
            const changed = getChangedFields(lead, value);
            if (Object.keys(changed).length === 0) return;
            await updateLeadMutation.mutateAsync(changed);
        }
    });

    const getChangedFields = (
        orig: Record<string, unknown>,
        cur: Record<string, unknown>
    ) => {
        const out = {};
        Object.keys(cur).forEach((k) => {
            if (['createdAt', 'updatedAt', 'meetings', 'id'].includes(k))
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
    }, [lead, form]);

    const updateLeadMutation = useMutation({
        mutationFn: async (changed) => {
            const res = await request.put(`/api/crm/leads/${leadId}`, changed);
            return res.data || res;
        },
        onSuccess: (updated) => {
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

    const handleEdit = (cardId: string) => {
        setLeadEditStates((p) => ({ ...p, [cardId]: true }));
        if (lead && Object.keys(lead).length) {
            setFormData(lead);
            form.reset(lead);
        }
    };
    const handleCancel = (cardId: string) => {
        setLeadEditStates((p) => ({ ...p, [cardId]: false }));
        setFormData(lead);
        form.reset(lead);
    };
    const handleSave = async (cardId: string) => {
        const changed = getChangedFields(lead, formData);
        if (Object.keys(changed).length === 0) {
            setLeadEditStates((p) => ({ ...p, [cardId]: false }));
            return;
        }
        await updateLeadMutation.mutateAsync(changed);
        setLeadEditStates((p) => ({ ...p, [cardId]: false }));
    };
    const handleFieldChange = (field: string, value: string) => {
        setFormData((p) => ({ ...p, [field]: value }));
        form.setFieldValue(field, value);
    };
    const hasUnsavedChanges = (cardId: string) => {
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

    const handleCreateUser = (leadData: Record<string, unknown>) => {
        setSelectedLead(leadData);
        setShowCreateUserModal(true);
    };
    const handleCloseCreateUserModal = () => {
        setShowCreateUserModal(false);
        setSelectedLead(null);
    };
    const handleUserCreated = async (userData: Record<string, string>) => {
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
    const handleEditDeal = (deal: Record<string, unknown>) => {
        setEditingDeal(deal);
        setShowDealModal(true);
    };

    const openStatusMenu = (
        e: React.MouseEvent<HTMLElement>,
        deal: unknown
    ) => {
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

    if (!is_TaiGer_role(user))
        return <Navigate to={`${DEMO.DASHBOARD_LINK}`} />;
    if (isLoading) return <Loading />;

    // If the lead endpoint explicitly returned 404, redirect to lead list
    if (!leadLoading && leadData?.status === 404)
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
                updateStatusMutation={updateStatusMutation}
                openStatusMenu={openStatusMenu}
                t={t}
            />
            <MeetingsList meetings={lead?.meetings ?? []} t={t} />
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
                onChoose={(s: string) => {
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
