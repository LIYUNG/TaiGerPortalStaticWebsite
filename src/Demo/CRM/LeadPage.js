import { useParams, Navigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
import { useForm } from '@tanstack/react-form';
import { Box, Breadcrumbs, Link, Typography, Grid } from '@mui/material';
import { Event as EventIcon } from '@mui/icons-material';

import DEMO from '../../store/constant';
import { TabTitle } from '../Utils/TabTitle';
import Loading from '../../components/Loading/Loading';
import { useAuth } from '../../components/AuthProvider';
import { is_TaiGer_role } from '@taiger-common/core';
import { appConfig } from '../../config';
import { getCRMLeadQuery } from '../../api/query';
import EditableCard from './components/EditableCard';
import { GenericCardContent } from './components/GenericCard';
import { getCardConfigurations } from './components/CardConfigurations';
import CreateUserFromLeadModal from './components/CreateUserFromLeadModal';
import SimilarStudents from './components/SimilarStudents';

import { request } from '../../api/request';

const LeadPage = () => {
    const { leadId } = useParams();
    const queryClient = useQueryClient();

    const { user } = useAuth();
    if (!is_TaiGer_role(user)) {
        return <Navigate to={`${DEMO.DASHBOARD_LINK}`} />;
    }

    const { data, isLoading } = useQuery(getCRMLeadQuery(leadId));
    const lead = data?.data?.data || {};
    TabTitle(`Lead ${lead ? `- ${lead.fullName}` : ''}`);

    // Modal state for creating user from lead
    const [showCreateUserModal, setShowCreateUserModal] = useState(false);
    const [selectedLead, setSelectedLead] = useState(null);

    // Handle create user modal
    const handleCreateUser = (leadData) => {
        setSelectedLead(leadData);
        setShowCreateUserModal(true);
    };

    const handleCloseCreateUserModal = () => {
        setShowCreateUserModal(false);
        setSelectedLead(null);
    };

    const handleUserCreated = async (userData) => {
        // Extract the new user ID from the response
        const newUserId = userData?.newUser;
        console.log('User created successfully:', newUserId);

        if (newUserId) {
            try {
                // Update the lead with the new user ID and convert status
                const updateData = {
                    userId: newUserId,
                    status: 'converted'
                };

                console.log('Updating lead with:', updateData);

                // Use the existing mutation to update the lead
                await updateLeadMutation.mutateAsync(updateData);

                console.log(
                    'Lead successfully updated with user ID and converted status'
                );

                // Optionally show a success message
                // You can add a toast notification here if you have one set up
            } catch (error) {
                console.error(
                    'Failed to update lead after user creation:',
                    error
                );
                // Handle the error - you might want to show an error message to the user
                alert(
                    'User was created successfully, but failed to update the lead. Please refresh the page.'
                );
            }
        } else {
            console.error('No user ID received from user creation response');
        }

        // Invalidate queries to refetch the latest data
        queryClient.invalidateQueries(['crm/lead', leadId]);
    };

    // Get card configurations with the create user handler
    const cardConfigurations = getCardConfigurations(handleCreateUser);

    // Generate edit states dynamically from card configurations
    const initialEditStates = cardConfigurations.reduce((acc, config) => {
        acc[config.id] = false;
        return acc;
    }, {});

    const [editStates, setEditStates] = useState(initialEditStates);
    const [formData, setFormData] = useState({});

    // Initialize form data when lead loads
    useMemo(() => {
        if (lead && Object.keys(lead).length > 0) {
            setFormData(lead);
        }
    }, [lead]);

    // Create form with TanStack Form for change tracking
    const form = useForm({
        defaultValues: formData,
        onSubmit: async ({ value }) => {
            // Get only the changed fields by comparing with original lead data
            const changedFields = getChangedFields(lead, value);
            if (Object.keys(changedFields).length === 0) {
                console.log('No changes detected');
                return;
            }

            console.log('Submitting only changed fields:', changedFields);
            return updateLeadMutation.mutateAsync(changedFields);
        }
    });

    // Helper function to get only changed fields with deep comparison
    const getChangedFields = (original, current) => {
        const changes = {};
        Object.keys(current).forEach((key) => {
            // Skip system fields that shouldn't be sent to API
            if (['createdAt', 'updatedAt', 'meetings', 'id'].includes(key)) {
                return;
            }

            // Compare values, treating undefined/null/empty string as equivalent for form fields
            const originalValue = original[key] || '';
            const currentValue = current[key] || '';

            if (originalValue !== currentValue) {
                changes[key] = current[key];
            }
        });
        return changes;
    };

    // Update form values when lead data changes
    useMemo(() => {
        if (lead && Object.keys(lead).length > 0) {
            setFormData(lead);
            form.reset(lead);
        }
    }, [lead, form]);

    // Update lead mutation - now only sends changed fields
    const updateLeadMutation = useMutation({
        mutationFn: async (changedData) => {
            // Only send the changed fields to the API
            console.log('Sending to API:', changedData);
            const response = await request.put(
                `/api/crm/leads/${leadId}`,
                changedData
            );
            return response.data || response;
        },
        onSuccess: (updatedLead) => {
            // Update the query cache with the merged data
            queryClient.setQueryData(['crm/lead', leadId], (oldData) => {
                if (oldData) {
                    return {
                        ...oldData,
                        data: {
                            ...oldData.data,
                            data: { ...oldData.data.data, ...updatedLead }
                        }
                    };
                }
                return oldData;
            });

            // Also invalidate to refetch from server as backup
            queryClient.invalidateQueries(['crm-lead', leadId]);
        }
    });

    const handleEdit = (cardType) => {
        setEditStates((prev) => ({
            ...prev,
            [cardType]: true
        }));
        // Ensure form has the latest lead values when starting edit
        if (lead && Object.keys(lead).length > 0) {
            setFormData(lead);
            form.reset(lead);
        }
    };

    const handleCancel = (cardType) => {
        setEditStates((prev) => ({
            ...prev,
            [cardType]: false
        }));
        // Reset form to original lead values on cancel
        setFormData(lead);
        form.reset(lead);
    };

    const handleSave = async (cardType) => {
        try {
            // Get the changed fields before submitting
            const changedFields = getChangedFields(lead, formData);
            console.log('Changed fields to submit:', changedFields);

            if (Object.keys(changedFields).length === 0) {
                console.log('No changes detected, exiting edit mode');
                setEditStates((prev) => ({
                    ...prev,
                    [cardType]: false
                }));
                return;
            }

            // Submit the changes
            await updateLeadMutation.mutateAsync(changedFields);
            // Exit edit mode only after successful save
            setEditStates((prev) => ({
                ...prev,
                [cardType]: false
            }));
        } catch (error) {
            console.error('Failed to save lead data:', error);
            alert('Failed to save changes. Please try again.');
        }
    };

    const handleFieldChange = (field, value) => {
        // Update both form data state and TanStack form
        setFormData((prev) => ({
            ...prev,
            [field]: value
        }));

        // Update TanStack form as well for consistency
        form.setFieldValue(field, value);
    };

    // Helper to check if a specific card has unsaved changes
    const hasUnsavedChanges = (cardId) => {
        const changedFields = getChangedFields(lead, formData);
        // Get fields for this specific card from the configuration
        const cardConfig = cardConfigurations.find(
            (config) => config.id === cardId
        );
        if (!cardConfig) return false;

        const cardFields = cardConfig.fields
            ? cardConfig.fields.map((field) => field.key)
            : [];
        const cardSectionFields = cardConfig.sections
            ? cardConfig.sections.flatMap((section) =>
                  section.fields.map((field) => field.key)
              )
            : [];

        const allCardFields = [...cardFields, ...cardSectionFields];

        return allCardFields.some((field) =>
            Object.prototype.hasOwnProperty.call(changedFields, field)
        );
    };

    if (isLoading) {
        return <Loading />;
    }

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
                        CRM
                    </Link>
                    <Link
                        color="inherit"
                        component="a"
                        href="/crm/leads"
                        underline="hover"
                    >
                        Leads
                    </Link>
                    <Typography color="text.primary">
                        {lead.fullName}
                    </Typography>
                </Breadcrumbs>
            </Box>

            {/* Meetings */}
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
                                                {meeting.title}
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
                                                'No summary available'}
                                        </Box>
                                    </Typography>
                                </Box>
                            </Box>
                        ))}
                    </Box>
                </Box>
            )}

            {/* Similar Students Section */}
            <SimilarStudents leadId={leadId} maxStudents={5} />

            {lead && Object.keys(lead).length > 0 ? (
                <Grid container spacing={3} sx={{ pb: 5 }}>
                    {cardConfigurations.map((config) => (
                        <Grid item key={config.id} {...config.gridSize}>
                            <EditableCard
                                editContent={
                                    <GenericCardContent
                                        config={config}
                                        formData={formData}
                                        isEditing={true}
                                        lead={lead}
                                        onFieldChange={handleFieldChange}
                                    />
                                }
                                hasUnsavedChanges={hasUnsavedChanges(config.id)}
                                isEditing={editStates[config.id]}
                                isLoading={updateLeadMutation.isPending}
                                onCancel={() => handleCancel(config.id)}
                                onEdit={() => handleEdit(config.id)}
                                onSave={() => handleSave(config.id)}
                                title={config.title}
                                viewContent={
                                    <GenericCardContent
                                        config={config}
                                        formData={formData}
                                        isEditing={false}
                                        lead={lead}
                                        onFieldChange={handleFieldChange}
                                    />
                                }
                            />
                        </Grid>
                    ))}
                </Grid>
            ) : (
                <Typography color="text.secondary" variant="body1">
                    Loading lead information...
                </Typography>
            )}

            {/* Create User Modal */}
            <CreateUserFromLeadModal
                lead={selectedLead}
                onClose={handleCloseCreateUserModal}
                onSuccess={handleUserCreated}
                open={showCreateUserModal}
            />
        </Box>
    );
};

export default LeadPage;
