import { Typography } from '@mui/material';
import i18next from 'i18next';

export const getCardConfigurations = () => [
    {
        id: 'education',
        title: i18next.t('cards.education.title', { ns: 'crm' }),
        gridSize: { xs: 12, md: 8 },
        layout: 'grid',
        sections: [
            {
                title: i18next.t('cards.education.highSchool', { ns: 'crm' }),
                gridSize: 4,
                fields: [
                    {
                        key: 'highschoolName',
                        label: i18next.t('cards.education.highSchoolName', {
                            ns: 'crm'
                        }),
                        type: 'text'
                    },
                    {
                        key: 'highschoolGPA',
                        label: i18next.t('cards.education.highSchoolGPA', {
                            ns: 'crm'
                        }),
                        type: 'text'
                    }
                ]
            },
            {
                title: i18next.t('cards.education.bachelor', { ns: 'crm' }),
                gridSize: 4,
                fields: [
                    {
                        key: 'bachelorSchool',
                        label: i18next.t('cards.education.bachelorSchool', {
                            ns: 'crm'
                        }),
                        type: 'text'
                    },
                    {
                        key: 'bachelorProgramName',
                        label: i18next.t('cards.education.bachelorProgram', {
                            ns: 'crm'
                        }),
                        type: 'text'
                    },
                    {
                        key: 'bachelorGPA',
                        label: i18next.t('cards.education.bachelorGPA', {
                            ns: 'crm'
                        }),
                        type: 'text'
                    }
                ]
            },
            {
                title: i18next.t('cards.education.master', { ns: 'crm' }),
                gridSize: 4,
                fields: [
                    {
                        key: 'masterSchool',
                        label: i18next.t('cards.education.masterSchool', {
                            ns: 'crm'
                        }),
                        type: 'text'
                    },
                    {
                        key: 'masterProgramName',
                        label: i18next.t('cards.education.masterProgram', {
                            ns: 'crm'
                        }),
                        type: 'text'
                    },
                    {
                        key: 'masterGPA',
                        label: i18next.t('cards.education.masterGPA', {
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
                label: i18next.t('cards.education.highestEducation', {
                    ns: 'crm'
                }),
                type: 'text'
            }
        ]
    },
    {
        id: 'programs',
        title: i18next.t('cards.programs.title', { ns: 'crm' }),
        gridSize: { xs: 12, md: 4 },
        fields: [
            {
                key: 'intendedPrograms',
                label: i18next.t('cards.programs.targetUniversities', {
                    ns: 'crm'
                }),
                type: 'text',
                multiline: true,
                rows: 2
            },
            {
                key: 'intendedDirection',
                label: i18next.t('cards.programs.targetField', { ns: 'crm' }),
                type: 'text'
            },
            {
                key: 'intendedProgramLevel',
                label: i18next.t('cards.programs.targetDegree', { ns: 'crm' }),
                type: 'text'
            },
            {
                key: 'intendedStartTime',
                label: i18next.t('cards.programs.startTime', { ns: 'crm' }),
                type: 'text'
            }
        ]
    },
    {
        id: 'language',
        title: i18next.t('cards.language.title', { ns: 'crm' }),
        gridSize: { md: 4, xs: 12 },
        fields: [
            {
                key: 'englishLevel',
                label: i18next.t('cards.language.englishLevel', { ns: 'crm' }),
                type: 'text'
            },
            {
                key: 'germanLevel',
                label: i18next.t('cards.language.germanLevel', { ns: 'crm' }),
                type: 'text'
            }
        ]
    },
    {
        id: 'work',
        title: i18next.t('cards.work.title', { ns: 'crm' }),
        gridSize: { md: 4, xs: 12 },
        fields: [
            {
                key: 'workExperience',
                label: i18next.t('cards.work.workExperience', { ns: 'crm' }),
                type: 'custom',
                render: (lead) => (
                    <Typography sx={{ whiteSpace: 'pre-line' }} variant="body1">
                        {lead.workExperience ||
                            i18next.t('cards.work.noWorkExperience', {
                                ns: 'crm'
                            })}
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
        title: i18next.t('cards.contact.title', { ns: 'crm' }),
        gridSize: { md: 4, xs: 12 },
        fields: [
            {
                key: 'email',
                label: i18next.t('cards.contact.email', { ns: 'crm' }),
                type: 'text',
                inputType: 'email'
            },
            {
                key: 'phone',
                label: i18next.t('cards.contact.phone', { ns: 'crm' }),
                type: 'text'
            },
            {
                key: 'preferredContact',
                label: i18next.t('cards.contact.preferredContact', {
                    ns: 'crm'
                }),
                type: 'text'
            },
            {
                key: 'lineId',
                label: i18next.t('cards.contact.lineId', { ns: 'crm' }),
                type: 'text'
            },
            {
                key: 'source',
                label: i18next.t('cards.contact.source', { ns: 'crm' }),
                type: 'text'
            }
        ]
    },
    {
        id: 'additional',
        title: i18next.t('cards.additional.title', { ns: 'crm' }),
        gridSize: { xs: 12 },
        fields: [
            {
                key: 'additionalInfo',
                label: i18next.t('cards.additional.additionalInfo', {
                    ns: 'crm'
                }),
                type: 'text',
                multiline: true,
                rows: 3
            },
            {
                key: 'reasonsToStudyAbroad',
                label: i18next.t('cards.additional.reasonsToStudyAbroad', {
                    ns: 'crm'
                }),
                type: 'text',
                multiline: true,
                rows: 3
            }
        ]
    }
];
