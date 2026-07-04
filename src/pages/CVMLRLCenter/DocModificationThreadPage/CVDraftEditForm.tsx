import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Box,
    Button,
    Divider,
    IconButton,
    MenuItem,
    Stack,
    TextField,
    Typography
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

import type {
    CVDraft,
    CVEducation,
    CVExperience,
    CVAward,
    CVLanguage,
    CVComputerSkill
} from '@/api';

// Controlled vocabularies — MUST match services/ai-assist/cv/validate.ts so a
// dropdown selection can never produce a lang_bad_level / computer_bad_level.
const LANGUAGE_LEVELS = [
    'mother tongue',
    'business fluent',
    'fluent',
    'intermediate',
    'beginner'
];
const COMPUTER_LEVELS = [
    'very good knowledge',
    'good knowledge',
    'basic knowledge'
];

// Immutable helper: replace item i of an array via an updater.
const replaceAt = <T,>(arr: T[], i: number, next: T): T[] =>
    arr.map((v, idx) => (idx === i ? next : v));

interface EditProps {
    initial: CVDraft;
    saving?: boolean;
    onSave: (draft: CVDraft) => void;
    onCancel: () => void;
    // Emitted on every change so the parent can live-validate (debounced).
    onChange?: (draft: CVDraft) => void;
}

/**
 * Tightly-scoped inline editor for a reviewed CVDraft: edit existing scalar
 * fields, pick the two controlled-vocabulary levels from dropdowns, and edit /
 * add / remove experience bullets. Adding whole education/experience entities is
 * intentionally NOT supported here — that happens in CV Details + regenerate.
 */
const CVDraftEditForm = ({
    initial,
    saving,
    onSave,
    onCancel,
    onChange
}: EditProps) => {
    const { t } = useTranslation();
    const td = (k: string) => t(`aiDraft.${k}`, { ns: 'cvmlrl' });
    const dv = (k: string) => t(`draftView.${k}`, { ns: 'cvmlrl' });
    // Deep clone so Cancel is a true no-op on the parent's draft.
    const [d, setD] = useState<CVDraft>(() =>
        JSON.parse(JSON.stringify(initial))
    );
    // Notify the parent of edits so it can live-validate the working draft.
    // Skip the initial mount (the draft is unchanged then — avoids a redundant
    // validate call right after opening the editor).
    const firstEdit = useRef(true);
    useEffect(() => {
        if (firstEdit.current) {
            firstEdit.current = false;
            return;
        }
        onChange?.(d);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [d]);

    const field = (
        label: string,
        value: string,
        onChange: (v: string) => void,
        opts?: { multiline?: boolean }
    ) => (
        <TextField
            size="small"
            label={label}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={saving}
            fullWidth
            multiline={opts?.multiline}
            minRows={opts?.multiline ? 2 : undefined}
            sx={{ mb: 1 }}
        />
    );

    const setPersonal = (k: keyof CVDraft['personal'], v: string) =>
        setD((p) => ({ ...p, personal: { ...p.personal, [k]: v } }));

    const setEdu = (
        group: 'universities' | 'seniorHighSchools' | 'juniorHighSchools',
        i: number,
        k: keyof CVEducation,
        v: string
    ) =>
        setD((p) => ({
            ...p,
            [group]: replaceAt(p[group], i, { ...p[group][i], [k]: v })
        }));

    const setExp = (i: number, k: keyof CVExperience, v: string) =>
        setD((p) => ({
            ...p,
            experience: replaceAt(p.experience, i, {
                ...p.experience[i],
                [k]: v
            })
        }));

    const setBullet = (i: number, j: number, v: string) =>
        setD((p) => ({
            ...p,
            experience: replaceAt(p.experience, i, {
                ...p.experience[i],
                bullets: replaceAt(p.experience[i].bullets, j, v)
            })
        }));

    const addBullet = (i: number) =>
        setD((p) => ({
            ...p,
            experience: replaceAt(p.experience, i, {
                ...p.experience[i],
                bullets: [...p.experience[i].bullets, '']
            })
        }));

    const removeBullet = (i: number, j: number) =>
        setD((p) => ({
            ...p,
            experience: replaceAt(p.experience, i, {
                ...p.experience[i],
                bullets: p.experience[i].bullets.filter((_, idx) => idx !== j)
            })
        }));

    const setAward = (i: number, k: keyof CVAward, v: string) =>
        setD((p) => ({
            ...p,
            awards: replaceAt(p.awards, i, { ...p.awards[i], [k]: v })
        }));

    const setLang = (i: number, k: keyof CVLanguage, v: string) =>
        setD((p) => ({
            ...p,
            languages: replaceAt(p.languages, i, { ...p.languages[i], [k]: v })
        }));

    const setComputer = (i: number, k: keyof CVComputerSkill, v: string) =>
        setD((p) => ({
            ...p,
            computer: replaceAt(p.computer, i, { ...p.computer[i], [k]: v })
        }));

    const section = (title: string) => (
        <Typography variant="subtitle2" sx={{ mt: 1.5, mb: 0.5 }}>
            {title}
        </Typography>
    );

    const eduBlock = (
        group: 'universities' | 'seniorHighSchools' | 'juniorHighSchools',
        title: string,
        isUni: boolean
    ) =>
        d[group].length ? (
            <Box>
                {section(title)}
                {d[group].map((e, i) => (
                    <Box
                        key={i}
                        sx={{ pl: 1, mb: 1, borderLeft: '2px solid #eee' }}
                    >
                        {field(dv('period'), e.period, (v) =>
                            setEdu(group, i, 'period', v)
                        )}
                        {field(dv('institution'), e.institution, (v) =>
                            setEdu(group, i, 'institution', v)
                        )}
                        <Stack direction="row" spacing={1}>
                            {field(dv('city'), e.city, (v) =>
                                setEdu(group, i, 'city', v)
                            )}
                            {field(dv('country'), e.country, (v) =>
                                setEdu(group, i, 'country', v)
                            )}
                        </Stack>
                        {isUni ? (
                            <>
                                {field(dv('major'), e.major, (v) =>
                                    setEdu(group, i, 'major', v)
                                )}
                                {field(dv('minor'), e.minor, (v) =>
                                    setEdu(group, i, 'minor', v)
                                )}
                                {field(dv('gpa'), e.gpa, (v) =>
                                    setEdu(group, i, 'gpa', v)
                                )}
                            </>
                        ) : (
                            field(dv('gsat'), e.gsat, (v) =>
                                setEdu(group, i, 'gsat', v)
                            )
                        )}
                        {field(dv('courses'), e.courses, (v) =>
                            setEdu(group, i, 'courses', v)
                        )}
                        {field(
                            dv('specialActivities'),
                            e.specialActivities,
                            (v) => setEdu(group, i, 'specialActivities', v)
                        )}
                    </Box>
                ))}
            </Box>
        ) : null;

    return (
        <Box>
            <Typography variant="caption" color="text.secondary">
                {td('editHint')}
            </Typography>

            {section(dv('personalInformation'))}
            {field(dv('name'), d.personal.fullName, (v) =>
                setPersonal('fullName', v)
            )}
            <Stack direction="row" spacing={1}>
                {field(dv('birthday'), d.personal.birthday, (v) =>
                    setPersonal('birthday', v)
                )}
                {field(dv('birthplace'), d.personal.birthplace, (v) =>
                    setPersonal('birthplace', v)
                )}
            </Stack>
            {field(dv('nationality'), d.personal.nationality, (v) =>
                setPersonal('nationality', v)
            )}
            {field(dv('address'), d.personal.address, (v) =>
                setPersonal('address', v)
            )}
            <Stack direction="row" spacing={1}>
                {field(dv('phone'), d.personal.phone, (v) =>
                    setPersonal('phone', v)
                )}
                {field(dv('email'), d.personal.email, (v) =>
                    setPersonal('email', v)
                )}
            </Stack>

            {eduBlock('universities', dv('university'), true)}
            {eduBlock('seniorHighSchools', dv('seniorHighSchool'), false)}
            {eduBlock('juniorHighSchools', dv('juniorHighSchool'), false)}

            {d.experience.length ? (
                <Box>
                    {section(dv('practicalExperience'))}
                    {d.experience.map((x, i) => (
                        <Box
                            key={i}
                            sx={{ pl: 1, mb: 1, borderLeft: '2px solid #eee' }}
                        >
                            {field(dv('period'), x.period, (v) =>
                                setExp(i, 'period', v)
                            )}
                            <Stack direction="row" spacing={1}>
                                {field(dv('jobTitle'), x.jobTitle, (v) =>
                                    setExp(i, 'jobTitle', v)
                                )}
                                {field(dv('company'), x.company, (v) =>
                                    setExp(i, 'company', v)
                                )}
                            </Stack>
                            <Stack direction="row" spacing={1}>
                                {field(dv('city'), x.city, (v) =>
                                    setExp(i, 'city', v)
                                )}
                                {field(dv('country'), x.country, (v) =>
                                    setExp(i, 'country', v)
                                )}
                            </Stack>
                            {x.bullets.map((b, j) => (
                                <Stack
                                    key={j}
                                    direction="row"
                                    alignItems="center"
                                    spacing={0.5}
                                >
                                    <TextField
                                        size="small"
                                        value={b}
                                        onChange={(e) =>
                                            setBullet(i, j, e.target.value)
                                        }
                                        disabled={saving}
                                        fullWidth
                                        multiline
                                        sx={{ mb: 1 }}
                                    />
                                    <IconButton
                                        size="small"
                                        onClick={() => removeBullet(i, j)}
                                        disabled={saving}
                                        aria-label="remove bullet"
                                    >
                                        <DeleteOutlineIcon fontSize="small" />
                                    </IconButton>
                                </Stack>
                            ))}
                            <Button
                                size="small"
                                startIcon={<AddIcon />}
                                onClick={() => addBullet(i)}
                                disabled={saving}
                            >
                                {td('addBullet')}
                            </Button>
                        </Box>
                    ))}
                </Box>
            ) : null}

            {d.awards.length ? (
                <Box>
                    {section(dv('awards'))}
                    {d.awards.map((a, i) => (
                        <Box key={i} sx={{ pl: 1, mb: 1 }}>
                            <Stack direction="row" spacing={1}>
                                {field(dv('date'), a.date, (v) =>
                                    setAward(i, 'date', v)
                                )}
                                {field(dv('title'), a.title, (v) =>
                                    setAward(i, 'title', v)
                                )}
                            </Stack>
                            {field(dv('description'), a.description, (v) =>
                                setAward(i, 'description', v)
                            )}
                        </Box>
                    ))}
                </Box>
            ) : null}

            {d.languages.length ? (
                <Box>
                    {section(dv('languages'))}
                    {d.languages.map((l, i) => (
                        <Stack key={i} direction="row" spacing={1}>
                            {field(dv('name'), l.name, (v) =>
                                setLang(i, 'name', v)
                            )}
                            <TextField
                                size="small"
                                select
                                label={dv('level')}
                                value={
                                    LANGUAGE_LEVELS.includes(
                                        l.level.toLowerCase()
                                    )
                                        ? l.level.toLowerCase()
                                        : ''
                                }
                                onChange={(e) =>
                                    setLang(i, 'level', e.target.value)
                                }
                                disabled={saving}
                                sx={{ mb: 1, minWidth: 170 }}
                            >
                                {LANGUAGE_LEVELS.map((lv) => (
                                    <MenuItem key={lv} value={lv}>
                                        {lv}
                                    </MenuItem>
                                ))}
                            </TextField>
                            {field(dv('testScore'), l.testScore, (v) =>
                                setLang(i, 'testScore', v)
                            )}
                        </Stack>
                    ))}
                </Box>
            ) : null}

            {d.computer.length ? (
                <Box>
                    {section(dv('computer'))}
                    {d.computer.map((c, i) => (
                        <Stack key={i} direction="row" spacing={1}>
                            {field(dv('name'), c.name, (v) =>
                                setComputer(i, 'name', v)
                            )}
                            <TextField
                                size="small"
                                select
                                label={dv('level')}
                                value={
                                    COMPUTER_LEVELS.includes(
                                        c.level.toLowerCase()
                                    )
                                        ? c.level.toLowerCase()
                                        : ''
                                }
                                onChange={(e) =>
                                    setComputer(i, 'level', e.target.value)
                                }
                                disabled={saving}
                                sx={{ mb: 1, minWidth: 190 }}
                            >
                                {COMPUTER_LEVELS.map((lv) => (
                                    <MenuItem key={lv} value={lv}>
                                        {lv}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Stack>
                    ))}
                </Box>
            ) : null}

            {section(dv('skills'))}
            {field(
                dv('otherSkills'),
                d.otherSkills,
                (v) => setD((p) => ({ ...p, otherSkills: v })),
                { multiline: true }
            )}

            {section(dv('hobbiesInterests'))}
            {field(dv('socialEngagement'), d.socialEngagement, (v) =>
                setD((p) => ({ ...p, socialEngagement: v }))
            )}
            {field(dv('competitiveSports'), d.competitiveSports, (v) =>
                setD((p) => ({ ...p, competitiveSports: v }))
            )}
            {field(
                dv('hobbies'),
                d.hobbies,
                (v) => setD((p) => ({ ...p, hobbies: v })),
                { multiline: true }
            )}
            {field(
                dv('anythingElse'),
                d.anythingElse,
                (v) => setD((p) => ({ ...p, anythingElse: v })),
                { multiline: true }
            )}

            <Divider sx={{ my: 1.5 }} />
            <Stack direction="row" spacing={1}>
                <Button
                    variant="contained"
                    onClick={() => onSave(d)}
                    disabled={saving}
                >
                    {td('saveEdits')}
                </Button>
                <Button onClick={onCancel} disabled={saving}>
                    {td('cancelEdits')}
                </Button>
            </Stack>
        </Box>
    );
};

export default CVDraftEditForm;
