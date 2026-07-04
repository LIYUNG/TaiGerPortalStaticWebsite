import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Box,
    Button,
    Chip,
    Collapse,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Stack,
    Typography
} from '@mui/material';

import type { CVDraft } from '@/api';

interface HistoryEntry {
    draft: CVDraft;
    meta?: {
        source?: string;
        model?: string;
        generatedAt?: string;
        editedAt?: string;
    };
    savedAt?: string;
}

interface Props {
    open: boolean;
    onClose: () => void;
    current: CVDraft;
    history: HistoryEntry[];
    restoring?: boolean;
    onRestore: (draft: CVDraft) => void;
}

const MAX_CHANGES = 40;

/**
 * Version history browser: lists every kept draft snapshot (newest first) with
 * its source/time, a lazily-computed FIELD-LEVEL diff vs the current draft
 * (what restoring would change), and a Restore action. Restore is non-destructive
 * — the server snapshots the current draft first.
 */
const CVDraftHistoryDialog = ({
    open,
    onClose,
    current,
    history,
    restoring,
    onRestore
}: Props) => {
    const { t } = useTranslation();
    const td = (k: string) => t(`aiDraft.${k}`, { ns: 'cvmlrl' });
    const dv = (k: string) => t(`draftView.${k}`, { ns: 'cvmlrl' });
    const [expanded, setExpanded] = useState<number | null>(null);

    const s = (v: unknown) => (v === undefined || v === null ? '' : String(v));

    // Field-level diff between the current draft (a) and a target version (b):
    // each entry reads current → target, i.e. what a restore would change.
    const diffDrafts = (
        a: CVDraft,
        b: CVDraft
    ): { label: string; from: string; to: string }[] => {
        const out: { label: string; from: string; to: string }[] = [];
        const cmp = (label: string, av: unknown, bv: unknown) => {
            if (s(av) !== s(bv)) out.push({ label, from: s(av), to: s(bv) });
        };
        const personalFields: [keyof CVDraft['personal'], string][] = [
            ['fullName', 'name'],
            ['birthday', 'birthday'],
            ['birthplace', 'birthplace'],
            ['nationality', 'nationality'],
            ['address', 'address'],
            ['phone', 'phone'],
            ['email', 'email']
        ];
        personalFields.forEach(([f, lk]) =>
            cmp(
                `${dv('personalInformation')} · ${dv(lk)}`,
                a.personal?.[f],
                b.personal?.[f]
            )
        );

        const eduFields = [
            'period',
            'institution',
            'city',
            'country',
            'major',
            'minor',
            'gpa',
            'gsat',
            'courses',
            'specialActivities'
        ] as const;
        const eduGroups: [keyof CVDraft, string][] = [
            ['universities', 'university'],
            ['seniorHighSchools', 'seniorHighSchool'],
            ['juniorHighSchools', 'juniorHighSchool']
        ];
        eduGroups.forEach(([group, lk]) => {
            const aa = (a[group] as Record<string, unknown>[]) || [];
            const bb = (b[group] as Record<string, unknown>[]) || [];
            const max = Math.max(aa.length, bb.length);
            for (let i = 0; i < max; i++) {
                const av = aa[i] || {};
                const bv = bb[i] || {};
                eduFields.forEach((f) =>
                    cmp(`${dv(lk)} #${i + 1} · ${dv(f)}`, av[f], bv[f])
                );
            }
        });

        const aExp = a.experience || [];
        const bExp = b.experience || [];
        const maxExp = Math.max(aExp.length, bExp.length);
        for (let i = 0; i < maxExp; i++) {
            const av = aExp[i] || ({} as CVDraft['experience'][number]);
            const bv = bExp[i] || ({} as CVDraft['experience'][number]);
            (
                ['period', 'jobTitle', 'company', 'city', 'country'] as const
            ).forEach((f) =>
                cmp(
                    `${dv('practicalExperience')} #${i + 1} · ${dv(f)}`,
                    av[f],
                    bv[f]
                )
            );
            const ab = av.bullets || [];
            const bbu = bv.bullets || [];
            const maxB = Math.max(ab.length, bbu.length);
            for (let j = 0; j < maxB; j++) {
                cmp(
                    `${dv('practicalExperience')} #${i + 1} · bullet ${j + 1}`,
                    ab[j],
                    bbu[j]
                );
            }
        }

        const listGroups: [keyof CVDraft, string, string[]][] = [
            ['awards', 'awards', ['date', 'title', 'description']],
            ['languages', 'languages', ['name', 'level', 'testScore']],
            ['computer', 'computer', ['name', 'level']]
        ];
        listGroups.forEach(([group, lk, fields]) => {
            const aa = (a[group] as Record<string, unknown>[]) || [];
            const bb = (b[group] as Record<string, unknown>[]) || [];
            const max = Math.max(aa.length, bb.length);
            for (let i = 0; i < max; i++) {
                const av = aa[i] || {};
                const bv = bb[i] || {};
                fields.forEach((f) =>
                    cmp(`${dv(lk)} #${i + 1} · ${dv(f)}`, av[f], bv[f])
                );
            }
        });

        (
            [
                'otherSkills',
                'socialEngagement',
                'competitiveSports',
                'hobbies',
                'anythingElse'
            ] as const
        ).forEach((f) => cmp(dv(f), a[f], b[f]));

        return out;
    };

    const sourceLabel = (src?: string) => td(`src_${src || 'generate'}`);
    const when = (e: HistoryEntry) =>
        e.savedAt ? new Date(e.savedAt).toLocaleString() : '';
    const total = history.length + 1;

    const renderChanges = (entry: HistoryEntry) => {
        const changes = diffDrafts(current, entry.draft);
        if (!changes.length) {
            return (
                <Typography variant="caption" color="text.secondary">
                    {td('historyNoDiff')}
                </Typography>
            );
        }
        const shown = changes.slice(0, MAX_CHANGES);
        return (
            <Box sx={{ pl: 1 }}>
                {shown.map((c, i) => (
                    <Typography
                        key={i}
                        variant="caption"
                        sx={{ display: 'block' }}
                    >
                        <b>{c.label}:</b>{' '}
                        <span style={{ textDecoration: 'line-through' }}>
                            {c.from || '∅'}
                        </span>{' '}
                        → {c.to || '∅'}
                    </Typography>
                ))}
                {changes.length > MAX_CHANGES ? (
                    <Typography variant="caption" color="text.secondary">
                        {t('aiDraft.historyMore', {
                            ns: 'cvmlrl',
                            n: changes.length - MAX_CHANGES
                        })}
                    </Typography>
                ) : null}
            </Box>
        );
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>{td('historyTitle')}</DialogTitle>
            <DialogContent dividers>
                <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    sx={{ mb: 1 }}
                >
                    <Chip size="small" color="success" label={`v${total}`} />
                    <Typography variant="body2">
                        {td('historyCurrent')}
                    </Typography>
                </Stack>
                <Divider />
                {history.map((entry, i) => {
                    const version = total - 1 - i;
                    const isOpen = expanded === i;
                    return (
                        <Box key={i} sx={{ py: 1 }}>
                            <Stack
                                direction="row"
                                alignItems="center"
                                spacing={1}
                                flexWrap="wrap"
                            >
                                <Chip size="small" label={`v${version}`} />
                                <Typography variant="body2">
                                    {sourceLabel(entry.meta?.source)}
                                </Typography>
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                >
                                    {when(entry)}
                                </Typography>
                                <Box sx={{ flex: 1 }} />
                                <Button
                                    size="small"
                                    onClick={() =>
                                        setExpanded(isOpen ? null : i)
                                    }
                                >
                                    {isOpen
                                        ? td('historyHide')
                                        : td('historyView')}
                                </Button>
                                <Button
                                    size="small"
                                    variant="outlined"
                                    color="warning"
                                    disabled={restoring}
                                    onClick={() => onRestore(entry.draft)}
                                >
                                    {td('historyRestore')}
                                </Button>
                            </Stack>
                            <Collapse in={isOpen}>
                                <Box sx={{ mt: 0.5 }}>
                                    {renderChanges(entry)}
                                </Box>
                            </Collapse>
                            <Divider sx={{ mt: 1 }} />
                        </Box>
                    );
                })}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>{td('cancel')}</Button>
            </DialogActions>
        </Dialog>
    );
};

export default CVDraftHistoryDialog;
