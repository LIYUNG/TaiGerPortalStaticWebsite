import React from 'react';
import { Link as LinkDom } from 'react-router-dom';
import { Alert, Link, Typography } from '@mui/material';

const Banner = ({
    link_name,
    removeBanner,
    notification_key,
    path,
    text,
    title
}) => {
    return (
        <Alert
            onClose={
                notification_key
                    ? (e) => removeBanner(e, notification_key)
                    : undefined
            }
            severity={
                title === 'warning' || title?.toLowerCase() === 'warning'
                    ? 'warning'
                    : title === 'error'
                      ? 'error'
                      : title === 'success'
                        ? 'success'
                        : title === 'info'
                          ? 'info'
                          : 'info'
            }
        >
            <Typography variant="body2">
                <strong>
                    {title === 'warning'
                        ? 'Warning'
                        : title === 'error'
                          ? 'Error'
                          : title === 'success'
                            ? 'Success'
                            : title === 'info'
                              ? 'Info'
                              : title || 'Reminder'}
                    :
                </strong>
                <br />
                {text}
                {link_name && (
                    <Link component={LinkDom} to={`${path}`}>
                        {link_name}
                    </Link>
                )}
            </Typography>
        </Alert>
    );
};

export default Banner;
