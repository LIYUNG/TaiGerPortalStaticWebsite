import { Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import { ArrowForward as ArrowForwardIcon } from '@mui/icons-material';

import { getAvailableLeadStatusOptions } from '../constants/statusOptions';

interface LeadStatusMenuProps {
    anchorEl: HTMLElement | null;
    currentStatus: string | undefined;
    onClose: () => void;
    onChoose: (status: string) => void;
}

const LeadStatusMenu = ({
    anchorEl,
    currentStatus,
    onClose,
    onChoose
}: LeadStatusMenuProps) => {
    const open = Boolean(anchorEl);
    const statusOptions = getAvailableLeadStatusOptions(currentStatus);

    return (
        <Menu
            anchorEl={anchorEl}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            onClose={onClose}
            open={open}
            transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        >
            {statusOptions.map((option) => (
                <MenuItem
                    key={option.value}
                    onClick={() => onChoose(option.value)}
                >
                    <ListItemIcon>
                        <ArrowForwardIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={option.label} />
                </MenuItem>
            ))}
        </Menu>
    );
};

export default LeadStatusMenu;
