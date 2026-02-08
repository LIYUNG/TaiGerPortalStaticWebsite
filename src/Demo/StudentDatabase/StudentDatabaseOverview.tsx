import React from 'react';
import { Link as LinkDom, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Box,
    Breadcrumbs,
    Card,
    CardContent,
    Chip,
    Divider,
    Grid,
    Link,
    LinearProgress,
    List,
    ListItem,
    ListItemText,
    Typography
} from '@mui/material';
import { School, Language, CalendarToday, Category } from '@mui/icons-material';
import { is_TaiGer_role } from '@taiger-common/core';
import { useQuery } from '@tanstack/react-query';

import { TabTitle } from '../Utils/TabTitle';
import DEMO from '../../store/constant';
import { useAuth } from '../../components/AuthProvider';
import { appConfig } from '../../config';
import { getUsersOverviewQuery } from '../../api/query';
import Loading from '../../components/Loading/Loading';
import ErrorPage from '../Utils/ErrorPage';

const StudentDatabaseOverview = () => {
    const { user } = useAuth();
    const { t } = useTranslation();

    const { data, isLoading, isError, error } = useQuery(
        getUsersOverviewQuery()
    );
    const overview = data?.data;

    TabTitle(t('Student Database Overview', { ns: 'common' }));

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

    const totalStudents =
        overview.byRole?.find((r) => r.role === 'Student')?.count || 0;

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
                    to={DEMO.STUDENT_DATABASE_LINK}
                    underline="hover"
                >
                    {t('Student Database', { ns: 'common' })}
                </Link>
                <Typography color="text.primary">
                    {t('Overview', { ns: 'common' })}
                </Typography>
            </Breadcrumbs>

            {/* Title Section */}
            <Box mb={3} mt={3}>
                <Typography gutterBottom variant="h4">
                    <School sx={{ mr: 1, verticalAlign: 'middle' }} />
                    {t('Student Database Overview', { ns: 'common' })}
                </Typography>
                <Typography color="textSecondary" variant="body2">
                    {t(
                        'Comprehensive insights into student backgrounds and university distribution',
                        { ns: 'common' }
                    )}
                </Typography>
            </Box>

            {/* Distribution Analysis Section */}
            <Typography gutterBottom sx={{ mt: 4, mb: 3 }} variant="h5">
                {t('Distribution Analysis', { ns: 'common' })}
            </Typography>
            <Grid container mb={4} spacing={3}>
                {/* Students by Target Degree */}
                {overview.byTargetDegree &&
                    overview.byTargetDegree.length > 0 && (
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
                                            {t('Students by Target Degree', {
                                                ns: 'common'
                                            })}
                                        </Typography>
                                    </Box>
                                    <Divider sx={{ mb: 2 }} />
                                    <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                                        <List dense>
                                            {overview.byTargetDegree
                                                .slice(0, 10)
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
                                                                            item.degree
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
                                                                    sx={{
                                                                        mt: 1
                                                                    }}
                                                                    value={
                                                                        (item.count /
                                                                            totalStudents) *
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
                            </Card>
                        </Grid>
                    )}

                {/* Students by Application Semester */}
                {overview.byApplicationSemester &&
                    overview.byApplicationSemester.length > 0 && (
                        <Grid item md={3} sm={6} xs={12}>
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
                                        <CalendarToday sx={{ mr: 1 }} />
                                        <Typography variant="h6">
                                            {t('By Application Semester', {
                                                ns: 'common'
                                            })}
                                        </Typography>
                                    </Box>
                                    <Divider sx={{ mb: 2 }} />
                                    <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                                        <List dense>
                                            {overview.byApplicationSemester.map(
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
                                                                            item.semester
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
                                                                    sx={{
                                                                        mt: 1
                                                                    }}
                                                                    value={
                                                                        (item.count /
                                                                            totalStudents) *
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

                {/* Students by Program Language */}
                {overview.byProgramLanguage &&
                    overview.byProgramLanguage.length > 0 && (
                        <Grid item md={3} sm={6} xs={12}>
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
                                        <Language sx={{ mr: 1 }} />
                                        <Typography variant="h6">
                                            {t('By Program Language', {
                                                ns: 'common'
                                            })}
                                        </Typography>
                                    </Box>
                                    <Divider sx={{ mb: 2 }} />
                                    <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                                        <List dense>
                                            {overview.byProgramLanguage.map(
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
                                                                    sx={{
                                                                        mt: 1
                                                                    }}
                                                                    value={
                                                                        (item.count /
                                                                            totalStudents) *
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

            {/* Additional Insights Section */}
            {(overview.byTargetField && overview.byTargetField.length > 0) ||
            (overview.byUniversity && overview.byUniversity.length > 0) ? (
                <>
                    <Typography gutterBottom sx={{ mt: 4, mb: 3 }} variant="h5">
                        {t('Additional Insights', { ns: 'common' })}
                    </Typography>
                    <Grid container mb={4} spacing={3}>
                        {/* Students by Target Field */}
                        {overview.byTargetField &&
                            overview.byTargetField.length > 0 && (
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
                                                <Category sx={{ mr: 1 }} />
                                                <Typography variant="h6">
                                                    {t(
                                                        'Students by Target Field',
                                                        {
                                                            ns: 'common'
                                                        }
                                                    )}
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
                                                    {overview.byTargetField.map(
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
                                                                                    item.field
                                                                                }
                                                                            </Typography>
                                                                            <Chip
                                                                                color="warning"
                                                                                label={
                                                                                    item.count
                                                                                }
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
                                                                                (item.count /
                                                                                    totalStudents) *
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

                        {/* University Distribution */}
                        {overview.byUniversity &&
                            overview.byUniversity.length > 0 && (
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
                                                    {t(
                                                        'Students by University',
                                                        {
                                                            ns: 'common'
                                                        }
                                                    )}
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
                                                    {overview.byUniversity.map(
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
                                                                                    item.university
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
                                                                                    totalStudents) *
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
            ) : (
                /* University Distribution (if no target field) */
                overview.byUniversity &&
                overview.byUniversity.length > 0 && (
                    <>
                        <Typography
                            gutterBottom
                            sx={{ mt: 4, mb: 3 }}
                            variant="h5"
                        >
                            {t('University Distribution', { ns: 'common' })}
                        </Typography>
                        <Box sx={{ mb: 4 }}>
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
                                            {t('Students by University', {
                                                ns: 'common'
                                            })}
                                        </Typography>
                                    </Box>
                                    <Divider sx={{ mb: 2 }} />
                                    <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                                        <List dense>
                                            {overview.byUniversity.map(
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
                                                                            item.university
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
                                                                            totalStudents) *
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
                        </Box>
                    </>
                )
            )}
        </Box>
    );
};

export default StudentDatabaseOverview;
