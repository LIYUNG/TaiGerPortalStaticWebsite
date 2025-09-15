import { Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
    Breadcrumbs,
    Link,
    Typography,
    Grid,
    Box,
    Card,
    CardContent,
    Tooltip,
    IconButton
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { BarChart } from '@mui/x-charts/BarChart';
import { useTranslation } from 'react-i18next';

import { TabTitle } from '../Utils/TabTitle';
import DEMO from '../../store/constant';
import Loading from '../../components/Loading/Loading';
import { useAuth } from '../../components/AuthProvider';
import { appConfig } from '../../config';
import { is_TaiGer_role } from '@taiger-common/core';
import { getCRMStatsQuery } from '../../api/query';

const CRMDashboard = () => {
    const { t } = useTranslation();
    TabTitle(t('breadcrumbs.dashboard', { ns: 'crm' }));
    const { user } = useAuth();
    if (!is_TaiGer_role(user)) {
        return <Navigate to={`${DEMO.DASHBOARD_LINK}`} />;
    }

    const { data, isLoading } = useQuery(getCRMStatsQuery());
    const stats = data?.data?.data || {};

    if (isLoading) {
        return <Loading />;
    }

    // Calculate conversion rate (converted leads / total leads)
    const totalLeads = Number(stats.totalLeadCount) || 0;
    const convertedLeads = Number(stats.convertedLeadCount) || 0;
    const conversionRate = totalLeads
        ? Number(((convertedLeads / totalLeads) * 100).toFixed(1))
        : 0;

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
    const unifiedHighChanceLeadsData = prepareChartData(
        stats.leadsCountByDate,
        allWeeks,
        'highChanceCount'
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

    // Prepare per-week conversion rate labels (converted / leads * 100)
    // Round up to nearest integer and omit decimals
    const unifiedConversionRates = allWeeks.map((_, idx) => {
        const leads = unifiedLeadsData[idx];
        const converted = unifiedConvertedLeadsData[idx];
        if (leads === null || leads === 0 || leads === undefined) return null;
        const rate = (Number(converted || 0) / Number(leads)) * 100;
        if (rate === 0) return null;
        return Math.ceil(rate);
    });

    const formatDays = (value) =>
        value == null || isNaN(value) ? '-' : `${Number(value).toFixed(2)}d`;
    const percentileLine = (p50, p95) => {
        if (p50 == null && p95 == null) return null;
        const parts = [];
        if (p50 != null) parts.push(`p50 ${Number(p50).toFixed(2)}d`);
        if (p95 != null) parts.push(`p95 ${Number(p95).toFixed(2)}d`);
        return (
            <Typography
                color="text.secondary"
                sx={{ display: 'block', mt: 0.25 }}
                variant="caption"
            >
                {parts.join(' \u2022 ')}
            </Typography>
        );
    };

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
                    {t('breadcrumbs.dashboard', { ns: 'crm' })}
                </Typography>
            </Breadcrumbs>

            <Grid container spacing={1} sx={{ mt: 0.5 }}>
                {/* Leads Box */}
                <Grid item md={1.5} sm={6} xs={12}>
                    <Box
                        sx={{
                            p: 1.5,
                            backgroundColor: 'background.paper',
                            borderRadius: 1,
                            boxShadow: 1
                        }}
                    >
                        <Typography color="textSecondary" variant="body2">
                            {t('dashboard.leads', { ns: 'crm' })}
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
                            {t('dashboard.totalLeadsRecent', { ns: 'crm' })}
                        </Typography>
                    </Box>
                </Grid>
                {/* Meetings Box */}
                <Grid item md={1.5} sm={6} xs={12}>
                    <Box
                        sx={{
                            p: 1.5,
                            backgroundColor: 'background.paper',
                            borderRadius: 1,
                            boxShadow: 1
                        }}
                    >
                        <Typography color="textSecondary" variant="body2">
                            {t('dashboard.meetings', { ns: 'crm' })}
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
                            {t('dashboard.totalMeetingsRecent', { ns: 'crm' })}
                        </Typography>
                    </Box>
                </Grid>
                {/* Converted Leads Box */}
                <Grid item md={1.5} sm={6} xs={12}>
                    <Box
                        sx={{
                            p: 1.5,
                            backgroundColor: 'background.paper',
                            borderRadius: 1,
                            boxShadow: 1
                        }}
                    >
                        <Typography color="textSecondary" variant="body2">
                            {t('dashboard.convertedLeads', { ns: 'crm' })}
                        </Typography>
                        <Typography component="div" variant="h5">
                            {stats.convertedLeadCount || 0}
                        </Typography>
                        <Typography color="textSecondary" variant="caption">
                            {t('dashboard.totalConverted', { ns: 'crm' })}
                        </Typography>
                    </Box>
                </Grid>
                {/* Conversion Rate Box */}
                <Grid item md={1.5} sm={6} xs={12}>
                    <Box
                        sx={{
                            p: 1.5,
                            backgroundColor: 'background.paper',
                            borderRadius: 1,
                            boxShadow: 1
                        }}
                    >
                        <Typography color="textSecondary" variant="body2">
                            {t('dashboard.conversionRate', {
                                ns: 'crm',
                                defaultValue: 'Conversion Rate'
                            })}
                        </Typography>
                        <Typography component="div" variant="h5">
                            {conversionRate}%
                        </Typography>
                        <Typography color="textSecondary" variant="caption">
                            {t('dashboard.conversionRateDesc', {
                                ns: 'crm',
                                defaultValue: 'Converted / Total'
                            })}
                            : {convertedLeads}
                            {' / '}
                            {totalLeads}
                        </Typography>
                    </Box>
                </Grid>
                {/* Avg Response Time Box */}
                <Grid item md={2} sm={6} xs={12}>
                    <Box
                        sx={{
                            p: 1.5,
                            backgroundColor: 'background.paper',
                            borderRadius: 1,
                            boxShadow: 1
                        }}
                    >
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5
                            }}
                        >
                            <Typography color="textSecondary" variant="body2">
                                {t('dashboard.avgResponseTime', {
                                    ns: 'crm',
                                    defaultValue: 'Avg Response Time'
                                })}
                            </Typography>
                            <Tooltip
                                arrow
                                title={t('dashboard.avgResponseTimeDesc', {
                                    ns: 'crm',
                                    defaultValue:
                                        'Average days between first contact and first meeting'
                                })}
                            >
                                <IconButton
                                    size="small"
                                    sx={{ p: 0, color: 'text.secondary' }}
                                >
                                    <InfoOutlinedIcon fontSize="inherit" />
                                </IconButton>
                            </Tooltip>
                        </Box>
                        <Typography
                            component="div"
                            sx={{ fontWeight: 600 }}
                            variant="h6"
                        >
                            {formatDays(stats.avgResponseTimeDays)}
                        </Typography>
                        {percentileLine(
                            stats.p50ResponseTimeDays,
                            stats.p95ResponseTimeDays
                        )}
                        {/* description moved to tooltip */}
                    </Box>
                </Grid>
                {/* Follow-Up Rate Box */}
                <Grid item md={2} sm={6} xs={12}>
                    <Box
                        sx={{
                            p: 1.5,
                            backgroundColor: 'background.paper',
                            borderRadius: 1,
                            boxShadow: 1
                        }}
                    >
                        <Typography color="textSecondary" variant="body2">
                            {t('dashboard.followUpRate', {
                                ns: 'crm',
                                defaultValue: 'Follow-Up Rate'
                            })}
                        </Typography>
                        <Typography component="div" variant="h5">
                            {(() => {
                                const totalWithMeeting =
                                    Number(stats.totalLeadsWithMeeting) || 0;
                                const totalWithFollowUp =
                                    Number(stats.totalLeadsWithFollowUp) || 0;
                                return totalWithMeeting
                                    ? `${((totalWithFollowUp / totalWithMeeting) * 100).toFixed(1)}%`
                                    : '-';
                            })()}
                        </Typography>
                        <Typography color="textSecondary" variant="caption">
                            {t('dashboard.followUpRateDesc', {
                                ns: 'crm',
                                defaultValue: 'follow-ups / total'
                            })}
                            : {stats.totalLeadsWithFollowUp || 0} {' / '}
                            {stats.totalLeadsWithMeeting || 0}
                        </Typography>
                    </Box>
                </Grid>
                {/* Avg Sales Cycle Box */}
                <Grid item md={2} sm={6} xs={12}>
                    <Box
                        sx={{
                            p: 1.5,
                            backgroundColor: 'background.paper',
                            borderRadius: 1,
                            boxShadow: 1
                        }}
                    >
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5
                            }}
                        >
                            <Typography color="textSecondary" variant="body2">
                                {t('dashboard.avgSalesCycle', {
                                    ns: 'crm',
                                    defaultValue: 'Avg Sales Cycle'
                                })}
                            </Typography>
                            <Tooltip
                                arrow
                                title={t('dashboard.avgSalesCycleDesc', {
                                    ns: 'crm',
                                    defaultValue:
                                        'Average days between first contact and conversion'
                                })}
                            >
                                <IconButton
                                    size="small"
                                    sx={{ p: 0, color: 'text.secondary' }}
                                >
                                    <InfoOutlinedIcon fontSize="inherit" />
                                </IconButton>
                            </Tooltip>
                        </Box>
                        <Typography
                            component="div"
                            sx={{ fontWeight: 600 }}
                            variant="h6"
                        >
                            {formatDays(stats.avgSalesCycleDays)}
                        </Typography>
                        {percentileLine(
                            stats.p50SalesCycleDays,
                            stats.p95SalesCycleDays
                        )}
                        {/* description moved to tooltip */}
                    </Box>
                </Grid>
            </Grid>
            <Grid container spacing={1} sx={{ mt: 0.5 }}>
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography gutterBottom variant="h6">
                                {t('dashboard.leadsCountByWeek', { ns: 'crm' })}
                            </Typography>
                            {allWeeks.length > 0 ? (
                                <BarChart
                                    barLabel={(valueObj, meta) => {
                                        try {
                                            const { seriesId, dataIndex } =
                                                valueObj || {};
                                            const bar = meta?.bar || {};
                                            if (seriesId === 'newLeads') {
                                                const label =
                                                    unifiedConversionRates[
                                                        dataIndex
                                                    ] ?? null;
                                                if (!label) return null;
                                                // place label above the bar by shifting it up by half the bar height + padding
                                                // move label higher and make it slightly bigger
                                                const dy = bar.height
                                                    ? -(bar.height / 2 + 12)
                                                    : -12;
                                                return (
                                                    <tspan
                                                        dy={dy}
                                                        style={{
                                                            fontSize: '12px',
                                                            fill: 'rgba(0,0,0,0.54)'
                                                        }}
                                                    >
                                                        {`${label}%`}
                                                    </tspan>
                                                );
                                            }
                                        } catch (e) {
                                            // fall through to no label
                                        }
                                        return null;
                                    }}
                                    height={250}
                                    series={[
                                        {
                                            id: 'newLeads',
                                            data: unifiedLeadsData,
                                            label: t('dashboard.newLeads', {
                                                ns: 'crm'
                                            })
                                        },
                                        {
                                            id: 'highChance',
                                            data: unifiedHighChanceLeadsData,
                                            label: t(
                                                'dashboard.highChanceLeads',
                                                { ns: 'crm' }
                                            ),
                                            color: '#F28E2B'
                                        },
                                        {
                                            id: 'convertedLeads',
                                            data: unifiedConvertedLeadsData,
                                            label: t(
                                                'dashboard.convertedLeadsSeries',
                                                { ns: 'crm' }
                                            ),
                                            color: '#59A14F'
                                        }
                                    ]}
                                    slotProps={{
                                        legend: { hidden: true }
                                    }}
                                    xAxis={[
                                        {
                                            label: t('dashboard.calendarWeek', {
                                                ns: 'crm'
                                            }),
                                            data: allWeeks,
                                            scaleType: 'band',
                                            barGapRatio: -1
                                        }
                                    ]}
                                    yAxis={[
                                        {
                                            label: t('dashboard.count', {
                                                ns: 'crm'
                                            })
                                        }
                                    ]}
                                />
                            ) : (
                                <Typography
                                    color="textSecondary"
                                    variant="body2"
                                >
                                    {t('dashboard.noData', { ns: 'crm' })}
                                </Typography>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography gutterBottom variant="h6">
                                {t('dashboard.meetingCountByWeek', {
                                    ns: 'crm'
                                })}
                            </Typography>
                            {allWeeks.length > 0 ? (
                                <BarChart
                                    height={250}
                                    series={[
                                        {
                                            data: unifiedMeetingsData,
                                            label: t('dashboard.meetings', {
                                                ns: 'crm'
                                            })
                                        }
                                    ]}
                                    slotProps={{
                                        legend: { hidden: true }
                                    }}
                                    xAxis={[
                                        {
                                            label: t('dashboard.calendarWeek', {
                                                ns: 'crm'
                                            }),
                                            data: allWeeks,
                                            scaleType: 'band'
                                        }
                                    ]}
                                    yAxis={[
                                        {
                                            label: t('dashboard.count', {
                                                ns: 'crm'
                                            })
                                        }
                                    ]}
                                />
                            ) : (
                                <Typography
                                    color="textSecondary"
                                    variant="body2"
                                >
                                    {t('dashboard.noData', { ns: 'crm' })}
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
