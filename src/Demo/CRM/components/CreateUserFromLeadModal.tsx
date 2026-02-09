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
    CircularProgress
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useForm } from '@tanstack/react-form';
import { addUser } from '../../../api';

function parseGPA(value) {
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

/** Lead fields used when creating a user from lead (form prefill + mapLeadToStudentAcademic) */
export interface CreateUserFromLeadLead {
    fullName?: string;
    email?: string;
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
}

export interface CreateUserFromLeadModalProps {
    open: boolean;
    onClose: () => void;
    lead: CreateUserFromLeadLead;
    onSuccess?: () => void;
}
const CreateUserFromLeadModal = ({ open, onClose, lead, onSuccess }: CreateUserFromLeadModalProps) => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Initialize form with TanStack Form
    const form = useForm({
        defaultValues: {
            firstname: '',
            lastname: '',
            firstname_chinese: '',
            lastname_chinese: '',
            email: '',
            applying_program_count: '1'
        },
        onSubmit: async ({ value }) => {
            // Basic validation
            if (!value.firstname || !value.lastname || !value.email) {
                setError(t('users.errors.requiredFields', { ns: 'crm' }));
                return;
            }

            setLoading(true);
            setError('');

            try {
                // Trim email to remove any spaces
                const userInformation = {
                    ...value,
                    email: value.email.trim(),
                    role: 'Student',
                    ...mapLeadToStudentAcademic(lead)
                };

                const response = await addUser(userInformation);

                if (response.data.success) {
                    if (onSuccess) onSuccess(response.data);
                    handleClose();
                } else {
                    setError(
                        response.data.message ||
                            t('users.errors.failedCreate', { ns: 'crm' })
                    );
                }
            } catch (err) {
                console.error('Error creating user:', err);
                setError(
                    err.response?.data?.message ||
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
            const nameParts = (lead.fullName?.trim() || '')
                .split(/[\s,]+/)
                .filter((part) => part.length > 0);
            const newData = {
                firstname: nameParts[0] || '',
                lastname: nameParts.slice(1).join(' ') || '',
                firstname_chinese: nameParts[0] || '',
                lastname_chinese: nameParts.slice(1).join(' ') || '',
                email: lead.email || '',
                applying_program_count: '1'
            };

            // Reset form with new data
            form.reset(newData);
            setError('');
        }
    }, [lead, open, form]);

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
