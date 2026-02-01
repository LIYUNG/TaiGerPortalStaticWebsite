import React from 'react';
import { Box, Card } from '@mui/material';

import PageNotFoundError from './PageNotFoundError';
import TimeOutErrors from './TimeOutErrors';
import UnauthorizedError from './UnauthorizedError';
import UnauthenticatedError from './UnauthenticatedError';
import TooManyRequestsError from './TooManyRequestsError';
import ResourceLockedError from './ResourceLockedError';

interface ErrorPageProps {
    res_status?: number;
}

const ErrorPage = ({ res_status }: ErrorPageProps) => {
    if (res_status === 400) {
        return (
            <Box>
                <Card>Server problem. Please try later.</Card>
            </Box>
        );
    }
    if (res_status === 401) {
        return <UnauthenticatedError />;
    }
    if (res_status === 403) {
        return <UnauthorizedError />;
    }
    if (res_status === 404) {
        return <PageNotFoundError />;
    }
    if (res_status === 408) {
        return <TimeOutErrors />;
    }
    if (res_status === 423) {
        return <ResourceLockedError />;
    }
    if (res_status === 429) {
        return <TooManyRequestsError />;
    }
    if (res_status !== undefined && res_status >= 500) {
        return (
            <Box>
                <Card>Server problem. Please try later.</Card>
            </Box>
        );
    }
    return null;
};

export default ErrorPage;
