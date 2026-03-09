import { useTranslation } from 'react-i18next';
import {
    Box,
    Card,
    List,
    ListSubheader,
    Alert,
    Typography
} from '@mui/material';

import BaseDocumentCheckingTasks from '../../MainViewTab/AgentTasks/BaseDocumentCheckingTasks';
import { useAuth } from '@components/AuthProvider';
import type { IStudentResponse } from '@taiger-common/model';

const BaseDocumentCheckingTable = ({
    students
}: {
    students: IStudentResponse[];
}) => {
    const { user } = useAuth();
    const { t } = useTranslation();

    const base_documents_checking_tasks = students
        .filter((student) =>
            student.agents?.some((agent) => agent._id === user?._id?.toString())
        )
        .map((student, i) => (
            <BaseDocumentCheckingTasks key={i} student={student} />
        ));

    return (
        <Box>
            <Card sx={{ mb: 2 }}>
                <Alert severity="error">
                    <Typography>
                        {t('Check uploaded base documents')}:
                    </Typography>
                </Alert>
                <List
                    subheader={
                        <ListSubheader
                            component="div"
                            sx={{
                                display: 'flex',
                                gap: 2,
                                py: 1,
                                bgcolor: 'action.hover'
                            }}
                        >
                            <Typography
                                component="span"
                                variant="subtitle2"
                                sx={{ minWidth: 120 }}
                            >
                                {t('Student', { ns: 'common' })}
                            </Typography>
                            <Typography
                                component="span"
                                variant="subtitle2"
                                sx={{ minWidth: 140 }}
                            >
                                {t('Document Type', { ns: 'common' })}
                            </Typography>
                        </ListSubheader>
                    }
                >
                    {base_documents_checking_tasks}
                </List>
            </Card>
        </Box>
    );
};

export default BaseDocumentCheckingTable;
