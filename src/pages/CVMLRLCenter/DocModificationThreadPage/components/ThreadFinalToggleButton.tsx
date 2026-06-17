import { Button, IconButton, Tooltip, CircularProgress } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ReplayIcon from '@mui/icons-material/Replay';
import i18next from 'i18next';

export interface ThreadFinalToggleButtonProps {
    isFinalVersion: boolean;
    isToggleBlocked: boolean;
    isLocked: boolean;
    isWithdraw: boolean;
    lockTooltip: string;
    isSubmissionLoaded: boolean;
    /** Render icon-only (mobile) to keep the top bar compact. */
    compact?: boolean;
    onToggle: () => void;
}

/**
 * Mark-as-finished / mark-as-open toggle for a document thread. Lives in the
 * thread's top bar (next to the tabs) rather than at the bottom of the composer,
 * so the primary action is reachable without scrolling.
 */
const ThreadFinalToggleButton = ({
    isFinalVersion,
    isToggleBlocked,
    isLocked,
    isWithdraw,
    lockTooltip,
    isSubmissionLoaded,
    compact = false,
    onToggle
}: ThreadFinalToggleButtonProps) => {
    const loading = !isSubmissionLoaded;
    const label = isWithdraw
        ? i18next.t('Withdrawn', { defaultValue: 'Withdrawn' })
        : isFinalVersion
          ? i18next.t('Mark as open')
          : i18next.t('Mark as finished');
    const blockedTooltip = isLocked
        ? lockTooltip
        : isWithdraw
          ? i18next.t('thread-withdrawn', {
                defaultValue: 'This thread is withdrawn.'
            })
          : i18next.t('thread-close');
    const color = isFinalVersion ? 'secondary' : 'success';
    const variant = isFinalVersion ? 'outlined' : 'contained';
    const icon = loading ? (
        <CircularProgress color="inherit" size={18} />
    ) : isFinalVersion ? (
        <ReplayIcon fontSize="small" />
    ) : (
        <CheckCircleOutlineIcon fontSize="small" />
    );

    if (compact) {
        return (
            <Tooltip title={isToggleBlocked ? blockedTooltip : label}>
                <span>
                    <IconButton
                        aria-label={label}
                        color={color}
                        disabled={isToggleBlocked || loading}
                        onClick={onToggle}
                        size="small"
                    >
                        {icon}
                    </IconButton>
                </span>
            </Tooltip>
        );
    }

    return (
        <Tooltip title={isToggleBlocked ? blockedTooltip : ''}>
            <span>
                <Button
                    color={color}
                    disabled={isToggleBlocked || loading}
                    onClick={onToggle}
                    size="small"
                    startIcon={icon}
                    sx={{ whiteSpace: 'nowrap' }}
                    variant={variant}
                >
                    {label}
                </Button>
            </span>
        </Tooltip>
    );
};

export default ThreadFinalToggleButton;
