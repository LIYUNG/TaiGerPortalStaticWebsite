import React from 'react';
import { Box, Typography } from '@mui/material';
import i18next from 'i18next';

import Friend from './Friend';

interface EmbeddedFriendsProps {
    students: unknown[];
    user: { _id?: { toString: () => string } };
}

const Friends = (props: EmbeddedFriendsProps) => {
    const students = Array.isArray(props.students) ? props.students : [];

    if (students.length === 0) {
        return (
            <Typography
                sx={{
                    marginLeft: '10px',
                    marginTop: '10px',
                    marginBottom: '10px',
                    textAlign: 'center'
                }}
            >
                {i18next.t('No students found')}
            </Typography>
        );
    }
    const friendList = students.map((f: Record<string, unknown>) => (
        <Friend
            activeId={props.user._id?.toString() ?? ''}
            data={f}
            key={
                (f._id as { toString?: () => string })?.toString?.() ??
                String(f._id)
            }
        />
    ));

    return <Box>{friendList}</Box>;
};

export default Friends;
