import { useState } from 'react';
import {
    Alert,
    AlertTitle,
    Box,
    Button,
    Card,
    Chip,
    CircularProgress,
    Divider,
    Stack,
    TextField,
    Typography
} from '@mui/material';

import {
    generateCvDraft,
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
}) =>
    items.length ? (
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
                    <Field label="Major" value={e.major} />
                    <Field label="Minor" value={e.minor} />
                    <Field label="GPA" value={e.gpa} />
                    <Field label="GSAT" value={e.gsat} />
                    <Field label="Courses" value={e.courses} />
                    <Field
                        label="Special activities"
                        value={e.specialActivities}
                    />
                </Box>
            ))}
        </Box>
    ) : null;

const ExperienceBlock = ({ items }: { items: CVExperience[] }) =>
    items.length ? (
        <Box sx={{ mb: 1 }}>
            <Typography variant="subtitle2">Practical experience</Typography>
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

const Checklist = ({ items }: { items: CVChecklistItem[] }) => {
    const errors = items.filter((i) => i.level === 'error');
    const warnings = items.filter((i) => i.level === 'warning');
    if (!items.length) {
        return (
            <Alert severity="success">
                No issues found. The draft looks complete.
            </Alert>
        );
    }
    return (
        <Stack spacing={1}>
            {errors.length > 0 && (
                <Alert severity="error">
                    <AlertTitle>Must fix ({errors.length})</AlertTitle>
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
                    <AlertTitle>Review ({warnings.length})</AlertTitle>
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

const DraftView = ({ draft }: { draft: CVDraft }) => (
    <Box>
        <Typography variant="subtitle2">Personal information</Typography>
        <Box sx={{ pl: 1, mb: 1 }}>
            <Field label="Name" value={draft.personal.fullName} />
            <Field
                label="Birthday / place"
                value={[draft.personal.birthday, draft.personal.birthplace]
                    .filter(Boolean)
                    .join(' / ')}
            />
            <Field label="Nationality" value={draft.personal.nationality} />
            <Field label="Address" value={draft.personal.address} />
            <Field label="Phone" value={draft.personal.phone} />
            <Field label="E-Mail" value={draft.personal.email} />
        </Box>
        <EducationBlock items={draft.universities} title="University" />
        <EducationBlock
            items={draft.seniorHighSchools}
            title="Senior high school"
        />
        <EducationBlock
            items={draft.juniorHighSchools}
            title="Junior high school"
        />
        <ExperienceBlock items={draft.experience} />
        {draft.awards.length > 0 && (
            <Box sx={{ mb: 1 }}>
                <Typography variant="subtitle2">Awards</Typography>
                {draft.awards.map((a, i) => (
                    <Typography key={i} variant="body2" sx={{ pl: 1 }}>
                        <b>{a.date}</b> {a.title} — {a.description}
                    </Typography>
                ))}
            </Box>
        )}
        <Typography variant="subtitle2">Skills</Typography>
        <Box sx={{ pl: 1, mb: 1 }}>
            {draft.languages.length > 0 && (
                <Field
                    label="Languages"
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
                    label="Computer"
                    value={draft.computer
                        .map((c) => `${c.name} – ${c.level}`)
                        .join('; ')}
                />
            )}
            <Field label="Other skills" value={draft.otherSkills} />
        </Box>
        <Typography variant="subtitle2">Hobbies & interests</Typography>
        <Box sx={{ pl: 1, mb: 1 }}>
            <Field label="Social engagement" value={draft.socialEngagement} />
            <Field label="Competitive sports" value={draft.competitiveSports} />
            <Field label="Hobbies" value={draft.hobbies} />
        </Box>
        <Field label="Anything else" value={draft.anythingElse} />
    </Box>
);

const CVDraftGenerator = ({
    studentId,
    fileType,
    programId,
    programFullName,
    editorRequirements
}: CVDraftGeneratorProps) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<CVDraftResult | null>(null);
    // Editor-supplied facts to fill gaps the survey/profile is missing. Sent as
    // part of editorRequirements; the model uses them but still never invents.
    const [notes, setNotes] = useState('');

    const onGenerate = async () => {
        setLoading(true);
        setError(null);
        try {
            const mergedRequirements = [editorRequirements, notes.trim()]
                .filter(Boolean)
                .join('\n');
            const resp = await generateCvDraft(studentId, {
                fileType,
                programId,
                programFullName,
                editorRequirements: mergedRequirements
            });
            if (resp?.success) {
                setResult(resp.data);
            } else {
                setError('Generation failed. Please try again.');
            }
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Generation failed.');
        } finally {
            setLoading(false);
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
                <Typography variant="h6">AI first draft (beta)</Typography>
                <Chip size="small" label="CVDraft + checklist" />
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Generates a first-draft CV from the student profile and survey.
                You can generate even when data is incomplete — missing items
                are listed in the checklist rather than invented. Fill gaps in
                the box below and regenerate. No document is created yet.
            </Typography>

            <TextField
                fullWidth
                multiline
                minRows={2}
                size="small"
                label="Add or correct facts the survey is missing (optional)"
                placeholder="e.g. GPA 3.8/4.30; Internship at Acme, 06/2022–08/2022, built CI pipeline; German B2"
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
                {result ? 'Regenerate first draft' : 'Generate first draft'}
            </Button>

            {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                    {error}
                </Alert>
            )}

            {result && (
                <Box sx={{ mt: 2 }}>
                    <Checklist items={result.validation.items} />
                    <Divider sx={{ my: 2 }} />
                    <DraftView draft={result.draft} />
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: 'block', mt: 1 }}
                    >
                        Generated by {result.meta.model} at{' '}
                        {new Date(result.meta.generatedAt).toLocaleString()}
                    </Typography>
                </Box>
            )}
        </Card>
    );
};

export default CVDraftGenerator;
