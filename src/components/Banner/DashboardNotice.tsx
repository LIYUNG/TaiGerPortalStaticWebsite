import type { ReactNode, SyntheticEvent } from 'react';
import { Link as LinkDom } from 'react-router-dom';
import {
    Box,
    Button,
    IconButton,
    Paper,
    Stack,
    Typography
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import LaunchIcon from '@mui/icons-material/Launch';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

export type NoticeSeverity = 'warning' | 'error' | 'info';

export interface DashboardNoticeProps {
    severity?: NoticeSeverity;
    children: ReactNode;
    /** Right-aligned call to action. */
    actionLabel?: string;
    actionTo?: string;
    onDismiss?: (e: SyntheticEvent) => void;
}

const ICON: Record<NoticeSeverity, typeof WarningAmberIcon> = {
    warning: WarningAmberIcon,
    error: ErrorOutlineIcon,
    info: InfoOutlinedIcon
};

/**
 * A dashboard notice, styled like the rest of the dashboard rather than like a
 * stock MUI Alert: outlined surface, coloured accent spine, icon, then the
 * action right-aligned on the same row — the same shape as the application
 * cards above it.
 *
 * The tint and spine come from the severity palette, so it still reads as a
 * warning at a glance; what it drops is the heavy full-bleed alert background
 * that made a stack of them shout over the actual content.
 */
const DashboardNotice = ({
    severity = 'warning',
    children,
    actionLabel,
    actionTo,
    onDismiss
}: DashboardNoticeProps) => {
    const Icon = ICON[severity];

    return (
        <Paper
            sx={{
                bgcolor: (theme) => alpha(theme.palette[severity].main, 0.08),
                borderLeft: 4,
                borderLeftColor: `${severity}.main`
            }}
            variant="outlined"
        >
            <Stack
                alignItems="center"
                direction="row"
                spacing={1.5}
                sx={{ px: 1.5, py: 1 }}
            >
                <Icon color={severity} fontSize="small" />
                {/* component="div": callers pass lists of affected programmes,
                    which would be invalid nested inside a <p>. */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography component="div" variant="body2">
                        {children}
                    </Typography>
                </Box>
                {actionLabel && actionTo ? (
                    <Button
                        color={severity}
                        component={LinkDom}
                        endIcon={<LaunchIcon />}
                        size="small"
                        sx={{ flexShrink: 0 }}
                        target="_blank"
                        to={actionTo}
                        variant="outlined"
                    >
                        {actionLabel}
                    </Button>
                ) : null}
                {onDismiss ? (
                    <IconButton
                        aria-label="dismiss notice"
                        onClick={onDismiss}
                        size="small"
                        sx={{ flexShrink: 0 }}
                    >
                        <CloseIcon fontSize="small" />
                    </IconButton>
                ) : null}
            </Stack>
        </Paper>
    );
};

export default DashboardNotice;
