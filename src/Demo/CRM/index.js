import { Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
    Breadcrumbs,
    Link,
    Typography,
    Grid,
    Box,
    Card,
    CardContent
} from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import i18next from 'i18next';

import { TabTitle } from '../Utils/TabTitle';
import DEMO from '../../store/constant';
import Loading from '../../components/Loading/Loading';
import { useAuth } from '../../components/AuthProvider';
import { appConfig } from '../../config';
import { is_TaiGer_role } from '@taiger-common/core';
import { getCRMStatsQuery } from '../../api/query';

const CRMDashboard = () => {
    TabTitle(i18next.t('CRM Dashboard', { ns: 'common' }));
    const { user } = useAuth();
    if (!is_TaiGer_role(user)) {
        return <Navigate to={`${DEMO.DASHBOARD_LINK}`} />;
    }

    const { data, isLoading } = useQuery(getCRMStatsQuery());
    const stats = data?.data?.data || {};

    if (isLoading) {
        return <Loading />;
    }

    // Create unified week range for consistent x-axis across both charts
    const createUnifiedWeekRange = (leadsData, meetingsData) => {
        const allWeeks = new Set();

        // Collect all weeks from both datasets
        if (leadsData && Array.isArray(leadsData)) {
            leadsData.forEach((item) => allWeeks.add(item.week));
        }
        if (meetingsData && Array.isArray(meetingsData)) {
            meetingsData.forEach((item) => allWeeks.add(item.week));
        }

        // Sort weeks chronologically
        return Array.from(allWeeks).sort();
    };

    // Prepare data with null values for missing weeks (no bars will be shown)
    const prepareChartData = (data, allWeeks, valueKey = 'count') => {
        const dataMap = new Map();
        if (data && Array.isArray(data)) {
            data.forEach((item) => dataMap.set(item.week, item[valueKey] || 0));
        }

        return allWeeks.map((week) =>
            dataMap.has(week) ? dataMap.get(week) : null
        );
    };

    const allWeeks = createUnifiedWeekRange(
        stats.leadsCountByDate,
        stats.meetingCountByDate
    );

    // Prepare data for both charts with consistent x-axis (null for missing weeks)
    const unifiedLeadsData = prepareChartData(
        stats.leadsCountByDate,
        allWeeks,
        'count'
    );
    const unifiedConvertedLeadsData = prepareChartData(
        stats.leadsCountByDate,
        allWeeks,
        'convertedCount'
    );
    const unifiedMeetingsData = prepareChartData(
        stats.meetingCountByDate,
        allWeeks,
        'count'
    );

    return (
        <>
            <Breadcrumbs aria-label="breadcrumb">
                <Link
                    color="inherit"
                    component="a"
                    href={`${DEMO.DASHBOARD_LINK}`}
                    underline="hover"
                >
                    {appConfig.companyName}
                </Link>
                <Typography color="text.primary">
                    {i18next.t('CRM Dashboard', { ns: 'common' })}
                </Typography>
            </Breadcrumbs>

            <Grid container spacing={1} sx={{ mt: 0.5 }}>
                <Grid item md={3} sm={6} xs={12}>
                    <Box
                        sx={{
                            p: 1.5,
                            backgroundColor: 'background.paper',
                            borderRadius: 1,
                            boxShadow: 1
                        }}
                    >
                        <Typography color="textSecondary" variant="body2">
                            {i18next.t('Leads', { ns: 'common' })}
                        </Typography>
                        <Typography component="div" variant="h5">
                            {stats.totalLeadCount || 0}
                            <Typography
                                component="span"
                                sx={{ color: 'success.main', ml: 1 }}
                                variant="body2"
                            >
                                (+{stats.recentLeadCount || 0})
                            </Typography>
                        </Typography>
                        <Typography color="textSecondary" variant="caption">
                            {i18next.t('Total leads (+last 7 days)', {
                                ns: 'common'
                            })}
                        </Typography>
                    </Box>
                </Grid>
                <Grid item md={3} sm={6} xs={12}>
                    <Box
                        sx={{
                            p: 1.5,
                            backgroundColor: 'background.paper',
                            borderRadius: 1,
                            boxShadow: 1
                        }}
                    >
                        <Typography color="textSecondary" variant="body2">
                            {i18next.t('Converted Leads', { ns: 'common' })}
                        </Typography>
                        <Typography component="div" variant="h5">
                            {stats.convertedLeadCount || 0}
                        </Typography>
                        <Typography color="textSecondary" variant="caption">
                            {i18next.t('Total Converted', {
                                ns: 'common'
                            })}
                        </Typography>
                    </Box>
                </Grid>
                <Grid item md={3} sm={6} xs={12}>
                    <Box
                        sx={{
                            p: 1.5,
                            backgroundColor: 'background.paper',
                            borderRadius: 1,
                            boxShadow: 1
                        }}
                    >
                        <Typography color="textSecondary" variant="body2">
                            {i18next.t('Meetings', { ns: 'common' })}
                        </Typography>
                        <Typography component="div" variant="h5">
                            {stats.totalMeetingCount || 0}
                            <Typography
                                component="span"
                                sx={{ color: 'success.main', ml: 1 }}
                                variant="body2"
                            >
                                (+{stats.recentMeetingCount || 0})
                            </Typography>
                        </Typography>
                        <Typography color="textSecondary" variant="caption">
                            {i18next.t('Total meetings (+last 7 days)', {
                                ns: 'common'
                            })}
                        </Typography>
                    </Box>
                </Grid>
            </Grid>
            <Grid container spacing={1} sx={{ mt: 0.5 }}>
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography gutterBottom variant="h6">
                                {i18next.t('Leads Count by Calendar Week', {
                                    ns: 'common'
                                })}
                            </Typography>
                            {allWeeks.length > 0 ? (
                                <BarChart
                                    height={250}
                                    series={[
                                        {
                                            data: unifiedLeadsData,
                                            label: 'New Leads'
                                        },
                                        {
                                            data: unifiedConvertedLeadsData,
                                            label: 'Converted Leads'
                                        }
                                    ]}
                                    slotProps={{
                                        legend: { hidden: true }
                                    }}
                                    xAxis={[
                                        {
                                            label: 'Calendar Week',
                                            data: allWeeks,
                                            scaleType: 'band',
                                            barGapRatio: -1
                                        }
                                    ]}
                                    yAxis={[
                                        {
                                            label: 'Count'
                                        }
                                    ]}
                                />
                            ) : (
                                <Typography
                                    color="textSecondary"
                                    variant="body2"
                                >
                                    {i18next.t('No data available', {
                                        ns: 'common'
                                    })}
                                </Typography>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography gutterBottom variant="h6">
                                {i18next.t('Meeting Count by Calendar Week', {
                                    ns: 'common'
                                })}
                            </Typography>
                            {allWeeks.length > 0 ? (
                                <BarChart
                                    height={250}
                                    series={[
                                        {
                                            data: unifiedMeetingsData,
                                            label: i18next.t('Meetings', {
                                                ns: 'common'
                                            })
                                        }
                                    ]}
                                    slotProps={{
                                        legend: { hidden: true }
                                    }}
                                    xAxis={[
                                        {
                                            label: i18next.t('Calendar Week', {
                                                ns: 'common'
                                            }),
                                            data: allWeeks,
                                            scaleType: 'band'
                                        }
                                    ]}
                                    yAxis={[
                                        {
                                            label: i18next.t('Count', {
                                                ns: 'common'
                                            })
                                        }
                                    ]}
                                />
                            ) : (
                                <Typography
                                    color="textSecondary"
                                    variant="body2"
                                >
                                    {i18next.t('No data available', {
                                        ns: 'common'
                                    })}
                                </Typography>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </>
    );
};

export default CRMDashboard;
