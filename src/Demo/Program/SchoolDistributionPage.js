import React, { useState, useMemo } from 'react';
import { Link as LinkDom, Navigate, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Box,
    Breadcrumbs,
    Button,
    Card,
    CardContent,
    Chip,
    FormControl,
    Grid,
    InputLabel,
    Link,
    MenuItem,
    Paper,
    Select,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    TextField,
    Typography,
    InputAdornment
} from '@mui/material';
import { ArrowBack, School, Search, Public } from '@mui/icons-material';
import { is_TaiGer_role } from '@taiger-common/core';
import { useQuery } from '@tanstack/react-query';

import { TabTitle } from '../Utils/TabTitle';
import DEMO from '../../store/constant';
import { useAuth } from '../../components/AuthProvider';
import { appConfig } from '../../config';
import {
    getSchoolsDistributionQuery,
    getProgramsOverviewQuery
} from '../../api/query';
import Loading from '../../components/Loading/Loading';
import ErrorPage from '../Utils/ErrorPage';

const SchoolDistributionPage = () => {
    const { user } = useAuth();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(25);
    const [filterCountry, setFilterCountry] = useState('all');

    // Fetch all schools from dedicated endpoint
    const {
        data: schoolsData,
        isLoading: schoolsLoading,
        isError: schoolsError,
        error: schoolsErrorMsg
    } = useQuery(getSchoolsDistributionQuery());

    // Fetch overview for totalPrograms and totalSchools
    const { data: overviewData, isLoading: overviewLoading } = useQuery(
        getProgramsOverviewQuery()
    );

    const allSchools = schoolsData?.data || [];
    const overview = overviewData?.data;

    // All hooks must be called before any conditional returns
    // Get unique countries for filter
    const countries = useMemo(() => {
        const uniqueCountries = [
            ...new Set(allSchools.map((s) => s.country).filter(Boolean))
        ];
        return uniqueCountries.sort();
    }, [allSchools]);

    // Filter and search schools
    const filteredSchools = useMemo(() => {
        return allSchools.filter((school) => {
            const matchesSearch =
                (school.school || '')
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                (school.country || '')
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                (school.city || '')
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase());

            const matchesCountry =
                filterCountry === 'all' || school.country === filterCountry;

            return matchesSearch && matchesCountry;
        });
    }, [allSchools, searchTerm, filterCountry]);

    // Paginated schools
    const paginatedSchools = useMemo(() => {
        return filteredSchools.slice(
            page * rowsPerPage,
            page * rowsPerPage + rowsPerPage
        );
    }, [filteredSchools, page, rowsPerPage]);

    const maxCount = useMemo(
        () => Math.max(...allSchools.map((s) => s.programCount), 1),
        [allSchools]
    );

    const totalPrograms = useMemo(
        () => filteredSchools.reduce((sum, s) => sum + s.programCount, 0),
        [filteredSchools]
    );

    TabTitle(t('Schools Distribution', { ns: 'common' }));

    // Conditional returns AFTER all hooks
    if (!is_TaiGer_role(user)) {
        return <Navigate to={`${DEMO.DASHBOARD_LINK}`} />;
    }

    if (schoolsLoading || overviewLoading) {
        return <Loading />;
    }

    if (schoolsError) {
        return <ErrorPage error={schoolsErrorMsg} />;
    }

    if (!overview || allSchools.length === 0) {
        return null;
    }

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

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
                <Link
                    color="inherit"
                    component={LinkDom}
                    to={DEMO.PROGRAMS_OVERVIEW}
                    underline="hover"
                >
                    {t('Programs Overview', { ns: 'common' })}
                </Link>
                <Typography color="text.primary">
                    {t('Schools Distribution', { ns: 'common' })}
                </Typography>
            </Breadcrumbs>

            {/* Title Section */}
            <Box mb={3} mt={3}>
                <Box
                    alignItems="center"
                    display="flex"
                    justifyContent="space-between"
                    mb={3}
                >
                    <Box>
                        <Typography gutterBottom variant="h4">
                            <School sx={{ mr: 1, verticalAlign: 'middle' }} />
                            {t('Schools Distribution', { ns: 'common' })}
                        </Typography>
                        <Typography color="textSecondary" variant="body2">
                            {t('Comprehensive list of all universities', {
                                ns: 'common'
                            })}
                        </Typography>
                    </Box>
                    <Button
                        onClick={() => navigate(DEMO.PROGRAMS_OVERVIEW)}
                        startIcon={<ArrowBack />}
                        variant="outlined"
                    >
                        {t('Back to Overview', { ns: 'common' })}
                    </Button>
                </Box>

                {/* Summary Stats */}
                <Grid container mb={3} spacing={2}>
                    <Grid item sm={4} xs={12}>
                        <Card>
                            <CardContent>
                                <Typography
                                    color="textSecondary"
                                    variant="body2"
                                >
                                    {t('Total Universities', { ns: 'common' })}
                                </Typography>
                                <Typography variant="h4">
                                    {overview.totalSchools}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item sm={4} xs={12}>
                        <Card>
                            <CardContent>
                                <Typography
                                    color="textSecondary"
                                    variant="body2"
                                >
                                    {t('Total Programs', { ns: 'common' })}
                                </Typography>
                                <Typography variant="h4">
                                    {overview.totalPrograms}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item sm={4} xs={12}>
                        <Card>
                            <CardContent>
                                <Typography
                                    color="textSecondary"
                                    variant="body2"
                                >
                                    {t('Avg Programs per School', {
                                        ns: 'common'
                                    })}
                                </Typography>
                                <Typography variant="h4">
                                    {(
                                        overview.totalPrograms /
                                        overview.totalSchools
                                    ).toFixed(1)}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Filters */}
                <Grid container spacing={2}>
                    <Grid item md={8} xs={12}>
                        <TextField
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search />
                                    </InputAdornment>
                                )
                            }}
                            fullWidth
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setPage(0);
                            }}
                            placeholder={t(
                                'Search schools, countries, or cities...',
                                { ns: 'common' }
                            )}
                            value={searchTerm}
                        />
                    </Grid>
                    <Grid item md={4} xs={12}>
                        <FormControl fullWidth>
                            <InputLabel>
                                {t('Filter by Country', { ns: 'common' })}
                            </InputLabel>
                            <Select
                                label={t('Filter by Country', { ns: 'common' })}
                                onChange={(e) => {
                                    setFilterCountry(e.target.value);
                                    setPage(0);
                                }}
                                startAdornment={
                                    <InputAdornment position="start">
                                        <Public sx={{ ml: 1 }} />
                                    </InputAdornment>
                                }
                                value={filterCountry}
                            >
                                <MenuItem value="all">
                                    {t('All Countries', { ns: 'common' })}
                                </MenuItem>
                                {countries.map((country) => (
                                    <MenuItem key={country} value={country}>
                                        {country}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </Box>

            {/* Schools Table */}
            <Card>
                <CardContent>
                    <Box
                        alignItems="center"
                        display="flex"
                        justifyContent="space-between"
                        mb={2}
                    >
                        <Typography color="textSecondary" variant="body2">
                            {t('Showing', { ns: 'common' })}{' '}
                            {filteredSchools.length}{' '}
                            {t('schools', { ns: 'common' })}
                            {filterCountry !== 'all' &&
                                ` ${t('in', { ns: 'common' })} ${filterCountry}`}
                            {' • '}
                            {totalPrograms}{' '}
                            {t('total programs', { ns: 'common' })}
                        </Typography>
                    </Box>

                    {filteredSchools.length === 0 ? (
                        <Box py={4} textAlign="center">
                            <Typography color="textSecondary">
                                {t('No schools found matching your criteria', {
                                    ns: 'common'
                                })}
                            </Typography>
                        </Box>
                    ) : (
                        <>
                            <TableContainer component={Paper}>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>
                                                {t('Rank', { ns: 'common' })}
                                            </TableCell>
                                            <TableCell>
                                                {t('School', { ns: 'common' })}
                                            </TableCell>
                                            <TableCell>
                                                {t('Location', {
                                                    ns: 'common'
                                                })}
                                            </TableCell>
                                            <TableCell align="right">
                                                {t('Programs', {
                                                    ns: 'common'
                                                })}
                                            </TableCell>
                                            <TableCell align="right">
                                                {t('% of Catalog', {
                                                    ns: 'common'
                                                })}
                                            </TableCell>
                                            <TableCell align="center">
                                                {t('Distribution', {
                                                    ns: 'common'
                                                })}
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {paginatedSchools.map(
                                            (school, index) => {
                                                const globalRank =
                                                    page * rowsPerPage +
                                                    index +
                                                    1;
                                                const percentage = (
                                                    (school.programCount /
                                                        overview.totalPrograms) *
                                                    100
                                                ).toFixed(1);
                                                const relativePercentage =
                                                    (school.programCount /
                                                        maxCount) *
                                                    100;

                                                return (
                                                    <TableRow hover key={index}>
                                                        <TableCell>
                                                            <Chip
                                                                label={
                                                                    globalRank
                                                                }
                                                                size="small"
                                                                variant="outlined"
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography
                                                                fontWeight="medium"
                                                                variant="body1"
                                                            >
                                                                {school.school}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Box>
                                                                <Typography variant="body2">
                                                                    {
                                                                        school.country
                                                                    }
                                                                </Typography>
                                                                {school.city && (
                                                                    <Typography
                                                                        color="textSecondary"
                                                                        variant="caption"
                                                                    >
                                                                        {
                                                                            school.city
                                                                        }
                                                                    </Typography>
                                                                )}
                                                            </Box>
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            <Chip
                                                                color="primary"
                                                                label={
                                                                    school.programCount
                                                                }
                                                                size="small"
                                                            />
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            <Typography variant="body2">
                                                                {percentage}%
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Box
                                                                sx={{
                                                                    width: 100
                                                                }}
                                                            >
                                                                <Box
                                                                    alignItems="center"
                                                                    display="flex"
                                                                >
                                                                    <Box
                                                                        sx={{
                                                                            width: '100%',
                                                                            mr: 1
                                                                        }}
                                                                    >
                                                                        <Box
                                                                            sx={{
                                                                                height: 8,
                                                                                borderRadius: 1,
                                                                                bgcolor:
                                                                                    'primary.main',
                                                                                width: `${relativePercentage}%`,
                                                                                minWidth:
                                                                                    '2%'
                                                                            }}
                                                                        />
                                                                    </Box>
                                                                </Box>
                                                            </Box>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            }
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <TablePagination
                                component="div"
                                count={filteredSchools.length}
                                onPageChange={handleChangePage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                                page={page}
                                rowsPerPage={rowsPerPage}
                                rowsPerPageOptions={[10, 25, 50, 100]}
                            />
                        </>
                    )}
                </CardContent>
            </Card>
        </Box>
    );
};

export default SchoolDistributionPage;
