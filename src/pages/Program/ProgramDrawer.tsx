import { lazy, Suspense } from 'react';
import { Box, Drawer, IconButton, Tooltip, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import i18next from 'i18next';

import Loading from '@components/Loading/Loading';

// Code-split the (heavy) program page: it's only loaded when the Drawer opens.
const SingleProgram = lazy(() => import('./SingleProgram'));

export interface ProgramDrawerProps {
    open: boolean;
    onClose: () => void;
    programId: string;
}

/**
 * Right-anchored Drawer that shows the full program view for a given program.
 * SingleProgram is only mounted while the Drawer is open, so its data is
 * fetched lazily on first open.
 */
const ProgramDrawer = ({ open, onClose, programId }: ProgramDrawerProps) => (
    <Drawer
        anchor="right"
        onClose={onClose}
        open={open}
        sx={{
            '& .MuiDrawer-paper': { width: '100%', maxWidth: 720 }
        }}
        variant="temporary"
    >
        <Box
            sx={{
                position: 'sticky',
                top: 0,
                zIndex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: 1,
                borderColor: 'divider',
                bgcolor: 'background.paper',
                px: 2,
                py: 1.5
            }}
        >
            <Typography fontWeight="600" variant="h6">
                {i18next.t('Program', {
                    ns: 'common',
                    defaultValue: 'Program'
                })}
            </Typography>
            <Tooltip title={i18next.t('Close', { ns: 'common' })}>
                <IconButton aria-label="close program" onClick={onClose}>
                    <CloseIcon />
                </IconButton>
            </Tooltip>
        </Box>
        <Box sx={{ p: 2, overflowY: 'auto' }}>
            {open && programId ? (
                <Suspense fallback={<Loading variant="child" />}>
                    <SingleProgram programId={programId} />
                </Suspense>
            ) : null}
        </Box>
    </Drawer>
);

export default ProgramDrawer;
