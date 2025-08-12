import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    Chip,
    Link,
    Divider,
    Skeleton
} from '@mui/material';
import {
    School as SchoolIcon,
    Person as PersonIcon,
    CheckCircle,
    Cancel
} from '@mui/icons-material';

import { request } from '../../../api/request';
import DEMO from '../../../store/constant';

const { STUDENT_DATABASE_STUDENTID_LINK, SINGLE_PROGRAM_LINK } = DEMO;

// Extracted student card component for better organization
const StudentCard = ({ student, matchReason }) => {
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
                    sx={{
                        color: 'inherit',
                        textDecoration: 'none',
                        '&:hover': { color: 'primary.main' }
                    }}
                    underline="hover"
                >
                    <Typography
                        fontWeight="bold"
                        sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            fontSize: '0.8rem'
                        }}
                        variant="caption"
                    >
                        {student.firstname} {student.lastname}
                    </Typography>
                </Link>
                {student?.application_preference?.target_degree && (
                    <Chip
                        color="primary"
                        label={student?.application_preference?.target_degree}
                        size="small"
                        sx={{
                            fontSize: '0.6rem',
                            height: 16,
                            '& .MuiChip-label': { px: 0.5 }
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
                            fontSize: '0.6rem',
                            height: 16,
                            '& .MuiChip-label': { px: 0.5 }
                        }}
                        variant="outlined"
                    />
                )}
            </Box>

            {/* Match reason - moved to the top */}
            {matchReason && (
                <Box sx={{ mb: 0.8 }}>
                    <Typography
                        sx={{
                            display: 'block',
                            fontSize: '0.65rem',
                            color: 'primary.main',
                            fontWeight: 'medium',
                            mb: 0.2
                        }}
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
                            sx={{
                                color: 'text.primary',
                                fontSize: 'inherit',
                                display: 'block'
                            }}
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
                    label="GPA"
                    value={student?.academic_background?.university?.My_GPA_Uni}
                />
                <StudentDetailRow
                    label="Direction"
                    value={
                        student?.application_preference
                            ?.target_application_field
                    }
                />
            </Box>

            <Divider sx={{ my: 1 }} />

            {/* Applications section */}
            <Box>
                {sortedApplications.map((application, index) => (
                    <Box
                        key={index}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            mb: index < sortedApplications.length - 1 ? 1 : 0,
                            fontSize: '0.75rem'
                        }}
                    >
                        <Link
                            href={SINGLE_PROGRAM_LINK(
                                application.programId._id
                            )}
                            sx={{
                                color: 'inherit',
                                textDecoration: 'none',
                                '&:hover': { color: 'primary.main' },
                                flex: 1
                            }}
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
                                {application.programId?.school}{' '}
                                {application.programId?.program_name}
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
            </Box>
        </Box>
    );
};

// Helper component for consistent student detail rows
const StudentDetailRow = ({ label, value }) => (
    <Typography
        color="text.secondary"
        sx={{
            display: 'block',
            mb: 0.3,
            fontSize: '0.65rem',
            lineHeight: 1.2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: value === 'Direction' ? 'nowrap' : 'normal'
        }}
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
    // Fetch similar students if not provided directly
    const { data: similarStudentsData, isLoading: isLoadingSimilarStudents } =
        useQuery({
            queryKey: ['similar-students', leadId],
            queryFn: async () => {
                const response = await request.get(
                    `/crm-api/lead-student-matching?leadId=${leadId}`
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
    const { data: userDetails, isLoading: isLoadingUserDetails } = useQuery({
        queryKey: ['similar-user-details', studentIds],
        queryFn: async () => {
            if (!studentIds.length) return [];
            const response = await request.get(
                `/api/students/batch?ids=${studentIds.join(',')}`
            );
            return response.data.data;
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
    const studentCount = sortedStudents?.length || 0;

    // Render loading state
    if (isLoading) {
        return (
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            mb: 2
                        }}
                    >
                        <PersonIcon color="primary" />
                        <Typography variant="h6">Similar Students</Typography>
                    </Box>
                    <Grid container spacing={2}>
                        {[1, 2, 3, 4, 5].map((i) => (
                            <Grid item key={i} md={2.4} sm={6} xs={12}>
                                <StudentCardSkeleton />
                            </Grid>
                        ))}
                    </Grid>
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
                            gap: 1,
                            mb: 2
                        }}
                    >
                        <PersonIcon color="primary" />
                        <Typography variant="h6">Similar Students</Typography>
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
                        gap: 1,
                        mb: 2
                    }}
                >
                    <PersonIcon color="primary" />
                    <Typography variant="h6">
                        Similar Students ({studentCount})
                    </Typography>
                </Box>

                <Grid container spacing={2}>
                    {sortedStudents.map((student) => (
                        <Grid item key={student._id} md={2.4} sm={6} xs={12}>
                            <StudentCard
                                matchReason={reasonMap[student._id]}
                                student={student}
                            />
                        </Grid>
                    ))}
                </Grid>
            </CardContent>
        </Card>
    );
};

export default SimilarStudents;
