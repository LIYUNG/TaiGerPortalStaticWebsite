import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Alert,
    Box,
    Button,
    Card,
    Checkbox,
    CircularProgress,
    Divider,
    FormControl,
    FormControlLabel,
    Grid,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    TextField,
    Typography
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';

import {
    getStudentCvProfile,
    updateStudentCvProfile,
    type CvProfileData,
    type CvProfileExperience,
    type CvProfileAward,
    type CvProfileComputerSkill
} from '@/api';

interface CVProfileFormProps {
    studentId: string;
}

const NS = 'cvmlrl';

// Controlled vocabulary for computer/hard-skill level (matches the CV validator).
const COMPUTER_LEVELS = [
    'very good knowledge',
    'good knowledge',
    'basic knowledge'
];

const emptyProfile = (): CvProfileData => ({
    personal_information: {},
    professional_experience: [],
    awards: [],
    skills: { computer: [], other: [] },
    interests: {}
});

// "06/2022" <-> "2022-06" (native <input type="month"> value)
const mmYYYYtoInput = (s?: string) => {
    const m = (s ?? '').match(/(\d{1,2})\/(\d{4})/);
    return m ? `${m[2]}-${m[1].padStart(2, '0')}` : '';
};
const inputToMMYYYY = (s?: string) => {
    const m = (s ?? '').match(/(\d{4})-(\d{2})/);
    return m ? `${m[2]}/${m[1]}` : '';
};

const parsePeriod = (period?: string) => {
    const parts = (period ?? '').split(/[–—-]/).map((p) => p.trim());
    const present = /present|current|now|jetzt/i.test(parts[1] ?? '');
    return {
        start: mmYYYYtoInput(parts[0] ?? ''),
        end: present ? '' : mmYYYYtoInput(parts[1] ?? ''),
        present
    };
};
const composePeriod = (start: string, end: string, present: boolean) => {
    const s = inputToMMYYYY(start);
    const e = present ? 'present' : inputToMMYYYY(end);
    if (!s && !e) return '';
    return `${s} – ${e}`;
};

const CVProfileForm = ({ studentId }: CVProfileFormProps) => {
    const { t } = useTranslation();
    const tp = (k: string) => t(`cvProfile.${k}`, { ns: NS });

    const [data, setData] = useState<CvProfileData>(emptyProfile());
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [savedAt, setSavedAt] = useState<Date | null>(null);

    useEffect(() => {
        let active = true;
        setLoading(true);
        getStudentCvProfile(studentId)
            .then((resp) => {
                if (active && resp?.success) {
                    setData({ ...emptyProfile(), ...resp.data });
                }
            })
            .catch(() => {
                if (active) setError(tp('loadFailed'));
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => {
            active = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [studentId]);

    const onSave = async () => {
        setSaving(true);
        setError(null);
        try {
            const resp = await updateStudentCvProfile(studentId, data);
            if (resp?.success) {
                setData({ ...emptyProfile(), ...resp.data });
                setSavedAt(new Date());
            } else {
                setError(tp('saveFailed'));
            }
        } catch (e) {
            setError(e instanceof Error ? e.message : tp('saveFailed'));
        } finally {
            setSaving(false);
        }
    };

    const SectionTitle = ({ children }: { children: React.ReactNode }) => (
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 2, mb: 1 }}>
            {children}
        </Typography>
    );

    if (loading) {
        return (
            <Box sx={{ p: 2 }}>
                <CircularProgress size={20} />
            </Box>
        );
    }

    const pi = data.personal_information;
    const setPi = (k: keyof typeof pi, v: string) =>
        setData((d) => ({
            ...d,
            personal_information: { ...d.personal_information, [k]: v }
        }));
    const setExp = (i: number, patch: Partial<CvProfileExperience>) =>
        setData((d) => {
            const arr = [...d.professional_experience];
            arr[i] = { ...arr[i], ...patch };
            return { ...d, professional_experience: arr };
        });
    const setAward = (i: number, k: keyof CvProfileAward, v: string) =>
        setData((d) => {
            const arr = [...d.awards];
            arr[i] = { ...arr[i], [k]: v };
            return { ...d, awards: arr };
        });
    const setComputer = (
        i: number,
        k: keyof CvProfileComputerSkill,
        v: string
    ) =>
        setData((d) => {
            const arr = [...(d.skills.computer ?? [])];
            arr[i] = { ...arr[i], [k]: v };
            return { ...d, skills: { ...d.skills, computer: arr } };
        });

    const month = (
        label: string,
        value: string,
        onChange: (v: string) => void
    ) => (
        <TextField
            fullWidth
            size="small"
            type="month"
            label={label}
            InputLabelProps={{ shrink: true }}
            value={value}
            onChange={(e) => onChange(e.target.value)}
        />
    );

    return (
        <Card variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6">{tp('title')}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {tp('subtitle')}
            </Typography>

            <SectionTitle>{tp('personalInformation')}</SectionTitle>
            <Grid container spacing={1}>
                {(
                    ['nationality', 'birthplace', 'address', 'phone'] as const
                ).map((k) => (
                    <Grid item xs={12} sm={6} key={k}>
                        <TextField
                            fullWidth
                            size="small"
                            label={tp(k)}
                            value={pi[k] ?? ''}
                            onChange={(e) => setPi(k, e.target.value)}
                        />
                    </Grid>
                ))}
            </Grid>

            <SectionTitle>{tp('practicalExperience')}</SectionTitle>
            {data.professional_experience.map((x, i) => {
                const p = parsePeriod(x.period);
                return (
                    <Card key={i} variant="outlined" sx={{ p: 1.5, mb: 1 }}>
                        <Stack direction="row" justifyContent="flex-end">
                            <IconButton
                                size="small"
                                onClick={() =>
                                    setData((d) => ({
                                        ...d,
                                        professional_experience:
                                            d.professional_experience.filter(
                                                (_, j) => j !== i
                                            )
                                    }))
                                }
                            >
                                <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                        </Stack>
                        <Grid container spacing={1} alignItems="center">
                            <Grid item xs={6} sm={3}>
                                {month(tp('startDate'), p.start, (v) =>
                                    setExp(i, {
                                        period: composePeriod(
                                            v,
                                            p.end,
                                            p.present
                                        )
                                    })
                                )}
                            </Grid>
                            <Grid item xs={6} sm={3}>
                                {month(tp('endDate'), p.end, (v) =>
                                    setExp(i, {
                                        period: composePeriod(p.start, v, false)
                                    })
                                )}
                            </Grid>
                            <Grid item xs={12} sm={3}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={p.present}
                                            onChange={(e) =>
                                                setExp(i, {
                                                    period: composePeriod(
                                                        p.start,
                                                        p.end,
                                                        e.target.checked
                                                    )
                                                })
                                            }
                                        />
                                    }
                                    label={tp('present')}
                                />
                            </Grid>
                            <Grid item xs={12} sm={3}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    label={tp('jobTitle')}
                                    value={x.job_title ?? ''}
                                    onChange={(e) =>
                                        setExp(i, { job_title: e.target.value })
                                    }
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    label={tp('company')}
                                    value={x.company ?? ''}
                                    onChange={(e) =>
                                        setExp(i, { company: e.target.value })
                                    }
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    label={tp('cityCountry')}
                                    value={[x.city, x.country]
                                        .filter(Boolean)
                                        .join(', ')}
                                    onChange={(e) => {
                                        const [city, country] = e.target.value
                                            .split(',')
                                            .map((s) => s.trim());
                                        setExp(i, {
                                            city: city ?? '',
                                            country: country ?? ''
                                        });
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    multiline
                                    minRows={2}
                                    size="small"
                                    label={tp('tasks')}
                                    value={(x.bullets ?? []).join('\n')}
                                    onChange={(e) =>
                                        setExp(i, {
                                            bullets: e.target.value
                                                .split('\n')
                                                .map((b) => b.trim())
                                                .filter(Boolean)
                                        })
                                    }
                                />
                            </Grid>
                        </Grid>
                    </Card>
                );
            })}
            <Button
                size="small"
                startIcon={<AddIcon />}
                onClick={() =>
                    setData((d) => ({
                        ...d,
                        professional_experience: [
                            ...d.professional_experience,
                            {}
                        ]
                    }))
                }
            >
                {tp('addExperience')}
            </Button>

            <SectionTitle>{tp('awards')}</SectionTitle>
            {data.awards.map((a, i) => (
                <Grid
                    container
                    spacing={1}
                    key={i}
                    sx={{ mb: 1 }}
                    alignItems="center"
                >
                    <Grid item xs={3} sm={2}>
                        {month(tp('date'), mmYYYYtoInput(a.date), (v) =>
                            setAward(i, 'date', inputToMMYYYY(v))
                        )}
                    </Grid>
                    <Grid item xs={4} sm={3}>
                        <TextField
                            fullWidth
                            size="small"
                            label={tp('awardTitle')}
                            value={a.title ?? ''}
                            onChange={(e) =>
                                setAward(i, 'title', e.target.value)
                            }
                        />
                    </Grid>
                    <Grid item xs={4} sm={6}>
                        <TextField
                            fullWidth
                            size="small"
                            label={tp('description')}
                            value={a.description ?? ''}
                            onChange={(e) =>
                                setAward(i, 'description', e.target.value)
                            }
                        />
                    </Grid>
                    <Grid item xs={1}>
                        <IconButton
                            size="small"
                            onClick={() =>
                                setData((d) => ({
                                    ...d,
                                    awards: d.awards.filter((_, j) => j !== i)
                                }))
                            }
                        >
                            <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                    </Grid>
                </Grid>
            ))}
            <Button
                size="small"
                startIcon={<AddIcon />}
                onClick={() =>
                    setData((d) => ({ ...d, awards: [...d.awards, {}] }))
                }
            >
                {tp('addAward')}
            </Button>

            <SectionTitle>{tp('skills')}</SectionTitle>
            {(data.skills.computer ?? []).map((c, i) => (
                <Grid
                    container
                    spacing={1}
                    key={i}
                    sx={{ mb: 1 }}
                    alignItems="center"
                >
                    <Grid item xs={5}>
                        <TextField
                            fullWidth
                            size="small"
                            label={tp('software')}
                            value={c.name ?? ''}
                            onChange={(e) =>
                                setComputer(i, 'name', e.target.value)
                            }
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <FormControl fullWidth size="small">
                            <InputLabel>{tp('level')}</InputLabel>
                            <Select
                                label={tp('level')}
                                value={
                                    COMPUTER_LEVELS.includes(c.level ?? '')
                                        ? c.level
                                        : ''
                                }
                                onChange={(e) =>
                                    setComputer(
                                        i,
                                        'level',
                                        String(e.target.value)
                                    )
                                }
                            >
                                {COMPUTER_LEVELS.map((lvl) => (
                                    <MenuItem key={lvl} value={lvl}>
                                        {tp(
                                            lvl === 'very good knowledge'
                                                ? 'levelVeryGood'
                                                : lvl === 'good knowledge'
                                                  ? 'levelGood'
                                                  : 'levelBasic'
                                        )}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={1}>
                        <IconButton
                            size="small"
                            onClick={() =>
                                setData((d) => ({
                                    ...d,
                                    skills: {
                                        ...d.skills,
                                        computer: (
                                            d.skills.computer ?? []
                                        ).filter((_, j) => j !== i)
                                    }
                                }))
                            }
                        >
                            <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                    </Grid>
                </Grid>
            ))}
            <Button
                size="small"
                startIcon={<AddIcon />}
                onClick={() =>
                    setData((d) => ({
                        ...d,
                        skills: {
                            ...d.skills,
                            computer: [...(d.skills.computer ?? []), {}]
                        }
                    }))
                }
            >
                {tp('addComputerSkill')}
            </Button>
            <Box sx={{ mt: 1 }}>
                <TextField
                    fullWidth
                    size="small"
                    label={tp('otherSkills')}
                    value={(data.skills.other ?? []).join(', ')}
                    onChange={(e) =>
                        setData((d) => ({
                            ...d,
                            skills: {
                                ...d.skills,
                                other: e.target.value
                                    .split(',')
                                    .map((o) => o.trim())
                                    .filter(Boolean)
                            }
                        }))
                    }
                />
            </Box>

            <SectionTitle>{tp('hobbiesInterests')}</SectionTitle>
            <Grid container spacing={1}>
                {(
                    [
                        'hobbies',
                        'social_engagement',
                        'competitive_sports'
                    ] as const
                ).map((k) => (
                    <Grid item xs={12} sm={4} key={k}>
                        <TextField
                            fullWidth
                            size="small"
                            label={tp(
                                k === 'social_engagement'
                                    ? 'socialEngagement'
                                    : k === 'competitive_sports'
                                      ? 'competitiveSports'
                                      : 'hobbies'
                            )}
                            value={data.interests[k] ?? ''}
                            onChange={(e) =>
                                setData((d) => ({
                                    ...d,
                                    interests: {
                                        ...d.interests,
                                        [k]: e.target.value
                                    }
                                }))
                            }
                        />
                    </Grid>
                ))}
            </Grid>

            <Divider sx={{ my: 2 }} />
            <Stack direction="row" alignItems="center" spacing={2}>
                <Button
                    variant="contained"
                    onClick={onSave}
                    disabled={saving}
                    startIcon={
                        saving ? (
                            <CircularProgress size={16} color="inherit" />
                        ) : undefined
                    }
                >
                    {tp('save')}
                </Button>
                {savedAt ? (
                    <Typography variant="caption" color="text.secondary">
                        {tp('saved')} {savedAt.toLocaleTimeString()}
                    </Typography>
                ) : null}
            </Stack>
            {error ? (
                <Alert severity="error" sx={{ mt: 1.5 }}>
                    {error}
                </Alert>
            ) : null}
        </Card>
    );
};

export default CVProfileForm;
