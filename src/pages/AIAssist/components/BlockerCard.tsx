import { Box, Chip, Stack, Typography } from '@mui/material';
import type { ParsedBlocker } from '../utils/parseAnalysisOutput';

const WAITING_ON_COLORS: Record<string, 'warning' | 'info' | 'default'> = {
    student: 'warning',
    team: 'info',
    editor: 'info',
    agent: 'info'
};

export const BlockerCard = ({ blocker }: { blocker: ParsedBlocker }): JSX.Element => {
    const waitingOnColor = WAITING_ON_COLORS[blocker.waitingOn?.toLowerCase()] ?? 'default';

    return (
        <Box
            sx={{
                border: 1,
                borderColor: 'error.light',
                borderRadius: 1,
                p: 1.5,
                bgcolor: 'error.50',
                '&': { bgcolor: 'rgba(211,47,47,0.04)' }
            }}
        >
            <Stack spacing={0.75}>
                <Stack alignItems="flex-start" direction="row" justifyContent="space-between" spacing={1}>
                    <Typography fontWeight={700} variant="body2">
                        {blocker.title}
                    </Typography>
                    {blocker.waitingOn && blocker.waitingOn !== 'unknown' && (
                        <Chip
                            color={waitingOnColor}
                            label={`Waiting on: ${blocker.waitingOn}`}
                            size="small"
                            sx={{ borderRadius: 0.75, flexShrink: 0 }}
                            variant="outlined"
                        />
                    )}
                </Stack>
                {blocker.rootCause && (
                    <Typography color="text.secondary" variant="body2">
                        <Box component="span" fontWeight={600}>Root cause: </Box>
                        {blocker.rootCause}
                    </Typography>
                )}
                {blocker.since && blocker.since !== 'unknown' && (
                    <Typography color="text.disabled" variant="caption">
                        Since {blocker.since}
                    </Typography>
                )}
            </Stack>
        </Box>
    );
};
