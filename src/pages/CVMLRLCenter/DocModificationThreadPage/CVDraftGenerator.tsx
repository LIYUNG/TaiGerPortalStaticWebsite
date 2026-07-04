import { useState, useEffect, useRef } from 'react';
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
    Link,
    Stack,
    TextField,
    Tooltip,
    Typography
} from '@mui/material';

import {
    generateCvDraft,
    renderCvDraft,
    attachCvDraftToThread,
    getSavedCvDraft,
    getCvReadiness,
    getMyAiQuota,
    downloadCvDraft,
    updateCvDraft,
    validateCvDraft,
    type CVDraft,
    type CVDraftResult,
    type CVValidationResult,
    type CVChecklistItem,
    type CVEducation,
    type CVExperience
} from '@/api';
import CVDraftEditForm from './CVDraftEditForm';

interface CVDraftGeneratorProps {
    studentId: string;
    fileType: string;
    programId?: string;
    // Target program degree (e.g. "Bachelor" / "Master"). Threaded to the
    // generator/validator so the bachelor-only rules (junior high school) apply.
    degree?: string;
    programFullName?: string;
    editorRequirements?: string;
    documentsthreadId?: string;
    // When the thread is final, attaching is blocked (reopen first).
    isFinalVersion?: boolean;
    // Switch the parent tab view to CV Details (checklist / coverage deep-links).
    onNavigateToCvDetails?: () => void;
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

const Checklist = ({
    items,
    onNavigate
}: {
    items: CVChecklistItem[];
    onNavigate?: () => void;
}) => {
    const { t } = useTranslation();
    const errors = items.filter((i) => i.level === 'error');
    const warnings = items.filter((i) => i.level === 'warning');
    // A checklist item is actionable when it points at data the editor fixes in
    // CV Details (i.e. not a transient system/parse error).
    const clickable = (section: string) =>
        Boolean(onNavigate) && section !== 'system';
    const itemSx = (section: string) =>
        clickable(section)
            ? { cursor: 'pointer', textDecoration: 'underline dotted' }
            : undefined;
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
                            <li
                                key={i}
                                onClick={
                                    clickable(it.section)
                                        ? onNavigate
                                        : undefined
                                }
                                title={
                                    clickable(it.section)
                                        ? t('aiDraft.fixInCvDetails', {
                                              ns: 'cvmlrl'
                                          })
                                        : undefined
                                }
                                style={itemSx(it.section)}
                            >
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
                            <li
                                key={i}
                                onClick={
                                    clickable(it.section)
                                        ? onNavigate
                                        : undefined
                                }
                                title={
                                    clickable(it.section)
                                        ? t('aiDraft.fixInCvDetails', {
                                              ns: 'cvmlrl'
                                          })
                                        : undefined
                                }
                                style={itemSx(it.section)}
                            >
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
    hasPhoto,
    onNavigate
}: {
    draft: CVDraft;
    hasPhoto?: boolean;
    onNavigate?: () => void;
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
                {items.map(([k, v]) => {
                    // Only unfilled (outlined) chips are actionable — they point
                    // the editor to data still missing from CV Details.
                    const isClickable = !v && Boolean(onNavigate);
                    return (
                        <Chip
                            key={k}
                            size="small"
                            variant={v ? 'filled' : 'outlined'}
                            color={v ? 'success' : 'default'}
                            label={`${v ? '✓' : '–'} ${cv(k)}`}
                            onClick={isClickable ? onNavigate : undefined}
                            clickable={isClickable}
                        />
                    );
                })}
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

// Maps CVDraft top-level keys to draftView i18n labels for the regenerate diff.
const SECTION_LABEL: Record<string, string> = {
    personal: 'personalInformation',
    universities: 'university',
    seniorHighSchools: 'seniorHighSchool',
    juniorHighSchools: 'juniorHighSchool',
    experience: 'practicalExperience',
    awards: 'awards',
    languages: 'languages',
    computer: 'computer',
    otherSkills: 'otherSkills',
    socialEngagement: 'socialEngagement',
    competitiveSports: 'competitiveSports',
    hobbies: 'hobbies',
    anythingElse: 'anythingElse'
};

const CVDraftGenerator = ({
    studentId,
    fileType,
    programId,
    degree,
    programFullName,
    editorRequirements,
    documentsthreadId,
    isFinalVersion,
    onNavigateToCvDetails
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
        photoEmbedded?: boolean;
    } | null>(null);
    // True when the last render reused an unchanged file (no new .docx produced).
    const [reused, setReused] = useState(false);
    // Confirm dialog shown when creating the .docx while must-fix items remain.
    const [confirmOpen, setConfirmOpen] = useState(false);
    // Inline structured editing of the reviewed draft.
    const [editing, setEditing] = useState(false);
    const [savingEdit, setSavingEdit] = useState(false);
    const [editError, setEditError] = useState<string | null>(null);
    // Live checklist while inline-editing (debounced server validation).
    const [editValidation, setEditValidation] =
        useState<CVValidationResult | null>(null);
    const editValidateTimer = useRef<ReturnType<typeof setTimeout>>();
    // Remaining TaiGer AI quota (null while unknown / not gated).
    const [quota, setQuota] = useState<number | null>(null);
    // Confirm dialog when regenerating with unchanged inputs (avoids wasting a
    // credit + reshuffling a reviewed draft, while still allowing a deliberate re-roll).
    const [regenConfirmOpen, setRegenConfirmOpen] = useState(false);
    // Pre-generation readiness (shown before the first draft exists).
    const [readiness, setReadiness] = useState<
        { key: string; ok: boolean }[] | null
    >(null);
    // "Request missing info" — an editable, editor-reviewed student message
    // drafted from the checklist gaps. Never auto-posted.
    const [requestOpen, setRequestOpen] = useState(false);
    const [requestMsg, setRequestMsg] = useState('');
    const [requestCopied, setRequestCopied] = useState(false);
    // Undo-of-regenerate (restore the previous draft from history).
    const [undoing, setUndoing] = useState(false);
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
                    // Restore the editor notes that fed this draft (survives tab
                    // switch / refresh) — provenance from meta (W6).
                    if (resp.data.meta?.editorNotes) {
                        setNotes(resp.data.meta.editorNotes);
                    }
                    // Restore the "ready to attach" state if the persisted .docx
                    // is still current for this draft — otherwise a tab switch or
                    // refresh would needlessly disable Attach (U1).
                    if (resp.data.renderedCurrent && resp.data.rendered) {
                        setRendered({
                            name: resp.data.rendered.name,
                            path: resp.data.rendered.path,
                            photoEmbedded: resp.data.rendered.photoEmbedded
                        });
                    }
                }
            })
            .catch(() => {});
        return () => {
            active = false;
        };
    }, [documentsthreadId]);

    // Pre-generation readiness snapshot from the profile (cheap GET). Rendered
    // only in the empty state (before a draft exists), so a wasted call when a
    // draft is already saved is harmless.
    useEffect(() => {
        if (!studentId) return;
        let active = true;
        getCvReadiness(studentId)
            .then((r) => {
                if (active && r?.success) setReadiness(r.data.readiness);
            })
            .catch(() => {});
        return () => {
            active = false;
        };
    }, [studentId]);

    // Remaining AI quota, refreshed after each generation (which spends one).
    useEffect(() => {
        let active = true;
        getMyAiQuota()
            .then((r) => {
                if (active && r?.success) setQuota(r.data.quota);
            })
            .catch(() => {});
        return () => {
            active = false;
        };
    }, []);

    const onGenerate = async () => {
        setLoading(true);
        setError(null);
        setRendered(null);
        setReused(false);
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
                degree,
                programFullName,
                editorRequirements: mergedRequirements,
                documentsthreadId
            });
            if (resp?.success && resp.data?.meta?.parseError) {
                // Server didn't persist or charge — keep the existing good draft
                // on screen and surface a retry error instead of replacing it with
                // the empty parse-failure draft.
                setError(td('parseFailedBody'));
            } else if (resp?.success) {
                setResult(resp.data);
            } else {
                setError(td('failed'));
            }
        } catch (e) {
            const status = (e as { status?: number })?.status;
            setError(
                status === 403
                    ? td('quotaExceeded')
                    : e instanceof Error
                      ? e.message
                      : td('failed')
            );
        } finally {
            setLoading(false);
            getMyAiQuota()
                .then((r) => {
                    if (r?.success) setQuota(r.data.quota);
                })
                .catch(() => {});
        }
    };

    // True when nothing that feeds generation has changed since the current draft
    // (best-effort client check: a draft exists, notes match provenance, and CV
    // Details / photo weren't flagged as changed). Generation has no server dedup,
    // so an unchanged regenerate really spends a credit and may reshuffle.
    const inputsUnchanged = (): boolean =>
        Boolean(result) &&
        !result?.meta.parseError &&
        !result?.inputsChanged &&
        notes.trim() === (result?.meta.editorNotes ?? '').trim();

    const onGenerateClick = () => {
        if (inputsUnchanged()) {
            setRegenConfirmOpen(true);
        } else {
            onGenerate();
        }
    };

    const onConfirmRegen = () => {
        setRegenConfirmOpen(false);
        onGenerate();
    };

    // Actually render the reviewed draft into the working .docx. Extracted so it
    // can run directly (no must-fix items) or after the confirm dialog.
    const doRender = async () => {
        if (!result) return;
        setRendering(true);
        setRenderError(null);
        try {
            const resp = await renderCvDraft(studentId, {
                draft: result.draft,
                documentsthreadId
            });
            if (resp?.success) {
                setRendered({
                    name: resp.data.name,
                    path: resp.data.path,
                    photoEmbedded: resp.data.photoEmbedded
                });
                setReused(Boolean(resp.data.reused));
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

    const onRenderDocx = async () => {
        if (!result) return;
        // Must-fix items present: confirm via a proper dialog (listing them),
        // not a native window.confirm that looks broken next to the MUI app.
        if (result.validation.errorCount > 0) {
            setConfirmOpen(true);
            return;
        }
        await doRender();
    };

    const onConfirmRender = async () => {
        setConfirmOpen(false);
        await doRender();
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
            // generated) or missing; clear it so the editor must regenerate before
            // sharing. Prefer the machine-readable code, falling back to the old
            // message regex for resilience.
            const msg = e instanceof Error ? e.message : td('attachFailed');
            const code = (e as { code?: string })?.code;
            const isStale =
                code === 'CV_DRAFT_STALE' ||
                code === 'CV_DRAFT_NO_RENDER' ||
                (!code && /change|regenerate|stale|409/i.test(msg));
            if (isStale) {
                setRendered(null);
                setReused(false);
                setAttachOpen(false);
                setAttachError(td('attachStale'));
            } else if (code === 'CV_DRAFT_THREAD_FINAL') {
                // Terminal for the dialog — retrying won't help until the thread
                // is reopened. Close it and surface the reason.
                setAttachOpen(false);
                setAttachError(td('attachThreadFinal'));
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

    // Persist inline edits: the server re-validates and drops the rendered .docx,
    // so the checklist refreshes and the editor must re-create the working copy
    // before attaching (keeps the stale guard honest).
    const onSaveEdits = async (draft: CVDraft) => {
        if (!documentsthreadId) return;
        setSavingEdit(true);
        setEditError(null);
        try {
            const resp = await updateCvDraft(documentsthreadId, {
                draft,
                degree
            });
            if (resp?.success && resp.data) {
                setResult(resp.data);
                setRendered(null);
                setReused(false);
                setAttached(false);
                setEditing(false);
                setEditValidation(null);
            } else {
                setEditError(td('editFailed'));
            }
        } catch (e) {
            setEditError(e instanceof Error ? e.message : td('editFailed'));
        } finally {
            setSavingEdit(false);
        }
    };

    // Debounced live re-validation while inline-editing, so the checklist stays
    // honest as the editor types (uses the deterministic validate endpoint).
    const onEditDraftChange = (d: CVDraft) => {
        if (editValidateTimer.current) {
            clearTimeout(editValidateTimer.current);
        }
        editValidateTimer.current = setTimeout(() => {
            validateCvDraft(studentId, { draft: d, fileType, degree })
                .then((r) => {
                    if (r?.success) setEditValidation(r.data.validation);
                })
                .catch(() => {});
        }, 500);
    };

    // Which top-level draft sections differ from the previous version (history[0]).
    const changedSections = (): string[] => {
        const prev = result?.history?.[0]?.draft;
        if (!prev || !result) return [];
        const cur = result.draft as unknown as Record<string, unknown>;
        const prevRec = prev as unknown as Record<string, unknown>;
        return Object.keys(SECTION_LABEL).filter(
            (k) => JSON.stringify(cur[k]) !== JSON.stringify(prevRec[k])
        );
    };

    // Undo the last regenerate/edit by restoring the previous draft. This itself
    // snapshots the current draft into history server-side, so it is reversible.
    const onUndo = async () => {
        const prev = result?.history?.[0]?.draft;
        if (!prev || !documentsthreadId) return;
        setUndoing(true);
        try {
            const resp = await updateCvDraft(documentsthreadId, {
                draft: prev,
                degree
            });
            if (resp?.success && resp.data) {
                setResult(resp.data);
                setRendered(null);
                setReused(false);
                setAttached(false);
            }
        } catch {
            // best-effort undo
        } finally {
            setUndoing(false);
        }
    };

    // Draft a single student-facing message from the current checklist gaps.
    // The editor reviews/edits before sending — nothing is posted automatically.
    const openRequest = () => {
        const lines = (result?.validation.items ?? []).map(
            (i) => `- ${i.message}`
        );
        setRequestMsg(
            [td('requestIntro'), '', ...lines, '', td('requestOutro')].join(
                '\n'
            )
        );
        setRequestCopied(false);
        setRequestOpen(true);
    };
    const copyRequest = async () => {
        try {
            await navigator.clipboard.writeText(requestMsg);
            setRequestCopied(true);
            setTimeout(() => setRequestCopied(false), 1500);
        } catch {
            // clipboard may be unavailable — the editor can still select+copy.
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
                onClick={onGenerateClick}
                disabled={loading}
                startIcon={
                    loading ? (
                        <CircularProgress size={16} color="inherit" />
                    ) : undefined
                }
            >
                {result ? td('regenerate') : td('generate')}
            </Button>
            {quota !== null ? (
                <Typography
                    variant="caption"
                    color={quota <= 0 ? 'error' : 'text.secondary'}
                    sx={{ display: 'block', mt: 0.5 }}
                >
                    {t('aiDraft.quotaInfo', { ns: 'cvmlrl', n: quota })}
                </Typography>
            ) : null}

            {!result && !loading && readiness ? (
                <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                        {td('readinessTitle')} (
                        {readiness.filter((r) => r.ok).length}/
                        {readiness.length})
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {readiness.map((r) => (
                            <Chip
                                key={r.key}
                                size="small"
                                variant={r.ok ? 'filled' : 'outlined'}
                                color={r.ok ? 'success' : 'default'}
                                label={`${r.ok ? '\u2713' : '\u2013'} ${t(
                                    `coverage.${r.key}`,
                                    { ns: 'cvmlrl' }
                                )}`}
                                onClick={
                                    !r.ok ? onNavigateToCvDetails : undefined
                                }
                                clickable={
                                    !r.ok && Boolean(onNavigateToCvDetails)
                                }
                            />
                        ))}
                    </Box>
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: 'block', mt: 0.5 }}
                    >
                        {td('readinessHint')}
                    </Typography>
                </Box>
            ) : null}

            {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                    {error}
                </Alert>
            )}

            {result && (
                <Box sx={{ mt: 2 }}>
                    {result.meta.parseError ? (
                        <Alert severity="error">
                            <AlertTitle>{td('parseFailedTitle')}</AlertTitle>
                            {td('parseFailedBody')}
                            <Box sx={{ mt: 1 }}>
                                <Button
                                    size="small"
                                    variant="outlined"
                                    onClick={onGenerate}
                                    disabled={loading}
                                >
                                    {td('retry')}
                                </Button>
                            </Box>
                        </Alert>
                    ) : (
                        <Box>
                            {result.inputsChanged ? (
                                <Alert
                                    severity="warning"
                                    sx={{ mb: 1 }}
                                    action={
                                        <Button
                                            color="inherit"
                                            size="small"
                                            onClick={onGenerate}
                                            disabled={loading}
                                        >
                                            {td('regenerate')}
                                        </Button>
                                    }
                                >
                                    {td('inputsChanged')}
                                </Alert>
                            ) : null}
                            <Checklist
                                items={
                                    editing && editValidation
                                        ? editValidation.items
                                        : result.validation.items
                                }
                                onNavigate={onNavigateToCvDetails}
                            />
                            <Coverage
                                draft={result.draft}
                                hasPhoto={result.hasPhoto}
                                onNavigate={onNavigateToCvDetails}
                            />
                            {result.history &&
                            result.history.length > 0 &&
                            changedSections().length > 0 ? (
                                <Alert
                                    severity="info"
                                    sx={{ mt: 1 }}
                                    action={
                                        <Button
                                            color="inherit"
                                            size="small"
                                            onClick={onUndo}
                                            disabled={undoing || editing}
                                        >
                                            {td('undo')}
                                        </Button>
                                    }
                                >
                                    {td('changedSince')}:{' '}
                                    {changedSections()
                                        .map((k) =>
                                            t(`draftView.${SECTION_LABEL[k]}`, {
                                                ns: 'cvmlrl'
                                            })
                                        )
                                        .join(', ')}
                                </Alert>
                            ) : null}
                            {editing ? (
                                <Box sx={{ mt: 1 }}>
                                    {editError ? (
                                        <Alert severity="error" sx={{ mb: 1 }}>
                                            {editError}
                                        </Alert>
                                    ) : null}
                                    <CVDraftEditForm
                                        initial={result.draft}
                                        saving={savingEdit}
                                        onSave={onSaveEdits}
                                        onChange={onEditDraftChange}
                                        onCancel={() => {
                                            setEditing(false);
                                            setEditError(null);
                                            setEditValidation(null);
                                        }}
                                    />
                                </Box>
                            ) : (
                                <Box>
                                    <Divider sx={{ my: 2 }} />
                                    <DraftView draft={result.draft} />
                                    <Divider sx={{ my: 2 }} />
                                    <Stack
                                        direction="row"
                                        spacing={1}
                                        flexWrap="wrap"
                                    >
                                        <Button
                                            variant="outlined"
                                            onClick={() => {
                                                setEditing(true);
                                                setEditError(null);
                                                setEditValidation(null);
                                            }}
                                            disabled={rendering}
                                        >
                                            {td('editFields')}
                                        </Button>
                                        {result.validation.items.length > 0 ? (
                                            <Button
                                                variant="outlined"
                                                onClick={openRequest}
                                            >
                                                {td('requestButton')}
                                            </Button>
                                        ) : null}
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
                                            {rendered
                                                ? td('regenerateDocx')
                                                : td('createDocx')}
                                        </Button>
                                        <Tooltip
                                            title={
                                                isFinalVersion
                                                    ? td('attachThreadFinal')
                                                    : rendered
                                                      ? ''
                                                      : td('attachDisabledHint')
                                            }
                                        >
                                            <span>
                                                <Button
                                                    variant="outlined"
                                                    color="secondary"
                                                    onClick={openAttach}
                                                    disabled={
                                                        rendering ||
                                                        !rendered ||
                                                        Boolean(isFinalVersion)
                                                    }
                                                >
                                                    {td('attachToThread')}
                                                </Button>
                                            </span>
                                        </Tooltip>
                                    </Stack>
                                    {rendered ? (
                                        <Alert
                                            severity="success"
                                            sx={{ mt: 1.5 }}
                                        >
                                            {reused
                                                ? td('reusedBanner')
                                                : `${td('docxReady')}: ${rendered.name}`}
                                            <Link
                                                component="button"
                                                type="button"
                                                variant="body2"
                                                onClick={onDownload}
                                                sx={{ ml: 1 }}
                                            >
                                                {td('downloadDocx')}
                                            </Link>
                                        </Alert>
                                    ) : null}
                                    {rendered &&
                                    result.hasPhoto &&
                                    rendered.photoEmbedded === false ? (
                                        <Alert
                                            severity="warning"
                                            sx={{ mt: 1.5 }}
                                        >
                                            {td('photoNotEmbedded')}
                                        </Alert>
                                    ) : null}
                                    {attached ? (
                                        <Alert
                                            severity="success"
                                            sx={{ mt: 1.5 }}
                                        >
                                            {td('attachSuccess')}
                                        </Alert>
                                    ) : null}
                                    {attachError ? (
                                        <Alert
                                            severity="warning"
                                            sx={{ mt: 1.5 }}
                                        >
                                            {attachError}
                                        </Alert>
                                    ) : null}
                                    {renderError ? (
                                        <Alert
                                            severity="error"
                                            sx={{ mt: 1.5 }}
                                        >
                                            {renderError}
                                        </Alert>
                                    ) : null}
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        sx={{ display: 'block', mt: 1 }}
                                    >
                                        {td('generatedBy')} {result.meta.model}{' '}
                                        at{' '}
                                        {new Date(
                                            result.meta.generatedAt
                                        ).toLocaleString()}
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    )}

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
                            {attachError ? (
                                <Alert severity="warning" sx={{ mt: 1.5 }}>
                                    {attachError}
                                </Alert>
                            ) : null}
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
                                disabled={attaching || !attachMessage.trim()}
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

                    <Dialog
                        open={confirmOpen}
                        onClose={() => setConfirmOpen(false)}
                        fullWidth
                        maxWidth="sm"
                    >
                        <DialogTitle>{td('confirmErrorsTitle')}</DialogTitle>
                        <DialogContent>
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mb: 1 }}
                            >
                                {td('confirmErrorsBody')}
                            </Typography>
                            <ul style={{ margin: 0, paddingLeft: 18 }}>
                                {result.validation.items
                                    .filter((it) => it.level === 'error')
                                    .map((it, i) => (
                                        <li key={i}>
                                            <b>[{it.section}]</b> {it.message}
                                        </li>
                                    ))}
                            </ul>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setConfirmOpen(false)}>
                                {td('cancel')}
                            </Button>
                            <Button
                                variant="contained"
                                color="warning"
                                onClick={onConfirmRender}
                            >
                                {td('confirmCreate')}
                            </Button>
                        </DialogActions>
                    </Dialog>

                    <Dialog
                        open={regenConfirmOpen}
                        onClose={() => setRegenConfirmOpen(false)}
                        fullWidth
                        maxWidth="sm"
                    >
                        <DialogTitle>{td('regenConfirmTitle')}</DialogTitle>
                        <DialogContent>
                            <Typography variant="body2" color="text.secondary">
                                {td('regenConfirmBody')}
                            </Typography>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setRegenConfirmOpen(false)}>
                                {td('cancel')}
                            </Button>
                            <Button
                                variant="contained"
                                color="warning"
                                onClick={onConfirmRegen}
                            >
                                {td('regenConfirmButton')}
                            </Button>
                        </DialogActions>
                    </Dialog>

                    <Dialog
                        open={requestOpen}
                        onClose={() => setRequestOpen(false)}
                        fullWidth
                        maxWidth="sm"
                    >
                        <DialogTitle>{td('requestTitle')}</DialogTitle>
                        <DialogContent>
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mb: 1.5 }}
                            >
                                {td('requestSubtitle')}
                            </Typography>
                            <TextField
                                fullWidth
                                multiline
                                minRows={6}
                                size="small"
                                value={requestMsg}
                                onChange={(e) => setRequestMsg(e.target.value)}
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setRequestOpen(false)}>
                                {td('cancel')}
                            </Button>
                            <Button variant="contained" onClick={copyRequest}>
                                {requestCopied
                                    ? td('requestCopied')
                                    : td('requestCopy')}
                            </Button>
                        </DialogActions>
                    </Dialog>
                </Box>
            )}
        </Card>
    );
};

export default CVDraftGenerator;
