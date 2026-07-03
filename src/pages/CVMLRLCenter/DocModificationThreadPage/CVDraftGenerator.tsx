import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Alert,
    AlertTitle,
    Box,
    Button,
    Card,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Stack,
    TextField,
    Typography
} from '@mui/material';

import {
    generateCvDraft,
    renderCvDraft,
    attachCvDraftToThread,
    getSavedCvDraft,
    downloadCvDraft,
    type CVDraft,
    type CVDraftResult,
    type CVChecklistItem,
    type CVEducation,
    type CVExperience
} from '@/api';

interface CVDraftGeneratorProps {
    studentId: string;
    fileType: string;
    programId?: string;
    programFullName?: string;
    editorRequirements?: string;
    documentsthreadId?: string;
}

const Field = ({ label, value }: { label: string; value?: string }) =>
    value ? (
        <Typography variant="body2">
            <b>{label}:</b> {value}
        </Typography>
    ) : null;

const EducationBlock = ({
    items,
    title
}: {
    items: CVEducation[];
    title: string;
}) => {
    const { t } = useTranslation();
    const dv = (k: string) => t(`draftView.${k}`, { ns: 'cvmlrl' });
    return items.length ? (
        <Box sx={{ mb: 1 }}>
            <Typography variant="subtitle2">{title}</Typography>
            {items.map((e, i) => (
                <Box key={i} sx={{ pl: 1, mb: 0.5 }}>
                    <Typography variant="body2">
                        <b>{e.period}</b> —{' '}
                        {[e.institution, e.city, e.country]
                            .filter(Boolean)
                            .join(', ')}
                    </Typography>
                    <Field label={dv('major')} value={e.major} />
                    <Field label={dv('minor')} value={e.minor} />
                    <Field label={dv('gpa')} value={e.gpa} />
                    <Field label={dv('gsat')} value={e.gsat} />
                    <Field label={dv('courses')} value={e.courses} />
                    <Field
                        label={dv('specialActivities')}
                        value={e.specialActivities}
                    />
                </Box>
            ))}
        </Box>
    ) : null;
};

const ExperienceBlock = ({ items }: { items: CVExperience[] }) => {
    const { t } = useTranslation();
    const dv = (k: string) => t(`draftView.${k}`, { ns: 'cvmlrl' });
    return items.length ? (
        <Box sx={{ mb: 1 }}>
            <Typography variant="subtitle2">
                {dv('practicalExperience')}
            </Typography>
            {items.map((x, i) => (
                <Box key={i} sx={{ pl: 1, mb: 0.5 }}>
                    <Typography variant="body2">
                        <b>{x.period}</b> —{' '}
                        {[x.jobTitle, x.company, x.city, x.country]
                            .filter(Boolean)
                            .join(', ')}
                    </Typography>
                    <ul style={{ margin: '2px 0 2px 18px' }}>
                        {x.bullets.map((b, j) => (
                            <li key={j}>
                                <Typography variant="body2" component="span">
                                    {b}
                                </Typography>
                            </li>
                        ))}
                    </ul>
                </Box>
            ))}
        </Box>
    ) : null;
};

const Checklist = ({ items }: { items: CVChecklistItem[] }) => {
    const { t } = useTranslation();
    const errors = items.filter((i) => i.level === 'error');
    const warnings = items.filter((i) => i.level === 'warning');
    if (!items.length) {
        return (
            <Alert severity="success">
                {t('aiDraft.noIssues', { ns: 'cvmlrl' })}
            </Alert>
        );
    }
    return (
        <Stack spacing={1}>
            {errors.length > 0 && (
                <Alert severity="error">
                    <AlertTitle>
                        {t('aiDraft.mustFix', { ns: 'cvmlrl' })} (
                        {errors.length})
                    </AlertTitle>
                    <ul style={{ margin: 0, paddingLeft: 18 }}>
                        {errors.map((it, i) => (
                            <li key={i}>
                                <b>[{it.section}]</b> {it.message}
                            </li>
                        ))}
                    </ul>
                </Alert>
            )}
            {warnings.length > 0 && (
                <Alert severity="warning">
                    <AlertTitle>
                        {t('aiDraft.review', { ns: 'cvmlrl' })} (
                        {warnings.length})
                    </AlertTitle>
                    <ul style={{ margin: 0, paddingLeft: 18 }}>
                        {warnings.map((it, i) => (
                            <li key={i}>
                                <b>[{it.section}]</b> {it.message}
                            </li>
                        ))}
                    </ul>
                </Alert>
            )}
        </Stack>
    );
};

const DraftView = ({ draft }: { draft: CVDraft }) => {
    const { t } = useTranslation();
    const dv = (k: string) => t(`draftView.${k}`, { ns: 'cvmlrl' });
    return (
        <Box>
            <Typography variant="subtitle2">
                {dv('personalInformation')}
            </Typography>
            <Box sx={{ pl: 1, mb: 1 }}>
                <Field label={dv('name')} value={draft.personal.fullName} />
                <Field
                    label={dv('birthdayPlace')}
                    value={[draft.personal.birthday, draft.personal.birthplace]
                        .filter(Boolean)
                        .join(' / ')}
                />
                <Field
                    label={dv('nationality')}
                    value={draft.personal.nationality}
                />
                <Field label={dv('address')} value={draft.personal.address} />
                <Field label={dv('phone')} value={draft.personal.phone} />
                <Field label={dv('email')} value={draft.personal.email} />
            </Box>
            <EducationBlock
                items={draft.universities}
                title={dv('university')}
            />
            <EducationBlock
                items={draft.seniorHighSchools}
                title={dv('seniorHighSchool')}
            />
            <EducationBlock
                items={draft.juniorHighSchools}
                title={dv('juniorHighSchool')}
            />
            <ExperienceBlock items={draft.experience} />
            {draft.awards.length > 0 && (
                <Box sx={{ mb: 1 }}>
                    <Typography variant="subtitle2">{dv('awards')}</Typography>
                    {draft.awards.map((a, i) => (
                        <Typography key={i} variant="body2" sx={{ pl: 1 }}>
                            <b>{a.date}</b> {a.title} — {a.description}
                        </Typography>
                    ))}
                </Box>
            )}
            <Typography variant="subtitle2">{dv('skills')}</Typography>
            <Box sx={{ pl: 1, mb: 1 }}>
                {draft.languages.length > 0 && (
                    <Field
                        label={dv('languages')}
                        value={draft.languages
                            .map(
                                (l) =>
                                    `${l.name} – ${l.level}${l.testScore ? ` (${l.testScore})` : ''}`
                            )
                            .join('; ')}
                    />
                )}
                {draft.computer.length > 0 && (
                    <Field
                        label={dv('computer')}
                        value={draft.computer
                            .map((c) => `${c.name} – ${c.level}`)
                            .join('; ')}
                    />
                )}
                <Field label={dv('otherSkills')} value={draft.otherSkills} />
            </Box>
            <Typography variant="subtitle2">
                {dv('hobbiesInterests')}
            </Typography>
            <Box sx={{ pl: 1, mb: 1 }}>
                <Field
                    label={dv('socialEngagement')}
                    value={draft.socialEngagement}
                />
                <Field
                    label={dv('competitiveSports')}
                    value={draft.competitiveSports}
                />
                <Field label={dv('hobbies')} value={draft.hobbies} />
            </Box>
            <Field label={dv('anythingElse')} value={draft.anythingElse} />
        </Box>
    );
};

const Coverage = ({
    draft,
    hasPhoto
}: {
    draft: CVDraft;
    hasPhoto?: boolean;
}) => {
    const { t } = useTranslation();
    const cv = (k: string) => t(`coverage.${k}`, { ns: 'cvmlrl' });
    const p = draft.personal;
    const items: Array<[string, boolean]> = [
        ['photo', Boolean(hasPhoto)],
        ['name', Boolean(p.fullName)],
        ['contact', Boolean(p.phone || p.email || p.address)],
        [
            'birthNationality',
            Boolean(p.birthday || p.birthplace || p.nationality)
        ],
        ['university', draft.universities.length > 0],
        [
            'highSchool',
            draft.seniorHighSchools.length > 0 ||
                draft.juniorHighSchools.length > 0
        ],
        ['experience', draft.experience.length > 0],
        ['awards', draft.awards.length > 0],
        ['languages', draft.languages.length > 0],
        ['computer', draft.computer.length > 0],
        ['otherSkills', Boolean(draft.otherSkills)],
        [
            'hobbies',
            Boolean(
                draft.hobbies ||
                    draft.socialEngagement ||
                    draft.competitiveSports
            )
        ]
    ];
    const filled = items.filter(([, v]) => v).length;
    return (
        <Box sx={{ mb: 1 }}>
            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                {cv('title')} ({filled}/{items.length})
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {items.map(([k, v]) => (
                    <Chip
                        key={k}
                        size="small"
                        variant={v ? 'filled' : 'outlined'}
                        color={v ? 'success' : 'default'}
                        label={`${v ? '✓' : '–'} ${cv(k)}`}
                    />
                ))}
            </Box>
            <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', mt: 0.5 }}
            >
                {cv('hint')}
            </Typography>
        </Box>
    );
};

const CVDraftGenerator = ({
    studentId,
    fileType,
    programId,
    programFullName,
    editorRequirements,
    documentsthreadId
}: CVDraftGeneratorProps) => {
    const { t } = useTranslation();
    const td = (k: string) => t(`aiDraft.${k}`, { ns: 'cvmlrl' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<CVDraftResult | null>(null);
    // Editor-supplied facts to fill gaps the survey/profile is missing. Sent as
    // part of editorRequirements; the model uses them but still never invents.
    const [notes, setNotes] = useState('');
    const [rendering, setRendering] = useState(false);
    const [renderError, setRenderError] = useState<string | null>(null);
    // The rendered working .docx (stable S3 key). Cleared whenever the draft is
    // (re)generated, so a stale file can never be attached.
    const [rendered, setRendered] = useState<{
        name: string;
        path: string;
    } | null>(null);
    // "Attach to thread" dialog — the editor writes their own message.
    const [attachOpen, setAttachOpen] = useState(false);
    const [attachMessage, setAttachMessage] = useState('');
    const [attaching, setAttaching] = useState(false);
    const [attachError, setAttachError] = useState<string | null>(null);
    const [attached, setAttached] = useState(false);

    // Restore the last generated draft on refresh (persisted on the thread).
    useEffect(() => {
        if (!documentsthreadId) return;
        let active = true;
        getSavedCvDraft(documentsthreadId)
            .then((resp) => {
                if (active && resp?.success && resp.data) {
                    setResult(resp.data);
                }
            })
            .catch(() => {});
        return () => {
            active = false;
        };
    }, [documentsthreadId]);

    const onGenerate = async () => {
        setLoading(true);
        setError(null);
        setRendered(null);
        setRenderError(null);
        setAttached(false);
        setAttachError(null);
        try {
            const mergedRequirements = [editorRequirements, notes.trim()]
                .filter(Boolean)
                .join('\n');
            const resp = await generateCvDraft(studentId, {
                fileType,
                programId,
                programFullName,
                editorRequirements: mergedRequirements,
                documentsthreadId
            });
            if (resp?.success) {
                setResult(resp.data);
            } else {
                setError(td('failed'));
            }
        } catch (e) {
            setError(e instanceof Error ? e.message : td('failed'));
        } finally {
            setLoading(false);
        }
    };

    const onRenderDocx = async () => {
        if (!result) return;
        if (
            result.validation.errorCount > 0 &&
            !window.confirm(td('confirmErrors'))
        ) {
            return;
        }
        setRendering(true);
        setRenderError(null);
        try {
            const resp = await renderCvDraft(studentId, {
                draft: result.draft,
                documentsthreadId
            });
            if (resp?.success) {
                setRendered({ name: resp.data.name, path: resp.data.path });
                setAttached(false);
                setAttachError(null);
            } else {
                setRenderError(td('docxFailed'));
            }
        } catch (e) {
            setRenderError(e instanceof Error ? e.message : td('docxFailed'));
        } finally {
            setRendering(false);
        }
    };

    const openAttach = () => {
        setAttachError(null);
        setAttachMessage(td('attachDefaultMessage'));
        setAttachOpen(true);
    };

    const onAttach = async () => {
        if (!result || !documentsthreadId) return;
        setAttaching(true);
        setAttachError(null);
        try {
            const resp = await attachCvDraftToThread(documentsthreadId, {
                draft: result.draft,
                message: attachMessage
            });
            if (resp?.success) {
                setAttached(true);
                setAttachOpen(false);
            } else {
                setAttachError(td('attachFailed'));
            }
        } catch (e) {
            // A 409 means the rendered file is stale (draft changed since it was
            // generated); clear it so the editor must regenerate before sharing.
            const msg = e instanceof Error ? e.message : td('attachFailed');
            if (/change|regenerate|stale|409/i.test(msg)) {
                setRendered(null);
                setAttachOpen(false);
                setAttachError(td('attachStale'));
            } else {
                setAttachError(msg);
            }
        } finally {
            setAttaching(false);
        }
    };

    const onDownload = async () => {
        if (!result) return;
        setRendering(true);
        setRenderError(null);
        try {
            const blob = await downloadCvDraft(studentId, result.draft);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'CV_first_draft.docx';
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        } catch (e) {
            setRenderError(e instanceof Error ? e.message : td('docxFailed'));
        } finally {
            setRendering(false);
        }
    };

    return (
        <Card variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{ mb: 1 }}
            >
                <Typography variant="h6">{td('title')}</Typography>
                <Chip size="small" label={td('chip')} />
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {td('subtitle')}
            </Typography>

            <TextField
                fullWidth
                multiline
                minRows={2}
                size="small"
                label={td('notesLabel')}
                placeholder={td('notesPlaceholder')}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={loading}
                sx={{ mb: 1.5 }}
            />

            <Button
                variant="contained"
                onClick={onGenerate}
                disabled={loading}
                startIcon={
                    loading ? (
                        <CircularProgress size={16} color="inherit" />
                    ) : undefined
                }
            >
                {result ? td('regenerate') : td('generate')}
            </Button>

            {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                    {error}
                </Alert>
            )}

            {result && (
                <Box sx={{ mt: 2 }}>
                    <Checklist items={result.validation.items} />
                    <Coverage draft={result.draft} hasPhoto={result.hasPhoto} />
                    <Divider sx={{ my: 2 }} />
                    <DraftView draft={result.draft} />
                    <Divider sx={{ my: 2 }} />
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                        <Button
                            variant="contained"
                            onClick={onRenderDocx}
                            disabled={rendering}
                            startIcon={
                                rendering ? (
                                    <CircularProgress
                                        size={16}
                                        color="inherit"
                                    />
                                ) : undefined
                            }
                        >
                            {rendered ? td('regenerateDocx') : td('createDocx')}
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={onDownload}
                            disabled={rendering}
                        >
                            {td('downloadDocx')}
                        </Button>
                        <Button
                            variant="outlined"
                            color="secondary"
                            onClick={openAttach}
                            disabled={rendering || !rendered}
                        >
                            {td('attachToThread')}
                        </Button>
                    </Stack>
                    {rendered ? (
                        <Alert severity="success" sx={{ mt: 1.5 }}>
                            {td('docxReady')}: {rendered.name}
                        </Alert>
                    ) : null}
                    {attached ? (
                        <Alert severity="success" sx={{ mt: 1.5 }}>
                            {td('attachSuccess')}
                        </Alert>
                    ) : null}
                    {attachError ? (
                        <Alert severity="warning" sx={{ mt: 1.5 }}>
                            {attachError}
                        </Alert>
                    ) : null}
                    {renderError ? (
                        <Alert severity="error" sx={{ mt: 1.5 }}>
                            {renderError}
                        </Alert>
                    ) : null}
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: 'block', mt: 1 }}
                    >
                        {td('generatedBy')} {result.meta.model} at{' '}
                        {new Date(result.meta.generatedAt).toLocaleString()}
                    </Typography>

                    <Dialog
                        open={attachOpen}
                        onClose={() => !attaching && setAttachOpen(false)}
                        fullWidth
                        maxWidth="sm"
                    >
                        <DialogTitle>{td('attachDialogTitle')}</DialogTitle>
                        <DialogContent>
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mb: 1.5 }}
                            >
                                {td('attachDialogSubtitle')}
                            </Typography>
                            <TextField
                                fullWidth
                                multiline
                                minRows={3}
                                size="small"
                                label={td('attachMessageLabel')}
                                value={attachMessage}
                                onChange={(e) =>
                                    setAttachMessage(e.target.value)
                                }
                                disabled={attaching}
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button
                                onClick={() => setAttachOpen(false)}
                                disabled={attaching}
                            >
                                {td('cancel')}
                            </Button>
                            <Button
                                variant="contained"
                                onClick={onAttach}
                                disabled={attaching}
                                startIcon={
                                    attaching ? (
                                        <CircularProgress
                                            size={16}
                                            color="inherit"
                                        />
                                    ) : undefined
                                }
                            >
                                {td('attachSend')}
                            </Button>
                        </DialogActions>
                    </Dialog>
                </Box>
            )}
        </Card>
    );
};

export default CVDraftGenerator;
