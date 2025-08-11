import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    Chip,
    Link
} from '@mui/material';
import {
    School as SchoolIcon,
    Person as PersonIcon
} from '@mui/icons-material';

import { request } from '../../../api/request';

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
            enabled: !!leadId,
            staleTime: Infinity,
            cacheTime: 24 * 60 * 60 * 1000,
            refetchOnMount: false,
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
            retry: 1
        });

    // Parse student text information
    const parseStudentInfo = (text) => {
        const info = {};
        const lines = text.replace(/"/g, '').split('\\n');
        lines.forEach((line) => {
            if (line.includes(':')) {
                const [key, value] = line.split(':').map((s) => s.trim());
                info[key] = value;
            }
        });
        return info;
    };

    if (isLoadingSimilarStudents) {
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

    if (!similarStudentsData) {
        return null;
    }

    const studentsToShow = similarStudentsData?.matches || [];

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
                        Similar Students ({studentsToShow.length})
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Grid container spacing={1}>
                        {studentsToShow.map((student) => {
                            const info = parseStudentInfo(student.text);
                            return (
                                <Grid
                                    item
                                    key={student.mongo_id}
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
                                            backgroundColor: 'background.paper',
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            '&:hover': {
                                                backgroundColor: 'action.hover',
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
                                                href={`/student-database/${student.mongo_id}`}
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
                                                        whiteSpace: 'nowrap',
                                                        fontSize: '0.8rem'
                                                    }}
                                                    variant="caption"
                                                >
                                                    {student.full_name}
                                                </Typography>
                                            </Link>
                                        </Box>

                                        <Box
                                            sx={{
                                                flex: 1,
                                                fontSize: '0.75rem'
                                            }}
                                        >
                                            {info['Bachelor School'] && (
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
                                                    {info['Bachelor School']}
                                                </Typography>
                                            )}

                                            {info['Bachelor Program'] && (
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
                                                    {info['Bachelor Program']}
                                                </Typography>
                                            )}
                                            {info['Bachelor GPA'] && (
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
                                                    {info['Bachelor GPA']}
                                                </Typography>
                                            )}
                                            {info['Intended Program Level'] && (
                                                <Box sx={{ mb: 0.3 }}>
                                                    <Chip
                                                        color="primary"
                                                        label={
                                                            info[
                                                                'Intended Program Level'
                                                            ]
                                                        }
                                                        size="small"
                                                        sx={{
                                                            fontSize: '0.6rem',
                                                            height: 16,
                                                            '& .MuiChip-label':
                                                                {
                                                                    px: 0.5
                                                                }
                                                        }}
                                                        variant="outlined"
                                                    />
                                                </Box>
                                            )}
                                            {info['Intended Direction'] && (
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
                                                    {info['Intended Direction']}
                                                </Typography>
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
