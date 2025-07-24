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

    // Process chart data - data is already grouped by calendar week
    const processWeeklyData = (countByWeek) => {
        if (!countByWeek || !Array.isArray(countByWeek))
            return { labels: [], data: [] };

        const sortedData = countByWeek.sort((a, b) =>
            a.week.localeCompare(b.week)
        );

        return {
            labels: sortedData.map((item) => item.week),
            data: sortedData.map((item) => item.count)
        };
    };

    // const leadsWeeklyData = processWeeklyData(stats.leadsCountByDate);
    const meetingsWeeklyData = processWeeklyData(stats.meetingCountByDate);

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
                            {stats.leadsCountByDate.length > 0 ? (
                                <BarChart
                                    height={250}
                                    series={[
                                        {
                                            data: stats.leadsCountByDate.map(
                                                (item) => item.count
                                            ),
                                            label: 'New Leads'
                                        },
                                        {
                                            data: stats.leadsCountByDate.map(
                                                (item) => item.convertedCount
                                            ),
                                            label: 'Converted Leads'
                                        }
                                    ]}
                                    slotProps={{
                                        legend: { hidden: true }
                                    }}
                                    xAxis={[
                                        {
                                            label: 'Calendar Week',
                                            data: stats.leadsCountByDate.map(
                                                (item) => item.week
                                            ),
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
                            {meetingsWeeklyData.labels.length > 0 ? (
                                <BarChart
                                    height={250}
                                    series={[
                                        {
                                            data: meetingsWeeklyData.data,
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
                                            data: meetingsWeeklyData.labels,
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
