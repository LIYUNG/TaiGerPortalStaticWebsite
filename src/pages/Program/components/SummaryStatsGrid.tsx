import React from 'react';
import {
    Box,
    Card,
    CardContent,
    Grid,
    Typography
} from '@mui/material';
import {
    TrendingUp,
    School,
    Public,
    Assessment
} from '@mui/icons-material';

interface SummaryStatsGridProps {
    totalPrograms: number;
    totalCountries: number;
    totalSchools: number;
    avgAdmissionRate: number | string;
    t: (key: string, opts?: Record<string, unknown>) => string;
}

const SummaryStatsGrid = ({
    totalPrograms,
    totalCountries,
    totalSchools,
    avgAdmissionRate,
    t
}: SummaryStatsGridProps) => {
    return (
        <Grid container mb={4} spacing={3}>
            {/* Total Programs */}
            <Grid item md={3} sm={6} xs={12}>
                <Card
                    sx={{
                        height: '100%',
                        bgcolor: 'primary.light',
                        color: 'primary.contrastText'
                    }}
                >
                    <CardContent>
                        <Box
                            alignItems="flex-start"
                            display="flex"
                            justifyContent="space-between"
                        >
                            <Box>
                                <Typography
                                    gutterBottom
                                    sx={{ opacity: 0.9 }}
                                    variant="body2"
                                >
                                    {t('Total Programs', { ns: 'common' })}
                                </Typography>
                                <Typography fontWeight="bold" variant="h3">
                                    {totalPrograms.toLocaleString()}
                                </Typography>
                            </Box>
                            <TrendingUp
                                sx={{ fontSize: 40, opacity: 0.7 }}
                            />
                        </Box>
                    </CardContent>
                </Card>
            </Grid>

            {/* Countries */}
            <Grid item md={3} sm={6} xs={12}>
                <Card
                    sx={{
                        height: '100%',
                        bgcolor: 'success.light',
                        color: 'success.contrastText'
                    }}
                >
                    <CardContent>
                        <Box
                            alignItems="flex-start"
                            display="flex"
                            justifyContent="space-between"
                        >
                            <Box>
                                <Typography
                                    gutterBottom
                                    sx={{ opacity: 0.9 }}
                                    variant="body2"
                                >
                                    {t('Countries', { ns: 'common' })}
                                </Typography>
                                <Typography fontWeight="bold" variant="h3">
                                    {totalCountries}
                                </Typography>
                            </Box>
                            <Public sx={{ fontSize: 40, opacity: 0.7 }} />
                        </Box>
                    </CardContent>
                </Card>
            </Grid>

            {/* Schools */}
            <Grid item md={3} sm={6} xs={12}>
                <Card
                    sx={{
                        height: '100%',
                        bgcolor: 'secondary.light',
                        color: 'secondary.contrastText'
                    }}
                >
                    <CardContent>
                        <Box
                            alignItems="flex-start"
                            display="flex"
                            justifyContent="space-between"
                        >
                            <Box>
                                <Typography
                                    gutterBottom
                                    sx={{ opacity: 0.9 }}
                                    variant="body2"
                                >
                                    {t('Total Universities', {
                                        ns: 'common'
                                    })}
                                </Typography>
                                <Typography fontWeight="bold" variant="h3">
                                    {totalSchools}
                                </Typography>
                            </Box>
                            <School sx={{ fontSize: 40, opacity: 0.7 }} />
                        </Box>
                    </CardContent>
                </Card>
            </Grid>

            {/* Avg Admission Rate */}
            <Grid item md={3} sm={6} xs={12}>
                <Card
                    sx={{
                        height: '100%',
                        bgcolor: 'info.light',
                        color: 'info.contrastText'
                    }}
                >
                    <CardContent>
                        <Box
                            alignItems="flex-start"
                            display="flex"
                            justifyContent="space-between"
                        >
                            <Box>
                                <Typography
                                    gutterBottom
                                    sx={{ opacity: 0.9 }}
                                    variant="body2"
                                >
                                    {t('Avg Admission Rate', {
                                        ns: 'common'
                                    })}
                                </Typography>
                                <Typography fontWeight="bold" variant="h3">
                                    {avgAdmissionRate}%
                                </Typography>
                            </Box>
                            <Assessment
                                sx={{ fontSize: 40, opacity: 0.7 }}
                            />
                        </Box>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );
};

export default SummaryStatsGrid;
