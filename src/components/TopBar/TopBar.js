import React, { useState } from 'react';
import {
    Card,
    Typography,
    Box,
    IconButton,
    Chip,
    Fade,
    useTheme
} from '@mui/material';
import {
    Close as CloseIcon,
    Info as InfoIcon,
    Warning as WarningIcon,
    Error as ErrorIcon,
    CheckCircle as SuccessIcon,
    Lock as LockIcon,
    LockOpen as LockOpenIcon
} from '@mui/icons-material';

/**
 * TopBar - A modern, flexible status indicator component
 * @param {string} status - The status text to display (default: 'Close')
 * @param {string} severity - The severity level: 'info', 'warning', 'error', 'success', 'finished', 'closed', 'open' (default: 'finished')
 * @param {string} message - Optional additional message
 * @param {boolean} dismissible - Whether the bar can be dismissed (default: false)
 * @param {function} onDismiss - Callback function when dismissed
 * @param {boolean} showIcon - Whether to show status icon (default: true)
 */
export const TopBar = ({
    status = 'Close',
    severity = 'finished',
    message = '',
    dismissible = false,
    onDismiss = null,
    showIcon = true
}) => {
    const [visible, setVisible] = useState(true);
    const theme = useTheme();

    const handleDismiss = () => {
        setVisible(false);
        if (onDismiss) {
            onDismiss();
        }
    };

    // Define severity configurations
    const severityConfig = {
        info: {
            icon: <InfoIcon />,
            color: theme.palette.info.main,
            bgColor: theme.palette.info.light,
            textColor: theme.palette.info.dark,
            gradient: `linear-gradient(135deg, ${theme.palette.info.light}15 0%, ${theme.palette.info.main}25 100%)`
        },
        warning: {
            icon: <WarningIcon />,
            color: theme.palette.warning.main,
            bgColor: theme.palette.warning.light,
            textColor: theme.palette.warning.dark,
            gradient: `linear-gradient(135deg, ${theme.palette.warning.light}15 0%, ${theme.palette.warning.main}25 100%)`
        },
        error: {
            icon: <ErrorIcon />,
            color: theme.palette.error.main,
            bgColor: theme.palette.error.light,
            textColor: theme.palette.error.dark,
            gradient: `linear-gradient(135deg, ${theme.palette.error.light}15 0%, ${theme.palette.error.main}25 100%)`
        },
        finished: {
            icon: <SuccessIcon />,
            color: '#2e7d32',
            bgColor: '#e8f5e9',
            textColor: '#1b5e20',
            gradient: 'linear-gradient(135deg, #e8f5e915 0%, #4caf5025 100%)'
        },
        closed: {
            icon: <LockIcon />,
            color: '#d32f2f',
            bgColor: '#ffebee',
            textColor: '#c62828',
            gradient: 'linear-gradient(135deg, #ffebee15 0%, #ef535025 100%)'
        },
        open: {
            icon: <LockOpenIcon />,
            color: '#2e7d32',
            bgColor: '#e8f5e9',
            textColor: '#1b5e20',
            gradient: 'linear-gradient(135deg, #e8f5e915 0%, #4caf5025 100%)'
        }
    };

    const config = severityConfig[severity] || severityConfig.finished;

    if (!visible) {
        return null;
    }

    return (
        <Fade in={visible}>
            <Card
                elevation={2}
                sx={{
                    mb: 2,
                    borderRadius: 2,
                    background: config.gradient,
                    border: `2px solid ${config.color}20`,
                    overflow: 'hidden',
                    position: 'relative',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                        boxShadow: theme.shadows[4],
                        transform: 'translateY(-2px)'
                    },
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: '4px',
                        background: config.color
                    }
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        p: 2,
                        pl: 3
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            flex: 1
                        }}
                    >
                        {showIcon && (
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: 40,
                                    height: 40,
                                    borderRadius: '50%',
                                    backgroundColor: `${config.color}20`,
                                    color: config.color,
                                    flexShrink: 0
                                }}
                            >
                                {config.icon}
                            </Box>
                        )}

                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1.5,
                                    flexWrap: 'wrap'
                                }}
                            >
                                <Typography
                                    sx={{
                                        color: theme.palette.text.secondary,
                                        letterSpacing: '0.5px',
                                        textTransform: 'uppercase'
                                    }}
                                    variant="body2"
                                >
                                    Status:
                                </Typography>
                                <Chip
                                    label={status}
                                    size="small"
                                    sx={{
                                        backgroundColor: config.color,
                                        color: '#fff',
                                        fontWeight: 600,
                                        fontSize: '0.875rem',
                                        height: 28,
                                        '& .MuiChip-label': {
                                            px: 2
                                        }
                                    }}
                                />
                            </Box>

                            {message && (
                                <Typography
                                    sx={{
                                        mt: 0.5,
                                        color: theme.palette.text.secondary,
                                        fontSize: '0.875rem'
                                    }}
                                    variant="body2"
                                >
                                    {message}
                                </Typography>
                            )}
                        </Box>
                    </Box>

                    {dismissible && (
                        <IconButton
                            aria-label="dismiss"
                            onClick={handleDismiss}
                            size="small"
                            sx={{
                                color: theme.palette.text.secondary,
                                ml: 1,
                                '&:hover': {
                                    backgroundColor: `${config.color}15`,
                                    color: config.color
                                }
                            }}
                        >
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    )}
                </Box>
            </Card>
        </Fade>
    );
};
