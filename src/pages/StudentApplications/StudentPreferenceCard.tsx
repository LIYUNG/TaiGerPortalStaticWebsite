import { useTranslation } from 'react-i18next';
import { Box, List, ListItem, Stack, Typography } from '@mui/material';
import type { IStudentResponse } from '@taiger-common/model';

export const StudentPreferenceCard = ({
    student
}: {
    student: IStudentResponse;
}) => {
    const { t } = useTranslation();

    const preferenceValue = (value?: string | string[] | null) => {
        if (Array.isArray(value)) {
            return value.length > 0 ? value.join(', ') : '-';
        }

        return value && value.trim() ? value : '-';
    };

    return (
        <Box>
            <Typography variant="subtitle1" sx={{ mb: 0.75 }}>
                {t('Application Preference From Survey')}
            </Typography>
            <List
                disablePadding
                sx={{
                    display: 'grid',
                    gap: 0.75
                }}
            >
                <ListItem disableGutters sx={{ display: 'block', py: 0.25 }}>
                    <Stack spacing={0}>
                        <Typography color="text.secondary" variant="overline">
                            {t('Target Application Fields')}
                        </Typography>
                        <Typography fontWeight={600} variant="body2">
                            {preferenceValue(
                                student.application_preference
                                    ?.target_application_field
                            )}
                        </Typography>
                    </Stack>
                </ListItem>
                <ListItem disableGutters sx={{ display: 'block', py: 0.25 }}>
                    <Stack spacing={0}>
                        <Typography color="text.secondary" variant="overline">
                            {t('Target Application Subjects')}
                        </Typography>
                        <Typography fontWeight={600} variant="body2">
                            {preferenceValue(
                                student.application_preference
                                    ?.targetApplicationSubjects
                            )}
                        </Typography>
                    </Stack>
                </ListItem>
                <ListItem disableGutters sx={{ display: 'block', py: 0.25 }}>
                    <Stack spacing={0}>
                        <Typography color="text.secondary" variant="overline">
                            {t('Target Degree Programs')}
                        </Typography>
                        <Typography fontWeight={600} variant="body2">
                            {preferenceValue(
                                student.application_preference?.target_degree
                            )}
                        </Typography>
                    </Stack>
                </ListItem>
                <ListItem disableGutters sx={{ display: 'block', py: 0.25 }}>
                    <Stack spacing={0}>
                        <Typography color="text.secondary" variant="overline">
                            {t('Target Program Language')}
                        </Typography>
                        <Typography fontWeight={600} variant="body2">
                            {preferenceValue(
                                student.application_preference
                                    ?.target_program_language
                            )}
                        </Typography>
                    </Stack>
                </ListItem>
                <ListItem disableGutters sx={{ display: 'block', py: 0.25 }}>
                    <Stack spacing={0}>
                        <Typography color="text.secondary" variant="overline">
                            {t(
                                'Considering private universities? (Tuition Fee: ~15000 EURO/year)'
                            )}
                        </Typography>
                        <Typography fontWeight={600} variant="body2">
                            {preferenceValue(
                                student.application_preference
                                    ?.considered_privat_universities
                            )}
                        </Typography>
                    </Stack>
                </ListItem>
                <ListItem disableGutters sx={{ display: 'block', py: 0.25 }}>
                    <Stack spacing={0}>
                        <Typography color="text.secondary" variant="overline">
                            {t('Considering universities outside Germany?')}
                        </Typography>
                        <Typography fontWeight={600} variant="body2">
                            {preferenceValue(
                                student.application_preference
                                    ?.application_outside_germany
                            )}
                        </Typography>
                    </Stack>
                </ListItem>
                <ListItem disableGutters sx={{ display: 'block', py: 0.25 }}>
                    <Stack spacing={0.5}>
                        <Typography color="text.secondary" variant="overline">
                            {t('Other wish', { ns: 'survey' })}
                        </Typography>
                        <Box
                            sx={{
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: 2,
                                bgcolor: 'background.default',
                                px: 1,
                                py: 0.75,
                                whiteSpace: 'pre-wrap',
                                lineHeight: 1.5,
                                maxHeight: 96,
                                overflowY: 'auto'
                            }}
                        >
                            <Typography variant="body2" sx={{ fontSize: 13 }}>
                                {student.application_preference?.special_wished?.trim() ||
                                    '-'}
                            </Typography>
                        </Box>
                    </Stack>
                </ListItem>
            </List>
        </Box>
    );
};
