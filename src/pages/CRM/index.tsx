import { Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState, type ComponentProps } from 'react';
import {
    Breadcrumbs,
    Link,
    Typography,
    Grid,
    Box,
    Card,
    CardContent,
    Tooltip,
    IconButton,
    Tabs,
    Tab,
    useTheme
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { BarChart } from '@mui/x-charts/BarChart';
import { useTranslation } from 'react-i18next';

import { TabTitle } from '../Utils/TabTitle';
import DEMO from '@store/constant';
import Loading from '@components/Loading/Loading';
import { useAuth } from '@components/AuthProvider';
import { appConfig } from '../../config';
import { is_TaiGer_role } from '@taiger-common/core';
import type { IUser } from '@taiger-common/model';
import { getCRMStatsQuery } from '@/api/query';

type TimePreset = '1m' | '3m' | '6m' | 'ytd' | '1y' | 'full';
type ChartPoint = { week: string; [key: string]: unknown };

const WEEK_PATTERN = /^(\d{4})-W(\d{1,2})$/;
const YEAR_PATTERN = /(20\d{2})/;

const toWeekOrdinal = (year: number, week: number) => year * 100 + week;

const parseWeekLabel = (weekLabel: string) => {
    const meta = getWeekMeta(weekLabel);
    if (!meta) return null;
    const day = new Date(Date.UTC(meta.year, 0, 1));
    day.setUTCDate(day.getUTCDate() + (meta.week - 1) * 7);
    return day;
};

const getWeekMeta = (weekLabel: string) => {
    const match = WEEK_PATTERN.exec(weekLabel);
    if (!match) return null;
    const year = Number(match[1]);
    const week = Number(match[2]);
    if (!year || !week) return null;
    return {
        label: weekLabel,
        year,
        week,
        ordinal: toWeekOrdinal(year, week)
    };
};

const getYearFromLabel = (label: string) => {
    const match = YEAR_PATTERN.exec(label);
    return match ? Number(match[1]) : null;
};

const getNumeric = (item: Record<string, unknown>, keys: string[]) => {
    for (const key of keys) {
        const value = Number(item[key]);
        if (!Number.isNaN(value)) return value;
    }
    return 0;
};

const sumByWeeks = (
    data: ChartPoint[] | undefined,
    selectedWeeks: Set<string>,
    keys: string[]
) => {
    if (!Array.isArray(data)) return 0;
    return data.reduce((sum, item) => {
        if (!selectedWeeks.has(item.week)) return sum;
        return sum + getNumeric(item as Record<string, unknown>, keys);
    }, 0);
};

const CRMDashboard = () => {
    const theme = useTheme();
    const { t } = useTranslation();
    TabTitle(t('breadcrumbs.dashboard', { ns: 'crm' }));
    const { user } = useAuth();
    const { data, isLoading } = useQuery(getCRMStatsQuery());
    const [timePreset, setTimePreset] = useState<TimePreset>('3m');
    const isAuthorized = Boolean(user) && is_TaiGer_role(user as IUser);
    const now = new Date();
    const currentYear = now.getFullYear();
    const stats =
        (
            data as
                | {
                      data?: {
                          data?: {
                              totalLeadCount?: number;
                              convertedLeadCount?: number;
                              totalMeetingCount?: number;
                              recentLeadCount?: number;
                              recentMeetingCount?: number;
                              avgResponseTimeDays?: number | null;
                              p50ResponseTimeDays?: number | null;
                              p95ResponseTimeDays?: number | null;
                              totalLeadsWithMeeting?: number;
                              totalLeadsWithFollowUp?: number;
                              avgSalesCycleDays?: number | null;
                              p50SalesCycleDays?: number | null;
                              p95SalesCycleDays?: number | null;
                              leadsCountByDate?: ChartPoint[];
                              meetingCountByDate?: ChartPoint[];
                              [key: string]: unknown;
                          };
                      };
                  }
                | undefined
        )?.data?.data || {};

    // Create unified week range for consistent x-axis across both charts
    const createUnifiedWeekRange = (
        leadsData: Array<{ week: string; [key: string]: unknown }> | undefined,
        meetingsData:
            | Array<{ week: string; [key: string]: unknown }>
            | undefined
    ) => {
        const allWeeks = new Set<string>();

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
    const prepareChartData = (
        data: Array<{ week: string; [key: string]: unknown }> | undefined,
        allWeeks: string[],
        valueKey = 'count'
    ) => {
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

    const sortedWeekMeta = useMemo(
        () =>
            allWeeks
                .map((w) => {
                    const meta = getWeekMeta(w);
                    return meta
                        ? {
                              ...meta,
                              date: parseWeekLabel(w)
                          }
                        : null;
                })
                .filter(Boolean)
                .sort(
                    (a, b) =>
                        (a?.date?.getTime() || 0) - (b?.date?.getTime() || 0)
                ),
        [allWeeks]
    );

    // Keep a stable ordered week axis even when week labels are not ISO-like.
    const orderedWeekLabels = useMemo(() => {
        if (sortedWeekMeta.length) {
            return sortedWeekMeta.map((w) => w?.label || '').filter(Boolean);
        }
        return allWeeks;
    }, [allWeeks, sortedWeekMeta]);

    const filteredWeekLabels = useMemo(() => {
        if (timePreset === 'full') {
            return orderedWeekLabels;
        }

        const rangeWeeks: Record<
            Exclude<TimePreset, 'full' | 'ytd'>,
            number
        > = {
            '1m': 4,
            '3m': 13,
            '6m': 26,
            '1y': 52
        };

        // If backend week labels are not ISO-like, fallback to index-based slicing.
        if (!sortedWeekMeta.length) {
            if (timePreset === 'ytd') {
                return orderedWeekLabels.filter(
                    (label) => getYearFromLabel(label) === currentYear
                );
            }
            const count =
                rangeWeeks[timePreset as keyof typeof rangeWeeks] || 52;
            return orderedWeekLabels.slice(-count);
        }

        if (timePreset === 'ytd') {
            const ytdLabels = sortedWeekMeta
                .filter((w) => w?.year === currentYear)
                .map((w) => w?.label || '')
                .filter(Boolean);
            if (ytdLabels.length) return ytdLabels;
            return orderedWeekLabels.filter(
                (label) => getYearFromLabel(label) === currentYear
            );
        }

        const count = rangeWeeks[timePreset as keyof typeof rangeWeeks] || 52;
        return orderedWeekLabels.slice(-count);
    }, [currentYear, orderedWeekLabels, sortedWeekMeta, timePreset]);

    const filteredWeekSet = useMemo(
        () => new Set(filteredWeekLabels),
        [filteredWeekLabels]
    );

    // Always show latest 7-day delta (approximated by latest week bucket)
    const latestWeekSet = useMemo(() => {
        const latestLabel = orderedWeekLabels[orderedWeekLabels.length - 1];
        return new Set(latestLabel ? [latestLabel] : []);
    }, [orderedWeekLabels]);

    const recent7dLeads = sumByWeeks(stats.leadsCountByDate, latestWeekSet, [
        'count',
        'leadCount',
        'totalLeadCount'
    ]);
    const recent7dMeetings = sumByWeeks(
        stats.meetingCountByDate,
        latestWeekSet,
        ['count', 'meetingCount', 'totalMeetingCount']
    );
    const recent7dConverted = sumByWeeks(
        stats.leadsCountByDate,
        latestWeekSet,
        ['convertedCount', 'convertedLeadCount']
    );

    const totalLeads = sumByWeeks(stats.leadsCountByDate, filteredWeekSet, [
        'count',
        'leadCount',
        'totalLeadCount'
    ]);
    const convertedLeads = sumByWeeks(stats.leadsCountByDate, filteredWeekSet, [
        'convertedCount',
        'convertedLeadCount'
    ]);
    const totalMeetings = sumByWeeks(
        stats.meetingCountByDate,
        filteredWeekSet,
        ['count', 'meetingCount', 'totalMeetingCount']
    );
    const conversionRate = totalLeads
        ? Number(((convertedLeads / totalLeads) * 100).toFixed(1))
        : 0;

    // Prepare data for both charts with consistent x-axis (null for missing weeks)
    const unifiedLeadsData = prepareChartData(
        stats.leadsCountByDate,
        filteredWeekLabels,
        'count'
    );
    const unifiedHighChanceLeadsData = prepareChartData(
        stats.leadsCountByDate,
        filteredWeekLabels,
        'highChanceCount'
    );

    const unifiedConvertedLeadsData = prepareChartData(
        stats.leadsCountByDate,
        filteredWeekLabels,
        'convertedCount'
    );
    const unifiedMeetingsData = prepareChartData(
        stats.meetingCountByDate,
        filteredWeekLabels,
        'count'
    );

    // Prepare per-week conversion rate labels (converted / leads * 100)
    // Round up to nearest integer and omit decimals
    const unifiedConversionRates = filteredWeekLabels.map((_, idx) => {
        const leads = unifiedLeadsData[idx];
        const converted = unifiedConvertedLeadsData[idx];
        if (leads === null || leads === 0 || leads === undefined) return null;
        const rate = (Number(converted || 0) / Number(leads)) * 100;
        if (rate === 0) return null;
        return Math.ceil(rate);
    });

    const barLabelFill =
        theme.palette.mode === 'dark'
            ? 'rgba(255,255,255,0.92)'
            : 'rgba(0,0,0,0.72)';

    const leadsBarLabel = ((
        valueObj: { seriesId?: string; dataIndex?: number },
        meta: { bar?: { height?: number } }
    ) => {
        try {
            const { seriesId, dataIndex } = valueObj || {};
            if (seriesId === 'newLeads') {
                const idx = typeof dataIndex === 'number' ? dataIndex : -1;
                const label = idx >= 0 ? unifiedConversionRates[idx] : null;
                if (!label) return null;
                const bar = meta?.bar || {};
                const dy = bar.height ? -(bar.height / 2 + 14) : -14;
                return (
                    <tspan
                        dy={dy}
                        style={{
                            fontSize: '11px',
                            fill: barLabelFill
                        }}
                    >
                        {`${label}%`}
                    </tspan>
                );
            }
        } catch {
            // fall through to no label
        }
        return null;
    }) as unknown as NonNullable<ComponentProps<typeof BarChart>['barLabel']>;

    const meetingsBarLabel = ((
        valueObj: { dataIndex?: number },
        meta: { bar?: { height?: number } }
    ) => {
        try {
            const idx =
                typeof valueObj?.dataIndex === 'number'
                    ? valueObj.dataIndex
                    : -1;
            const count = idx >= 0 ? unifiedMeetingsData[idx] : null;
            if (count == null || Number(count) <= 0) return null;
            const bar = meta?.bar || {};
            const dy = bar.height ? -(bar.height / 2 + 14) : -14;
            return (
                <tspan
                    dy={dy}
                    style={{
                        fontSize: '11px',
                        fill: barLabelFill
                    }}
                >
                    {`${Math.round(Number(count))}`}
                </tspan>
            );
        } catch {
            return null;
        }
    }) as unknown as NonNullable<ComponentProps<typeof BarChart>['barLabel']>;

    const formatDays = (value: number | null | undefined) =>
        value == null || Number.isNaN(Number(value))
            ? '-'
            : `${Number(value).toFixed(2)}d`;
    const percentileLine = (
        p50: number | null | undefined,
        p95: number | null | undefined
    ) => {
        if (p50 === null && p95 === null) return null;
        const parts = [];
        if (p50 !== null) parts.push(`p50 ${Number(p50).toFixed(2)}d`);
        if (p95 !== null) parts.push(`p95 ${Number(p95).toFixed(2)}d`);
        return (
            <Typography color="textSecondary" variant="caption">
                {parts.join(' \u2022 ')}
            </Typography>
        );
    };

    if (!isAuthorized) {
        return <Navigate to={`${DEMO.DASHBOARD_LINK}`} />;
    }

    if (isLoading) {
        return <Loading />;
    }

    return (
        <>
            <Box
                sx={{
                    mt: 0.25,
                    mb: 0.75,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1,
                    flexWrap: 'wrap'
                }}
            >
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

                <Tabs
                    onChange={(_event, value) => setTimePreset(value)}
                    value={timePreset}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                        ml: 'auto',
                        minHeight: 26,
                        p: 0.125,
                        borderRadius: 12,
                        bgcolor: 'action.hover',
                        border: '1px solid',
                        borderColor: 'divider',
                        '& .MuiTabs-indicator': {
                            display: 'none'
                        }
                    }}
                >
                    <Tab
                        label="1M"
                        value="1m"
                        sx={{
                            minHeight: 20,
                            minWidth: 'auto',
                            py: 0.125,
                            px: 0.875,
                            borderRadius: 8,
                            color: 'text.secondary',
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            '&.Mui-selected': {
                                color: 'primary.main',
                                bgcolor: 'action.selected',
                                border: '1px solid',
                                borderColor: 'primary.main'
                            }
                        }}
                    />
                    <Tab
                        label="3M"
                        value="3m"
                        sx={{
                            minHeight: 20,
                            minWidth: 'auto',
                            py: 0.125,
                            px: 0.875,
                            borderRadius: 8,
                            color: 'text.secondary',
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            '&.Mui-selected': {
                                color: 'primary.main',
                                bgcolor: 'action.selected',
                                border: '1px solid',
                                borderColor: 'primary.main'
                            }
                        }}
                    />
                    <Tab
                        label="6M"
                        value="6m"
                        sx={{
                            minHeight: 20,
                            minWidth: 'auto',
                            py: 0.125,
                            px: 0.875,
                            borderRadius: 8,
                            color: 'text.secondary',
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            '&.Mui-selected': {
                                color: 'primary.main',
                                bgcolor: 'action.selected',
                                border: '1px solid',
                                borderColor: 'primary.main'
                            }
                        }}
                    />
                    <Tab
                        label="YTD"
                        value="ytd"
                        sx={{
                            minHeight: 20,
                            minWidth: 'auto',
                            py: 0.125,
                            px: 0.875,
                            borderRadius: 8,
                            color: 'text.secondary',
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            '&.Mui-selected': {
                                color: 'primary.main',
                                bgcolor: 'action.selected',
                                border: '1px solid',
                                borderColor: 'primary.main'
                            }
                        }}
                    />
                    <Tab
                        label="1Y"
                        value="1y"
                        sx={{
                            minHeight: 20,
                            minWidth: 'auto',
                            py: 0.125,
                            px: 0.875,
                            borderRadius: 8,
                            color: 'text.secondary',
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            '&.Mui-selected': {
                                color: 'primary.main',
                                bgcolor: 'action.selected',
                                border: '1px solid',
                                borderColor: 'primary.main'
                            }
                        }}
                    />
                    <Tab
                        label="MAX"
                        value="full"
                        sx={{
                            minHeight: 20,
                            minWidth: 'auto',
                            py: 0.125,
                            px: 0.875,
                            borderRadius: 8,
                            color: 'text.secondary',
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            '&.Mui-selected': {
                                color: 'primary.main',
                                bgcolor: 'action.selected',
                                border: '1px solid',
                                borderColor: 'primary.main'
                            }
                        }}
                    />
                </Tabs>
            </Box>

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
                            {totalLeads}
                            <Typography
                                component="span"
                                sx={{ color: 'success.main', ml: 1 }}
                                variant="body2"
                            >
                                (+{recent7dLeads})
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
                            {totalMeetings}
                            <Typography
                                component="span"
                                sx={{ color: 'success.main', ml: 1 }}
                                variant="body2"
                            >
                                (+{recent7dMeetings})
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
                            {convertedLeads}
                            <Typography
                                component="span"
                                sx={{ color: 'success.main', ml: 1 }}
                                variant="body2"
                            >
                                (+{recent7dConverted})
                            </Typography>
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
                        <Typography component="div" variant="h5">
                            {formatDays(stats.avgResponseTimeDays)}
                        </Typography>
                        {percentileLine(
                            stats.p50ResponseTimeDays,
                            stats.p95ResponseTimeDays
                        )}
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
                        <Typography component="div" variant="h5">
                            {formatDays(stats.avgSalesCycleDays)}
                        </Typography>
                        {percentileLine(
                            stats.p50SalesCycleDays,
                            stats.p95SalesCycleDays
                        )}
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
                            {filteredWeekLabels.length > 0 ? (
                                <BarChart
                                    barLabel={leadsBarLabel}
                                    height={250}
                                    series={[
                                        {
                                            id: 'highChance',
                                            data: unifiedHighChanceLeadsData,
                                            label: t(
                                                'dashboard.highChanceLeads',
                                                { ns: 'crm' }
                                            ),
                                            color: '#F28E2B',
                                            stack: 'leadStack'
                                        },
                                        {
                                            id: 'convertedLeads',
                                            data: unifiedConvertedLeadsData,
                                            label: t(
                                                'dashboard.convertedLeadsSeries',
                                                { ns: 'crm' }
                                            ),
                                            color: '#59A14F',
                                            stack: 'leadStack'
                                        },
                                        {
                                            id: 'newLeads',
                                            data: unifiedLeadsData,
                                            label: t('dashboard.newLeads', {
                                                ns: 'crm'
                                            }),
                                            color: '#4BC0C0',
                                            stack: 'leadStack'
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
                                            data: filteredWeekLabels,
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

                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography gutterBottom variant="h6">
                                {t('dashboard.meetingCountByWeek', {
                                    ns: 'crm'
                                })}
                            </Typography>
                            {filteredWeekLabels.length > 0 ? (
                                <BarChart
                                    barLabel={meetingsBarLabel}
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
                                            data: filteredWeekLabels,
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
