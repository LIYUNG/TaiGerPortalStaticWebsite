import { useEffect, useState } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import { Box, Typography } from '@mui/material';
import i18next from 'i18next';

interface LoadingProps {
    variant?: 'full' | 'child';
}

export default function Loading({ variant = 'full' }: LoadingProps): JSX.Element {
    const [showExtraMessage, setShowExtraMessage] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowExtraMessage(true);
        }, 1 * 1000);

        return () => clearTimeout(timer);
    }, []);

    const isChild = variant === 'child';

    return (
        <Box
            sx={
                isChild
                    ? {
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '100%',
                          height: '100%',
                          minHeight: '100px',
                          backgroundColor: 'rgba(0, 0, 0, 0.05)',
                          borderRadius: 2
                      }
                    : {
                          position: 'fixed',
                          top: 0,
                          left: 0,
                          width: '100vw',
                          height: '100vh',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: 'rgba(0, 0, 0, 0.5)',
                          zIndex: -1
                      }
            }
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
