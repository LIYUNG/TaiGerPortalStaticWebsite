import React from 'react';
import { Box, Container, CssBaseline, useTheme } from '@mui/material';
import Footer from '../Footer/Footer';
import { appConfig } from '../../config';

interface AuthWrapperProps {
    children: React.ReactNode;
}

export default function AuthWrapper({
    children
}: AuthWrapperProps): JSX.Element {
    const theme = useTheme();
    const mode = theme.palette.mode;
    const logoLink =
        mode === 'dark'
            ? `${appConfig.LoginPageDarkLogo}.svg`
            : `${appConfig.LoginPageLightLogo}.svg`;

    return (
        <Container component="main" maxWidth="xs">
            <CssBaseline />
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                }}
            >
                <img alt="Logo" src={logoLink} style={{ maxWidth: '100%' }} />
                {children}
            </Box>
            <Footer />
        </Container>
    );
}
