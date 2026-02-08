import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    CircularProgress,
    Typography,
    Chip
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useTranslation } from 'react-i18next';

export const MeetingFormModal = ({
    open,
    onClose,
    onSave,
    meeting = null,
    isLoading = false,
    student = null
}) => {
    const { t } = useTranslation();
    const isEdit = !!meeting;

    // Get local browser timezone
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // Format timezone for display (e.g., "America/New_York" -> "EST (UTC-5)")
    const formatTimezoneDisplay = (tz) => {
        try {
            const formatter = new Intl.DateTimeFormat('en-US', {
                timeZone: tz,
                timeZoneName: 'short'
            });
            const parts = formatter.formatToParts(new Date());
            const timeZoneName = parts.find(
                (part) => part.type === 'timeZoneName'
            )?.value;
            return `${tz} (${timeZoneName || tz})`;
        } catch {
            return tz;
        }
    };

    const timezoneDisplay = formatTimezoneDisplay(timezone);

    const [formData, setFormData] = useState({
        title: '',
        dateTime: null,
        location: '',
        description: '',
        notes: ''
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (meeting) {
            // Convert ISO date to datetime-local format (YYYY-MM-DDTHH:mm)
            const dateTimeLocal = meeting.dateTime
                ? new Date(meeting.dateTime).toISOString().slice(0, 16)
                : '';
            setFormData({
                title: meeting.title || '',
                dateTime: dateTimeLocal,
                location: meeting.location || '',
                description: meeting.description || '',
                notes: meeting.notes || ''
            });
        } else {
            setFormData({
                title: '',
                dateTime: '',
                location: '',
                description: '',
                notes: ''
            });
        }
        setErrors({});
    }, [meeting, open]);

    const handleChange = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value
        }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors((prev) => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = t('Title is required', { ns: 'common' });
        }

        if (!formData.dateTime) {
            newErrors.dateTime = t('Date and time is required', {
                ns: 'common'
            });
        } else {
            const selectedDate = new Date(formData.dateTime);
            const now = new Date();
            // Only validate future date for new meetings
            if (!isEdit && selectedDate < now) {
                newErrors.dateTime = t('Meeting date must be in the future', {
                    ns: 'common'
                });
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = () => {
        if (validate()) {
            onSave({
                ...formData,
                dateTime: formData.dateTime
                    ? new Date(formData.dateTime).toISOString()
                    : null
            });
        }
    };

    return (
        <Dialog
            aria-labelledby="meeting-form-dialog-title"
            fullWidth
            maxWidth="sm"
            onClose={onClose}
            open={open}
        >
            <DialogTitle id="meeting-form-dialog-title">
                {isEdit
                    ? t('Edit Meeting', { ns: 'common' })
                    : t('Arrange Meeting', { ns: 'common' })}
            </DialogTitle>
            <DialogContent>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                        pt: 1
                    }}
                >
                    {/* Student Field - Read Only */}
                    {student && !isEdit && (
                        <Box>
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    mb: 1
                                }}
                            >
                                <PersonIcon color="action" fontSize="small" />
                                <Typography
                                    color="text.secondary"
                                    variant="body2"
                                >
                                    {t('Student', { ns: 'common' })}
                                </Typography>
                            </Box>
                            <TextField
                                disabled
                                fullWidth
                                sx={{
                                    '& .MuiInputBase-input': {
                                        bgcolor: 'grey.50'
                                    }
                                }}
                                value={`${student.firstname || ''} ${student.lastname || ''} ${
                                    student.firstname_chinese || ''
                                } ${student.lastname_chinese || ''}`.trim()}
                            />
                        </Box>
                    )}

                    <TextField
                        error={!!errors.title}
                        fullWidth
                        helperText={errors.title}
                        label={t('Title', { ns: 'common' })}
                        onChange={(e) => handleChange('title', e.target.value)}
                        required
                        value={formData.title}
                    />

                    {/* Date & Time with Timezone */}
                    <Box>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                mb: 1
                            }}
                        >
                            <AccessTimeIcon color="action" fontSize="small" />
                            <Typography color="text.secondary" variant="body2">
                                {t('Date & Time', { ns: 'common' })}
                            </Typography>
                            <Chip
                                label={timezoneDisplay}
                                size="small"
                                sx={{ ml: 'auto', height: 20 }}
                            />
                        </Box>
                        <TextField
                            InputLabelProps={{
                                shrink: true
                            }}
                            error={!!errors.dateTime}
                            fullWidth
                            helperText={
                                errors.dateTime ||
                                `${t('Timezone', { ns: 'common' })}: ${timezoneDisplay}`
                            }
                            inputProps={{
                                min: new Date().toISOString().slice(0, 16)
                            }}
                            label={t('Date & Time', { ns: 'common' })}
                            onChange={(e) =>
                                handleChange('dateTime', e.target.value)
                            }
                            required
                            type="datetime-local"
                            value={formData.dateTime}
                        />
                    </Box>
                    <TextField
                        fullWidth
                        label={t('Description', { ns: 'common' })}
                        multiline
                        onChange={(e) =>
                            handleChange('description', e.target.value)
                        }
                        placeholder={t('Meeting description or agenda...', {
                            ns: 'common'
                        })}
                        rows={3}
                        value={formData.description}
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button disabled={isLoading} onClick={onClose}>
                    {t('Cancel', { ns: 'common' })}
                </Button>
                <Button
                    disabled={isLoading}
                    onClick={handleSave}
                    startIcon={isLoading && <CircularProgress size={20} />}
                    variant="contained"
                >
                    {isLoading
                        ? t('Saving...', { ns: 'common' })
                        : t('Save', { ns: 'common' })}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
