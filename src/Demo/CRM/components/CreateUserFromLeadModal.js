import React, { useState, useEffect } from 'react';
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

const CreateUserFromLeadModal = ({ open, onClose, lead, onSuccess }) => {
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
                setError('Please fill in all required fields');
                return;
            }

            setLoading(true);
            setError('');

            try {
                // Trim email to remove any spaces
                const userInformation = {
                    ...value,
                    email: value.email.trim()
                };

                const response = await addUser(userInformation);

                if (response.data.success) {
                    onSuccess && onSuccess(response.data);
                    handleClose();
                } else {
                    setError(response.data.message || 'Failed to create user');
                }
            } catch (err) {
                console.error('Error creating user:', err);
                setError(
                    err.response?.data?.message ||
                        'Failed to create user. Please try again.'
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
        form.reset({
            firstname: '',
            lastname: '',
            firstname_chinese: '',
            lastname_chinese: '',
            email: '',
            applying_program_count: '1'
        });
        setError('');
        setLoading(false);
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>{t('Create User Account from Lead')}</DialogTitle>

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
                                        ? 'First name is required'
                                        : undefined
                            }}
                        >
                            {(field) => (
                                <TextField
                                    fullWidth
                                    required
                                    label={t('First Name (English)')}
                                    name={field.name}
                                    value={field.state.value}
                                    onChange={(e) =>
                                        field.handleChange(e.target.value)
                                    }
                                    onBlur={field.handleBlur}
                                    placeholder="John"
                                    disabled={loading}
                                    error={!!field.state.meta.errors.length}
                                    helperText={field.state.meta.errors.join(
                                        ', '
                                    )}
                                />
                            )}
                        </form.Field>
                        <form.Field
                            name="lastname"
                            validators={{
                                onChange: ({ value }) =>
                                    !value ? 'Last name is required' : undefined
                            }}
                        >
                            {(field) => (
                                <TextField
                                    fullWidth
                                    required
                                    label={t('Last Name (English)')}
                                    name={field.name}
                                    value={field.state.value}
                                    onChange={(e) =>
                                        field.handleChange(e.target.value)
                                    }
                                    onBlur={field.handleBlur}
                                    placeholder="Doe"
                                    disabled={loading}
                                    error={!!field.state.meta.errors.length}
                                    helperText={field.state.meta.errors.join(
                                        ', '
                                    )}
                                />
                            )}
                        </form.Field>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                        <form.Field name="firstname_chinese">
                            {(field) => (
                                <TextField
                                    fullWidth
                                    label={t('名 (中文)')}
                                    name={field.name}
                                    value={field.state.value}
                                    onChange={(e) =>
                                        field.handleChange(e.target.value)
                                    }
                                    onBlur={field.handleBlur}
                                    placeholder="小明"
                                    disabled={loading}
                                />
                            )}
                        </form.Field>
                        <form.Field name="lastname_chinese">
                            {(field) => (
                                <TextField
                                    fullWidth
                                    label={t('姓 (中文)')}
                                    name={field.name}
                                    value={field.state.value}
                                    onChange={(e) =>
                                        field.handleChange(e.target.value)
                                    }
                                    onBlur={field.handleBlur}
                                    placeholder="陳"
                                    disabled={loading}
                                />
                            )}
                        </form.Field>
                    </Box>

                    <form.Field
                        name="email"
                        validators={{
                            onChange: ({ value }) => {
                                if (!value) return 'Email is required';
                                if (!/^\S+@\S+\.\S+$/.test(value))
                                    return 'Invalid email format';
                                return undefined;
                            }
                        }}
                    >
                        {(field) => (
                            <TextField
                                fullWidth
                                required
                                type="email"
                                label={t('Email Address')}
                                name={field.name}
                                value={field.state.value}
                                onChange={(e) =>
                                    field.handleChange(e.target.value)
                                }
                                onBlur={field.handleBlur}
                                placeholder="john.doe@example.com"
                                disabled={loading}
                                sx={{ mb: 2 }}
                                error={!!field.state.meta.errors.length}
                                helperText={field.state.meta.errors.join(', ')}
                            />
                        )}
                    </form.Field>

                    <form.Field name="applying_program_count">
                        {(field) => (
                            <FormControl fullWidth sx={{ mb: 2 }}>
                                <InputLabel id="application-count-label">
                                    {t('Application Count')}
                                </InputLabel>
                                <Select
                                    labelId="application-count-label"
                                    name={field.name}
                                    value={field.state.value}
                                    onChange={(e) =>
                                        field.handleChange(e.target.value)
                                    }
                                    onBlur={field.handleBlur}
                                    label={t('Application Count')}
                                    disabled={loading}
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
                        onClick={handleClose}
                        disabled={loading}
                        color="secondary"
                    >
                        {t('Cancel', { ns: 'common' })}
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
                                type="submit"
                                variant="contained"
                                disabled={
                                    !firstname || !lastname || !email || loading
                                }
                                startIcon={
                                    loading && <CircularProgress size={20} />
                                }
                            >
                                {loading
                                    ? t('Creating...')
                                    : t('Create User Account')}
                            </Button>
                        )}
                    </form.Subscribe>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default CreateUserFromLeadModal;
