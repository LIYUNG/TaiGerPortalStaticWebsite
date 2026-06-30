import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Alert,
    Box,
    Button,
    Card,
    CircularProgress,
    Stack,
    TextField,
    Typography
} from '@mui/material';

import { updateCvAdditionalInformation } from '@/api';

interface AdditionalInformationCardProps {
    threadId: string;
    initialValue?: string;
}

const NS = 'cvmlrl';

// Thread-scoped free-text context for the CV (e.g. "what to emphasise on this
// CV"). Editable by BOTH the student and the editor; persisted on the thread.
// This is data input only — it does not generate anything.
const AdditionalInformationCard = ({
    threadId,
    initialValue = ''
}: AdditionalInformationCardProps) => {
    const { t } = useTranslation();
    const ta = (k: string) => t(`additionalInfo.${k}`, { ns: NS });

    const [value, setValue] = useState(initialValue);
    const [saving, setSaving] = useState(false);
    const [savedAt, setSavedAt] = useState<Date | null>(null);
    const [error, setError] = useState<string | null>(null);

    const dirty = value !== initialValue;

    const onSave = async () => {
        setSaving(true);
        setError(null);
        try {
            const resp = await updateCvAdditionalInformation(threadId, value);
            if (resp?.success) {
                setSavedAt(new Date());
            } else {
                setError(ta('saveFailed'));
            }
        } catch (e) {
            setError(e instanceof Error ? e.message : ta('saveFailed'));
        } finally {
            setSaving(false);
        }
    };

    return (
        <Card variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6">{ta('title')}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                {ta('subtitle')}
            </Typography>

            <TextField
                fullWidth
                multiline
                minRows={4}
                size="small"
                placeholder={ta('placeholder')}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                disabled={saving}
            />

            <Stack
                direction="row"
                alignItems="center"
                spacing={2}
                sx={{ mt: 1.5 }}
            >
                <Button
                    variant="contained"
                    onClick={onSave}
                    disabled={saving || !dirty}
                    startIcon={
                        saving ? (
                            <CircularProgress size={16} color="inherit" />
                        ) : undefined
                    }
                >
                    {ta('save')}
                </Button>
                {savedAt && !dirty ? (
                    <Typography variant="caption" color="text.secondary">
                        {ta('saved')} {savedAt.toLocaleTimeString()}
                    </Typography>
                ) : null}
            </Stack>

            {error ? (
                <Box sx={{ mt: 1.5 }}>
                    <Alert severity="error">{error}</Alert>
                </Box>
            ) : null}
        </Card>
    );
};

export default AdditionalInformationCard;
