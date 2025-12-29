import { Typography } from '@mui/material';

export const getLeadCardConfigurations = (t) => [
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

export const getStudentCardConfigurations = (t) => [
    {
        id: 'academic-university',
        title: t('Academic Background Survey'),
        gridSize: { xs: 12, md: 8 },
        layout: 'grid',
        sections: [
            {
                title: t('High School'),
                gridSize: 4,
                fields: [
                    {
                        key: 'academic_background_university_high_school_isGraduated',
                        label: t('High School already graduated'),
                        type: 'text'
                    },
                    {
                        key: 'academic_background_university_attended_high_school',
                        label: t('High School Name (English)'),
                        type: 'text'
                    },
                    {
                        key: 'academic_background_university_high_school_graduated_year',
                        label: t('High School Graduate Year'),
                        type: 'text'
                    }
                ]
            },
            {
                title: t('University Name (Bachelor degree)'),
                gridSize: 4,
                fields: [
                    {
                        key: 'academic_background_university_attended_university',
                        label: t('University Name'),
                        type: 'text'
                    },
                    {
                        key: 'academic_background_university_attended_university_program',
                        label: t('Program Name'),
                        type: 'text'
                    },
                    {
                        key: 'academic_background_university_isGraduated',
                        label: t('Already Bachelor graduated ?'),
                        type: 'text'
                    },
                    {
                        key: 'academic_background_university_expected_grad_date',
                        label: t('Expected Graduate Year'),
                        type: 'text'
                    },
                    {
                        key: 'academic_background_university_My_GPA_Uni',
                        label: t('My GPA'),
                        type: 'text'
                    },
                    {
                        key: 'academic_background_university_Highest_GPA_Uni',
                        label: t(
                            'Highest Score GPA of your university program'
                        ),
                        type: 'text'
                    },
                    {
                        key: 'academic_background_university_Passing_GPA_Uni',
                        label: t(
                            'Passing Score GPA of your university program'
                        ),
                        type: 'text'
                    }
                ]
            },
            {
                title: t('Second degree (Another Bachelor or Master)', {
                    ns: 'survey'
                }),
                gridSize: 4,
                fields: [
                    {
                        key: 'academic_background_university_attendedSecondDegreeUniversity',
                        label: t('University Name'),
                        type: 'text'
                    },
                    {
                        key: 'academic_background_university_attendedSecondDegreeProgram',
                        label: t('Program Name'),
                        type: 'text'
                    },
                    {
                        key: 'academic_background_university_isSecondGraduated',
                        label: t('Already Second Degree graduated ?'),
                        type: 'text'
                    },
                    {
                        key: 'academic_background_university_expectedSecondDegreeGradDate',
                        label: t('Graduated Year'),
                        type: 'text'
                    }
                ]
            }
        ]
    },
    {
        id: 'application-preference',
        title: t('Application Preference'),
        gridSize: { xs: 12, md: 4 },
        layout: 'grid',
        sections: [
            {
                gridSize: 12,
                fields: [
                    {
                        key: 'application_preference_expected_application_date',
                        label: t('Expected Application Year'),
                        type: 'text'
                    },
                    {
                        key: 'application_preference_expected_application_semester',
                        label: t('Expected Application Semester'),
                        type: 'text'
                    }
                ]
            }
        ],
        fields: [
            {
                key: 'application_preference_target_degree',
                label: t('Target Degree Programs'),
                type: 'text'
            },
            {
                key: 'application_preference_target_program_language',
                label: t('Target Program Language'),
                type: 'text'
            },
            {
                key: 'application_preference_target_application_field',
                label: t('Target Application Fields'),
                type: 'text'
            },
            {
                key: 'application_preference_targetApplicationSubjects',
                label: t('Target Application Subjects'),
                type: 'text'
            },
            {
                key: 'application_preference_considered_privat_universities',
                label: t(
                    'Considering private universities? (Tuition Fee: ~15000 EURO/year)'
                ),
                type: 'text'
            },
            {
                key: 'application_preference_application_outside_germany',
                label: t('Considering universities outside Germany?'),
                type: 'text'
            },
            {
                key: 'application_preference_special_wished',
                label: t('Note'),
                type: 'text',
                multiline: true,
                rows: 3
            }
        ]
    },

    // 👇 same position as "language" in lead cards
    {
        id: 'academic-language',
        title: t('Languages Test and Certificates'),
        gridSize: { xs: 12, md: 4 },
        layout: 'grid',
        sections: [
            {
                title: t('English Certificate'),
                gridSize: 6,
                fields: [
                    {
                        key: 'academic_background_language_english_isPassed',
                        label: t('English Passed ? (IELTS 6_5 / TOEFL 88)'),
                        type: 'text'
                    },
                    {
                        key: 'academic_background_language_english_certificate',
                        label: t('English Certificate'),
                        type: 'text'
                    },
                    {
                        key: 'academic_background_language_english_score',
                        label: t('acquired-score'),
                        type: 'text'
                    },
                    {
                        key: 'academic_background_language_english_test_date',
                        label: t('English Test Date'),
                        type: 'text'
                    }
                ]
            },
            {
                title: t('German Certificate'),
                gridSize: 6,
                fields: [
                    {
                        key: 'academic_background_language_german_isPassed',
                        label: t(
                            'German Passed ? (Set Not need if applying English taught programs_)'
                        ),
                        type: 'text'
                    },
                    {
                        key: 'academic_background_language_german_certificate',
                        label: t('German Certificate'),
                        type: 'text'
                    },
                    {
                        key: 'academic_background_language_german_score',
                        label: t('German Test Score'),
                        type: 'text'
                    },
                    {
                        key: 'academic_background_language_german_test_date',
                        label: t('German Test Date'),
                        type: 'text'
                    }
                ]
            }
        ]
    },
    {
        id: 'academic-experience',
        title: t('Practical Experience', { ns: 'survey' }),
        gridSize: { xs: 12, md: 4 },
        fields: [
            {
                key: 'academic_background_university_Has_Exchange_Experience',
                label: t('Exchange Student Experience ?'),
                type: 'text'
            },
            {
                key: 'academic_background_university_Has_Internship_Experience',
                label: t('Internship Experience ?'),
                type: 'text'
            },
            {
                key: 'academic_background_university_Has_Working_Experience',
                label: t('Full-Time Job Experience ?'),
                type: 'text'
            }
        ]
    }
];
