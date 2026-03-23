import { Box, Typography } from '@mui/material';

import Friend from './Friend';
import EmbeddedFriend from './EmbeddedFriend';
import { useTranslation } from 'react-i18next';
import { menuWidth } from '@utils/contants';
import type { IStudentResponse } from '@taiger-common/model';

interface FriendsProps {
    students: IStudentResponse[] | unknown[];
    user: { _id?: { toString: () => string } };
    embedded?: boolean;
    handleCloseChat?: () => void;
}

const Friends = ({
    students,
    user,
    embedded,
    handleCloseChat
}: FriendsProps) => {
    const { t } = useTranslation();
    const studentsArray = Array.isArray(students) ? students : [];

    if (studentsArray.length === 0) {
        return (
            <Typography
                sx={{
                    ...(embedded ? {} : { width: menuWidth }),
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

    const friendList = studentsArray.map((f: unknown) => {
        const rec = f as Record<string, unknown>;
        const key =
            (rec._id as { toString?: () => string })?.toString?.() ??
            String(rec._id);
        return embedded ? (
            <EmbeddedFriend
                activeId={user._id?.toString() ?? ''}
                data={rec as Parameters<typeof EmbeddedFriend>[0]['data']}
                key={key}
            />
        ) : (
            <Friend
                activeId={user._id?.toString() ?? ''}
                data={rec as Parameters<typeof Friend>[0]['data']}
                handleCloseChat={handleCloseChat}
                key={key}
            />
        );
    });

    return <Box>{friendList}</Box>;
};

export default Friends;
