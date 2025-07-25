import React from 'react';
import { Box, Typography, Link } from '@mui/material';

// Card configurations for each section
export const cardConfigurations = [
    {
        id: 'personal',
        title: 'Personal Information',
        gridSize: { md: 6, xs: 12 },
        fields: [
            {
                key: 'fullName',
                label: 'Full Name',
                type: 'text'
            },
            {
                key: 'gender',
                label: 'Gender',
                type: 'text'
            },
            {
                key: 'applicantRole',
                label: 'Role',
                type: 'text'
            },
            {
                key: 'status',
                label: 'Status',
                type: 'chip',
                color: (value) => (value === 'new' ? 'primary' : 'default'),
                additionalContent: (lead) =>
                    lead.userId ? (
                        <Link
                            component="a"
                            href={`/student-database/${lead.userId}`}
                            underline="hover"
                            variant="body2"
                        >
                            View Student Profile
                        </Link>
                    ) : null,
                // For edit mode, render as select
                editField: {
                    type: 'select',
                    options: [
                        { value: 'open', label: 'Open' },
                        { value: 'contacted', label: 'Contacted' },
                        { value: 'qualified', label: 'Qualified' },
                        { value: 'converted', label: 'Converted' }
                    ]
                }
            }
        ]
    },
    {
        id: 'contact',
        title: 'Contact Information',
        gridSize: { md: 6, xs: 12 },
        fields: [
            {
                key: 'email',
                label: 'Email',
                type: 'text',
                inputType: 'email'
            },
            {
                key: 'phone',
                label: 'Phone',
                type: 'text'
            },
            {
                key: 'preferredContact',
                label: 'Preferred Contact',
                type: 'text'
            },
            {
                key: 'lineId',
                label: 'LINE ID',
                type: 'text'
            },
            {
                key: 'source',
                label: 'Source',
                type: 'text'
            }
        ]
    },
    {
        id: 'education',
        title: 'Educational Background',
        gridSize: { xs: 12 },
        layout: 'grid',
        sections: [
            {
                title: 'High School',
                gridSize: 4,
                fields: [
                    {
                        key: 'highschoolName',
                        label: 'High School Name',
                        type: 'text'
                    },
                    {
                        key: 'highschoolGPA',
                        label: 'High School GPA',
                        type: 'text'
                    }
                ]
            },
            {
                title: "Bachelor's Degree",
                gridSize: 4,
                fields: [
                    {
                        key: 'bachelorSchool',
                        label: 'Bachelor School',
                        type: 'text'
                    },
                    {
                        key: 'bachelorProgramName',
                        label: 'Bachelor Program',
                        type: 'text'
                    },
                    {
                        key: 'bachelorGPA',
                        label: 'Bachelor GPA',
                        type: 'text'
                    }
                ]
            },
            {
                title: "Master's Degree",
                gridSize: 4,
                fields: [
                    {
                        key: 'masterSchool',
                        label: 'Master School',
                        type: 'text'
                    },
                    {
                        key: 'masterProgramName',
                        label: 'Master Program',
                        type: 'text'
                    },
                    {
                        key: 'masterGPA',
                        label: 'Master GPA',
                        type: 'text'
                    }
                ]
            }
        ],
        fields: [
            {
                key: 'highestEducation',
                label: 'Highest Education',
                type: 'text'
            }
        ]
    },
    {
        id: 'programs',
        title: 'Intended Programs',
        gridSize: { md: 6, xs: 12 },
        fields: [
            {
                key: 'intendedPrograms',
                label: 'Target Universities',
                type: 'text',
                multiline: true,
                rows: 2
            },
            {
                key: 'intendedDirection',
                label: 'Direction',
                type: 'text'
            },
            {
                key: 'intendedProgramLevel',
                label: 'Program Level',
                type: 'text'
            },
            {
                key: 'intendedStartTime',
                label: 'Start Time',
                type: 'text'
            }
        ]
    },
    {
        id: 'language',
        title: 'Language Skills',
        gridSize: { md: 6, xs: 12 },
        fields: [
            {
                key: 'englishLevel',
                label: 'English Level',
                type: 'text'
            },
            {
                key: 'germanLevel',
                label: 'German Level',
                type: 'text'
            }
        ]
    },
    {
        id: 'work',
        title: 'Work Experience',
        gridSize: { xs: 12 },
        fields: [
            {
                key: 'workExperience',
                label: 'Work Experience',
                type: 'custom',
                render: (lead) => (
                    <Typography sx={{ whiteSpace: 'pre-line' }} variant="body1">
                        {lead.workExperience || 'No work experience provided'}
                    </Typography>
                ),
                // For edit mode
                editField: {
                    type: 'text',
                    multiline: true,
                    rows: 6
                }
            }
        ]
    },
    {
        id: 'additional',
        title: 'Additional Information',
        gridSize: { xs: 12 },
        fields: [
            {
                key: 'additionalInfo',
                label: 'Additional Info',
                type: 'text',
                multiline: true,
                rows: 3
            },
            {
                key: 'reasonsToStudyAbroad',
                label: 'Reasons to Study Abroad',
                type: 'text',
                multiline: true,
                rows: 3
            }
        ],
        additionalContent: (lead) => (
            <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Typography color="text.secondary" variant="body2">
                    Created:{' '}
                    {lead.createdAt
                        ? new Date(lead.createdAt).toLocaleDateString()
                        : 'N/A'}
                </Typography>
                <Typography color="text.secondary" variant="body2">
                    Updated:{' '}
                    {lead.updatedAt
                        ? new Date(lead.updatedAt).toLocaleDateString()
                        : 'N/A'}
                </Typography>
            </Box>
        )
    }
];
