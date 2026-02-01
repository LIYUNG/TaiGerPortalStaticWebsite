import React from 'react';
import { Box, Card } from '@mui/material';

const ResourceLockedError = () => {
    return (
        <Box>
            <Card>The resource is locked and can not be changed.</Card>
        </Box>
    );
};

export default ResourceLockedError;
