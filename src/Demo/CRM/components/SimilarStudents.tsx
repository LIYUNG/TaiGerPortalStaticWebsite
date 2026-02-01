import React, { useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Typography,
    Chip,
    Link,
    Divider,
    Skeleton,
    IconButton,
    Tooltip,
    CircularProgress
} from '@mui/material';
import {
    School as SchoolIcon,
    Person as PersonIcon,
    CheckCircle,
    Cancel,
    NavigateNext as NavigateNextIcon,
    NavigateBefore as NavigateBeforeIcon,
    Replay as ReplayIcon
} from '@mui/icons-material';

import { request } from '../../../api/request';
import DEMO from '../../../store/constant';

const { STUDENT_DATABASE_STUDENTID_LINK, SINGLE_PROGRAM_LINK } = DEMO;

// Extracted student card component for better organization
const StudentCard = ({ student, matchReason }) => {
    const { t } = useTranslation();
    const [expanded, setExpanded] = React.useState(false);

    const sortedApplications = useMemo(() => {
        return (student?.applications || [])
            .filter((application) =>
                ['O', 'X'].includes(application?.admission)
            )
            .sort((a, b) => {
                // Sort by finalEnrolment first
                if (a.finalEnrolment && !b.finalEnrolment) return -1;
                if (!a.finalEnrolment && b.finalEnrolment) return 1;

                // Then sort by admission status ('O' > 'X')
                if (a.admission === 'O' && b.admission !== 'O') return -1;
                if (a.admission !== 'O' && b.admission === 'O') return 1;

                return 0;
            });
    }, [student?.applications]);

    return (
        <Box
            sx={{
                p: 1.5,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                backgroundColor: 'background.paper',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                '&:hover': {
                    backgroundColor: 'action.hover',
                    transition: 'background-color 0.2s ease'
                }
            }}
        >
            {/* Student header */}
            <Box
                sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}
            >
                <SchoolIcon color="primary" fontSize="small" />
                <Link
                    href={STUDENT_DATABASE_STUDENTID_LINK(student._id)}
                    rel="noopener noreferrer"
                    sx={{
                        color: 'primary.main',
                        fontWeight: 500,
                        cursor: 'pointer',
                        transition: 'color 0.2s',
                        '&:hover': {
                            color: 'primary.dark',
                            textDecoration: 'underline'
                        },
                        px: 0.1,
                        py: 0.1,
                        display: 'inline-flex',
                        alignItems: 'center'
                    }}
                    target="_blank"
                    underline="hover"
                >
                    <Typography fontWeight="bold" noWrap variant="body2">
                        {student.firstname} {student.lastname}
                    </Typography>
                </Link>
                {student?.application_preference?.target_degree && (
                    <Chip
                        color="primary"
                        label={student?.application_preference?.target_degree}
                        size="small"
                        sx={{
                            '& .MuiChip-label': {
                                fontSize: '0.7rem',
                                px: 0.8
                            }
                        }}
                        variant="filled"
                    />
                )}
                {(student.application_preference.expected_application_date ||
                    student.application_preference
                        .expected_application_semester) && (
                    <Chip
                        color="primary"
                        label={`${student.application_preference.expected_application_date} ${student.application_preference.expected_application_semester}`}
                        size="small"
                        sx={{
                            '& .MuiChip-label': {
                                fontSize: '0.7rem',
                                px: 0.8
                            }
                        }}
                        variant="outlined"
                    />
                )}
            </Box>

            {/* Match reason */}
            {matchReason && (
                <Box sx={{ mb: 0.8 }}>
                    <Typography
                        color="primary.main"
                        display="block"
                        fontWeight="medium"
                        gutterBottom
                        variant="caption"
                    >
                        {t('common.matchReason', { ns: 'crm' })}
                    </Typography>
                    <Box
                        sx={{
                            p: 0.7,
                            borderLeft: '2px solid',
                            borderColor: 'primary.light',
                            bgcolor: 'primary.lighter',
                            borderRadius: '0 4px 4px 0',
                            fontSize: '0.65rem',
                            lineHeight: 1.2
                        }}
                    >
                        <Typography
                            color="text.primary"
                            display="block"
                            variant="caption"
                        >
                            {matchReason}
                        </Typography>
                    </Box>
                </Box>
            )}

            {/* Student details */}
            <Box sx={{ flex: 1, fontSize: '0.75rem' }}>
                <StudentDetailRow
                    label={t('common.gpa', { ns: 'crm' })}
                    value={student?.academic_background?.university?.My_GPA_Uni}
                />
                <StudentDetailRow
                    label={t('common.school', { ns: 'crm' })}
                    value={
                        student?.academic_background?.university
                            ?.attended_university
                    }
                />
                <StudentDetailRow
                    label={t('common.program', { ns: 'crm' })}
                    value={
                        student?.academic_background?.university
                            ?.attended_university_program
                    }
                />
                <StudentDetailRow
                    label={t('common.targetField', { ns: 'crm' })}
                    value={
                        student?.application_preference
                            ?.target_application_field
                    }
                />
            </Box>

            <Divider sx={{ my: 1 }} />

            {/* Applications section */}
            <Box>
                {(expanded
                    ? sortedApplications
                    : sortedApplications.slice(0, 7)
                ).map((application, index) => (
                    <Box
                        key={index}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            mb:
                                index <
                                (expanded
                                    ? sortedApplications.length - 1
                                    : Math.min(sortedApplications.length, 7) -
                                      1)
                                    ? 1
                                    : 0,
                            fontSize: '0.75rem'
                        }}
                    >
                        <Link
                            href={SINGLE_PROGRAM_LINK(
                                application.programId._id
                            )}
                            rel="noopener noreferrer"
                            sx={{
                                color: 'primary.main',
                                fontWeight: 500,
                                cursor: 'pointer',
                                transition: 'color 0.2s',
                                '&:hover': {
                                    color: 'primary.dark'
                                },
                                px: 0.1,
                                py: 0.1,
                                flex: 1,
                                display: 'inline-flex',
                                alignItems: 'center'
                            }}
                            target="_blank"
                            underline="hover"
                        >
                            <Typography
                                sx={{
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'normal',
                                    wordWrap: 'break-word',
                                    fontSize: '0.7rem',
                                    lineHeight: 1.2
                                }}
                                variant="body2"
                            >
                                <Box component="span" display="block">
                                    {application.programId?.school}
                                </Box>
                                <Box component="span" display="block">
                                    - {application.programId?.program_name}
                                </Box>
                            </Typography>
                        </Link>

                        {application.admission === 'O' ? (
                            <CheckCircle
                                sx={{ color: 'success.main', fontSize: '1rem' }}
                            />
                        ) : (
                            <Cancel
                                sx={{ color: 'error.main', fontSize: '1rem' }}
                            />
                        )}
                    </Box>
                ))}

                {sortedApplications.length > 7 && (
                    <Box
                        onClick={() => setExpanded(!expanded)}
                        sx={{
                            mt: 1,
                            textAlign: 'center',
                            cursor: 'pointer',
                            '&:hover': {
                                color: 'primary.main'
                            },
                            fontSize: '0.7rem',
                            fontWeight: 'medium',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <Typography
                            color="primary"
                            sx={{
                                fontSize: 'inherit',
                                display: 'flex',
                                alignItems: 'center'
                            }}
                        >
                            {expanded
                                ? t('common.showLess', { ns: 'crm' })
                                : t('common.showMore', {
                                      ns: 'crm',
                                      count: sortedApplications.length - 7
                                  })}
                            {expanded ? (
                                <Box
                                    component="span"
                                    sx={{
                                        display: 'inline-flex',
                                        ml: 0.5,
                                        transform: 'rotate(180deg)'
                                    }}
                                >
                                    ▾
                                </Box>
                            ) : (
                                <Box
                                    component="span"
                                    sx={{ display: 'inline-flex', ml: 0.5 }}
                                >
                                    ▾
                                </Box>
                            )}
                        </Typography>
                    </Box>
                )}
            </Box>
        </Box>
    );
};

// Helper component for consistent student detail rows
const StudentDetailRow = ({ label, value }) => {
    const { t } = useTranslation();
    return (
        <Typography
            color="text.secondary"
            display="block"
            gutterBottom
            variant="caption"
        >
            <strong>{label}:</strong> {value || t('common.na', { ns: 'crm' })}
        </Typography>
    );
};

// Loading placeholder for student cards
const StudentCardSkeleton = () => (
    <Box
        sx={{
            p: 1.5,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            height: '100%',
            backgroundColor: 'background.paper',
            display: 'flex',
            flexDirection: 'column',
            minHeight: 360
        }}
    >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Skeleton height={22} variant="circular" width={22} />
            <Skeleton height={24} variant="text" width="70%" />
        </Box>

        {/* Match reason skeleton - moved to the top */}
        <Box sx={{ mb: 1.5 }}>
            <Skeleton height={14} variant="text" width="45%" />
            <Skeleton
                height={40}
                sx={{ mt: 0.5, borderRadius: '0 4px 4px 0' }}
                variant="rectangular"
                width="100%"
            />
        </Box>

        <Skeleton height={18} variant="text" width="90%" />
        <Skeleton height={18} variant="text" width="80%" />
        <Skeleton height={18} variant="text" width="45%" />
        <Skeleton height={18} variant="text" width="70%" />

        <Divider sx={{ my: 1.25 }} />
        {/* Applications list placeholder */}
        {[1, 2, 3, 4, 5].map((i) => (
            <Box
                key={i}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mb: i === 5 ? 0 : 1
                }}
            >
                <Skeleton
                    height={18}
                    sx={{ flex: 1 }}
                    variant="text"
                    width={i % 2 === 0 ? '92%' : '100%'}
                />
                <Skeleton height={16} variant="circular" width={16} />
            </Box>
        ))}
    </Box>
);

const SimilarStudents = ({ leadId, similarUsers = [] }) => {
    // Reference to the scrollable container
    const scrollContainerRef = useRef(null);
    const { t } = useTranslation();
    const defaultErrorCopy = t('common.similarStudentsErrorFallback', {
        ns: 'crm',
        defaultValue:
            'We were unable to load similar students. Please try again later.'
    });
    // Fetch similar students if not provided directly
    const {
        data: similarStudentsData,
        isLoading: isLoadingSimilarStudents,
        isFetching: isFetchingSimilarStudents,
        refetch: refetchSimilarStudents,
        error: similarStudentsError
    } = useQuery({
        queryKey: ['similar-students', leadId],
        queryFn: async () => {
            const response = await request.get(
                `/crm-api/similar-students?leadId=${leadId}`
            );
            if (response?.status >= 400) {
                const error = new Error(
                    response?.data?.message || defaultErrorCopy
                );
                error.response = response;
                throw error;
            }
            return response?.data;
        },
        // Do not auto-load for leadId when no similarUsers are provided.
        // Manual fetch will be triggered via `refetchSimilarStudents`.
        enabled: false,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        staleTime: Infinity
    });

    // Extract student IDs from either prop or API response and create a map of reasons
    const { studentIds, reasonMap } = useMemo(() => {
        const buildData = (list) => {
            const studentIds = list.map((item) => item.mongoId);
            const reasonMap = list.reduce((map, item) => {
                map[item.mongoId] = item.reason;
                return map;
            }, {});
            return { studentIds, reasonMap };
        };

        if (similarStudentsData?.matches?.length > 0) {
            return buildData(similarStudentsData.matches);
        }

        if (similarUsers.length > 0) {
            return buildData(similarUsers);
        }

        return { studentIds: [], reasonMap: {} };
    }, [similarUsers, similarStudentsData]);

    // Fetch detailed student information
    const {
        data: userDetails,
        isLoading: isLoadingUserDetails,
        isFetching: isFetchingUserDetails,
        error: userDetailsError
    } = useQuery({
        queryKey: ['similar-user-details', studentIds],
        queryFn: async () => {
            if (!studentIds.length) return [];
            const response = await request.get(
                `/api/students/batch?ids=${studentIds.join(',')}`
            );
            if (response?.status >= 400) {
                const error = new Error(
                    response?.data?.message || defaultErrorCopy
                );
                error.response = response;
                throw error;
            }
            const data = response.data.data;
            return data;
        },
        enabled: studentIds.length > 0,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        staleTime: Infinity
    });

    // Sort students by application date and semester
    const sortedStudents = useMemo(() => {
        if (!userDetails) return [];

        return [...userDetails].sort((a, b) => {
            // Extract year and semester for comparison
            const yearA = parseInt(
                a.application_preference?.expected_application_date || '0',
                10
            );
            const yearB = parseInt(
                b.application_preference?.expected_application_date || '0',
                10
            );

            // Sort by year first (descending)
            if (yearA !== yearB) {
                return yearB - yearA;
            }

            // If years are the same, sort by semester (WS > SS)
            const semesterOrder = { WS: 1, SS: 0 };
            const semesterA =
                semesterOrder[
                    a.application_preference?.expected_application_semester
                ] || -1;
            const semesterB =
                semesterOrder[
                    b.application_preference?.expected_application_semester
                ] || -1;

            if (semesterA !== semesterB) {
                return semesterB - semesterA;
            }

            // If semester and year are the same, sort by count of valid applications (O or X)
            const validAppsCountA = (a.applications || []).filter((app) =>
                ['O', 'X'].includes(app?.admission)
            ).length;

            const validAppsCountB = (b.applications || []).filter((app) =>
                ['O', 'X'].includes(app?.admission)
            ).length;

            if (validAppsCountA !== validAppsCountB) {
                return validAppsCountB - validAppsCountA; // Higher count first
            }

            // If application counts are the same, sort alphabetically by name
            const nameA = `${a.firstname || ''} ${a.lastname || ''}`
                .trim()
                .toLowerCase();
            const nameB = `${b.firstname || ''} ${b.lastname || ''}`
                .trim()
                .toLowerCase();

            return nameA.localeCompare(nameB);
        });
    }, [userDetails]);

    const queryError = similarStudentsError || userDetailsError;
    const hasError = Boolean(queryError);
    const isLoading = isLoadingSimilarStudents || isLoadingUserDetails;
    const isRefreshing = isFetchingSimilarStudents || isFetchingUserDetails;
    const handleRefetch = async () => {
        try {
            await refetchSimilarStudents();
        } catch (error) {
            console.error('Failed to refetch similar students', error);
        }
    };
    const studentCount = sortedStudents?.length || 0;

    const responseStatus = queryError?.response?.status;
    const responseStatusText = queryError?.response?.statusText;
    const serverErrorMessage =
        queryError?.response?.data?.message ||
        queryError?.message ||
        defaultErrorCopy;
    const statusLabel = responseStatusText
        ? `${responseStatus} ${responseStatusText}`
        : responseStatus;
    const errorMessage = statusLabel
        ? `${t('common.errorLabel', {
              ns: 'crm',
              defaultValue: 'Error'
          })} ${statusLabel}: ${serverErrorMessage}`
        : serverErrorMessage;
    const retryLabel = t('actions.retry', {
        ns: 'crm',
        defaultValue: 'Retry'
    });

    // Render loading state
    if (isLoading) {
        return (
            <Card sx={{ mb: 1 }}>
                <CardContent>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            mb: 2
                        }}
                    >
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                            }}
                        >
                            <PersonIcon color="primary" />
                            <Typography variant="h6">
                                {t('common.similarStudents', { ns: 'crm' })}
                            </Typography>
                        </Box>
                        <Tooltip title={t('actions.regenerate', { ns: 'crm' })}>
                            <span>
                                <IconButton
                                    aria-label={t('actions.regenerate', {
                                        ns: 'crm'
                                    })}
                                    disabled={isRefreshing}
                                    onClick={handleRefetch}
                                    size="small"
                                >
                                    {isRefreshing ? (
                                        <CircularProgress size={16} />
                                    ) : (
                                        <ReplayIcon />
                                    )}
                                </IconButton>
                            </span>
                        </Tooltip>
                    </Box>
                    <Box
                        sx={{
                            position: 'relative',
                            mb: 2
                        }}
                    >
                        {/* Navigation buttons for loading state */}
                        <IconButton
                            aria-label={t('common.scrollLeft', { ns: 'crm' })}
                            size="small"
                            sx={{
                                position: 'absolute',
                                left: -16,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                backgroundColor: 'background.paper',
                                boxShadow: 2,
                                zIndex: 2,
                                '&:hover': {
                                    backgroundColor: 'grey.200'
                                }
                            }}
                        >
                            <NavigateBeforeIcon />
                        </IconButton>

                        <IconButton
                            aria-label={t('common.scrollRight', { ns: 'crm' })}
                            size="small"
                            sx={{
                                position: 'absolute',
                                right: -16,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                backgroundColor: 'background.paper',
                                boxShadow: 2,
                                zIndex: 2,
                                '&:hover': {
                                    backgroundColor: 'grey.200'
                                }
                            }}
                        >
                            <NavigateNextIcon />
                        </IconButton>

                        <Box
                            sx={{
                                overflowX: 'auto',
                                pb: 1,
                                scrollBehavior: 'smooth',
                                scrollbarWidth: 'auto',
                                '&::-webkit-scrollbar': {
                                    height: 10
                                },
                                '&::-webkit-scrollbar-track': {
                                    backgroundColor: 'rgba(0,0,0,0.05)',
                                    borderRadius: 5
                                },
                                '&::-webkit-scrollbar-thumb': {
                                    backgroundColor: 'rgba(0,0,0,0.3)',
                                    borderRadius: 5,
                                    '&:hover': {
                                        backgroundColor: 'rgba(0,0,0,0.4)'
                                    }
                                }
                            }}
                        >
                            <Box
                                sx={{
                                    display: 'flex',
                                    gap: 2,
                                    width: 'max-content',
                                    pl: 1,
                                    pr: 1,
                                    py: 1
                                }}
                            >
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <Box
                                        key={i}
                                        sx={{
                                            width: {
                                                xs: '320px',
                                                sm: '300px',
                                                md: '280px'
                                            },
                                            minWidth: {
                                                xs: '320px',
                                                sm: '280px',
                                                md: '260px'
                                            },
                                            flexShrink: 0,
                                            scrollSnapAlign: 'start'
                                        }}
                                    >
                                        <StudentCardSkeleton />
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    </Box>
                </CardContent>
            </Card>
        );
    }

    if (hasError) {
        return (
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            mb: 2
                        }}
                    >
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                            }}
                        >
                            <PersonIcon color="primary" />
                            <Typography variant="h6">
                                {t('common.similarStudents', { ns: 'crm' })}
                            </Typography>
                        </Box>
                        <Tooltip title={t('actions.regenerate', { ns: 'crm' })}>
                            <span>
                                <IconButton
                                    aria-label={t('actions.regenerate', {
                                        ns: 'crm'
                                    })}
                                    disabled={isRefreshing}
                                    onClick={handleRefetch}
                                    size="small"
                                >
                                    {isRefreshing ? (
                                        <CircularProgress size={16} />
                                    ) : (
                                        <ReplayIcon />
                                    )}
                                </IconButton>
                            </span>
                        </Tooltip>
                    </Box>
                    <Alert
                        action={
                            <Button
                                color="inherit"
                                disabled={isRefreshing}
                                onClick={handleRefetch}
                                size="small"
                            >
                                {retryLabel}
                            </Button>
                        }
                        severity="error"
                        sx={{ alignItems: 'center' }}
                    >
                        {errorMessage}
                    </Alert>
                </CardContent>
            </Card>
        );
    }

    // Render empty state
    if (!sortedStudents || sortedStudents.length === 0) {
        // If we have a leadId and no similarUsers were passed in, but
        // we haven't fetched yet, show a manual fetch CTA instead of
        // auto-loading the endpoint.
        if (!!leadId && similarUsers.length === 0 && !similarStudentsData) {
            return (
                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                mb: 2
                            }}
                        >
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1
                                }}
                            >
                                <PersonIcon color="primary" />
                                <Typography variant="h6">
                                    {t('common.similarStudents', { ns: 'crm' })}
                                </Typography>
                            </Box>
                            <Tooltip
                                title={t('actions.regenerate', { ns: 'crm' })}
                            >
                                <span>
                                    <IconButton
                                        aria-label={t('actions.regenerate', {
                                            ns: 'crm'
                                        })}
                                        disabled={isRefreshing}
                                        onClick={handleRefetch}
                                        size="small"
                                    >
                                        {isRefreshing ? (
                                            <CircularProgress size={16} />
                                        ) : (
                                            <ReplayIcon />
                                        )}
                                    </IconButton>
                                </span>
                            </Tooltip>
                        </Box>

                        <Typography color="text.secondary">
                            {t('common.similarStudentsManualFetch', {
                                ns: 'crm',
                                defaultValue:
                                    'No similar students loaded. Click the button below to fetch suggestions for this lead.'
                            })}
                        </Typography>

                        <Box sx={{ mt: 2 }}>
                            <Button
                                disabled={isRefreshing}
                                onClick={handleRefetch}
                                startIcon={
                                    isRefreshing ? (
                                        <CircularProgress size={14} />
                                    ) : null
                                }
                                variant="contained"
                            >
                                {t('actions.findSimilarStudents', {
                                    ns: 'crm',
                                    defaultValue: 'Find similar students'
                                })}
                            </Button>
                        </Box>
                    </CardContent>
                </Card>
            );
        }

        return (
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            mb: 2
                        }}
                    >
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                            }}
                        >
                            <PersonIcon color="primary" />
                            <Typography variant="h6">
                                {t('common.similarStudents', { ns: 'crm' })}
                            </Typography>
                        </Box>
                        <Tooltip title={t('actions.regenerate', { ns: 'crm' })}>
                            <span>
                                <IconButton
                                    aria-label={t('actions.regenerate', {
                                        ns: 'crm'
                                    })}
                                    disabled={isRefreshing}
                                    onClick={handleRefetch}
                                    size="small"
                                >
                                    {isRefreshing ? (
                                        <CircularProgress size={16} />
                                    ) : (
                                        <ReplayIcon />
                                    )}
                                </IconButton>
                            </span>
                        </Tooltip>
                    </Box>
                    <Typography color="text.secondary">
                        {t('common.noSimilarStudentsFound', { ns: 'crm' })}
                    </Typography>
                </CardContent>
            </Card>
        );
    }

    // Render students
    return (
        <Card sx={{ mb: 3 }}>
            <CardContent>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        mb: 2
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PersonIcon color="primary" />
                        <Typography variant="h6">
                            {t('common.similarStudents', { ns: 'crm' })} (
                            {studentCount})
                        </Typography>
                    </Box>
                    <Tooltip title={t('actions.regenerate', { ns: 'crm' })}>
                        <span>
                            <IconButton
                                aria-label={t('actions.regenerate', {
                                    ns: 'crm'
                                })}
                                disabled={isRefreshing}
                                onClick={handleRefetch}
                                size="small"
                            >
                                {isRefreshing ? (
                                    <CircularProgress size={16} />
                                ) : (
                                    <ReplayIcon />
                                )}
                            </IconButton>
                        </span>
                    </Tooltip>
                </Box>

                {/* description */}
                <Typography
                    color="text.secondary"
                    sx={{ mb: 2 }}
                    variant="body2"
                >
                    {t('common.similarStudentsDesc', { ns: 'crm' })}
                </Typography>

                <Box
                    sx={{
                        position: 'relative',
                        mb: sortedStudents.length > 5 ? 2 : 0
                    }}
                >
                    {/* Navigation buttons */}
                    {sortedStudents.length > 5 && (
                        <>
                            <IconButton
                                aria-label={t('common.scrollLeft', {
                                    ns: 'crm'
                                })}
                                onClick={() => {
                                    if (scrollContainerRef.current) {
                                        const scrollAmount = 500;
                                        scrollContainerRef.current.scrollLeft -=
                                            scrollAmount;
                                    }
                                }}
                                size="small"
                                sx={{
                                    position: 'absolute',
                                    left: -16,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    backgroundColor: 'background.paper',
                                    boxShadow: 2,
                                    zIndex: 2,
                                    '&:hover': {
                                        backgroundColor: 'grey.200'
                                    }
                                }}
                            >
                                <NavigateBeforeIcon />
                            </IconButton>

                            <IconButton
                                aria-label={t('common.scrollRight', {
                                    ns: 'crm'
                                })}
                                onClick={() => {
                                    if (scrollContainerRef.current) {
                                        const scrollAmount = 500;
                                        scrollContainerRef.current.scrollLeft +=
                                            scrollAmount;
                                    }
                                }}
                                size="small"
                                sx={{
                                    position: 'absolute',
                                    right: -16,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    backgroundColor: 'background.paper',
                                    boxShadow: 2,
                                    zIndex: 2,
                                    '&:hover': {
                                        backgroundColor: 'grey.200'
                                    }
                                }}
                            >
                                <NavigateNextIcon />
                            </IconButton>
                        </>
                    )}

                    <Box
                        ref={scrollContainerRef}
                        sx={{
                            overflowX: 'auto',
                            pb: 2,
                            pt: 1,
                            scrollBehavior: 'smooth',
                            scrollbarWidth: 'auto',
                            '&::-webkit-scrollbar': {
                                height: 10
                            },
                            '&::-webkit-scrollbar-track': {
                                backgroundColor: 'rgba(0,0,0,0.05)',
                                borderRadius: 5
                            },
                            '&::-webkit-scrollbar-thumb': {
                                backgroundColor: 'rgba(0,0,0,0.3)',
                                borderRadius: 5,
                                '&:hover': {
                                    backgroundColor: 'rgba(0,0,0,0.4)'
                                }
                            }
                        }}
                    >
                        <Box
                            sx={{
                                display: 'flex',
                                gap: 2,
                                width: 'max-content',
                                pl: sortedStudents.length > 5 ? 1 : 0,
                                pr: sortedStudents.length > 5 ? 1 : 0,
                                py: 1
                            }}
                        >
                            {sortedStudents.map((student) => (
                                <Box
                                    key={student._id}
                                    sx={{
                                        width: {
                                            xs: '320px',
                                            sm: '300px',
                                            md: '280px'
                                        },
                                        minWidth: {
                                            xs: '320px',
                                            sm: '280px',
                                            md: '260px'
                                        },
                                        flexShrink: 0,
                                        scrollSnapAlign: 'start',
                                        transition: 'transform 0.2s',
                                        '&:hover': {
                                            transform: 'translateY(-2px)'
                                        }
                                    }}
                                >
                                    <StudentCard
                                        matchReason={reasonMap[student._id]}
                                        student={student}
                                    />
                                </Box>
                            ))}
                        </Box>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
};

export default SimilarStudents;
