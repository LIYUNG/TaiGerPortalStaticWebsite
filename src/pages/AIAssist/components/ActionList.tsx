import { Chip, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import type { ParsedAction } from '../utils/parseAnalysisOutput';

const URGENCY_COLORS: Record<string, 'error' | 'warning' | 'default'> = {
    IMMEDIATE: 'error',
    URGENT: 'warning',
    NORMAL: 'default'
};

const TARGET_LABELS: Record<string, string> = {
    AGENT: 'Agent',
    STUDENT: 'Student',
    EDITOR: 'Editor',
    TEAM: 'Team'
};

export const ActionList = ({
    actions
}: {
    actions: ParsedAction[];
}): JSX.Element => {
    if (actions.length === 0) {
        return (
            <Typography color="text.secondary" variant="body2">
                No specific actions identified.
            </Typography>
        );
    }

    const order = ['IMMEDIATE', 'URGENT', 'NORMAL'];
    const sorted = [...actions].sort(
        (a, b) => order.indexOf(a.urgency) - order.indexOf(b.urgency)
    );

    return (
        <Stack spacing={0.75}>
            {sorted.map((action, index) => (
                <Stack
                    key={`${index}-${action.urgency}`}
                    alignItems="flex-start"
                    direction="row"
                    spacing={1}
                    sx={{ py: 0.5 }}
                >
                    <Stack
                        direction="row"
                        spacing={0.5}
                        sx={{ flexShrink: 0, mt: 0.1 }}
                    >
                        <Chip
                            color={URGENCY_COLORS[action.urgency] ?? 'default'}
                            label={action.urgency}
                            size="small"
                            sx={{
                                borderRadius: 0.75,
                                fontWeight: 700,
                                fontSize: '0.65rem'
                            }}
                            variant="outlined"
                        />
                        <Chip
                            label={
                                TARGET_LABELS[action.target] ?? action.target
                            }
                            size="small"
                            sx={{ borderRadius: 0.75, fontSize: '0.65rem' }}
                            variant="outlined"
                        />
                    </Stack>
                    <Typography sx={{ flex: 1 }} variant="body2">
                        {action.text}
                    </Typography>
                    <Tooltip title="Copy">
                        <IconButton
                            onClick={() =>
                                navigator.clipboard.writeText(action.text)
                            }
                            size="small"
                            sx={{
                                flexShrink: 0,
                                opacity: 0.5,
                                '&:hover': { opacity: 1 }
                            }}
                        >
                            <ContentCopyIcon sx={{ fontSize: '0.875rem' }} />
                        </IconButton>
                    </Tooltip>
                </Stack>
            ))}
        </Stack>
    );
};
