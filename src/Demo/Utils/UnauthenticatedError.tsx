import React from 'react';
import { Box, Card } from '@mui/material';

const UnauthenticatedError = () => {
    return (
        <Box>
            <Card>
                Session is expired. Please refresh the page and login again.
            </Card>
        </Box>
    );
};

export default UnauthenticatedError;
