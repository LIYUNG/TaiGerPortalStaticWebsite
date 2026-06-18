import { Box, CircularProgress, Divider, Stack, Typography } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { parseAnalysisOutput } from './utils/parseAnalysisOutput';
import { HealthBadge } from './components/HealthBadge';
import { BlockerCard } from './components/BlockerCard';
import { ActionList } from './components/ActionList';

interface AnalysisDisplayProps {
    rawText: string;
    isStreaming: boolean;
}

const RiskList = ({ risks }: { risks: { severity: string; text: string }[] }): JSX.Element => {
    const colors: Record<string, string> = {
        HIGH: '#c62828',
        MEDIUM: '#e65100',
        LOW: '#558b2f'
    };

    return (
        <Stack spacing={0.5}>
            {risks.map((risk, i) => (
                <Stack key={i} alignItems="flex-start" direction="row" spacing={1}>
                    <Box
                        component="span"
                        sx={{
                            color: colors[risk.severity] ?? 'text.secondary',
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            flexShrink: 0,
                            mt: 0.15,
                            minWidth: 52
                        }}
                    >
                        {risk.severity}
                    </Box>
                    <Typography variant="body2">{risk.text}</Typography>
                </Stack>
            ))}
        </Stack>
    );
};

const Section = ({
    title,
    children
}: {
    title: string;
    children: React.ReactNode;
}): JSX.Element => (
    <Stack spacing={1}>
        <Typography fontWeight={700} variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.7rem' }}>
            {title}
        </Typography>
        {children}
    </Stack>
);

export const AnalysisDisplay = ({ rawText, isStreaming }: AnalysisDisplayProps): JSX.Element => {
    const parsed = parseAnalysisOutput(rawText);

    if (isStreaming && !parsed.isStructured) {
        return (
            <Stack spacing={1.5}>
                {rawText ? (
                    <Box
                        sx={{
                            '& p': { m: 0 },
                            '& p + p': { mt: 1 },
                            '& ul, & ol': { my: 0.75, pl: 3 },
                            wordBreak: 'break-word'
                        }}
                    >
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{rawText}</ReactMarkdown>
                    </Box>
                ) : (
                    <Stack alignItems="center" direction="row" spacing={1}>
                        <CircularProgress size={16} />
                        <Typography color="text.secondary" variant="body2">
                            Analyzing...
                        </Typography>
                    </Stack>
                )}
            </Stack>
        );
    }

    if (!parsed.isStructured) {
        return (
            <Box
                sx={{
                    '& p': { m: 0 },
                    '& p + p': { mt: 1 },
                    '& ul, & ol': { my: 0.75, pl: 3 },
                    '& li + li': { mt: 0.25 },
                    wordBreak: 'break-word'
                }}
            >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{rawText || ''}</ReactMarkdown>
            </Box>
        );
    }

    return (
        <Stack divider={<Divider flexItem />} spacing={2}>
            {parsed.health && (
                <Stack alignItems="center" direction="row" spacing={1.5}>
                    <Typography fontWeight={600} variant="body2" color="text.secondary">
                        Overall health
                    </Typography>
                    <HealthBadge health={parsed.health} size="medium" />
                </Stack>
            )}

            {parsed.blockers.length > 0 && (
                <Section title="Blockers">
                    <Stack spacing={1}>
                        {parsed.blockers.map((blocker, i) => (
                            <BlockerCard blocker={blocker} key={i} />
                        ))}
                    </Stack>
                </Section>
            )}

            {parsed.risks.length > 0 && (
                <Section title="Key risks">
                    <RiskList risks={parsed.risks} />
                </Section>
            )}

            {parsed.actions.length > 0 && (
                <Section title="Recommended actions">
                    <ActionList actions={parsed.actions} />
                </Section>
            )}

            {parsed.analysis && (
                <Section title="Analysis">
                    <Box
                        sx={{
                            '& p': { m: 0 },
                            '& p + p': { mt: 1 },
                            '& ul, & ol': { my: 0.75, pl: 3 },
                            '& li + li': { mt: 0.25 },
                            wordBreak: 'break-word'
                        }}
                    >
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{parsed.analysis}</ReactMarkdown>
                    </Box>
                </Section>
            )}
        </Stack>
    );
};
