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
        setError('');
        setLoading(false);
        // Delay onClose until after the dialog is closed to avoid aria-hidden focus issues
        setTimeout(() => {
            onClose();
        }, 0);
    };

    return (
        <Dialog fullWidth maxWidth="sm" onClose={handleClose} open={open}>
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
                                    disabled={loading}
                                    error={!!field.state.meta.errors.length}
                                    fullWidth
                                    helperText={field.state.meta.errors.join(
                                        ', '
                                    )}
                                    label={t('First Name (English)')}
                                    name={field.name}
                                    onBlur={field.handleBlur}
                                    onChange={(e) =>
                                        field.handleChange(e.target.value)
                                    }
                                    placeholder="John"
                                    required
                                    value={field.state.value}
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
                                    disabled={loading}
                                    error={!!field.state.meta.errors.length}
                                    fullWidth
                                    helperText={field.state.meta.errors.join(
                                        ', '
                                    )}
                                    label={t('Last Name (English)')}
                                    name={field.name}
                                    onBlur={field.handleBlur}
                                    onChange={(e) =>
                                        field.handleChange(e.target.value)
                                    }
                                    placeholder="Doe"
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
                                    label={t('名 (中文)')}
                                    name={field.name}
                                    onBlur={field.handleBlur}
                                    onChange={(e) =>
                                        field.handleChange(e.target.value)
                                    }
                                    placeholder="小明"
                                    value={field.state.value}
                                />
                            )}
                        </form.Field>
                        <form.Field name="lastname_chinese">
                            {(field) => (
                                <TextField
                                    disabled={loading}
                                    fullWidth
                                    label={t('姓 (中文)')}
                                    name={field.name}
                                    onBlur={field.handleBlur}
                                    onChange={(e) =>
                                        field.handleChange(e.target.value)
                                    }
                                    placeholder="陳"
                                    value={field.state.value}
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
                                disabled={loading}
                                error={!!field.state.meta.errors.length}
                                fullWidth
                                helperText={field.state.meta.errors.join(', ')}
                                label={t('Email Address')}
                                name={field.name}
                                onBlur={field.handleBlur}
                                onChange={(e) =>
                                    field.handleChange(e.target.value)
                                }
                                placeholder="john.doe@example.com"
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
                                    {t('Application Count')}
                                </InputLabel>
                                <Select
                                    disabled={loading}
                                    label={t('Application Count')}
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
