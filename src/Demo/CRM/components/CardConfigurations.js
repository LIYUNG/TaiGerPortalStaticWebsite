import { Typography } from '@mui/material';

export const getCardConfigurations = () => [
    {
        id: 'education',
        title: 'Educational Background',
        gridSize: { xs: 12, md: 8 },
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
        gridSize: { xs: 12, md: 4 },
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
                label: 'Target Field',
                type: 'text'
            },
            {
                key: 'intendedProgramLevel',
                label: 'Target Degree',
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
        gridSize: { md: 4, xs: 12 },
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
        gridSize: { md: 4, xs: 12 },
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
                editField: {
                    type: 'text',
                    multiline: true,
                    rows: 6
                }
            }
        ]
    },
    {
        id: 'contact',
        title: 'Contact Information',
        gridSize: { md: 4, xs: 12 },
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
        ]
    }
];
