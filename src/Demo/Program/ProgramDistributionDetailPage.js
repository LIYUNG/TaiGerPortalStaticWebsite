import React from 'react';
import {
    Link as LinkDom,
    Navigate,
    useParams,
    useNavigate
} from 'react-router-dom';
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
    Typography
} from '@mui/material';
import {
    ArrowBack,
    Public,
    School,
    Language,
    Category
} from '@mui/icons-material';
import { is_TaiGer_role } from '@taiger-common/core';
import { useQuery } from '@tanstack/react-query';

import { TabTitle } from '../Utils/TabTitle';
import DEMO from '../../store/constant';
import { useAuth } from '../../components/AuthProvider';
import { appConfig } from '../../config';
import { getProgramsOverviewQuery } from '../../api/query';
import Loading from '../../components/Loading/Loading';
import ErrorPage from '../Utils/ErrorPage';

const DISTRIBUTION_TYPES = {
    country: {
        icon: Public,
        title: 'Programs by Country',
        dataKey: 'byCountry',
        itemKey: 'country',
        color: 'primary'
    },
    degree: {
        icon: School,
        title: 'Programs by Degree',
        dataKey: 'byDegree',
        itemKey: 'degree',
        color: 'secondary'
    },
    language: {
        icon: Language,
        title: 'Programs by Language',
        dataKey: 'byLanguage',
        itemKey: 'language',
        color: 'success'
    },
    subject: {
        icon: Category,
        title: 'Programs by Subject',
        dataKey: 'bySubject',
        itemKey: 'subject',
        color: 'info'
    }
};

const ProgramDistributionDetailPage = () => {
    const { distributionType } = useParams();
    const { user } = useAuth();
    const { t } = useTranslation();
    const navigate = useNavigate();

    const { data, isLoading, isError, error } = useQuery(
        getProgramsOverviewQuery()
    );
    const overview = data?.data;

    const config = DISTRIBUTION_TYPES[distributionType];
    const Icon = config?.icon || Public;

    TabTitle(t(config?.title || 'Program Distribution', { ns: 'common' }));

    if (!is_TaiGer_role(user)) {
        return <Navigate to={`${DEMO.DASHBOARD_LINK}`} />;
    }

    if (!config) {
        return <Navigate to={DEMO.PROGRAMS_OVERVIEW} />;
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

    const distributionData = overview[config.dataKey] || [];
    const maxCount = Math.max(...distributionData.map((item) => item.count));

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
                    {t(config.title, { ns: 'common' })}
                </Typography>
            </Breadcrumbs>

            {/* Title Section */}
            <Box mb={3} mt={3}>
                <Box
                    alignItems="center"
                    display="flex"
                    justifyContent="space-between"
                >
                    <Box>
                        <Typography gutterBottom variant="h4">
                            <Icon sx={{ mr: 1, verticalAlign: 'middle' }} />
                            {t(config.title, { ns: 'common' })}
                        </Typography>
                        <Typography color="textSecondary" variant="body2">
                            {t('Showing all {count} items', {
                                ns: 'common',
                                count: distributionData.length
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
            </Box>

            {/* Distribution List */}
            <Card>
                <CardContent>
                    <List>
                        {distributionData.map((item, index) => {
                            const percentage = (
                                (item.count / overview.totalPrograms) *
                                100
                            ).toFixed(1);
                            const relativePercentage =
                                (item.count / maxCount) * 100;

                            return (
                                <ListItem disablePadding key={index}>
                                    <ListItemButton
                                        sx={{
                                            borderBottom:
                                                index <
                                                distributionData.length - 1
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
                                                            {
                                                                item[
                                                                    config
                                                                        .itemKey
                                                                ]
                                                            }
                                                        </Typography>
                                                        <Typography
                                                            color="textSecondary"
                                                            variant="caption"
                                                        >
                                                            {percentage}%{' '}
                                                            {t(
                                                                'of total programs',
                                                                { ns: 'common' }
                                                            )}
                                                        </Typography>
                                                    </Box>
                                                    <Chip
                                                        color={config.color}
                                                        label={`${item.count} ${t('programs', { ns: 'common' })}`}
                                                        size="medium"
                                                    />
                                                </Box>
                                            }
                                            secondary={
                                                <LinearProgress
                                                    color={config.color}
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
                </CardContent>
            </Card>
        </Box>
    );
};

export default ProgramDistributionDetailPage;
