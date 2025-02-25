import React, { useEffect, useState } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import { Box, Typography } from '@mui/material';
import i18next from 'i18next';

export default function ChildLoading() {
    const [showExtraMessage, setShowExtraMessage] = useState(false);

    useEffect(() => {
        // Set a timeout to show extra message after 1 second
        const timer = setTimeout(() => {
            setShowExtraMessage(true);
        }, 1 * 1000);

        // Cleanup the timer when the component unmounts
        return () => clearTimeout(timer);
    }, []);
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%', // Takes full width of the parent
                height: '100%', // Takes full height of the parent
                minHeight: '100px', // Ensures visibility even in small areas
                backgroundColor: 'rgba(0, 0, 0, 0.05)', // Light transparent overlay (optional)
                borderRadius: 2 // Matches card styling if used inside one
            }}
        >
            <CircularProgress />
            <Typography color="white" mt={2} variant="h6">
                {i18next.t('loading', { ns: 'common' })}
            </Typography>
            {showExtraMessage ? (
                <Typography color="white" variant="body2">
                    {i18next.t('almost-done', { ns: 'common' })}
                </Typography>
            ) : null}
        </Box>
    );
}
