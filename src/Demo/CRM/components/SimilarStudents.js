import React, { useMemo, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    Box,
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
                        Match Reason:
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
                    label="GPA"
                    value={student?.academic_background?.university?.My_GPA_Uni}
                />
                <StudentDetailRow
                    label="School"
                    value={
                        student?.academic_background?.university
                            ?.attended_university
                    }
                />
                <StudentDetailRow
                    label="Program"
                    value={
                        student?.academic_background?.university
                            ?.attended_university_program
                    }
                />
                <StudentDetailRow
                    label="Target Field"
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
                                ? 'Show Less'
                                : `Show ${sortedApplications.length - 7} More`}
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
const StudentDetailRow = ({ label, value }) => (
    <Typography
        color="text.secondary"
        display="block"
        gutterBottom
        variant="caption"
    >
        <strong>{label}:</strong> {value || 'N/A'}
    </Typography>
);

// Loading placeholder for student cards
const StudentCardSkeleton = () => (
    <Box
        sx={{
            p: 1.5,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            height: '100%'
        }}
    >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Skeleton height={20} variant="circular" width={20} />
            <Skeleton height={20} variant="text" width="60%" />
        </Box>

        {/* Match reason skeleton - moved to the top */}
        <Box sx={{ mb: 1.5 }}>
            <Skeleton height={12} variant="text" width="40%" />
            <Skeleton
                height={30}
                sx={{ mt: 0.5, borderRadius: '0 4px 4px 0' }}
                variant="rectangular"
                width="100%"
            />
        </Box>

        <Skeleton height={15} variant="text" width="90%" />
        <Skeleton height={15} variant="text" width="80%" />
        <Skeleton height={15} variant="text" width="40%" />
        <Skeleton height={15} variant="text" width="70%" />

        <Divider sx={{ my: 1 }} />
        <Skeleton height={20} variant="text" width="100%" />
        <Skeleton height={20} variant="text" width="100%" />
    </Box>
);

const SimilarStudents = ({ leadId, similarUsers = [] }) => {
    // Reference to the scrollable container
    const scrollContainerRef = useRef(null);
    // Fetch similar students if not provided directly
    const {
        data: similarStudentsData,
        isLoading: isLoadingSimilarStudents,
        isFetching: isFetchingSimilarStudents,
        refetch: refetchSimilarStudents
    } = useQuery({
        queryKey: ['similar-students', leadId],
        queryFn: async () => {
            const response = await request.get(
                `/crm-api/similar-students?leadId=${leadId}`
            );
            return response?.data;
        },
        enabled: !!leadId && similarUsers.length === 0,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        staleTime: Infinity
    });

    // Extract student IDs from either prop or API response and create a map of reasons
    const { studentIds, reasonMap } = useMemo(() => {
        if (similarUsers.length > 0) {
            const ids = similarUsers.map((user) => user.mongoId);
            const reasons = similarUsers.reduce((map, user) => {
                map[user.mongoId] = user.reason;
                return map;
            }, {});
            return { studentIds: ids, reasonMap: reasons };
        }

        const ids =
            similarStudentsData?.matches?.map((student) => student.mongo_id) ||
            [];
        const reasons = (similarStudentsData?.matches || []).reduce(
            (map, student) => {
                map[student.mongo_id] = student.reason;
                return map;
            },
            {}
        );

        return { studentIds: ids, reasonMap: reasons };
    }, [similarUsers, similarStudentsData]);

    // Fetch detailed student information
    const {
        data: userDetails,
        isLoading: isLoadingUserDetails,
        isFetching: isFetchingUserDetails,
        refetch: refetchUserDetails
    } = useQuery({
        queryKey: ['similar-user-details', studentIds],
        queryFn: async () => {
            if (!studentIds.length) return [];
            const response = await request.get(
                `/api/students/batch?ids=${studentIds.join(',')}`
            );
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

    const isLoading = isLoadingSimilarStudents || isLoadingUserDetails;
    const isRefreshing = isFetchingSimilarStudents || isFetchingUserDetails;
    const handleRefetch = async () => {
        await refetchSimilarStudents();
        await refetchUserDetails();
    };
    const studentCount = sortedStudents?.length || 0;

    // Render loading state
    if (isLoading) {
        return (
            <Card>
                <CardContent>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            mb: 1
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
                                Similar Students
                            </Typography>
                        </Box>
                        <Tooltip title="Regenerate">
                            <span>
                                <IconButton
                                    aria-label="Regenerate similar students"
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
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <Box
                                        key={i}
                                        sx={{
                                            width: {
                                                xs: '280px',
                                                sm: '260px',
                                                md: '240px'
                                            },
                                            minWidth: {
                                                xs: '280px',
                                                sm: '260px',
                                                md: '240px'
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

    // Render empty state
    if (!sortedStudents || sortedStudents.length === 0) {
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
                                Similar Students
                            </Typography>
                        </Box>
                        <Tooltip title="Regenerate">
                            <span>
                                <IconButton
                                    aria-label="Regenerate similar students"
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
                        No similar students found
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
                            Similar Students ({studentCount})
                        </Typography>
                    </Box>
                    <Tooltip title="Regenerate">
                        <span>
                            <IconButton
                                aria-label="Regenerate similar students"
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
                    Matches are based on academic background (school, program,
                    GPA) and application preferences (program level, direction).
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
                                aria-label="Scroll left"
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
                                aria-label="Scroll right"
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
