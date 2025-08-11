import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    Chip,
    Link,
    Divider
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

const SimilarStudents = ({ leadId }) => {
    const { data: similarStudentsData, isLoading: isLoadingSimilarStudents } =
        useQuery({
            queryKey: ['similar-students', leadId],
            queryFn: async () => {
                const response = await request.get(
                    `/crm-api/lead-student-matching?leadId=${leadId}`
                );
                return response?.data;
            },
            enabled: !!leadId
        });

    const { data: userDetails, isLoading: isLoadingUserDetails } = useQuery({
        queryKey: ['similar-user-details', similarStudentsData?.matches],
        queryFn: async () => {
            const response = await request.get(
                `/api/students/batch?ids=${similarStudentsData?.matches?.map((student) => student.mongo_id).join(',')}`
            );
            return response.data.data;
        },
        enabled: !!similarStudentsData?.matches
    });

    console.log(userDetails, isLoadingUserDetails);

    if (isLoadingSimilarStudents || isLoadingUserDetails) {
        return (
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography gutterBottom variant="h6">
                        Similar Students
                    </Typography>
                    <Typography color="text.secondary">
                        Loading similar students...
                    </Typography>
                </CardContent>
            </Card>
        );
    }

    if (!similarStudentsData || !userDetails) {
        return (
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography gutterBottom variant="h6">
                        Similar Students
                    </Typography>
                    <Typography color="text.secondary">N/A</Typography>
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
                        gap: 1,
                        mb: 2
                    }}
                >
                    <PersonIcon color="primary" />
                    <Typography variant="h6">
                        Similar Students ({userDetails.length})
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Grid container spacing={1}>
                        {userDetails
                            .sort((a, b) => {
                                // Extract year and semester for comparison
                                const yearA = parseInt(
                                    a.application_preference
                                        ?.expected_application_date || '0',
                                    10
                                );
                                const yearB = parseInt(
                                    b.application_preference
                                        ?.expected_application_date || '0',
                                    10
                                );

                                // Sort by year first
                                if (yearA !== yearB) {
                                    return yearB - yearA;
                                }

                                // If years are the same, sort by semester (WS > SS)
                                const semesterOrder = { WS: 1, SS: 0 }; // WS (Winter Semester) comes after SS (Summer Semester)
                                const semesterA =
                                    semesterOrder[
                                        a.application_preference
                                            ?.expected_application_semester
                                    ] || -1;
                                const semesterB =
                                    semesterOrder[
                                        b.application_preference
                                            ?.expected_application_semester
                                    ] || -1;

                                return semesterA - semesterB;
                            })
                            .map((student) => {
                                return (
                                    <Grid
                                        item
                                        key={student._id}
                                        md={2.4}
                                        sm={6}
                                        xs={12}
                                    >
                                        <Box
                                            sx={{
                                                p: 1.5,
                                                border: '1px solid',
                                                borderColor: 'divider',
                                                borderRadius: 1,
                                                backgroundColor:
                                                    'background.paper',
                                                height: '100%',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                '&:hover': {
                                                    backgroundColor:
                                                        'action.hover',
                                                    transition:
                                                        'background-color 0.2s ease'
                                                }
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 0.5,
                                                    mb: 1
                                                }}
                                            >
                                                <SchoolIcon
                                                    color="primary"
                                                    fontSize="small"
                                                />
                                                <Link
                                                    href={STUDENT_DATABASE_STUDENTID_LINK(
                                                        student._id
                                                    )}
                                                    sx={{
                                                        color: 'inherit',
                                                        textDecoration: 'none',
                                                        '&:hover': {
                                                            color: 'primary.main'
                                                        }
                                                    }}
                                                    underline="hover"
                                                >
                                                    <Typography
                                                        fontWeight="bold"
                                                        sx={{
                                                            overflow: 'hidden',
                                                            textOverflow:
                                                                'ellipsis',
                                                            whiteSpace:
                                                                'nowrap',
                                                            fontSize: '0.8rem'
                                                        }}
                                                        variant="caption"
                                                    >
                                                        {student.firstname}{' '}
                                                        {student.lastname}
                                                    </Typography>
                                                </Link>
                                                <Chip
                                                    color="primary"
                                                    label={
                                                        student
                                                            ?.application_preference
                                                            ?.target_degree
                                                    }
                                                    size="small"
                                                    sx={{
                                                        fontSize: '0.6rem',
                                                        height: 16,
                                                        '& .MuiChip-label': {
                                                            px: 0.5
                                                        }
                                                    }}
                                                    variant="filled"
                                                />
                                                <Chip
                                                    color="primary"
                                                    label={`${student.application_preference.expected_application_date} ${student.application_preference.expected_application_semester}`}
                                                    size="small"
                                                    sx={{
                                                        fontSize: '0.6rem',
                                                        height: 16,
                                                        '& .MuiChip-label': {
                                                            px: 0.5
                                                        }
                                                    }}
                                                    variant="outlined"
                                                />
                                            </Box>

                                            <Box
                                                sx={{
                                                    flex: 1,
                                                    fontSize: '0.75rem'
                                                }}
                                            >
                                                <Typography
                                                    color="text.secondary"
                                                    sx={{
                                                        display: 'block',
                                                        mb: 0.3,
                                                        fontSize: '0.65rem',
                                                        lineHeight: 1.2
                                                    }}
                                                    variant="caption"
                                                >
                                                    <strong>School:</strong>{' '}
                                                    {
                                                        student
                                                            ?.academic_background
                                                            ?.university
                                                            ?.attended_university
                                                    }
                                                </Typography>

                                                <Typography
                                                    color="text.secondary"
                                                    sx={{
                                                        display: 'block',
                                                        mb: 0.3,
                                                        fontSize: '0.65rem',
                                                        lineHeight: 1.2
                                                    }}
                                                    variant="caption"
                                                >
                                                    <strong>Program:</strong>{' '}
                                                    {
                                                        student
                                                            ?.academic_background
                                                            ?.university
                                                            ?.attended_university_program
                                                    }
                                                </Typography>

                                                <Typography
                                                    color="text.secondary"
                                                    sx={{
                                                        display: 'block',
                                                        mb: 0.3,
                                                        fontSize: '0.65rem',
                                                        lineHeight: 1.2
                                                    }}
                                                    variant="caption"
                                                >
                                                    <strong>GPA:</strong>{' '}
                                                    {
                                                        student
                                                            ?.academic_background
                                                            ?.university
                                                            ?.My_GPA_Uni
                                                    }
                                                </Typography>
                                                <Typography
                                                    color="text.secondary"
                                                    sx={{
                                                        display: 'block',
                                                        overflow: 'hidden',
                                                        textOverflow:
                                                            'ellipsis',
                                                        whiteSpace: 'nowrap',
                                                        fontSize: '0.65rem',
                                                        lineHeight: 1.2
                                                    }}
                                                    variant="caption"
                                                >
                                                    <strong>Direction:</strong>{' '}
                                                    {
                                                        student
                                                            ?.application_preference
                                                            ?.target_application_field
                                                    }
                                                </Typography>
                                            </Box>
                                            <Divider />
                                            <Box>
                                                {student?.applications?.length >
                                                    0 &&
                                                    student.applications
                                                        .filter((application) =>
                                                            ['O', 'X'].includes(
                                                                application?.admission
                                                            )
                                                        )
                                                        .sort((a, b) => {
                                                            // Sort by finalEnrolment first
                                                            if (
                                                                a.finalEnrolment &&
                                                                !b.finalEnrolment
                                                            )
                                                                return -1;
                                                            if (
                                                                !a.finalEnrolment &&
                                                                b.finalEnrolment
                                                            )
                                                                return 1;

                                                            // Then sort by admission status ('O' > 'X')
                                                            if (
                                                                a.admission ===
                                                                    'O' &&
                                                                b.admission !==
                                                                    'O'
                                                            )
                                                                return -1;
                                                            if (
                                                                a.admission !==
                                                                    'O' &&
                                                                b.admission ===
                                                                    'O'
                                                            )
                                                                return 1;

                                                            if (
                                                                a.admission ===
                                                                    'X' &&
                                                                b.admission !==
                                                                    'X'
                                                            )
                                                                return -1;
                                                            if (
                                                                a.admission !==
                                                                    'X' &&
                                                                b.admission ===
                                                                    'X'
                                                            )
                                                                return 1;

                                                            return 0; // Keep original order if all else is equal
                                                        })
                                                        .map(
                                                            (
                                                                application,
                                                                index
                                                            ) => {
                                                                return (
                                                                    <Box
                                                                        key={
                                                                            index
                                                                        }
                                                                        sx={{
                                                                            display:
                                                                                'flex',
                                                                            alignItems:
                                                                                'center',
                                                                            gap: 1,
                                                                            mb: 1,
                                                                            fontSize:
                                                                                '0.75rem'
                                                                        }}
                                                                    >
                                                                        <Link
                                                                            href={SINGLE_PROGRAM_LINK(
                                                                                application
                                                                                    .programId
                                                                                    ._id
                                                                            )}
                                                                            sx={{
                                                                                color: 'inherit',
                                                                                textDecoration:
                                                                                    'none',
                                                                                '&:hover':
                                                                                    {
                                                                                        color: 'primary.main'
                                                                                    }
                                                                            }}
                                                                            underline="hover"
                                                                        >
                                                                            {' '}
                                                                            <Typography
                                                                                sx={{
                                                                                    overflow:
                                                                                        'hidden',
                                                                                    textOverflow:
                                                                                        'ellipsis',
                                                                                    whiteSpace:
                                                                                        'normal', // Allow wrapping
                                                                                    wordWrap:
                                                                                        'break-word', // Break long words
                                                                                    flex: 1,
                                                                                    fontSize:
                                                                                        '0.7rem',
                                                                                    lineHeight: 1.2 // Adjust line height for better spacing
                                                                                }}
                                                                                variant="body2"
                                                                            >
                                                                                {
                                                                                    application
                                                                                        .programId
                                                                                        ?.school
                                                                                }{' '}
                                                                                {
                                                                                    application
                                                                                        .programId
                                                                                        ?.program_name
                                                                                }
                                                                            </Typography>
                                                                        </Link>

                                                                        <Box
                                                                            sx={{
                                                                                display:
                                                                                    'flex',
                                                                                alignItems:
                                                                                    'center',
                                                                                justifyContent:
                                                                                    'center'
                                                                            }}
                                                                        >
                                                                            {application.admission ===
                                                                            'O' ? (
                                                                                <CheckCircle
                                                                                    sx={{
                                                                                        color: 'success.main',
                                                                                        fontSize:
                                                                                            '1rem'
                                                                                    }}
                                                                                />
                                                                            ) : (
                                                                                <Cancel
                                                                                    sx={{
                                                                                        color: 'error.main',
                                                                                        fontSize:
                                                                                            '1rem'
                                                                                    }}
                                                                                />
                                                                            )}
                                                                        </Box>
                                                                    </Box>
                                                                );
                                                            }
                                                        )}
                                            </Box>
                                        </Box>
                                    </Grid>
                                );
                            })}
                    </Grid>
                </Box>
            </CardContent>
        </Card>
    );
};

export default SimilarStudents;
