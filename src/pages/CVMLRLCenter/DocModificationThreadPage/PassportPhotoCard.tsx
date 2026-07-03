import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Alert,
    Box,
    Button,
    Card,
    CircularProgress,
    Stack,
    Typography
} from '@mui/material';

import { getCvPassportPhoto, uploadPassportPhoto } from '@/api';

interface PassportPhotoCardProps {
    studentId: string;
    // Called after a successful upload so parents can refresh dependent UI
    // (e.g. the AI Draft coverage "Photo" chip).
    onChange?: () => void;
}

const ACCEPT = 'image/png,image/jpeg,image/jpg,image/gif,image/bmp';

// Shows the student's formal passport photo (profile doc "Passport_Photo") in the
// CV Details tab, and lets an editor upload one when it is missing / replace it.
const PassportPhotoCard = ({ studentId, onChange }: PassportPhotoCardProps) => {
    const { t } = useTranslation();
    const tp = (k: string) => t(`passportPhoto.${k}`, { ns: 'cvmlrl' });
    const [url, setUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);

    const load = async (active = { current: true }) => {
        try {
            const blob = await getCvPassportPhoto(studentId);
            if (!active.current) return;
            setUrl((prev) => {
                if (prev) URL.revokeObjectURL(prev);
                return URL.createObjectURL(blob);
            });
        } catch {
            if (!active.current) return;
            setUrl((prev) => {
                if (prev) URL.revokeObjectURL(prev);
                return null;
            });
        } finally {
            if (active.current) setLoading(false);
        }
    };

    useEffect(() => {
        if (!studentId) {
            setLoading(false);
            return undefined;
        }
        const active = { current: true };
        setLoading(true);
        load(active);
        return () => {
            active.current = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [studentId]);

    // Revoke the last object URL on unmount.
    useEffect(
        () => () => {
            setUrl((prev) => {
                if (prev) URL.revokeObjectURL(prev);
                return null;
            });
        },
        []
    );

    const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;
        setUploading(true);
        setError(null);
        try {
            await uploadPassportPhoto(studentId, file);
            await load();
            onChange?.();
        } catch (err) {
            setError(err instanceof Error ? err.message : tp('uploadFailed'));
        } finally {
            setUploading(false);
        }
    };

    return (
        <Card variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
                {tp('title')}
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
                <Box
                    sx={{
                        width: 96,
                        height: 120,
                        border: '1px dashed',
                        borderColor: 'divider',
                        borderRadius: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        flexShrink: 0,
                        bgcolor: 'action.hover'
                    }}
                >
                    {loading ? (
                        <CircularProgress size={20} />
                    ) : url ? (
                        <Box
                            component="img"
                            src={url}
                            alt={tp('title')}
                            sx={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                            }}
                        />
                    ) : (
                        <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ textAlign: 'center', px: 1 }}
                        >
                            {tp('none')}
                        </Typography>
                    )}
                </Box>
                <Box>
                    <Button
                        variant="outlined"
                        size="small"
                        onClick={() => inputRef.current?.click()}
                        disabled={uploading || !studentId}
                        startIcon={
                            uploading ? (
                                <CircularProgress size={16} color="inherit" />
                            ) : undefined
                        }
                    >
                        {url ? tp('replace') : tp('upload')}
                    </Button>
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: 'block', mt: 0.5 }}
                    >
                        {tp('formats')}
                    </Typography>
                    <input
                        ref={inputRef}
                        type="file"
                        accept={ACCEPT}
                        hidden
                        onChange={onFile}
                    />
                </Box>
            </Stack>
            {error ? (
                <Alert severity="error" sx={{ mt: 1.5 }}>
                    {error}
                </Alert>
            ) : null}
        </Card>
    );
};

export default PassportPhotoCard;
