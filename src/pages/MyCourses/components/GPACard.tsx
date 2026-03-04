import React, { memo } from 'react';
import {
    Box,
    Card,
    CardHeader,
    CardContent,
    Typography,
    Grid,
    Stack
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import type { IStudentResponse } from '@taiger-common/model';

interface GPACardProps {
    student: IStudentResponse;
    myGermanGPA: number | string;
}

const GPACard = memo(({ student, myGermanGPA }: GPACardProps) => {
    const theme = useTheme();
    const university = student?.academic_background?.university || {};

    const getGradeColor = (gpa: number) => {
        if (!gpa) return theme.palette.text.secondary;
        if (gpa <= 1.5) return theme.palette.success.main;
        if (gpa <= 2.5) return theme.palette.info.main;
        if (gpa <= 3.5) return theme.palette.warning.main;
        return theme.palette.error.main;
    };

    const getGradeLabel = (gpa: number) => {
        if (!gpa) return 'N/A';
        if (gpa <= 1.5) return '(Sehr gut)';
        if (gpa <= 2.5) return '(Gut)';
        if (gpa <= 3.5) return '(Befriedigend)';
        return '(Ausreichend)';
    };

    return (
        <Card>
            <CardHeader
                sx={{ pb: 1 }}
                title="GPA Information"
                titleTypography={{ variant: 'h6', fontWeight: 'medium' }}
            />
            <CardContent>
                <Grid container spacing={3}>
                    <Grid item xs={6}>
                        <Box>
                            <Typography
                                color="text.secondary"
                                gutterBottom
                                sx={{ fontSize: '0.875rem', mb: 0.5 }}
                                variant="subtitle2"
                            >
                                My GPA
                            </Typography>
                            <Stack
                                alignItems="baseline"
                                direction="row"
                                spacing={1}
                            >
                                <Typography
                                    sx={{
                                        fontSize: '2rem',
                                        fontWeight: 'medium',
                                        lineHeight: 1
                                    }}
                                    variant="h4"
                                >
                                    {university?.My_GPA_Uni || 'N/A'}
                                </Typography>
                                <Typography
                                    color="text.secondary"
                                    sx={{ fontSize: '0.875rem' }}
                                    variant="body1"
                                >
                                    / {university?.Highest_GPA_Uni || '-'}
                                </Typography>
                            </Stack>
                            <Typography
                                color="text.secondary"
                                sx={{
                                    mt: 0.5,
                                    fontSize: '0.75rem'
                                }}
                                variant="body2"
                            >
                                Passing Grade:{' '}
                                {university?.Passing_GPA_Uni || '-'}
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={6}>
                        <Box>
                            <Typography
                                color="text.secondary"
                                gutterBottom
                                sx={{ fontSize: '0.875rem', mb: 0.5 }}
                                variant="subtitle2"
                            >
                                German GPA Equivalent
                            </Typography>
                            <Stack
                                alignItems="baseline"
                                direction="row"
                                spacing={1}
                            >
                                <Typography
                                    color={getGradeColor(myGermanGPA as number)}
                                    sx={{
                                        fontSize: '2rem',
                                        fontWeight: 'medium',
                                        lineHeight: 1
                                    }}
                                >
                                    {myGermanGPA || 'N/A'}
                                </Typography>
                                <Typography
                                    color="text.secondary"
                                    sx={{ fontSize: '0.875rem' }}
                                    variant="body1"
                                >
                                    {getGradeLabel(myGermanGPA as number)}
                                </Typography>
                            </Stack>
                            <Typography
                                color="text.secondary"
                                sx={{
                                    mt: 0.5,
                                    fontSize: '0.75rem'
                                }}
                                variant="body2"
                            >
                                German Scale: 1.0 (Best) - 4.0 (Passing)
                            </Typography>
                            <Typography
                                color="text.secondary"
                                sx={{
                                    mt: 0.5,
                                    fontSize: '0.75rem'
                                }}
                                variant="body2"
                            >
                                1.0-1.5: Excellent | 1.6-2.5: Good | 2.6-3.5:
                                Satisfactory | 3.6-4.0: Sufficient
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
});
GPACard.displayName = 'GPACard';

export default GPACard;
