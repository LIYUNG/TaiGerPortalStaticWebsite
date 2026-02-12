import { Box, Typography } from '@mui/material';

import Friend from './Friend';
import { useTranslation } from 'react-i18next';
import { menuWidth } from '@utils/contants';
import { IStudentResponse } from '@/api/types';

interface FriendsProps {
    students: IStudentResponse[];
    user: { _id?: { toString: () => string } };
    handleCloseChat?: () => void;
}

const Friends = ({ students, user, handleCloseChat }: FriendsProps) => {
    const { t } = useTranslation();
    const studentsArray = Array.isArray(students) ? students : [];

    if (studentsArray.length === 0) {
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
    const friendList = studentsArray.map((f: IStudentResponse) => (
        <Friend
            activeId={user._id?.toString() ?? ''}
            data={f}
            handleCloseChat={handleCloseChat}
            key={
                (f._id as { toString?: () => string })?.toString?.() ??
                String(f._id)
            }
        />
    ));

    return <Box>{friendList}</Box>;
};

export default Friends;
