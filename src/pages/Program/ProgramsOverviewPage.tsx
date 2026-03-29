import { useState, useEffect } from 'react';
import { Link as LinkDom, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Alert,
    Box,
    Breadcrumbs,
    Button,
    Card,
    CardContent,
    Chip,
    Divider,
    Grid,
    IconButton,
    Link,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    Typography
} from '@mui/material';
import { Update, Refresh, Assessment, Info } from '@mui/icons-material';
import { is_TaiGer_role } from '@taiger-common/core';
import type { ProgramsOverviewData } from '@taiger-common/model';

import { TabTitle } from '../Utils/TabTitle';
import DEMO from '@store/constant';
import { useAuth } from '@components/AuthProvider';
import { appConfig } from '../../config';
import { queryClient } from '@/api';
import { useProgramsOverview } from '@hooks/useProgramsOverview';
import Loading from '@components/Loading/Loading';
import ErrorPage from '../Utils/ErrorPage';
import SummaryStatsGrid from './components/SummaryStatsGrid';
import DistributionAnalysisSection from './components/DistributionAnalysisSection';
import TopPerformersSection from './components/TopPerformersSection';
import AdditionalInsightsSection from './components/AdditionalInsightsSection';
import type { IUser } from '@taiger-common/model';

const ProgramsOverviewPage = () => {
    const { user } = useAuth();
    const { t } = useTranslation();
    const [refreshing, setRefreshing] = useState(false);
    const [cooldownSeconds, setCooldownSeconds] = useState(0);
    const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);

    const {
        data: rawOverview,
        isLoading,
        isError,
        error,
        queryKey
    } = useProgramsOverview();
    const overview = rawOverview as ProgramsOverviewData;

    TabTitle(t('Programs Overview', { ns: 'common' }));

    const COOLDOWN_PERIOD = 30; // 30 seconds cooldown

    // Countdown timer effect
    useEffect(() => {
        if (cooldownSeconds > 0) {
            const timer = setTimeout(() => {
                setCooldownSeconds(cooldownSeconds - 1);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [cooldownSeconds]);

    const handleRefresh = async () => {
        if (cooldownSeconds > 0) {
            return; // Still in cooldown
        }

        setRefreshing(true);
        setLastRefreshTime(new Date());
        await queryClient.invalidateQueries({
            queryKey
        });

        // Set cooldown period
        setCooldownSeconds(COOLDOWN_PERIOD);

        setTimeout(() => setRefreshing(false), 1000);
    };

    const getRefreshTooltip = () => {
        if (cooldownSeconds > 0) {
            return t('Please wait {seconds} seconds before refreshing again', {
                ns: 'common',
                seconds: cooldownSeconds
            });
        }
        if (lastRefreshTime) {
            return t('Last refreshed: {time}', {
                ns: 'common',
                time: lastRefreshTime.toLocaleTimeString()
            });
        }
        return t('Refresh data', { ns: 'common' });
    };

    if (!user || !is_TaiGer_role(user as IUser)) {
        return <Navigate to={`${DEMO.DASHBOARD_LINK}`} />;
    }

    if (isLoading) {
        return <Loading />;
    }

    if (isError) {
        return <ErrorPage error={error} />;
    }

    if (!overview) {
        return null;
    }

    // Calculate summary statistics
    const byCountry = overview.byCountry ?? [];
    const topApplicationPrograms = overview.topApplicationPrograms ?? [];
    const totalCountries = byCountry.length;
    const avgAdmissionRate =
        topApplicationPrograms.length > 0
            ? (
                  topApplicationPrograms.reduce(
                      (sum, p) => sum + (p.admissionRate ?? 0),
                      0
                  ) / topApplicationPrograms.length
              ).toFixed(1)
            : 0;

    return (
        <Box sx={{ pb: 4 }}>
            {/* Header */}
            <Breadcrumbs aria-label="breadcrumb">
                <Link
                    color="inherit"
                    component={LinkDom}
                    to={`${DEMO.DASHBOARD_LINK}`}
                    underline="hover"
                >
                    {appConfig.companyName}
                </Link>
                <Link
                    color="inherit"
                    component={LinkDom}
                    to={DEMO.PROGRAMS}
                    underline="hover"
                >
                    {t('Program List', { ns: 'common' })}
                </Link>
                <Typography color="text.primary">
                    {t('Programs Overview', { ns: 'common' })}
                </Typography>
            </Breadcrumbs>

            {/* Title Section */}
            <Box mb={3} mt={3}>
                <Box
                    alignItems="center"
                    display="flex"
                    justifyContent="space-between"
                    mb={2}
                >
                    <Box>
                        <Typography gutterBottom variant="h4">
                            <Assessment
                                sx={{ mr: 1, verticalAlign: 'middle' }}
                            />
                            {t('Programs Overview', { ns: 'common' })}
                        </Typography>
                        <Typography color="textSecondary" variant="body2">
                            {t(
                                'Comprehensive insights into your program catalog',
                                { ns: 'common' }
                            )}
                        </Typography>
                    </Box>
                    <Stack alignItems="center" direction="row" spacing={2}>
                        <Tooltip title={getRefreshTooltip()}>
                            <span>
                                <IconButton
                                    color="primary"
                                    disabled={refreshing || cooldownSeconds > 0}
                                    onClick={handleRefresh}
                                    sx={{ position: 'relative' }}
                                >
                                    <Refresh
                                        className={refreshing ? 'rotating' : ''}
                                    />
                                    {cooldownSeconds > 0 && (
                                        <Chip
                                            color="warning"
                                            label={cooldownSeconds}
                                            size="small"
                                            sx={{
                                                position: 'absolute',
                                                top: -8,
                                                right: -8,
                                                height: 20,
                                                minWidth: 20,
                                                fontSize: '0.7rem'
                                            }}
                                        />
                                    )}
                                </IconButton>
                            </span>
                        </Tooltip>
                        <Button
                            component={LinkDom}
                            to={DEMO.PROGRAMS}
                            variant="outlined"
                        >
                            {t('View All Programs', { ns: 'common' })}
                        </Button>
                    </Stack>
                </Box>

                <Alert icon={<Info />} severity="info">
                    {t('Last updated', { ns: 'common' })}:{' '}
                    {overview.generatedAt
                        ? new Date(overview.generatedAt).toLocaleString()
                        : '—'}
                    {lastRefreshTime && (
                        <>
                            {' • '}
                            {t('Last manual refresh', { ns: 'common' })}:{' '}
                            {lastRefreshTime.toLocaleTimeString()}
                        </>
                    )}
                </Alert>
            </Box>

            <SummaryStatsGrid
                totalPrograms={overview.totalPrograms ?? 0}
                totalCountries={totalCountries}
                totalSchools={overview.totalSchools ?? 0}
                avgAdmissionRate={avgAdmissionRate}
                t={t}
            />

            <DistributionAnalysisSection
                byCountry={(overview.byCountry ?? []).map((item) => ({
                    ...item,
                    count: item.count ?? 0
                }))}
                byDegree={(overview.byDegree ?? []).map((item) => ({
                    ...item,
                    count: item.count ?? 0
                }))}
                byLanguage={(overview.byLanguage ?? []).map((item) => ({
                    ...item,
                    count: item.count ?? 0
                }))}
                totalPrograms={overview.totalPrograms ?? 0}
                t={t}
            />

            <TopPerformersSection
                topSchools={overview.topSchools ?? []}
                topApplicationPrograms={topApplicationPrograms}
                t={t}
            />

            <AdditionalInsightsSection
                bySubject={overview.bySubject}
                bySchoolType={overview.bySchoolType}
                topContributors={overview.topContributors}
                t={t}
            />

            {/* Recent Activity Section */}
            {(overview.recentlyUpdated ?? []).length > 0 && (
                <>
                    <Typography gutterBottom sx={{ mt: 4, mb: 3 }} variant="h5">
                        {t('Recent Activity', { ns: 'common' })}
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Card>
                                <CardContent>
                                    <Box
                                        alignItems="center"
                                        display="flex"
                                        mb={2}
                                    >
                                        <Update sx={{ mr: 1 }} />
                                        <Typography variant="h6">
                                            {t(
                                                'Recently Updated Programs (Last 30 Days)',
                                                { ns: 'common' }
                                            )}
                                        </Typography>
                                    </Box>
                                    <Divider sx={{ mb: 2 }} />
                                    <TableContainer>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>
                                                        {t('School', {
                                                            ns: 'common'
                                                        })}
                                                    </TableCell>
                                                    <TableCell>
                                                        {t('Program Name', {
                                                            ns: 'common'
                                                        })}
                                                    </TableCell>
                                                    <TableCell>
                                                        {t('Degree', {
                                                            ns: 'common'
                                                        })}
                                                    </TableCell>
                                                    <TableCell>
                                                        {t('Semester', {
                                                            ns: 'common'
                                                        })}
                                                    </TableCell>
                                                    <TableCell>
                                                        {t('Updated By', {
                                                            ns: 'common'
                                                        })}
                                                    </TableCell>
                                                    <TableCell>
                                                        {t('Updated At', {
                                                            ns: 'common'
                                                        })}
                                                    </TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {(overview.recentlyUpdated ?? []).map(
                                                    (program) => (
                                                        <TableRow
                                                            key={program._id}
                                                        >
                                                            <TableCell>
                                                                {program.school}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Link
                                                                    component={
                                                                        LinkDom
                                                                    }
                                                                    to={`${DEMO.SINGLE_PROGRAM_LINK(program._id)}`}
                                                                    underline="hover"
                                                                >
                                                                    {
                                                                        program.program_name
                                                                    }
                                                                </Link>
                                                            </TableCell>
                                                            <TableCell>
                                                                {program.degree}
                                                            </TableCell>
                                                            <TableCell>
                                                                {
                                                                    program.semester
                                                                }
                                                            </TableCell>
                                                            <TableCell>
                                                                {
                                                                    program.whoupdated
                                                                }
                                                            </TableCell>
                                                            <TableCell>
                                                                {new Date(
                                                                    program.updatedAt
                                                                ).toLocaleDateString()}
                                                            </TableCell>
                                                        </TableRow>
                                                    )
                                                )}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </>
            )}

            {/* Add some CSS for rotating animation */}
            <style>
                {`
                    @keyframes rotate {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                    .rotating {
                        animation: rotate 1s linear infinite;
                    }
                `}
            </style>
        </Box>
    );
};

export default ProgramsOverviewPage;
