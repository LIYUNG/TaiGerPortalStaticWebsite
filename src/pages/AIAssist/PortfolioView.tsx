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
import { getAIAssistOverview, type AIAssistOverviewStudent } from '@/api';
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
    urgent_unaddressed_request: 'Urgent request unaddressed',
    technical_access_issue: 'Technical / access issue',
    missing_document_blocker: 'Missing document',
    financial_concern: 'Financial concern',
    low_confidence_in_outcome: 'Low confidence in outcome',
    other: 'Other'
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

// The backend (GET /api/ai-assist/overview) now returns students pre-grouped,
// worst-first, with per-signal urgency already computed. This function only
// localizes each structured signal into a display PortfolioSignal — no
// cross-bucket join or urgency derivation happens here anymore.
const buildPortfolioStudents = (
    students: AIAssistOverviewStudent[],
    t: TFn,
    isZh: boolean
): PortfolioStudent[] =>
    students.map((stu) => {
        const signals: PortfolioSignal[] = [];
        const elsewhere = stu.confirmedElsewhere
            ? ` · ${t('aiAssist.signalConfirmedElsewhere', 'enrolled elsewhere')}`
            : '';

        stu.signals.forEach((sig) => {
            switch (sig.bucket) {
                case 'upcomingDeadlines': {
                    const days = sig.daysUntil ?? 999;
                    const programLabel = sig.program
                        ? `${sig.program.school ?? ''} ${sig.program.name ?? ''}`.trim()
                        : '';
                    // Negative daysUntil = the deadline was missed while the
                    // application is still in progress — the most urgent state.
                    const base =
                        sig.overdue || days < 0
                            ? t(
                                  'aiAssist.signalDeadlineOverdue',
                                  'Deadline missed {{count}}d ago',
                                  { count: Math.abs(days) }
                              )
                            : t(
                                  'aiAssist.signalDeadline',
                                  'Deadline in {{count}} days',
                                  { count: days }
                              );
                    signals.push({
                        type: 'deadline',
                        urgency: sig.urgency,
                        label: `${programLabel ? `${base} · ${programLabel}` : base}${elsewhere}`
                    });
                    break;
                }
                case 'threadsWaitingOnTeam': {
                    const stalled = sig.stalledDays ?? 0;
                    const fileLabel = sig.fileType ? ` · ${sig.fileType}` : '';
                    const base = t(
                        'aiAssist.signalThreadStalled',
                        'Reply needed {{count}}d',
                        { count: stalled }
                    );
                    signals.push({
                        type: 'thread_waiting',
                        urgency: sig.urgency,
                        label: `${base}${fileLabel}${elsewhere}`
                    });
                    break;
                }
                case 'communicationGaps': {
                    const days = sig.lastContactDays ?? 0;
                    signals.push({
                        type: 'comm_gap',
                        urgency: sig.urgency,
                        label: t(
                            'aiAssist.signalStudentWaiting',
                            'Student waiting {{count}}d for reply',
                            { count: days }
                        )
                    });
                    break;
                }
                case 'studentSilence': {
                    const days = sig.silentDays ?? 0;
                    signals.push({
                        type: 'student_silence',
                        urgency: sig.urgency,
                        label: t(
                            'aiAssist.signalStudentSilent',
                            'Student silent for {{count}}d',
                            { count: days }
                        )
                    });
                    break;
                }
                case 'admittedNotConfirmed': {
                    const programLabel = sig.program
                        ? `${sig.program.school ?? ''} ${sig.program.name ?? ''}`.trim()
                        : '';
                    const base = t(
                        'aiAssist.signalAdmitted',
                        'Admitted — enrolment not confirmed'
                    );
                    signals.push({
                        type: 'admitted_unconfirmed',
                        urgency: sig.urgency,
                        label: programLabel ? `${base} · ${programLabel}` : base
                    });
                    break;
                }
                case 'missingBaseDocuments': {
                    const docs = sig.missingDocuments ?? [];
                    const base = t(
                        'aiAssist.signalMissingDocs',
                        'Missing docs'
                    );
                    signals.push({
                        type: 'missing_docs',
                        urgency: sig.urgency,
                        label: docs.length
                            ? t(
                                  'aiAssist.signalMissingDocsCount',
                                  '{{count}} missing docs',
                                  { count: docs.length }
                              )
                            : base,
                        detail: docs.length
                            ? `${base}: ${docs.join(', ')}`
                            : undefined
                    });
                    break;
                }
                case 'communicationRiskSignals': {
                    // Dedupe by category: each type shown once (× count when
                    // repeated); hover reveals that type's specific bilingual
                    // case descriptions.
                    const sevRank: Record<string, number> = {
                        low: 1,
                        medium: 2,
                        high: 3
                    };
                    const byType = new Map<
                        string,
                        { severity: string; count: number; lines: string[] }
                    >();
                    (sig.riskSignals ?? []).forEach((rs) => {
                        const g = byType.get(rs.type) ?? {
                            severity: 'low',
                            count: 0,
                            lines: []
                        };
                        g.count += 1;
                        if (
                            (sevRank[rs.severity] ?? 0) >
                            (sevRank[g.severity] ?? 0)
                        ) {
                            g.severity = rs.severity;
                        }
                        const summary = (
                            isZh ? rs.summaryZh : rs.summaryEn
                        )?.trim();
                        if (summary) {
                            const when = rs.occurredAt
                                ? new Date(rs.occurredAt).toLocaleDateString(
                                      isZh ? 'zh-TW' : 'en'
                                  )
                                : null;
                            const ago =
                                rs.sinceDays != null && rs.sinceDays > 0
                                    ? isZh
                                        ? `${rs.sinceDays} 天前`
                                        : `${rs.sinceDays}d ago`
                                    : null;
                            const meta = [when, ago]
                                .filter(Boolean)
                                .join(' · ');
                            g.lines.push(
                                meta ? `${summary}（${meta}）` : summary
                            );
                            // The verbatim message quote the LLM based this
                            // signal on — lets the user verify in one glance
                            // instead of trusting a bare category label.
                            const evidence = rs.evidence?.trim();
                            if (evidence) {
                                g.lines.push(`「${evidence}」`);
                            }
                        }
                        byType.set(rs.type, g);
                    });

                    byType.forEach((g, type) => {
                        const typeLabel = t(
                            `aiAssist.commRisk_${type}`,
                            COMM_RISK_FALLBACK[type] ?? type
                        );
                        signals.push({
                            type: 'comm_risk',
                            urgency: g.severity === 'high' ? 'high' : 'medium',
                            label:
                                g.count > 1
                                    ? `${typeLabel} ×${g.count}`
                                    : typeLabel,
                            detail: g.lines.join('\n') || undefined
                        });
                    });
                    break;
                }
            }
        });

        const sorted = signals.sort(
            (a, b) => URGENCY_ORDER[a.urgency] - URGENCY_ORDER[b.urgency]
        );

        return {
            id: stu.id,
            name: stu.name ?? stu.id,
            chineseName: stu.chineseName,
            signals: sorted,
            overallHealth:
                HEALTH_FROM_URGENCY[stu.overallUrgency] ?? 'Medium Risk',
            joinedAt: stu.joinedAt ?? null,
            applyingProgramCount: stu.applyingProgramCount ?? 0,
            offerCount: stu.offerCount ?? 0,
            rejectCount: stu.rejectCount ?? 0,
            hasEditors: stu.hasEditors ?? true,
            applicationTerms: stu.applicationTerms ?? []
        };
    });
// Backend already sorts students worst-first; preserve that order.

export const PortfolioView = ({
    onAnalyzeStudent,
    onChatPrompt,
    onOpenChat
}: PortfolioViewProps): JSX.Element => {
    const { t, i18n } = useTranslation();
    const isZh = i18n.language.startsWith('zh');
    const [overviewStudents, setOverviewStudents] = useState<
        AIAssistOverviewStudent[]
    >([]);
    const [hasMoreStudents, setHasMoreStudents] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [chatInput, setChatInput] = useState('');
    const [helpAnchor, setHelpAnchor] = useState<HTMLButtonElement | null>(
        null
    );

    const students = useMemo(
        () => buildPortfolioStudents(overviewStudents, t as TFn, isZh),
        [overviewStudents, t, isZh]
    );

    useEffect(() => {
        let active = true;
        getAIAssistOverview()
            .then((res) => {
                if (!active) return;
                setOverviewStudents(res?.data?.students ?? []);
                setHasMoreStudents(Boolean(res?.data?.hasMoreStudents));
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
                                                  '截止日已過（申請仍進行中）',
                                                  '截止日不足 7 天',
                                                  '學生訊息等待回覆 ≥ 14 天',
                                                  '文件討論串未回覆 ≥ 14 天'
                                              ]
                                            : [
                                                  'Deadline missed (application still in progress)',
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
                                                  '學生沉默 ≥ 21 天（無任何學生訊息）',
                                                  '訊息內容高度隱性風險（提及退費/競品、強烈不滿）'
                                              ]
                                            : [
                                                  'Deadline in 7–30 days',
                                                  'Student waiting 7–13 days for reply',
                                                  'Document thread unanswered 7–13 days',
                                                  'Student silent ≥ 21 days (no message from the student)',
                                                  'High implicit content risk (refund/competitor mention, strong dissatisfaction)'
                                              ]
                                    },
                                    {
                                        color: 'text.secondary',
                                        label: isZh ? '中風險' : 'Medium Risk',
                                        items: isZh
                                            ? [
                                                  '文件討論串未回覆 3–6 天',
                                                  '學生沉默 10–20 天',
                                                  '已錄取但未確認入學',
                                                  '缺少必要基本文件',
                                                  '訊息內容隱性風險（困惑、互動轉冷、承諾未兌現）',
                                                  '已在其他學校確認入學的學生的所有信號'
                                              ]
                                            : [
                                                  'Document thread unanswered 3–6 days',
                                                  'Student silent 10–20 days',
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
                <>
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
                    {/* Truncation must be visible: without this, a capped list
                        reads as "this is everyone at risk". */}
                    {hasMoreStudents ? (
                        <Typography
                            color="text.secondary"
                            sx={{ pb: 2, textAlign: 'center' }}
                            variant="caption"
                        >
                            {t(
                                'aiAssist.portfolioMoreStudents',
                                'More at-risk students exist beyond this list — the display is capped. Ask in chat about a specific student, or clear items above to surface the rest.'
                            )}
                        </Typography>
                    ) : null}
                </>
            )}
        </Stack>
    );
};
