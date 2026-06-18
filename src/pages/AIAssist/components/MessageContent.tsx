import { useState } from 'react';
import { Box, IconButton, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import DEMO from '@/store/constant';
import type {
    AIAssistMessage,
    AIAssistMessageLinkHint,
    AIAssistToolCall
} from '@/api/types';
import { AnalysisDisplay } from '../AnalysisDisplay';
import { parseAnalysisOutput } from '../utils/parseAnalysisOutput';
import { SOURCE_LABELS, getToolDisplayName } from '../utils/conversationUtils';
import { escapeRegExp } from '../utils/mentionUtils';

export const SourcesSummary = ({
    toolCalls
}: {
    toolCalls: AIAssistToolCall[];
}): JSX.Element | null => {
    const { t } = useTranslation();
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

    const visible = toolCalls.filter(
        (tc) => tc.status === 'success' && SOURCE_LABELS[tc.toolName]
    );

    if (visible.length === 0) {
        return null;
    }

    const toggle = (id: string): void => {
        setExpandedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    return (
        <Stack
            spacing={0.5}
            sx={{ mt: 1.25, borderTop: 1, borderColor: 'divider', pt: 1 }}
        >
            <Typography color="text.secondary" variant="caption">
                {t('aiAssist.toolsUsedCount', 'Tools used ({{count}})', {
                    count: visible.length
                })}
            </Typography>
            {visible.map((tc) => {
                const name = getToolDisplayName(tc.toolName);
                const isExpanded = expandedIds.has(tc.id);
                return (
                    <Box key={`${tc.id}-${tc.toolName}`}>
                        <Stack
                            alignItems="center"
                            direction="row"
                            spacing={0.5}
                        >
                            <Typography variant="caption">{name}</Typography>
                            <IconButton
                                aria-label={t(
                                    'aiAssist.showDetailsFor',
                                    'Show details for {{name}}',
                                    { name }
                                )}
                                onClick={() => toggle(tc.id)}
                                size="small"
                            >
                                {isExpanded ? (
                                    <ExpandLessIcon fontSize="inherit" />
                                ) : (
                                    <ExpandMoreIcon fontSize="inherit" />
                                )}
                            </IconButton>
                        </Stack>
                        {isExpanded ? (
                            <Box
                                component="pre"
                                sx={{
                                    fontSize: '0.7rem',
                                    m: 0,
                                    overflowX: 'auto',
                                    whiteSpace: 'pre-wrap'
                                }}
                            >
                                {JSON.stringify(
                                    {
                                        arguments: tc.arguments,
                                        result: tc.result
                                    },
                                    null,
                                    2
                                )}
                            </Box>
                        ) : null}
                    </Box>
                );
            })}
        </Stack>
    );
};

const MessageMarkdown = ({ content }: { content: string }): JSX.Element => (
    <Box
        sx={{
            '& p': { m: 0 },
            '& p + p': { mt: 1 },
            '& ul, & ol': { my: 0.75, pl: 3 },
            '& li + li': { mt: 0.25 },
            '& blockquote': {
                borderColor: 'divider',
                borderLeft: 3,
                m: 0,
                pl: 1.5
            },
            '& table': {
                borderCollapse: 'collapse',
                mt: 1,
                width: '100%'
            },
            '& th, & td': {
                border: '1px solid',
                borderColor: 'divider',
                p: 0.75
            },
            '& code': {
                bgcolor: 'action.hover',
                borderRadius: 0.5,
                px: 0.5,
                py: 0.25
            },
            '& pre': {
                bgcolor: 'action.hover',
                borderRadius: 1,
                m: 0,
                mt: 1,
                overflowX: 'auto',
                p: 1
            },
            '& a': {
                borderBottom: '1px solid rgba(25, 118, 210, 0.38)',
                color: '#1565c0',
                display: 'inline',
                fontWeight: 600,
                lineHeight: 1.35,
                textDecoration: 'none',
                textUnderlineOffset: '2px',
                transition:
                    'color 0.16s ease, border-color 0.16s ease, background-color 0.16s ease'
            },
            '& a:visited': {
                borderBottomColor: 'rgba(25, 118, 210, 0.38)',
                color: '#1565c0'
            },
            '& a:hover': {
                backgroundColor: 'rgba(21, 101, 192, 0.08)',
                borderColor: '#1565c0',
                color: '#0d47a1'
            },
            '& a:focus-visible': {
                boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.24)',
                outline: 'none'
            },
            wordBreak: 'break-word'
        }}
    >
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content || ''}
        </ReactMarkdown>
    </Box>
);

const renderHighlightedMessageText = (
    content: string,
    tokens: string[]
): JSX.Element => {
    if (!content) {
        return <>{''}</>;
    }

    const cleanedTokens = tokens.filter(Boolean);
    if (cleanedTokens.length === 0) {
        return <>{content}</>;
    }

    const tokenPattern = new RegExp(
        `(${cleanedTokens.map(escapeRegExp).join('|')})`,
        'gi'
    );
    const parts = content.split(tokenPattern);

    return (
        <>
            {parts.map((part, index) => {
                const isHighlighted = cleanedTokens.some(
                    (token) => token.toLowerCase() === part.toLowerCase()
                );

                return isHighlighted ? (
                    <Box
                        component="span"
                        data-testid="ai-assist-highlighted-token"
                        key={`hl-${index}`}
                        sx={{
                            backgroundColor: 'rgba(25, 118, 210, 0.2)',
                            borderRadius: 0.75,
                            color: 'primary.main',
                            px: 0.25
                        }}
                    >
                        {part}
                    </Box>
                ) : (
                    <Box component="span" key={`tx-${index}`}>
                        {part}
                    </Box>
                );
            })}
        </>
    );
};

const linkHrefFromHint = (hint: AIAssistMessageLinkHint): string | null => {
    if (!hint?.entityId || !hint?.entityType) {
        return null;
    }

    if (hint.entityType === 'student') {
        return DEMO.STUDENT_DATABASE_STUDENTID_LINK(
            hint.entityId,
            DEMO.PROFILE_HASH
        );
    }

    if (hint.entityType === 'program') {
        return DEMO.SINGLE_PROGRAM_LINK(hint.entityId);
    }

    return null;
};

const referenceMarkerPattern = /\[reflink:([a-zA-Z0-9_-]+)\|([^\]]+)\]/g;

const buildReferenceMap = (
    linkHints: Record<string, AIAssistMessageLinkHint> | null | undefined
): Map<string, AIAssistMessageLinkHint> => {
    const byRefId = new Map<string, AIAssistMessageLinkHint>();
    if (!linkHints || typeof linkHints !== 'object') {
        return byRefId;
    }

    Object.entries(linkHints).forEach(([rawRefId, hint]) => {
        const refId = String(rawRefId || '').trim();
        if (!refId || byRefId.has(refId)) {
            return;
        }
        byRefId.set(refId, hint);
    });

    return byRefId;
};

const applyReferenceMarkersToMarkdown = (
    content: string,
    linkHints: Record<string, AIAssistMessageLinkHint> | null | undefined
): string => {
    if (!content) {
        return content;
    }

    const referencesById = buildReferenceMap(linkHints);
    return content.replace(
        referenceMarkerPattern,
        (_marker, rawRefId, rawLabel) => {
            const refId = String(rawRefId || '').trim();
            const label = String(rawLabel || '').trim() || refId;
            const reference = referencesById.get(refId);
            if (!reference) {
                return label;
            }

            const href = linkHrefFromHint(reference);
            if (!href) {
                return label;
            }

            const displayLabel =
                reference.entityType === 'student' && !label.startsWith('@')
                    ? `@${label}`
                    : label;

            const safeLabel = displayLabel
                .replace(/\\/g, '\\\\')
                .replace(/\[/g, '\\[')
                .replace(/\]/g, '\\]');
            return `[${safeLabel}](${href})`;
        }
    );
};

export const MessageContent = ({
    message
}: {
    message: AIAssistMessage;
}): JSX.Element => {
    const student = message.skillTrace?.student || null;
    const studentDisplayName = student?.displayName || null;
    const requestedSkill = message.skillTrace?.requestedSkill || null;
    const highlightTokens = [
        studentDisplayName ? `@${studentDisplayName}` : '',
        requestedSkill ? `#${requestedSkill}` : ''
    ].filter(Boolean);
    const content = applyReferenceMarkersToMarkdown(
        message.content || '',
        message.linkHints
    );
    // Structured deep-dive analyses are persisted in the parseable section
    // format. Render them with the same structured view as the Student Analysis
    // screen instead of raw markdown (e.g. when the conversation is reopened
    // from chat history).
    if (parseAnalysisOutput(content).isStructured) {
        return <AnalysisDisplay isStreaming={false} rawText={content} />;
    }
    const hasMarkdownSyntax = /(^|\s)([#>*`-]|\d+\.)\s|[*_`[\]()]/m.test(
        content
    );

    return (
        <Stack spacing={0.75}>
            {highlightTokens.length === 0 || hasMarkdownSyntax ? (
                <MessageMarkdown content={content} />
            ) : (
                <Box
                    sx={{
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word'
                    }}
                >
                    {renderHighlightedMessageText(content, highlightTokens)}
                </Box>
            )}
        </Stack>
    );
};
