import React from 'react';
import {
    Menu,
    MenuItem,
    Divider,
    ListItemIcon,
    ListItemText
} from '@mui/material';
import {
    ArrowForward as ArrowForwardIcon,
    Check as CheckIcon,
    Cancel as CancelIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { STATUS_FLOW, isTerminalStatus } from './statusUtils';

/**
 * StatusMenu - reusable popup menu to progress/cancel a deal status.
 * Props:
 * - anchorEl: HTMLElement | null
 * - currentStatus: string | undefined
 * - onClose: () => void
 * - onChoose: (status: string) => void
 */
const StatusMenu = ({ anchorEl, currentStatus, onClose, onChoose }) => {
    const { t } = useTranslation();

    const open = Boolean(anchorEl);
    const isTerminal = isTerminalStatus(currentStatus);

    let nextOptions = [];
    if (currentStatus && !isTerminal) {
        const idx = STATUS_FLOW.indexOf(currentStatus);
        nextOptions = idx >= 0 ? STATUS_FLOW.slice(idx + 1) : [];
    }

    return (
        <Menu
            anchorEl={anchorEl}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            onClose={onClose}
            open={open}
            transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        >
            {currentStatus && (
                <MenuItem disabled>
                    <ListItemIcon>
                        <CheckIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                        primary={t('common.current', {
                            ns: 'crm',
                            defaultValue: 'Current'
                        })}
                        secondary={t(`deals.statusLabels.${currentStatus}`, {
                            ns: 'crm',
                            defaultValue: currentStatus
                        })}
                    />
                </MenuItem>
            )}

            {nextOptions.length > 0 && <Divider />}

            {nextOptions.map((s) => (
                <MenuItem key={s} onClick={() => onChoose(s)}>
                    <ListItemIcon>
                        <ArrowForwardIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                        primary={t(`deals.statusLabels.${s}`, {
                            ns: 'crm',
                            defaultValue: s
                        })}
                    />
                </MenuItem>
            ))}

            {!isTerminal && <Divider />}
            {!isTerminal && (
                <MenuItem onClick={() => onChoose('canceled')}>
                    <ListItemIcon>
                        <CancelIcon color="error" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                        primary={t('actions.cancel', {
                            ns: 'crm',
                            defaultValue: 'Cancel'
                        })}
                    />
                </MenuItem>
            )}
        </Menu>
    );
};

export default StatusMenu;
