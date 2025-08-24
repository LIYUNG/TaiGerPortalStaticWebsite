import { Typography } from '@mui/material';

export const getCardConfigurations = (t) => [
    {
        id: 'education',
        title: t('cards.education.title', { ns: 'crm' }),
        gridSize: { xs: 12, md: 8 },
        layout: 'grid',
        sections: [
            {
                title: t('cards.education.highSchool', { ns: 'crm' }),
                gridSize: 4,
                fields: [
                    {
                        key: 'highschoolName',
                        label: t('cards.education.highSchoolName', {
                            ns: 'crm'
                        }),
                        type: 'text'
                    },
                    {
                        key: 'highschoolGPA',
                        label: t('cards.education.highSchoolGPA', {
                            ns: 'crm'
                        }),
                        type: 'text'
                    }
                ]
            },
            {
                title: t('cards.education.bachelor', { ns: 'crm' }),
                gridSize: 4,
                fields: [
                    {
                        key: 'bachelorSchool',
                        label: t('cards.education.bachelorSchool', {
                            ns: 'crm'
                        }),
                        type: 'text'
                    },
                    {
                        key: 'bachelorProgramName',
                        label: t('cards.education.bachelorProgram', {
                            ns: 'crm'
                        }),
                        type: 'text'
                    },
                    {
                        key: 'bachelorGPA',
                        label: t('cards.education.bachelorGPA', {
                            ns: 'crm'
                        }),
                        type: 'text'
                    }
                ]
            },
            {
                title: t('cards.education.master', { ns: 'crm' }),
                gridSize: 4,
                fields: [
                    {
                        key: 'masterSchool',
                        label: t('cards.education.masterSchool', {
                            ns: 'crm'
                        }),
                        type: 'text'
                    },
                    {
                        key: 'masterProgramName',
                        label: t('cards.education.masterProgram', {
                            ns: 'crm'
                        }),
                        type: 'text'
                    },
                    {
                        key: 'masterGPA',
                        label: t('cards.education.masterGPA', {
                            ns: 'crm'
                        }),
                        type: 'text'
                    }
                ]
            }
        ],
        fields: [
            {
                key: 'highestEducation',
                label: t('cards.education.highestEducation', {
                    ns: 'crm'
                }),
                type: 'text'
            }
        ]
    },
    {
        id: 'programs',
        title: t('cards.programs.title', { ns: 'crm' }),
        gridSize: { xs: 12, md: 4 },
        fields: [
            {
                key: 'intendedPrograms',
                label: t('cards.programs.targetUniversities', {
                    ns: 'crm'
                }),
                type: 'text',
                multiline: true,
                rows: 2
            },
            {
                key: 'intendedDirection',
                label: t('cards.programs.targetField', { ns: 'crm' }),
                type: 'text'
            },
            {
                key: 'intendedProgramLevel',
                label: t('cards.programs.targetDegree', { ns: 'crm' }),
                type: 'text'
            },
            {
                key: 'intendedStartTime',
                label: t('cards.programs.startTime', { ns: 'crm' }),
                type: 'text'
            }
        ]
    },
    {
        id: 'language',
        title: t('cards.language.title', { ns: 'crm' }),
        gridSize: { md: 4, xs: 12 },
        fields: [
            {
                key: 'englishLevel',
                label: t('cards.language.englishLevel', { ns: 'crm' }),
                type: 'text'
            },
            {
                key: 'germanLevel',
                label: t('cards.language.germanLevel', { ns: 'crm' }),
                type: 'text'
            }
        ]
    },
    {
        id: 'work',
        title: t('cards.work.title', { ns: 'crm' }),
        gridSize: { md: 4, xs: 12 },
        fields: [
            {
                key: 'workExperience',
                label: t('cards.work.workExperience', { ns: 'crm' }),
                type: 'custom',
                render: (lead) => (
                    <Typography sx={{ whiteSpace: 'pre-line' }} variant="body1">
                        {lead.workExperience ||
                            t('cards.work.noWorkExperience', { ns: 'crm' })}
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
        title: t('cards.contact.title', { ns: 'crm' }),
        gridSize: { md: 4, xs: 12 },
        fields: [
            {
                key: 'email',
                label: t('cards.contact.email', { ns: 'crm' }),
                type: 'text',
                inputType: 'email'
            },
            {
                key: 'phone',
                label: t('cards.contact.phone', { ns: 'crm' }),
                type: 'text'
            },
            {
                key: 'preferredContact',
                label: t('cards.contact.preferredContact', {
                    ns: 'crm'
                }),
                type: 'text'
            },
            {
                key: 'lineId',
                label: t('cards.contact.lineId', { ns: 'crm' }),
                type: 'text'
            },
            {
                key: 'source',
                label: t('cards.contact.source', { ns: 'crm' }),
                type: 'text'
            }
        ]
    },
    {
        id: 'additional',
        title: t('cards.additional.title', { ns: 'crm' }),
        gridSize: { xs: 12 },
        fields: [
            {
                key: 'additionalInfo',
                label: t('cards.additional.additionalInfo', {
                    ns: 'crm'
                }),
                type: 'text',
                multiline: true,
                rows: 3
            },
            {
                key: 'reasonsToStudyAbroad',
                label: t('cards.additional.reasonsToStudyAbroad', {
                    ns: 'crm'
                }),
                type: 'text',
                multiline: true,
                rows: 3
            }
        ]
    }
];
