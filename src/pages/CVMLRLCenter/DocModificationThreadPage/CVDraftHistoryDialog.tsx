import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Box,
    Button,
    Collapse,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    Stack,
    Tooltip,
    Typography
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

import type { CVDraft } from '@/api';

interface HistoryEntry {
    draft: CVDraft;
    meta?: {
        source?: string;
    };
    savedAt?: string;
}

interface Props {
    open: boolean;
    onClose: () => void;
    // The live draft — the successor of the newest history entry (entry 0).
    current: CVDraft;
    history: HistoryEntry[];
    // Pre-expand a row when opened (e.g. the newest, from the regenerate banner).
    initialExpanded?: number | null;
}

const MAX_CHANGES = 40;
// Sources this build writes. Anything else (e.g. a legacy 'restore' snapshot, or
// a missing source) is labelled generically instead of rendering a missing key.
const KNOWN_SOURCES = ['generate', 'edit'];

/**
 * Read-only change log: for each kept snapshot (newest first, last 10) it shows
 * what THAT step changed — a field-level diff read old -> new against the version
 * that superseded it. No restore; recovery is per-field copy. The .docx files
 * attached to the thread remain the durable, permanent record.
 */
const CVDraftHistoryDialog = ({
    open,
    onClose,
    current,
    history,
    initialExpanded = null
}: Props) => {
    const { t } = useTranslation();
    const td = (k: string) => t(`aiDraft.${k}`, { ns: 'cvmlrl' });
    const dv = (k: string) => t(`draftView.${k}`, { ns: 'cvmlrl' });
    const [expanded, setExpanded] = useState<number | null>(initialExpanded);

    // Sync the pre-expanded row each time the dialog opens.
    useEffect(() => {
        if (open) setExpanded(initialExpanded ?? null);
    }, [open, initialExpanded]);

    const s = (v: unknown) => (v === undefined || v === null ? '' : String(v));

    // Field-level diff between an older draft (a) and its successor (b): each
    // entry reads a -> b (old -> new), i.e. what that single step changed.
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

    const sourceLabel = (src?: string) =>
        td(KNOWN_SOURCES.includes(src || '') ? `src_${src}` : 'src_updated');
    const when = (e: HistoryEntry) =>
        e.savedAt ? new Date(e.savedAt).toLocaleString() : '';

    // The successor of entry i is the version that replaced it: the previous
    // (newer) entry, or the live draft for the newest entry (i === 0).
    const successorOf = (i: number): CVDraft =>
        i === 0 ? current : history[i - 1].draft;

    const copyValue = (value: string) => {
        if (navigator?.clipboard?.writeText) {
            navigator.clipboard.writeText(value).catch(() => {});
        }
    };

    const renderChanges = (
        changes: { label: string; from: string; to: string }[]
    ) => {
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
                    <Stack
                        key={i}
                        direction="row"
                        alignItems="flex-start"
                        spacing={0.5}
                    >
                        <Typography
                            variant="caption"
                            sx={{ display: 'block', flex: 1 }}
                        >
                            <b>{c.label}:</b>{' '}
                            <span style={{ textDecoration: 'line-through' }}>
                                {c.from || '∅'}
                            </span>{' '}
                            → {c.to || '∅'}
                        </Typography>
                        {c.from ? (
                            <Tooltip title={td('copyPrev')}>
                                <IconButton
                                    size="small"
                                    sx={{ p: 0.25 }}
                                    onClick={() => copyValue(c.from)}
                                >
                                    <ContentCopyIcon sx={{ fontSize: 14 }} />
                                </IconButton>
                            </Tooltip>
                        ) : null}
                    </Stack>
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
                {history.map((entry, i) => {
                    const isOpen = expanded === i;
                    const changes = diffDrafts(entry.draft, successorOf(i));
                    return (
                        <Box key={i} sx={{ py: 1 }}>
                            <Stack
                                direction="row"
                                alignItems="center"
                                spacing={1}
                                flexWrap="wrap"
                            >
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
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                >
                                    {changes.length
                                        ? t('aiDraft.historyFieldsChanged', {
                                              ns: 'cvmlrl',
                                              n: changes.length
                                          })
                                        : td('historyNoDiff')}
                                </Typography>
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
                            </Stack>
                            <Collapse in={isOpen}>
                                <Box sx={{ mt: 0.5 }}>
                                    {renderChanges(changes)}
                                </Box>
                            </Collapse>
                            <Divider sx={{ mt: 1 }} />
                        </Box>
                    );
                })}
                <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', mt: 1 }}
                >
                    {td('historyFootnote')}
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>{td('cancel')}</Button>
            </DialogActions>
        </Dialog>
    );
};

export default CVDraftHistoryDialog;
