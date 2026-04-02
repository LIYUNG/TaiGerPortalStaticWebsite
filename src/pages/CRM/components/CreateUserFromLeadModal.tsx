import { useState, useEffect } from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    Box,
    Divider,
    Typography,
    CircularProgress
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useForm } from '@tanstack/react-form';
import { useQuery } from '@tanstack/react-query';
import { addUser, createCRMDeal, getCRMSalesReps, updateCRMDeal } from '@/api';
import { getDealId, isTerminalStatus } from './statusUtils';

function parseGPA(value: string | number | undefined) {
    if (!value || typeof value !== 'string') {
        return {};
    }

    const [current, max] = value.split('/').map((v) => v.trim());

    return {
        gpa: current || undefined,
        maxGpa: max || undefined
    };
}

function mapLeadToStudentAcademic(lead: CreateUserFromLeadLead) {
    const { gpa: bachelorGPA, maxGpa: bachelorHighestGPA } = parseGPA(
        lead.bachelorGPA
    );

    const { gpa: masterGPA, maxGpa: masterHighestGPA } = parseGPA(
        lead.masterGPA
    );
    return {
        academic_background: {
            university: {
                high_school_isGraduated: lead.highschoolName ? 'Yes' : 'No',
                attended_high_school: lead.highschoolName || '',

                isGraduated: lead.masterSchool ? 'Yes' : 'pending',
                attended_university: lead.bachelorSchool || '',
                attended_university_program: lead.bachelorProgramName || '',

                My_GPA_Uni: bachelorGPA ? Number(bachelorGPA) : undefined,
                Highest_GPA_Uni: bachelorHighestGPA
                    ? Number(bachelorHighestGPA)
                    : undefined,

                isSecondGraduated: lead.masterSchool ? 'pending' : 'No',
                attendedSecondDegreeUniversity: lead.masterSchool || '',
                attendedSecondDegreeProgram: lead.masterProgramName || '',
                mySecondDegreeGPA: masterGPA ? Number(masterGPA) : undefined,
                highestSecondDegreeGPA: masterHighestGPA
                    ? Number(masterHighestGPA)
                    : undefined,

                expected_grad_date: lead.currentYearOrGraduated || '',
                highestEducation: lead.highestEducation || '',
                Has_Working_Experience: lead.workExperience || '-',
                Has_Internship_Experience: lead.otherActivities || '-'
            },

            language: {
                english_certificate: lead.englishLevel || '',
                german_certificate: lead.germanLevel || ''
            }
        },
        application_preference: {
            expected_application_date: lead.intendedStartTime || '',
            target_program_level: lead.intendedProgramLevel || '',
            target_application_field: lead.intendedDirection || '',
            special_wished: [
                'Survey input:',
                lead.intendedStartTime &&
                    `Start Time: ${lead.intendedStartTime}`,
                lead.intendedProgramLevel &&
                    `Program Level: ${lead.intendedProgramLevel}`,
                lead.intendedDirection &&
                    `Direction: ${lead.intendedDirection}`,
                lead.intendedPrograms && `Programs: ${lead.intendedPrograms}`,
                lead.additionalInfo && `Info: ${lead.additionalInfo}`
            ]
                .filter(Boolean)
                .join('\n')
        }
    };
}

function formatDateForInput(date: Date) {
    const pad = (value: number) => String(value).padStart(2, '0');
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function toNonEmptyString(value: unknown) {
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (typeof value === 'number') return String(value);
    return '';
}

function getLeadNameForPrefill(lead: CreateUserFromLeadLead) {
    const direct = [
        toNonEmptyString(lead.fullName),
        toNonEmptyString(lead.name),
        toNonEmptyString(lead.full_name),
        toNonEmptyString(lead.username),
        toNonEmptyString(lead.userName)
    ].find(Boolean);

    if (direct) return direct;

    const first = toNonEmptyString(lead.firstName || lead.first_name);
    const last = toNonEmptyString(lead.lastName || lead.last_name);
    return [first, last].filter(Boolean).join(' ').trim();
}

function getLeadEmailForPrefill(lead: CreateUserFromLeadLead) {
    return (
        [
            toNonEmptyString(lead.email),
            toNonEmptyString(lead.userEmail),
            toNonEmptyString(lead.mail),
            toNonEmptyString(lead.emailAddress),
            toNonEmptyString(lead.email_address)
        ].find(Boolean) || ''
    );
}

/** Lead fields used when creating a user from lead (form prefill + mapLeadToStudentAcademic) */
export interface CreateUserFromLeadLead {
    id?: string;
    leadId?: string;
    fullName?: string;
    name?: string;
    full_name?: string;
    username?: string;
    userName?: string;
    firstName?: string;
    first_name?: string;
    lastName?: string;
    last_name?: string;
    email?: string;
    userEmail?: string;
    mail?: string;
    emailAddress?: string;
    email_address?: string;
    bachelorGPA?: string | number;
    masterGPA?: string | number;
    highschoolName?: string;
    masterSchool?: string;
    bachelorSchool?: string;
    bachelorProgramName?: string;
    masterProgramName?: string;
    currentYearOrGraduated?: string;
    highestEducation?: string;
    workExperience?: string;
    otherActivities?: string;
    englishLevel?: string;
    germanLevel?: string;
    intendedStartTime?: string;
    intendedProgramLevel?: string;
    intendedDirection?: string;
    intendedPrograms?: string;
    additionalInfo?: string;
    salesRep?: {
        userId?: string;
        label?: string;
    };
    deals?: Record<string, unknown>[];
}

export interface CreateUserFromLeadModalProps {
    open: boolean;
    onClose: () => void;
    lead: CreateUserFromLeadLead;
    onSuccess?: (userData?: Record<string, string>) => void;
}
const CreateUserFromLeadModal = ({
    open,
    onClose,
    lead,
    onSuccess
}: CreateUserFromLeadModalProps) => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const leadId = lead?.id || lead?.leadId || '';

    const existingOpenDeal =
        (Array.isArray(lead?.deals)
            ? (lead.deals as Record<string, unknown>[])
            : []
        ).find((deal) => !isTerminalStatus(String(deal?.status || ''))) || null;
    const existingOpenDealId = getDealId(existingOpenDeal);
    const hasExistingOpenDeal = Boolean(existingOpenDealId);

    const existingSalesRep =
        (existingOpenDeal?.salesRep as Record<string, unknown> | undefined) ||
        undefined;
    const existingSalesUserId =
        typeof existingOpenDeal?.salesUserId === 'string'
            ? existingOpenDeal.salesUserId
            : typeof existingSalesRep?.userId === 'string'
              ? existingSalesRep.userId
              : '';
    const existingSalesLabel =
        typeof existingSalesRep?.label === 'string'
            ? existingSalesRep.label
            : '';
    const existingDealSizeNtd =
        existingOpenDeal?.dealSizeNtd == null
            ? ''
            : String(existingOpenDeal.dealSizeNtd);
    const existingDealNote =
        typeof existingOpenDeal?.note === 'string' ? existingOpenDeal.note : '';

    const defaultSalesUserId =
        existingSalesUserId || lead?.salesRep?.userId || '';

    const { data: salesData } = useQuery({
        queryKey: ['crm/sales-reps'],
        enabled: open,
        queryFn: async () => {
            const res = await getCRMSalesReps();
            const body = res?.data as { data?: Record<string, string>[] };
            return body?.data ?? [];
        }
    });
    const salesOptions = (Array.isArray(salesData) ? salesData : []).map(
        (s: Record<string, string>) => ({
            userId: s.userId || s.value,
            label:
                s.label ||
                s.name ||
                s.fullName ||
                t('common.unknown', { ns: 'crm' })
        })
    );

    // Initialize form with TanStack Form
    const form = useForm({
        defaultValues: {
            firstname: '',
            lastname: '',
            firstname_chinese: '',
            lastname_chinese: '',
            email: '',
            applying_program_count: '1',
            dealSalesUserId: defaultSalesUserId,
            dealSizeNtd: '',
            dealNote: '',
            dealClosedAt: formatDateForInput(new Date()),
            dealStatus: 'closed'
        },
        onSubmit: async ({ value }) => {
            // Basic validation
            if (!value.firstname || !value.lastname || !value.email) {
                setError(t('users.errors.requiredFields', { ns: 'crm' }));
                return;
            }

            if (!value.dealSizeNtd || Number(value.dealSizeNtd) <= 0) {
                if (!hasExistingOpenDeal) {
                    setError(t('deals.mustBePositive', { ns: 'crm' }));
                    return;
                }
            }

            if (!leadId) {
                setError(t('common.leadNotFound', { ns: 'crm' }));
                return;
            }

            if (!value.dealSalesUserId) {
                if (!hasExistingOpenDeal) {
                    setError(t('deals.salesRepIsRequired', { ns: 'crm' }));
                    return;
                }
            }

            if (value.dealStatus === 'closed' && !value.dealClosedAt) {
                setError(t('deals.closedAtRequired', { ns: 'crm' }));
                return;
            }

            setLoading(true);
            setError('');

            try {
                // Trim email to remove any spaces
                const {
                    dealSizeNtd,
                    dealNote,
                    dealClosedAt,
                    dealSalesUserId,
                    dealStatus,
                    ...userValue
                } = value;
                const userInformation = {
                    ...userValue,
                    email: userValue.email.trim(),
                    role: 'Student',
                    ...mapLeadToStudentAcademic(lead)
                };

                const response = await addUser(userInformation);
                const responseData =
                    (response?.data as Record<string, unknown>) || {};

                if (responseData.success) {
                    try {
                        if (hasExistingOpenDeal && existingOpenDealId) {
                            await updateCRMDeal(String(existingOpenDealId), {
                                leadId,
                                salesUserId: dealSalesUserId || undefined,
                                dealSizeNtd: dealSizeNtd
                                    ? Number(dealSizeNtd)
                                    : undefined,
                                status: 'closed',
                                note: dealNote || undefined,
                                closedAt: dealClosedAt
                                    ? new Date(dealClosedAt).toISOString()
                                    : undefined
                            });
                        } else {
                            await createCRMDeal({
                                leadId,
                                salesUserId: dealSalesUserId,
                                dealSizeNtd: Number(dealSizeNtd),
                                status: dealStatus,
                                note: dealNote || undefined,
                                closedAt:
                                    dealStatus === 'closed' && dealClosedAt
                                        ? new Date(dealClosedAt).toISOString()
                                        : undefined
                            });
                        }
                    } catch (dealError) {
                        // User was created successfully, but deal creation failed.
                        // Show a deal-specific error and avoid treating this as a user-creation failure.

                        console.error(dealError);
                        setError(t('deals.errors.failedCreate', { ns: 'crm' }));
                        return;
                    }

                    if (onSuccess) {
                        onSuccess(responseData as Record<string, string>);
                    }
                    handleClose();
                } else {
                    setError(
                        (responseData.message as string | undefined) ||
                            t('users.errors.failedCreate', { ns: 'crm' })
                    );
                }
            } catch (err) {
                console.error('Error creating user:', err);
                const error = err as {
                    response?: { data?: { message?: string } };
                };
                setError(
                    error.response?.data?.message ||
                        t('users.errors.failedCreateDetailed', { ns: 'crm' })
                );
            } finally {
                setLoading(false);
            }
        }
    });

    // Pre-populate form data when lead changes
    useEffect(() => {
        if (lead && open) {
            const prefillName = getLeadNameForPrefill(lead);
            const prefillEmail = getLeadEmailForPrefill(lead);
            const nameParts = (prefillName.trim() || '')
                .split(/[\s,]+/)
                .filter((part) => part.length > 0);
            const newData = {
                firstname: nameParts[0] || '',
                lastname: nameParts.slice(1).join(' ') || '',
                firstname_chinese: nameParts[0] || '',
                lastname_chinese: nameParts.slice(1).join(' ') || '',
                email: prefillEmail,
                applying_program_count: '1',
                dealSalesUserId: defaultSalesUserId,
                dealSizeNtd: hasExistingOpenDeal ? existingDealSizeNtd : '',
                dealNote: hasExistingOpenDeal ? existingDealNote : '',
                dealClosedAt: formatDateForInput(new Date()),
                dealStatus: 'closed'
            };

            // Reset form with new data
            form.reset(newData);
            // Explicitly set critical fields to ensure prefill is reflected
            // even if form state was already initialized in a previous open cycle.
            form.setFieldValue('firstname', newData.firstname);
            form.setFieldValue('lastname', newData.lastname);
            form.setFieldValue('email', newData.email);
            setError('');
        }
    }, [
        lead,
        open,
        form,
        defaultSalesUserId,
        hasExistingOpenDeal,
        existingDealSizeNtd,
        existingDealNote
    ]);

    const handleClose = () => {
        setError('');
        setLoading(false);
        // Delay onClose until after the dialog is closed to avoid aria-hidden focus issues
        setTimeout(() => {
            onClose();
        }, 0);
    };

    return (
        <Dialog fullWidth maxWidth="sm" onClose={handleClose} open={open}>
            <DialogTitle>
                {t('actions.createUserAccountFromLead', { ns: 'crm' })}
            </DialogTitle>

            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    form.handleSubmit();
                }}
            >
                <DialogContent>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                        <form.Field
                            name="firstname"
                            validators={{
                                onChange: ({ value }) =>
                                    !value
                                        ? t('users.errors.firstnameRequired', {
                                              ns: 'crm'
                                          })
                                        : undefined
                            }}
                        >
                            {(field) => (
                                <TextField
                                    disabled={loading}
                                    error={!!field.state.meta.errors.length}
                                    fullWidth
                                    helperText={field.state.meta.errors.join(
                                        ', '
                                    )}
                                    label={t('users.firstNameEn', {
                                        ns: 'crm'
                                    })}
                                    name={field.name}
                                    onBlur={field.handleBlur}
                                    onChange={(e) =>
                                        field.handleChange(e.target.value)
                                    }
                                    placeholder={t(
                                        'users.placeholders.firstName',
                                        { ns: 'crm' }
                                    )}
                                    required
                                    value={field.state.value}
                                />
                            )}
                        </form.Field>
                        <form.Field
                            name="lastname"
                            validators={{
                                onChange: ({ value }) =>
                                    !value
                                        ? t('users.errors.lastnameRequired', {
                                              ns: 'crm'
                                          })
                                        : undefined
                            }}
                        >
                            {(field) => (
                                <TextField
                                    disabled={loading}
                                    error={!!field.state.meta.errors.length}
                                    fullWidth
                                    helperText={field.state.meta.errors.join(
                                        ', '
                                    )}
                                    label={t('users.lastNameEn', { ns: 'crm' })}
                                    name={field.name}
                                    onBlur={field.handleBlur}
                                    onChange={(e) =>
                                        field.handleChange(e.target.value)
                                    }
                                    placeholder={t(
                                        'users.placeholders.lastName',
                                        { ns: 'crm' }
                                    )}
                                    required
                                    value={field.state.value}
                                />
                            )}
                        </form.Field>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                        <form.Field name="firstname_chinese">
                            {(field) => (
                                <TextField
                                    disabled={loading}
                                    fullWidth
                                    label={t('users.firstNameZh', {
                                        ns: 'crm'
                                    })}
                                    name={field.name}
                                    onBlur={field.handleBlur}
                                    onChange={(e) =>
                                        field.handleChange(e.target.value)
                                    }
                                    placeholder={t(
                                        'users.placeholders.firstNameZh',
                                        { ns: 'crm' }
                                    )}
                                    value={field.state.value}
                                />
                            )}
                        </form.Field>
                        <form.Field name="lastname_chinese">
                            {(field) => (
                                <TextField
                                    disabled={loading}
                                    fullWidth
                                    label={t('users.lastNameZh', { ns: 'crm' })}
                                    name={field.name}
                                    onBlur={field.handleBlur}
                                    onChange={(e) =>
                                        field.handleChange(e.target.value)
                                    }
                                    placeholder={t(
                                        'users.placeholders.lastNameZh',
                                        { ns: 'crm' }
                                    )}
                                    value={field.state.value}
                                />
                            )}
                        </form.Field>
                    </Box>

                    <form.Field
                        name="email"
                        validators={{
                            onChange: ({ value }) => {
                                if (!value)
                                    return t('users.errors.emailRequired', {
                                        ns: 'crm'
                                    });
                                if (!/^\S+@\S+\.\S+$/.test(value))
                                    return t('users.errors.emailInvalid', {
                                        ns: 'crm'
                                    });
                                return undefined;
                            }
                        }}
                    >
                        {(field) => (
                            <TextField
                                disabled={loading}
                                error={!!field.state.meta.errors.length}
                                fullWidth
                                helperText={field.state.meta.errors.join(', ')}
                                label={t('users.email', { ns: 'crm' })}
                                name={field.name}
                                onBlur={field.handleBlur}
                                onChange={(e) =>
                                    field.handleChange(e.target.value)
                                }
                                placeholder={t('users.placeholders.email', {
                                    ns: 'crm'
                                })}
                                required
                                sx={{ mb: 2 }}
                                type="email"
                                value={field.state.value}
                            />
                        )}
                    </form.Field>

                    <form.Field name="applying_program_count">
                        {(field) => (
                            <FormControl fullWidth sx={{ mb: 2 }}>
                                <InputLabel id="application-count-label">
                                    {t('users.applicationCount', { ns: 'crm' })}
                                </InputLabel>
                                <Select
                                    disabled={loading}
                                    label={t('users.applicationCount', {
                                        ns: 'crm'
                                    })}
                                    labelId="application-count-label"
                                    name={field.name}
                                    onBlur={field.handleBlur}
                                    onChange={(e) =>
                                        field.handleChange(e.target.value)
                                    }
                                    value={field.state.value}
                                >
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(
                                        (num) => (
                                            <MenuItem
                                                key={num}
                                                value={num.toString()}
                                            >
                                                {num}
                                            </MenuItem>
                                        )
                                    )}
                                </Select>
                            </FormControl>
                        )}
                    </form.Field>

                    <Divider sx={{ mb: 2, mt: 1 }} />

                    <Typography sx={{ mb: 1 }} variant="subtitle2">
                        {hasExistingOpenDeal
                            ? t('deals.closeExistingDeal', {
                                  ns: 'crm',
                                  defaultValue: 'Close existing deal'
                              })
                            : t('deals.createDeal', {
                                  ns: 'crm',
                                  defaultValue: 'Create deal'
                              })}
                    </Typography>

                    {hasExistingOpenDeal ? (
                        <TextField
                            disabled
                            fullWidth
                            label={t('deals.salesRep', {
                                ns: 'crm',
                                defaultValue: 'Sales Representative'
                            })}
                            sx={{ mb: 2 }}
                            value={
                                existingSalesLabel ||
                                salesOptions.find(
                                    (s) => s.userId === existingSalesUserId
                                )?.label ||
                                existingSalesUserId ||
                                t('common.unknown', { ns: 'crm' })
                            }
                        />
                    ) : (
                        <form.Field
                            name="dealSalesUserId"
                            validators={{
                                onChange: ({ value }) =>
                                    !value
                                        ? t('deals.salesRepIsRequired', {
                                              ns: 'crm'
                                          })
                                        : undefined
                            }}
                        >
                            {(field) => (
                                <FormControl
                                    error={!!field.state.meta.errors.length}
                                    fullWidth
                                    sx={{ mb: 2 }}
                                >
                                    <InputLabel id="deal-sales-rep-label">
                                        {t('deals.salesRep', {
                                            ns: 'crm',
                                            defaultValue: 'Sales Representative'
                                        })}
                                    </InputLabel>
                                    <Select
                                        disabled={loading}
                                        label={t('deals.salesRep', {
                                            ns: 'crm',
                                            defaultValue: 'Sales Representative'
                                        })}
                                        labelId="deal-sales-rep-label"
                                        name={field.name}
                                        onBlur={field.handleBlur}
                                        onChange={(e) =>
                                            field.handleChange(e.target.value)
                                        }
                                        value={field.state.value}
                                    >
                                        <MenuItem value="">
                                            {t('common.select', {
                                                ns: 'crm',
                                                defaultValue: 'Select'
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
                                    {!!field.state.meta.errors.length && (
                                        <Typography
                                            color="error"
                                            variant="caption"
                                        >
                                            {field.state.meta.errors.join(', ')}
                                        </Typography>
                                    )}
                                </FormControl>
                            )}
                        </form.Field>
                    )}

                    <form.Field
                        name="dealSizeNtd"
                        validators={{
                            onChange: ({ value }) =>
                                !value || Number(value) <= 0
                                    ? t('deals.mustBePositive', { ns: 'crm' })
                                    : undefined
                        }}
                    >
                        {(field) => (
                            <TextField
                                disabled={loading || hasExistingOpenDeal}
                                error={!!field.state.meta.errors.length}
                                fullWidth
                                helperText={field.state.meta.errors.join(', ')}
                                label={t('deals.dealSizeNtd', { ns: 'crm' })}
                                name={field.name}
                                onBlur={field.handleBlur}
                                onChange={(e) =>
                                    field.handleChange(e.target.value)
                                }
                                placeholder={t('deals.placeholderDealSize', {
                                    ns: 'crm'
                                })}
                                required
                                sx={{ mb: 2 }}
                                type="number"
                                value={field.state.value}
                            />
                        )}
                    </form.Field>

                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel shrink>
                            {t('deals.status', { ns: 'crm' })}
                        </InputLabel>
                        <Select
                            disabled
                            label={t('deals.status', { ns: 'crm' })}
                            value="closed"
                        >
                            <MenuItem value="closed">
                                {t('deals.statusLabels.closed', { ns: 'crm' })}
                            </MenuItem>
                        </Select>
                    </FormControl>

                    <form.Field name="dealNote">
                        {(field) => (
                            <TextField
                                disabled={loading || hasExistingOpenDeal}
                                fullWidth
                                label={t('deals.note', { ns: 'crm' })}
                                minRows={2}
                                multiline
                                name={field.name}
                                onBlur={field.handleBlur}
                                onChange={(e) =>
                                    field.handleChange(e.target.value)
                                }
                                sx={{ mb: 2 }}
                                value={field.state.value}
                            />
                        )}
                    </form.Field>

                    <form.Field name="dealClosedAt">
                        {(field) => (
                            <TextField
                                disabled={loading}
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                label={t('deals.closedAt', {
                                    ns: 'crm',
                                    defaultValue: 'Closed at'
                                })}
                                name={field.name}
                                onBlur={field.handleBlur}
                                onChange={(e) =>
                                    field.handleChange(e.target.value)
                                }
                                sx={{ mb: 1 }}
                                type="datetime-local"
                                value={field.state.value}
                            />
                        )}
                    </form.Field>
                </DialogContent>

                <DialogActions>
                    <Button
                        color="secondary"
                        disabled={loading}
                        onClick={handleClose}
                    >
                        {t('actions.cancel', { ns: 'crm' })}
                    </Button>
                    <form.Subscribe
                        selector={(state) => [
                            state.values.firstname,
                            state.values.lastname,
                            state.values.email
                        ]}
                    >
                        {([firstname, lastname, email]) => (
                            <Button
                                disabled={
                                    !firstname || !lastname || !email || loading
                                }
                                startIcon={
                                    loading && <CircularProgress size={20} />
                                }
                                type="submit"
                                variant="contained"
                            >
                                {loading
                                    ? t('Creating...')
                                    : t('actions.createUserAccount', {
                                          ns: 'crm'
                                      })}
                            </Button>
                        )}
                    </form.Subscribe>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default CreateUserFromLeadModal;
