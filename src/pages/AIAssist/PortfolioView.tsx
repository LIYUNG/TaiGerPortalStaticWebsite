import { useEffect, useMemo, useState, JSX } from 'react';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Divider,
    IconButton,
    InputAdornment,
    Popover,
    Stack,
    TextField,
    Typography
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ChatIcon from '@mui/icons-material/Chat';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useTranslation } from 'react-i18next';
import { getAIAssistOverview, type AIAssistOverviewItem } from '@/api';
import {
    StudentHealthCard,
    PortfolioStudent,
    PortfolioSignal
} from './StudentHealthCard';

interface PortfolioViewProps {
    onAnalyzeStudent: (student: PortfolioStudent) => void;
    onChatPrompt: (prompt: string) => void;
    onOpenChat: () => void;
}

const URGENCY_ORDER = { critical: 0, high: 1, medium: 2 };

// Implicit communication-risk signal type → short English fallback label
// (translations live under aiAssist.commRisk_<type>).
const COMM_RISK_FALLBACK: Record<string, string> = {
    frustration: 'Frustration',
    confusion: 'Confusion',
    repeated_unanswered_question: 'Repeated unanswered Q',
    broken_promise: 'Broken promise',
    deadline_anxiety: 'Deadline anxiety',
    engagement_cooling: 'Cooling engagement',
    mentions_competitor_or_refund: 'Competitor / refund',
    sentiment_declining: 'Declining sentiment',
    dissatisfaction_with_service: 'Service dissatisfaction',
    urgent_unaddressed_request: 'Urgent request unaddressed'
};

const HEALTH_FROM_URGENCY: Record<string, string> = {
    critical: 'Critical',
    high: 'High Risk',
    medium: 'Medium Risk'
};

type TFn = (
    key: string,
    fallback: string,
    opts?: Record<string, unknown>
) => string;

const buildPortfolioStudents = (
    buckets: Record<string, { count: number; items: AIAssistOverviewItem[] }>,
    t: TFn,
    isZh: boolean
): PortfolioStudent[] => {
    const byId = new Map<string, PortfolioStudent>();

    const addSignal = (
        item: AIAssistOverviewItem,
        signal: PortfolioSignal
    ): void => {
        const id = item.student?.id;
        if (!id) return;
        if (!byId.has(id)) {
            byId.set(id, {
                id,
                name: item.student?.name ?? id,
                chineseName: item.student?.chineseName,
                signals: [],
                overallHealth: 'Medium Risk',
                joinedAt: item.student?.joinedAt ?? null,
                applyingProgramCount: item.student?.applyingProgramCount ?? 0,
                offerCount: item.student?.offerCount ?? 0,
                rejectCount: item.student?.rejectCount ?? 0,
                hasEditors: item.student?.hasEditors ?? true,
                applicationTerms: item.student?.applicationTerms ?? []
            });
        }
        byId.get(id)!.signals.push(signal);
    };

    (buckets.upcomingDeadlines?.items ?? []).forEach((item) => {
        const days = item.daysUntil ?? 999;
        const rawUrgency = days < 7 ? 'critical' : 'high';
        const urgency = item.confirmedElsewhere ? 'medium' : rawUrgency;
        const programLabel = item.program
            ? `${item.program.school ?? ''} ${item.program.name ?? ''}`.trim()
            : '';
        const base = t(
            'aiAssist.signalDeadline',
            'Deadline in {{count}} days',
            { count: days }
        );
        const elsewhere = item.confirmedElsewhere
            ? ` · ${t('aiAssist.signalConfirmedElsewhere', 'enrolled elsewhere')}`
            : '';
        addSignal(item, {
            type: 'deadline',
            urgency,
            label: `${programLabel ? `${base} · ${programLabel}` : base}${elsewhere}`
        });
    });

    (buckets.threadsWaitingOnTeam?.items ?? []).forEach((item) => {
        const stalled = item.stalledDays ?? 0;
        const rawUrgency =
            stalled >= 14 ? 'critical' : stalled >= 7 ? 'high' : 'medium';
        const urgency = item.confirmedElsewhere ? 'medium' : rawUrgency;
        const fileLabel = item.fileType ? ` · ${item.fileType}` : '';
        const elsewhere = item.confirmedElsewhere
            ? ` · ${t('aiAssist.signalConfirmedElsewhere', 'enrolled elsewhere')}`
            : '';
        const base = t(
            'aiAssist.signalThreadStalled',
            'Reply needed {{count}}d',
            { count: stalled }
        );
        addSignal(item, {
            type: 'thread_waiting',
            urgency,
            label: `${base}${fileLabel}${elsewhere}`
        });
    });

    (buckets.communicationGaps?.items ?? []).forEach((item) => {
        const days = item.lastContactDays ?? 0;
        const urgency = days >= 14 ? 'critical' : days >= 7 ? 'high' : 'medium';
        addSignal(item, {
            urgency,
            type: 'comm_gap',
            label: t(
                'aiAssist.signalStudentWaiting',
                'Student waiting {{count}}d for reply',
                { count: days }
            )
        });
    });

    (buckets.admittedNotConfirmed?.items ?? []).forEach((item) => {
        const programLabel = item.program
            ? `${item.program.school ?? ''} ${item.program.name ?? ''}`.trim()
            : '';
        const base = t(
            'aiAssist.signalAdmitted',
            'Admitted — enrolment not confirmed'
        );
        addSignal(item, {
            type: 'admitted_unconfirmed',
            urgency: 'medium',
            label: programLabel ? `${base} · ${programLabel}` : base
        });
    });

    (buckets.communicationRiskSignals?.items ?? []).forEach((item) => {
        // Dedupe by category: each type shown once (× count when repeated);
        // hover reveals that type's specific bilingual case descriptions.
        const sevRank: Record<string, number> = { low: 1, medium: 2, high: 3 };
        const byType = new Map<
            string,
            { severity: string; count: number; lines: string[] }
        >();
        (item.signals ?? []).forEach((signal) => {
            const g = byType.get(signal.type) ?? {
                severity: 'low',
                count: 0,
                lines: []
            };
            g.count += 1;
            if ((sevRank[signal.severity] ?? 0) > (sevRank[g.severity] ?? 0)) {
                g.severity = signal.severity;
            }
            const summary = (
                isZh ? signal.summaryZh : signal.summaryEn
            )?.trim();
            if (summary) {
                const days =
                    signal.sinceDays != null && signal.sinceDays > 0
                        ? isZh
                            ? `（${signal.sinceDays} 天）`
                            : ` (${signal.sinceDays}d)`
                        : '';
                g.lines.push(`${summary}${days}`);
            }
            byType.set(signal.type, g);
        });

        byType.forEach((g, type) => {
            const typeLabel = t(
                `aiAssist.commRisk_${type}`,
                COMM_RISK_FALLBACK[type] ?? type
            );
            addSignal(item, {
                type: 'comm_risk',
                urgency: g.severity === 'high' ? 'high' : 'medium',
                label: g.count > 1 ? `${typeLabel} ×${g.count}` : typeLabel,
                detail: g.lines.join('\n') || undefined
            });
        });
    });

    (buckets.missingBaseDocuments?.items ?? []).forEach((item) => {
        const docs = item.missingDocuments ?? [];
        const base = t('aiAssist.signalMissingDocs', 'Missing docs');
        addSignal(item, {
            type: 'missing_docs',
            urgency: 'medium',
            label: docs.length
                ? t(
                      'aiAssist.signalMissingDocsCount',
                      '{{count}} missing docs',
                      {
                          count: docs.length
                      }
                  )
                : base,
            detail: docs.length ? `${base}: ${docs.join(', ')}` : undefined
        });
    });

    const students = Array.from(byId.values()).map((student) => {
        const sorted = [...student.signals].sort(
            (a, b) => URGENCY_ORDER[a.urgency] - URGENCY_ORDER[b.urgency]
        );
        const topUrgency = sorted[0]?.urgency ?? 'medium';
        return {
            ...student,
            signals: sorted,
            overallHealth: HEALTH_FROM_URGENCY[topUrgency] ?? 'Medium Risk'
        };
    });

    return students.sort((a, b) => {
        const aTop = URGENCY_ORDER[a.signals[0]?.urgency ?? 'medium'];
        const bTop = URGENCY_ORDER[b.signals[0]?.urgency ?? 'medium'];
        return aTop - bTop;
    });
};

export const PortfolioView = ({
    onAnalyzeStudent,
    onChatPrompt,
    onOpenChat
}: PortfolioViewProps): JSX.Element => {
    const { t, i18n } = useTranslation();
    const isZh = i18n.language.startsWith('zh');
    const [buckets, setBuckets] = useState<
        Record<string, { count: number; items: AIAssistOverviewItem[] }>
    >({});
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [chatInput, setChatInput] = useState('');
    const [helpAnchor, setHelpAnchor] = useState<HTMLButtonElement | null>(
        null
    );

    const students = useMemo(
        () => buildPortfolioStudents(buckets, t as TFn, isZh),
        [buckets, t, isZh]
    );

    useEffect(() => {
        let active = true;
        getAIAssistOverview()
            .then((res) => {
                if (!active) return;
                setBuckets(res?.data?.buckets ?? {});
                setHasError(false);
            })
            .catch(() => {
                if (active) setHasError(true);
            })
            .finally(() => {
                if (active) setIsLoading(false);
            });
        return () => {
            active = false;
        };
    }, []);

    const handleChatSubmit = (): void => {
        const prompt = chatInput.trim();
        if (!prompt) return;
        onChatPrompt(prompt);
    };

    return (
        <Stack spacing={3} sx={{ height: '100%', overflow: 'auto', p: 2 }}>
            <Stack spacing={1}>
                <Stack
                    alignItems="center"
                    direction="row"
                    justifyContent="space-between"
                >
                    <Stack alignItems="center" direction="row" spacing={0.5}>
                        <Typography fontWeight={700} variant="h6">
                            {t(
                                'aiAssist.portfolioHeading',
                                'Portfolio — needs attention'
                            )}
                        </Typography>
                        <IconButton
                            aria-label="Risk level explanation"
                            onClick={(e) => setHelpAnchor(e.currentTarget)}
                            size="small"
                        >
                            <InfoOutlinedIcon fontSize="small" />
                        </IconButton>
                        <Popover
                            anchorEl={helpAnchor}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'left'
                            }}
                            onClose={() => setHelpAnchor(null)}
                            open={Boolean(helpAnchor)}
                            slotProps={{
                                paper: { sx: { maxWidth: 360, p: 2 } }
                            }}
                        >
                            <Stack spacing={1.5}>
                                <Typography fontWeight={700} variant="body2">
                                    {isZh
                                        ? '風險等級計算方式'
                                        : 'How risk levels are calculated'}
                                </Typography>
                                <Divider />
                                {[
                                    {
                                        color: 'error.main',
                                        label: isZh ? '緊急' : 'Critical',
                                        items: isZh
                                            ? [
                                                  '截止日不足 7 天',
                                                  '學生訊息等待回覆 ≥ 14 天',
                                                  '文件討論串未回覆 ≥ 14 天'
                                              ]
                                            : [
                                                  'Deadline in < 7 days',
                                                  'Student waiting ≥ 14 days for reply',
                                                  'Document thread unanswered ≥ 14 days'
                                              ]
                                    },
                                    {
                                        color: 'warning.main',
                                        label: isZh ? '高風險' : 'High Risk',
                                        items: isZh
                                            ? [
                                                  '截止日 7–30 天內',
                                                  '學生訊息等待回覆 7–13 天',
                                                  '文件討論串未回覆 7–13 天',
                                                  '訊息內容高度隱性風險（提及退費/競品、強烈不滿）'
                                              ]
                                            : [
                                                  'Deadline in 7–30 days',
                                                  'Student waiting 7–13 days for reply',
                                                  'Document thread unanswered 7–13 days',
                                                  'High implicit content risk (refund/competitor mention, strong dissatisfaction)'
                                              ]
                                    },
                                    {
                                        color: 'text.secondary',
                                        label: isZh ? '中風險' : 'Medium Risk',
                                        items: isZh
                                            ? [
                                                  '學生訊息等待回覆 3–6 天',
                                                  '文件討論串未回覆 3–6 天',
                                                  '已錄取但未確認入學',
                                                  '缺少必要基本文件',
                                                  '訊息內容隱性風險（困惑、互動轉冷、承諾未兌現）',
                                                  '已在其他學校確認入學的學生的所有信號'
                                              ]
                                            : [
                                                  'Student waiting 3–6 days for reply',
                                                  'Document thread unanswered 3–6 days',
                                                  'Admitted but enrolment not confirmed',
                                                  'Missing required base documents',
                                                  'Implicit content risk (confusion, cooling engagement, broken promises)',
                                                  'Any signal where student confirmed enrolment elsewhere'
                                              ]
                                    }
                                ].map(({ color, label, items }) => (
                                    <Stack key={label} spacing={0.5}>
                                        <Typography
                                            color={color}
                                            fontWeight={600}
                                            variant="caption"
                                        >
                                            {label}
                                        </Typography>
                                        {items.map((item) => (
                                            <Typography
                                                key={item}
                                                color="text.secondary"
                                                variant="caption"
                                            >
                                                · {item}
                                            </Typography>
                                        ))}
                                    </Stack>
                                ))}
                                <Divider />
                                <Typography
                                    color="text.disabled"
                                    variant="caption"
                                >
                                    {isZh
                                        ? '卡片顏色 = 最嚴重的信號。已在其他學校確認入學的學生，所有信號上限為中風險。'
                                        : 'Card colour = worst signal. Students who confirmed enrolment elsewhere are capped at Medium.'}
                                </Typography>
                            </Stack>
                        </Popover>
                    </Stack>
                    <Button
                        onClick={onOpenChat}
                        size="small"
                        startIcon={<ChatIcon fontSize="small" />}
                        variant="outlined"
                    >
                        {t('aiAssist.chatHistory', 'Chat / History')}
                    </Button>
                </Stack>
                <Typography color="text.secondary" variant="body2">
                    {t(
                        'aiAssist.portfolioSubtitle',
                        'Students with active risks, upcoming deadlines, or stalled threads. Click any card to run a deep-dive analysis.'
                    )}
                </Typography>
                <TextField
                    fullWidth
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <SendIcon
                                    fontSize="small"
                                    onClick={handleChatSubmit}
                                    sx={{
                                        cursor: 'pointer',
                                        color: chatInput.trim()
                                            ? 'primary.main'
                                            : 'action.disabled'
                                    }}
                                />
                            </InputAdornment>
                        )
                    }}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleChatSubmit();
                        }
                    }}
                    placeholder={t(
                        'aiAssist.portfolioChatPlaceholder',
                        'Ask about your portfolio... (e.g. What needs my attention today?)'
                    )}
                    size="small"
                    value={chatInput}
                    sx={{ mt: 1 }}
                />
            </Stack>

            {isLoading ? (
                <Stack
                    alignItems="center"
                    justifyContent="center"
                    spacing={1}
                    sx={{ minHeight: 200 }}
                >
                    <CircularProgress size={24} />
                    <Typography color="text.secondary" variant="body2">
                        {t('aiAssist.portfolioLoading', 'Loading portfolio...')}
                    </Typography>
                </Stack>
            ) : hasError ? (
                <Alert severity="info" variant="outlined">
                    {t(
                        'aiAssist.portfolioError',
                        'Could not load portfolio data.'
                    )}
                </Alert>
            ) : students.length === 0 ? (
                <Stack
                    alignItems="center"
                    justifyContent="center"
                    spacing={1}
                    sx={{ minHeight: 200 }}
                >
                    <Typography
                        color="text.secondary"
                        fontWeight={600}
                        variant="body1"
                    >
                        {t(
                            'aiAssist.portfolioAllOnTrack',
                            '✓ All students on track'
                        )}
                    </Typography>
                    <Typography color="text.secondary" variant="body2">
                        {t(
                            'aiAssist.portfolioNoUrgent',
                            'No urgent items detected. Use the search above to ask about specific students.'
                        )}
                    </Typography>
                </Stack>
            ) : (
                <Box
                    sx={{
                        display: 'grid',
                        gap: 2,
                        gridTemplateColumns: {
                            xs: '1fr',
                            sm: 'repeat(2, 1fr)',
                            md: 'repeat(3, 1fr)',
                            lg: 'repeat(4, 1fr)'
                        }
                    }}
                >
                    {students.map((student) => (
                        <StudentHealthCard
                            key={student.id}
                            onAnalyze={onAnalyzeStudent}
                            student={student}
                        />
                    ))}
                </Box>
            )}
        </Stack>
    );
};
