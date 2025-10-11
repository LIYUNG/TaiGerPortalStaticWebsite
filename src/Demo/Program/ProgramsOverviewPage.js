import React, { useState, useEffect } from 'react';
import { Link as LinkDom, Navigate, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Alert,
    Box,
    Breadcrumbs,
    Button,
    Card,
    CardActionArea,
    CardContent,
    Chip,
    Divider,
    Grid,
    IconButton,
    LinearProgress,
    Link,
    List,
    ListItem,
    ListItemText,
    Paper,
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
import {
    TrendingUp,
    School,
    Language,
    Public,
    Category,
    Update,
    Refresh,
    Assessment,
    Info,
    Person
} from '@mui/icons-material';
import { is_TaiGer_role } from '@taiger-common/core';
import { useQuery } from '@tanstack/react-query';

import { TabTitle } from '../Utils/TabTitle';
import DEMO from '../../store/constant';
import { useAuth } from '../../components/AuthProvider';
import { appConfig } from '../../config';
import { getProgramsOverviewQuery } from '../../api/query';
import { queryClient } from '../../api/client';
import Loading from '../../components/Loading/Loading';
import ErrorPage from '../Utils/ErrorPage';

const ProgramsOverviewPage = () => {
    const { user } = useAuth();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [refreshing, setRefreshing] = useState(false);
    const [cooldownSeconds, setCooldownSeconds] = useState(0);
    const [lastRefreshTime, setLastRefreshTime] = useState(null);

    const { data, isLoading, isError, error } = useQuery(
        getProgramsOverviewQuery()
    );
    const overview = data?.data;

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
            queryKey: ['programs', 'overview']
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

    if (!is_TaiGer_role(user)) {
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
    const totalCountries = overview.byCountry.length;
    const avgAdmissionRate =
        overview.topApplicationPrograms.length > 0
            ? (
                  overview.topApplicationPrograms.reduce(
                      (sum, p) => sum + p.admissionRate,
                      0
                  ) / overview.topApplicationPrograms.length
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
                    {new Date(overview.generatedAt).toLocaleString()}
                    {lastRefreshTime && (
                        <>
                            {' • '}
                            {t('Last manual refresh', { ns: 'common' })}:{' '}
                            {lastRefreshTime.toLocaleTimeString()}
                        </>
                    )}
                </Alert>
            </Box>

            {/* Summary Statistics Cards */}
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
                                        {overview.totalPrograms.toLocaleString()}
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
                                        {overview.totalSchools}
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

            {/* Main Content Sections */}
            <Typography gutterBottom sx={{ mt: 4, mb: 3 }} variant="h5">
                {t('Distribution Analysis', { ns: 'common' })}
            </Typography>
            <Grid container mb={4} spacing={3}>
                {/* Programs by Country */}
                <Grid item md={6} xs={12}>
                    <Card
                        onClick={() =>
                            navigate('/programs/distribution/country')
                        }
                        sx={{ height: 450, cursor: 'pointer' }}
                    >
                        <CardActionArea sx={{ height: '100%' }}>
                            <CardContent
                                sx={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}
                            >
                                <Box
                                    alignItems="center"
                                    display="flex"
                                    justifyContent="space-between"
                                    mb={2}
                                >
                                    <Box alignItems="center" display="flex">
                                        <Public sx={{ mr: 1 }} />
                                        <Typography variant="h6">
                                            {t('Programs by Country', {
                                                ns: 'common'
                                            })}
                                        </Typography>
                                    </Box>
                                    <Chip
                                        label={t('Click for details', {
                                            ns: 'common'
                                        })}
                                        size="small"
                                        variant="outlined"
                                    />
                                </Box>
                                <Divider sx={{ mb: 2 }} />
                                <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                                    <List dense>
                                        {overview.byCountry
                                            .slice(0, 8)
                                            .map((item, index) => (
                                                <ListItem key={index}>
                                                    <ListItemText
                                                        primary={
                                                            <Box
                                                                alignItems="center"
                                                                display="flex"
                                                                justifyContent="space-between"
                                                            >
                                                                <Typography>
                                                                    {
                                                                        item.country
                                                                    }
                                                                </Typography>
                                                                <Chip
                                                                    color="primary"
                                                                    label={
                                                                        item.count
                                                                    }
                                                                    size="small"
                                                                />
                                                            </Box>
                                                        }
                                                        secondary={
                                                            <LinearProgress
                                                                sx={{ mt: 1 }}
                                                                value={
                                                                    (item.count /
                                                                        overview.totalPrograms) *
                                                                    100
                                                                }
                                                                variant="determinate"
                                                            />
                                                        }
                                                    />
                                                </ListItem>
                                            ))}
                                    </List>
                                </Box>
                            </CardContent>
                        </CardActionArea>
                    </Card>
                </Grid>

                {/* Programs by Degree */}
                <Grid item md={3} sm={6} xs={12}>
                    <Card
                        onClick={() =>
                            navigate('/programs/distribution/degree')
                        }
                        sx={{ height: 450, cursor: 'pointer' }}
                    >
                        <CardActionArea sx={{ height: '100%' }}>
                            <CardContent
                                sx={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}
                            >
                                <Box
                                    alignItems="center"
                                    display="flex"
                                    justifyContent="space-between"
                                    mb={2}
                                >
                                    <Box alignItems="center" display="flex">
                                        <School sx={{ mr: 1 }} />
                                        <Typography variant="h6">
                                            {t('Programs by Degree', {
                                                ns: 'common'
                                            })}
                                        </Typography>
                                    </Box>
                                    <Chip
                                        label={t('Click for details', {
                                            ns: 'common'
                                        })}
                                        size="small"
                                        variant="outlined"
                                    />
                                </Box>
                                <Divider sx={{ mb: 2 }} />
                                <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                                    <List dense>
                                        {overview.byDegree.map(
                                            (item, index) => (
                                                <ListItem key={index}>
                                                    <ListItemText
                                                        primary={
                                                            <Box
                                                                alignItems="center"
                                                                display="flex"
                                                                justifyContent="space-between"
                                                            >
                                                                <Typography>
                                                                    {
                                                                        item.degree
                                                                    }
                                                                </Typography>
                                                                <Chip
                                                                    color="secondary"
                                                                    label={
                                                                        item.count
                                                                    }
                                                                    size="small"
                                                                />
                                                            </Box>
                                                        }
                                                        secondary={
                                                            <LinearProgress
                                                                color="secondary"
                                                                sx={{ mt: 1 }}
                                                                value={
                                                                    (item.count /
                                                                        overview.totalPrograms) *
                                                                    100
                                                                }
                                                                variant="determinate"
                                                            />
                                                        }
                                                    />
                                                </ListItem>
                                            )
                                        )}
                                    </List>
                                </Box>
                            </CardContent>
                        </CardActionArea>
                    </Card>
                </Grid>

                {/* Programs by Language */}
                <Grid item md={3} sm={6} xs={12}>
                    <Card
                        onClick={() =>
                            navigate('/programs/distribution/language')
                        }
                        sx={{ height: 450, cursor: 'pointer' }}
                    >
                        <CardActionArea sx={{ height: '100%' }}>
                            <CardContent
                                sx={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}
                            >
                                <Box
                                    alignItems="center"
                                    display="flex"
                                    justifyContent="space-between"
                                    mb={2}
                                >
                                    <Box alignItems="center" display="flex">
                                        <Language sx={{ mr: 1 }} />
                                        <Typography variant="h6">
                                            {t('Programs by Language', {
                                                ns: 'common'
                                            })}
                                        </Typography>
                                    </Box>
                                    <Chip
                                        label={t('Click for details', {
                                            ns: 'common'
                                        })}
                                        size="small"
                                        variant="outlined"
                                    />
                                </Box>
                                <Divider sx={{ mb: 2 }} />
                                <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                                    <List dense>
                                        {overview.byLanguage.map(
                                            (item, index) => (
                                                <ListItem key={index}>
                                                    <ListItemText
                                                        primary={
                                                            <Box
                                                                alignItems="center"
                                                                display="flex"
                                                                justifyContent="space-between"
                                                            >
                                                                <Typography>
                                                                    {
                                                                        item.language
                                                                    }
                                                                </Typography>
                                                                <Chip
                                                                    color="success"
                                                                    label={
                                                                        item.count
                                                                    }
                                                                    size="small"
                                                                />
                                                            </Box>
                                                        }
                                                        secondary={
                                                            <LinearProgress
                                                                color="success"
                                                                sx={{ mt: 1 }}
                                                                value={
                                                                    (item.count /
                                                                        overview.totalPrograms) *
                                                                    100
                                                                }
                                                                variant="determinate"
                                                            />
                                                        }
                                                    />
                                                </ListItem>
                                            )
                                        )}
                                    </List>
                                </Box>
                            </CardContent>
                        </CardActionArea>
                    </Card>
                </Grid>
            </Grid>

            {/* Top Performers Section */}
            <Typography gutterBottom sx={{ mt: 4, mb: 3 }} variant="h5">
                {t('Top Performers', { ns: 'common' })}
            </Typography>
            <Grid container mb={4} spacing={3}>
                {/* Top Schools Table */}
                <Grid item md={6} xs={12}>
                    <Card
                        onClick={() => navigate('/programs/schools')}
                        sx={{ height: 500, cursor: 'pointer' }}
                    >
                        <CardActionArea sx={{ height: '100%' }}>
                            <CardContent
                                sx={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}
                            >
                                <Box
                                    alignItems="center"
                                    display="flex"
                                    justifyContent="space-between"
                                    mb={2}
                                >
                                    <Box alignItems="center" display="flex">
                                        <School sx={{ mr: 1 }} />
                                        <Typography variant="h6">
                                            {t('Top Schools by Program Count', {
                                                ns: 'common'
                                            })}
                                        </Typography>
                                    </Box>
                                    <Chip
                                        label={t('Click for all schools', {
                                            ns: 'common'
                                        })}
                                        size="small"
                                        variant="outlined"
                                    />
                                </Box>
                                <Divider sx={{ mb: 2 }} />
                                <TableContainer
                                    component={Paper}
                                    style={{ maxHeight: 400 }}
                                >
                                    <Table size="small" stickyHeader>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>
                                                    {t('School', {
                                                        ns: 'common'
                                                    })}
                                                </TableCell>
                                                <TableCell>
                                                    {t('Country', {
                                                        ns: 'common'
                                                    })}
                                                </TableCell>
                                                <TableCell>
                                                    {t('City', {
                                                        ns: 'common'
                                                    })}
                                                </TableCell>
                                                <TableCell align="right">
                                                    {t('Programs', {
                                                        ns: 'common'
                                                    })}
                                                </TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {overview.schools
                                                ?.slice(0, 10)
                                                .map((school, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell>
                                                            {school.school}
                                                        </TableCell>
                                                        <TableCell>
                                                            {school.country}
                                                        </TableCell>
                                                        <TableCell>
                                                            {school.city}
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            {
                                                                school.programCount
                                                            }
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </CardContent>
                        </CardActionArea>
                    </Card>
                </Grid>

                {/* Top Application Programs */}
                <Grid item md={6} xs={12}>
                    <Card sx={{ height: 500 }}>
                        <CardContent
                            sx={{
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column'
                            }}
                        >
                            <Box alignItems="center" display="flex" mb={2}>
                                <TrendingUp sx={{ mr: 1 }} />
                                <Typography variant="h6">
                                    {t('Most Popular Programs', {
                                        ns: 'common'
                                    })}
                                </Typography>
                            </Box>
                            <Divider sx={{ mb: 2 }} />
                            <TableContainer
                                sx={{ flexGrow: 1, overflow: 'auto' }}
                            >
                                <Table size="small" stickyHeader>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>
                                                {t('Program', {
                                                    ns: 'common'
                                                })}
                                            </TableCell>
                                            <TableCell>
                                                {t('School', {
                                                    ns: 'common'
                                                })}
                                            </TableCell>
                                            <TableCell align="right">
                                                {t('Total Apps', {
                                                    ns: 'common'
                                                })}
                                            </TableCell>
                                            <TableCell align="right">
                                                {t('Submitted', {
                                                    ns: 'common'
                                                })}
                                            </TableCell>
                                            <TableCell align="right">
                                                <Tooltip
                                                    title={t(
                                                        'Admissions / Submitted Applications',
                                                        { ns: 'common' }
                                                    )}
                                                >
                                                    <span>
                                                        {t('Admission Rate', {
                                                            ns: 'common'
                                                        })}
                                                    </span>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {overview.topApplicationPrograms.map(
                                            (program, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>
                                                        <Link
                                                            component={LinkDom}
                                                            to={`${DEMO.SINGLE_PROGRAM_LINK(program.programId)}`}
                                                            underline="hover"
                                                        >
                                                            {
                                                                program.program_name
                                                            }
                                                        </Link>
                                                        <Typography
                                                            color="textSecondary"
                                                            display="block"
                                                            variant="caption"
                                                        >
                                                            {program.degree} -{' '}
                                                            {program.semester}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        {program.school}
                                                        <Typography
                                                            color="textSecondary"
                                                            display="block"
                                                            variant="caption"
                                                        >
                                                            {program.country}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        {
                                                            program.totalApplications
                                                        }
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Typography fontWeight="bold">
                                                            {
                                                                program.submittedCount
                                                            }
                                                        </Typography>
                                                        <Typography
                                                            color="textSecondary"
                                                            display="block"
                                                            variant="caption"
                                                        >
                                                            {
                                                                program.admittedCount
                                                            }
                                                            ✓{' '}
                                                            {
                                                                program.rejectedCount
                                                            }
                                                            ✗{' '}
                                                            {
                                                                program.pendingCount
                                                            }
                                                            ⏳
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Chip
                                                            color={
                                                                program.admissionRate >=
                                                                50
                                                                    ? 'success'
                                                                    : program.admissionRate >=
                                                                        30
                                                                      ? 'warning'
                                                                      : 'error'
                                                            }
                                                            label={`${program.admissionRate.toFixed(1)}%`}
                                                            size="small"
                                                        />
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

            {/* Additional Insights Section */}
            {(overview.bySubject.length > 0 ||
                overview.bySchoolType.length > 0 ||
                (overview.topContributors &&
                    overview.topContributors.length > 0)) && (
                <>
                    <Typography gutterBottom sx={{ mt: 4, mb: 3 }} variant="h5">
                        {t('Additional Insights', { ns: 'common' })}
                    </Typography>
                    <Grid container mb={4} spacing={3}>
                        {/* Programs by Subject */}
                        {overview.bySubject.length > 0 && (
                            <Grid item md={6} xs={12}>
                                <Card
                                    onClick={() =>
                                        navigate(
                                            '/programs/distribution/subject'
                                        )
                                    }
                                    sx={{ height: 450, cursor: 'pointer' }}
                                >
                                    <CardActionArea sx={{ height: '100%' }}>
                                        <CardContent
                                            sx={{
                                                height: '100%',
                                                display: 'flex',
                                                flexDirection: 'column'
                                            }}
                                        >
                                            <Box
                                                alignItems="center"
                                                display="flex"
                                                justifyContent="space-between"
                                                mb={2}
                                            >
                                                <Box
                                                    alignItems="center"
                                                    display="flex"
                                                >
                                                    <Category sx={{ mr: 1 }} />
                                                    <Typography variant="h6">
                                                        {t(
                                                            'Top Program Subjects',
                                                            {
                                                                ns: 'common'
                                                            }
                                                        )}
                                                    </Typography>
                                                </Box>
                                                <Chip
                                                    label={t(
                                                        'Click for details',
                                                        { ns: 'common' }
                                                    )}
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            </Box>
                                            <Divider sx={{ mb: 2 }} />
                                            <Box
                                                sx={{
                                                    flexGrow: 1,
                                                    overflow: 'auto'
                                                }}
                                            >
                                                <List dense>
                                                    {overview.bySubject.map(
                                                        (item, index) => (
                                                            <ListItem
                                                                key={index}
                                                            >
                                                                <ListItemText
                                                                    primary={
                                                                        <Box
                                                                            alignItems="center"
                                                                            display="flex"
                                                                            justifyContent="space-between"
                                                                        >
                                                                            <Typography>
                                                                                {
                                                                                    item.subject
                                                                                }
                                                                            </Typography>
                                                                            <Chip
                                                                                color="info"
                                                                                label={
                                                                                    item.count
                                                                                }
                                                                                size="small"
                                                                            />
                                                                        </Box>
                                                                    }
                                                                    secondary={
                                                                        <LinearProgress
                                                                            color="info"
                                                                            sx={{
                                                                                mt: 1
                                                                            }}
                                                                            value={
                                                                                (item.count /
                                                                                    Math.max(
                                                                                        ...overview.bySubject.map(
                                                                                            (
                                                                                                s
                                                                                            ) =>
                                                                                                s.count
                                                                                        )
                                                                                    )) *
                                                                                100
                                                                            }
                                                                            variant="determinate"
                                                                        />
                                                                    }
                                                                />
                                                            </ListItem>
                                                        )
                                                    )}
                                                </List>
                                            </Box>
                                        </CardContent>
                                    </CardActionArea>
                                </Card>
                            </Grid>
                        )}

                        {/* School Type Distribution */}
                        {overview.bySchoolType.length > 0 && (
                            <Grid item md={6} xs={12}>
                                <Card sx={{ height: 450 }}>
                                    <CardContent
                                        sx={{
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column'
                                        }}
                                    >
                                        <Box
                                            alignItems="center"
                                            display="flex"
                                            mb={2}
                                        >
                                            <School sx={{ mr: 1 }} />
                                            <Typography variant="h6">
                                                {t('School Type Distribution', {
                                                    ns: 'common'
                                                })}
                                            </Typography>
                                        </Box>
                                        <Divider sx={{ mb: 2 }} />
                                        <TableContainer
                                            sx={{
                                                flexGrow: 1,
                                                overflow: 'auto'
                                            }}
                                        >
                                            <Table size="small">
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell>
                                                            {t('School Type', {
                                                                ns: 'common'
                                                            })}
                                                        </TableCell>
                                                        <TableCell>
                                                            {t('Private', {
                                                                ns: 'common'
                                                            })}
                                                        </TableCell>
                                                        <TableCell>
                                                            {t('Partner', {
                                                                ns: 'common'
                                                            })}
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            {t('Count', {
                                                                ns: 'common'
                                                            })}
                                                        </TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {overview.bySchoolType.map(
                                                        (type, index) => (
                                                            <TableRow
                                                                key={index}
                                                            >
                                                                <TableCell>
                                                                    {type.schoolType ||
                                                                        '-'}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {type.isPrivateSchool
                                                                        ? '✓'
                                                                        : '✗'}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {type.isPartnerSchool
                                                                        ? '✓'
                                                                        : '✗'}
                                                                </TableCell>
                                                                <TableCell align="right">
                                                                    {type.count}
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
                        )}

                        {/* Top Contributors */}
                        {overview.topContributors &&
                            overview.topContributors.length > 0 && (
                                <Grid item md={6} xs={12}>
                                    <Card sx={{ height: 450 }}>
                                        <CardContent
                                            sx={{
                                                height: '100%',
                                                display: 'flex',
                                                flexDirection: 'column'
                                            }}
                                        >
                                            <Box
                                                alignItems="center"
                                                display="flex"
                                                mb={2}
                                            >
                                                <Person sx={{ mr: 1 }} />
                                                <Typography variant="h6">
                                                    {t('Top Contributors', {
                                                        ns: 'common'
                                                    })}
                                                </Typography>
                                            </Box>
                                            <Divider sx={{ mb: 2 }} />
                                            <Box
                                                sx={{
                                                    flexGrow: 1,
                                                    overflow: 'auto'
                                                }}
                                            >
                                                <List dense>
                                                    {overview.topContributors.map(
                                                        (
                                                            contributor,
                                                            index
                                                        ) => (
                                                            <ListItem
                                                                key={index}
                                                            >
                                                                <ListItemText
                                                                    primary={
                                                                        <Box
                                                                            alignItems="center"
                                                                            display="flex"
                                                                            justifyContent="space-between"
                                                                        >
                                                                            <Box>
                                                                                <Typography>
                                                                                    {
                                                                                        contributor.contributor
                                                                                    }
                                                                                </Typography>
                                                                                <Typography
                                                                                    color="textSecondary"
                                                                                    variant="caption"
                                                                                >
                                                                                    {t(
                                                                                        'Last update',
                                                                                        {
                                                                                            ns: 'common'
                                                                                        }
                                                                                    )}
                                                                                    :{' '}
                                                                                    {new Date(
                                                                                        contributor.lastUpdate
                                                                                    ).toLocaleDateString()}
                                                                                </Typography>
                                                                            </Box>
                                                                            <Chip
                                                                                color="warning"
                                                                                label={`${contributor.updateCount} ${t('updates', { ns: 'common' })}`}
                                                                                size="small"
                                                                            />
                                                                        </Box>
                                                                    }
                                                                    secondary={
                                                                        <LinearProgress
                                                                            color="warning"
                                                                            sx={{
                                                                                mt: 1
                                                                            }}
                                                                            value={
                                                                                (contributor.updateCount /
                                                                                    Math.max(
                                                                                        ...overview.topContributors.map(
                                                                                            (
                                                                                                c
                                                                                            ) =>
                                                                                                c.updateCount
                                                                                        )
                                                                                    )) *
                                                                                100
                                                                            }
                                                                            variant="determinate"
                                                                        />
                                                                    }
                                                                />
                                                            </ListItem>
                                                        )
                                                    )}
                                                </List>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            )}
                    </Grid>
                </>
            )}

            {/* Recent Activity Section */}
            {overview.recentlyUpdated.length > 0 && (
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
                                                {overview.recentlyUpdated.map(
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
