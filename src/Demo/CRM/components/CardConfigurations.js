import { useMemo, useState } from 'react';
import {
    Box,
    Chip,
    Typography,
    TextField,
    Button,
    IconButton,
    Stack
} from '@mui/material';
import { Close as CloseIcon, Add as AddIcon } from '@mui/icons-material';

const normalizeTagList = (value) => {
    const raw = Array.isArray(value)
        ? value
        : typeof value === 'string'
          ? value.split(/[\n,]/)
          : [];

    const normalized = raw
        .map((t) => (t && typeof t === 'object' ? t.tag : t))
        .map((t) => `${t}`.trim())
        .filter((t) => t.length > 0);

    const seen = new Set();
    return normalized.filter((tag) => {
        if (seen.has(tag)) return false;
        seen.add(tag);
        return true;
    });
};

const normalizeNoteObjects = (value) => {
    if (Array.isArray(value)) {
        return value
            .map((n) => (typeof n === 'object' ? n : { note: n }))
            .map((n) => ({
                ...n,
                note: `${n?.note ?? ''}`
            }))
            .filter((n) => n.note.trim().length > 0);
    }

    if (typeof value === 'string') {
        const normalized = `${value}`;
        return normalized.trim().length > 0 ? [{ note: normalized }] : [];
    }

    return [];
};

const TagsEditor = ({ field, formData, onFieldChange }) => {
    const [inputValue, setInputValue] = useState('');
    const tags = useMemo(
        () => normalizeTagList(formData[field.key] || []),
        [formData, field.key]
    );

    const addTags = (raw) => {
        const newTags = normalizeTagList(raw);
        if (!newTags.length) return;
        const merged = [...tags];
        newTags.forEach((tag) => {
            if (!merged.includes(tag)) merged.push(tag);
        });
        onFieldChange(field.key, merged);
        setInputValue('');
    };

    return (
        <Box sx={{ mb: 2 }}>
            <Typography color="text.secondary" variant="body2">
                {field.label}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                {tags.length === 0 ? (
                    <Typography color="text.secondary" variant="body2">
                        -
                    </Typography>
                ) : (
                    tags.map((tag) => (
                        <Chip
                            key={tag}
                            label={tag}
                            onDelete={() =>
                                onFieldChange(
                                    field.key,
                                    tags.filter((t) => t !== tag)
                                )
                            }
                            size="small"
                        />
                    ))
                )}
            </Box>
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <TextField
                    fullWidth
                    label={field.label}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            addTags(inputValue);
                        }
                    }}
                    size="small"
                    value={inputValue}
                />
                <Button
                    onClick={() => addTags(inputValue)}
                    startIcon={<AddIcon />}
                    variant="contained"
                >
                    Add
                </Button>
            </Stack>
        </Box>
    );
};

const NotesEditor = ({ field, formData, onFieldChange }) => {
    const [draft, setDraft] = useState('');
    const notes = useMemo(
        () => normalizeNoteObjects(formData[field.key] || []),
        [formData, field.key]
    );

    const updateNote = (index, newValue) => {
        const next = [...notes];
        next[index] = { ...next[index], note: newValue };
        onFieldChange(field.key, next);
    };

    const removeNote = (index) => {
        const next = notes.filter((_, i) => i !== index);
        onFieldChange(field.key, next);
    };

    const addNote = () => {
        const trimmed = `${draft}`.trim();
        if (!trimmed) return;
        const next = [...notes, { id: `new-${Date.now()}`, note: trimmed }];
        onFieldChange(field.key, next);
        setDraft('');
    };

    return (
        <Box sx={{ mb: 2 }}>
            <Typography color="text.secondary" variant="body2">
                {field.label}
            </Typography>
            <Stack spacing={1} sx={{ mt: 1 }}>
                {notes.length === 0 ? (
                    <Typography color="text.secondary" variant="body2">
                        -
                    </Typography>
                ) : (
                    notes.map((note, index) => (
                        <Stack
                            direction="row"
                            key={note.id || `note-${index}`}
                            spacing={1}
                            sx={{ alignItems: 'flex-start' }}
                        >
                            <TextField
                                fullWidth
                                minRows={2}
                                multiline
                                onChange={(e) =>
                                    updateNote(index, e.target.value)
                                }
                                value={note.note || ''}
                            />
                            <IconButton
                                aria-label="delete"
                                onClick={() => removeNote(index)}
                            >
                                <CloseIcon />
                            </IconButton>
                        </Stack>
                    ))
                )}
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    <TextField
                        fullWidth
                        label={field.label}
                        minRows={2}
                        multiline
                        onChange={(e) => setDraft(e.target.value)}
                        value={draft}
                    />
                    <Button
                        onClick={addNote}
                        startIcon={<AddIcon />}
                        variant="contained"
                    >
                        Add
                    </Button>
                </Stack>
            </Stack>
        </Box>
    );
};

export const getLeadCardConfigurations = (t) => [
    {
        id: 'internal',
        title: t('cards.internal.title', {
            ns: 'crm',
            defaultValue: 'Internal'
        }),
        gridSize: { xs: 12 },
        fields: [
            {
                key: 'tags',
                label: t('common.tags', { ns: 'crm', defaultValue: 'Tags' }),
                type: 'custom',
                render: (lead) => {
                    const tags = lead.tags || [];
                    if (!tags.length) {
                        return (
                            <Typography color="text.secondary" variant="body2">
                                {t('common.na', { ns: 'crm' })}
                            </Typography>
                        );
                    }
                    return (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {tags.map((tag) => (
                                <Chip key={tag} label={tag} size="small" />
                            ))}
                        </Box>
                    );
                },
                editField: {
                    type: 'custom',
                    renderEdit: ({ field, formData, onFieldChange }) => (
                        <TagsEditor
                            field={field}
                            formData={formData}
                            onFieldChange={onFieldChange}
                        />
                    )
                }
            },
            {
                key: 'notes',
                label: t('common.notes', { ns: 'crm', defaultValue: 'Notes' }),
                type: 'custom',
                render: (lead) => {
                    const notes = lead.notes || [];
                    if (!notes.length) {
                        return (
                            <Typography color="text.secondary" variant="body2">
                                {t('common.na', { ns: 'crm' })}
                            </Typography>
                        );
                    }
                    return (
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 1
                            }}
                        >
                            {notes.map((note) => (
                                <Typography
                                    key={note.id || note.note}
                                    variant="body2"
                                >
                                    • {note.note}
                                </Typography>
                            ))}
                        </Box>
                    );
                },
                editField: {
                    type: 'custom',
                    renderEdit: ({ field, formData, onFieldChange }) => (
                        <NotesEditor
                            field={field}
                            formData={formData}
                            onFieldChange={onFieldChange}
                        />
                    )
                }
            }
        ]
    },
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
                gridSize: 6,
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
                    },
                    {
                        key: 'application_preference_target_degree',
                        label: t('Target Degree Programs'),
                        type: 'text'
                    },
                    {
                        key: 'application_preference_target_program_language',
                        label: t('Target Program Language'),
                        type: 'text'
                    }
                ]
            },
            {
                gridSize: 6,
                fields: [
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
                    }
                ]
            }
        ],
        fields: [
            {
                key: 'application_preference_special_wished',
                label: t('Note'),
                type: 'text',
                multiline: true,
                rows: 3
            }
        ]
    },
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
