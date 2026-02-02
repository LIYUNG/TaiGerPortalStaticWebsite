import React from 'react';
import { Box, Stack, Typography, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { LinkableNewlineText } from '../../../Utils/checking-functions';
import { getRequirement } from '../../../Utils/util_functions';

const RequirementsBlock = ({ thread, isGeneralRL }) => {
    const theme = useTheme();
    const { t } = useTranslation();

    if (thread.program_id) {
        return (
            <Box
                sx={{
                    '& a': {
                        color: theme.palette.primary.main,
                        fontWeight: 500
                    }
                }}
            >
                <LinkableNewlineText text={getRequirement(thread)} />
            </Box>
        );
    }

    if (thread.file_type === 'CV' || thread.file_type === 'CV_US') {
        return (
            <Stack spacing={1.5}>
                <Box
                    sx={{
                        p: 1.5,
                        bgcolor: theme.palette.warning.lighter || 'warning.50',
                        borderLeft: `3px solid ${theme.palette.warning.main}`
                    }}
                >
                    <Typography variant="body2">
                        {t('cv-requirements-1', { ns: 'cvmlrl' })}
                        {` `}
                        <b>{t('cv-requirements-1.1', { ns: 'cvmlrl' })}</b>
                    </Typography>
                </Box>

                <Box
                    sx={{
                        p: 1.5,
                        bgcolor: theme.palette.info.lighter || 'info.50',
                        borderLeft: `3px solid ${theme.palette.warning.main}`
                    }}
                >
                    <Typography variant="body2">
                        {t('cv-requirements-2', { ns: 'cvmlrl' })}
                    </Typography>
                    <Typography variant="body2">
                        {t('cv-reminder-1', { ns: 'cvmlrl' })}
                    </Typography>
                </Box>
                <Box
                    sx={{
                        p: 1.5,
                        bgcolor: theme.palette.info.lighter || 'info.50',
                        borderRadius: 1
                    }}
                >
                    <Typography variant="body2">
                        {t('cv-reminder-2', { ns: 'cvmlrl' })}
                    </Typography>
                </Box>
            </Stack>
        );
    }

    if (isGeneralRL) {
        return (
            <Box
                sx={{
                    p: 1.5,
                    bgcolor: theme.palette.warning.lighter || 'warning.50',
                    borderRadius: 1,
                    borderLeft: `3px solid ${theme.palette.warning.main}`
                }}
            >
                <Typography variant="body2">
                    {t('rl-requirements-1', { ns: 'cvmlrl' })}
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ textAlign: 'center', py: 2 }}>
            <Typography color="text.secondary" variant="body2">
                {t('No', { ns: 'common' })}
            </Typography>
        </Box>
    );
};

export default RequirementsBlock;
