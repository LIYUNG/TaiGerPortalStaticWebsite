import React from 'react';
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
    Button,
    CircularProgress
} from '@mui/material';
import {
    Edit as EditIcon,
    Save as SaveIcon,
    Cancel as CancelIcon,
    PersonAdd as PersonAddIcon,
    Female as FemaleIcon,
    Male as MaleIcon,
    Transgender as OtherGenderIcon
} from '@mui/icons-material';

import DealItem from '@pages/CRM/components/DealItem';
import { getDealId } from '@pages/CRM/components/statusUtils';

interface LeadProfileHeaderProps {
    lead: Record<string, unknown>;
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
    onFieldChange: (field: string, value: string) => void;
    onCreateUser: (lead: Record<string, unknown>) => void;
    onCreateDeal: () => void;
    onEditDeal: (deal: Record<string, unknown>) => void;
    updateStatusMutation: {
        isPending: boolean;
        variables?: { id: string };
        mutate: (args: unknown, opts?: unknown) => void;
    };
    openStatusMenu: (e: React.MouseEvent<HTMLElement>, deal: unknown) => void;
    t: (key: string, opts?: Record<string, unknown>) => string;
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
    updateStatusMutation,
    openStatusMenu,
    t
}: LeadProfileHeaderProps) => {
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
                                    lead.status
                                        ? (lead.status as string)
                                              .charAt(0)
                                              .toUpperCase() +
                                          (lead.status as string).slice(1)
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
                                    {(lead?.salesRep as Record<string, unknown>)
                                        ?.label ||
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
                                        onFieldChange('gender', e.target.value)
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
                                        const selectedId = e.target.value;
                                        const selected = salesOptions.find(
                                            (s: {
                                                userId: string;
                                                label: string;
                                            }) => s.userId === selectedId
                                        );
                                        onFieldChange(
                                            'salesUserId',
                                            selectedId ? selected?.userId : null
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
                                        onFieldChange('status', e.target.value)
                                    }
                                    value={formData.status || ''}
                                >
                                    <MenuItem value="open">Open</MenuItem>
                                    <MenuItem value="not-qualified">
                                        Not Qualified
                                    </MenuItem>
                                    <MenuItem value="closed">Closed</MenuItem>
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
                                        onFieldChange(
                                            'closeLikelihood',
                                            e.target.value
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
