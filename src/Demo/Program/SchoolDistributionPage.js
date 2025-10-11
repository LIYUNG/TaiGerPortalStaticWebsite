import React, { useState } from 'react';
import { Link as LinkDom, Navigate, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Box,
    Breadcrumbs,
    Button,
    Card,
    CardContent,
    Chip,
    LinearProgress,
    Link,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    TextField,
    Typography,
    InputAdornment
} from '@mui/material';
import { ArrowBack, School, Search } from '@mui/icons-material';
import { is_TaiGer_role } from '@taiger-common/core';
import { useQuery } from '@tanstack/react-query';

import { TabTitle } from '../Utils/TabTitle';
import DEMO from '../../store/constant';
import { useAuth } from '../../components/AuthProvider';
import { appConfig } from '../../config';
import { getProgramsOverviewQuery } from '../../api/query';
import Loading from '../../components/Loading/Loading';
import ErrorPage from '../Utils/ErrorPage';

const SchoolDistributionPage = () => {
    const { user } = useAuth();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');

    const { data, isLoading, isError, error } = useQuery(
        getProgramsOverviewQuery(true) // Pass true to include all schools
    );
    const overview = data?.data;

    TabTitle(t('Schools Distribution', { ns: 'common' }));

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

    // Get all schools (already sorted by program count from backend)
    const allSchools = overview.schools || [];
    const maxCount = Math.max(...allSchools.map((s) => s.programCount), 1);

    // Filter schools based on search term
    const filteredSchools = allSchools.filter(
        (school) =>
            school.school.toLowerCase().includes(searchTerm.toLowerCase()) ||
            school.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (school.city &&
                school.city.toLowerCase().includes(searchTerm.toLowerCase()))
    );

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
                    mb={2}
                >
                    <Box>
                        <Typography gutterBottom variant="h4">
                            <School sx={{ mr: 1, verticalAlign: 'middle' }} />
                            {t('Schools Distribution', { ns: 'common' })}
                        </Typography>
                        <Typography color="textSecondary" variant="body2">
                            {t('Top schools ranked by program count', {
                                ns: 'common'
                            })}{' '}
                            • {t('Total', { ns: 'common' })}:{' '}
                            {overview.totalSchools}{' '}
                            {t('universities', { ns: 'common' })}
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

                {/* Search Bar */}
                <TextField
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search />
                            </InputAdornment>
                        )
                    }}
                    fullWidth
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={t('Search schools, countries, or cities...', {
                        ns: 'common'
                    })}
                    sx={{ mb: 2 }}
                    value={searchTerm}
                />
            </Box>

            {/* Schools List */}
            <Card>
                <CardContent>
                    <Typography
                        color="textSecondary"
                        gutterBottom
                        variant="body2"
                    >
                        {t('Showing', { ns: 'common' })}{' '}
                        {filteredSchools.length} {t('of', { ns: 'common' })}{' '}
                        {allSchools.length} {t('schools', { ns: 'common' })}
                    </Typography>
                    <List>
                        {filteredSchools.map((school, index) => {
                            const percentage = (
                                (school.programCount / overview.totalPrograms) *
                                100
                            ).toFixed(1);
                            const relativePercentage =
                                (school.programCount / maxCount) * 100;

                            return (
                                <ListItem disablePadding key={index}>
                                    <ListItemButton
                                        sx={{
                                            borderBottom:
                                                index <
                                                filteredSchools.length - 1
                                                    ? '1px solid rgba(0,0,0,0.12)'
                                                    : 'none',
                                            py: 2
                                        }}
                                    >
                                        <ListItemText
                                            primary={
                                                <Box
                                                    alignItems="center"
                                                    display="flex"
                                                    justifyContent="space-between"
                                                    mb={1}
                                                >
                                                    <Box>
                                                        <Typography variant="h6">
                                                            {school.school}
                                                        </Typography>
                                                        <Typography
                                                            color="textSecondary"
                                                            variant="caption"
                                                        >
                                                            {school.city &&
                                                                `${school.city}, `}
                                                            {school.country} •{' '}
                                                            {percentage}%{' '}
                                                            {t('of catalog', {
                                                                ns: 'common'
                                                            })}
                                                        </Typography>
                                                    </Box>
                                                    <Chip
                                                        color="secondary"
                                                        label={`${school.programCount} ${t('programs', { ns: 'common' })}`}
                                                        size="medium"
                                                    />
                                                </Box>
                                            }
                                            secondary={
                                                <LinearProgress
                                                    color="secondary"
                                                    sx={{
                                                        height: 8,
                                                        borderRadius: 1
                                                    }}
                                                    value={relativePercentage}
                                                    variant="determinate"
                                                />
                                            }
                                        />
                                    </ListItemButton>
                                </ListItem>
                            );
                        })}
                    </List>

                    {filteredSchools.length === 0 && (
                        <Box py={4} textAlign="center">
                            <Typography color="textSecondary">
                                {t('No schools found matching your search', {
                                    ns: 'common'
                                })}
                            </Typography>
                        </Box>
                    )}
                </CardContent>
            </Card>
        </Box>
    );
};

export default SchoolDistributionPage;
