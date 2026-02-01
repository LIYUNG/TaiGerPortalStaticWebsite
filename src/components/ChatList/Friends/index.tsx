import React from 'react';
import { Box, Typography } from '@mui/material';

import Friend from './Friend';
import { useTranslation } from 'react-i18next';
import { menuWidth } from '../../../utils/contants';

interface FriendsProps {
    students: unknown[];
    user: { _id?: { toString: () => string } };
    handleCloseChat?: () => void;
}

const Friends = (props: FriendsProps) => {
    const { t } = useTranslation();
    const students = Array.isArray(props.students) ? props.students : [];

    if (students.length === 0) {
        return (
            <Typography
                sx={{
                    width: menuWidth,
                    marginLeft: '10px',
                    marginTop: '10px',
                    marginBottom: '10px',
                    textAlign: 'center'
                }}
            >
                {t('No students found')}
            </Typography>
        );
    }
    const friendList = students.map((f: Record<string, unknown>) => (
        <Friend
            activeId={props.user._id?.toString() ?? ''}
            data={f}
            handleCloseChat={props.handleCloseChat}
            key={
                (f._id as { toString?: () => string })?.toString?.() ??
                String(f._id)
            }
        />
    ));

    return <Box>{friendList}</Box>;
};

export default Friends;
