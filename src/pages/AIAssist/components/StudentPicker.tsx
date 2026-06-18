import {
    Box,
    Button,
    CircularProgress,
    Stack,
    Typography
} from '@mui/material';
import { useTranslation } from 'react-i18next';

import type { AIAssistPickerStudent } from '@/api/types';

interface StudentSectionProps {
    testId: string;
    title: string;
    students: AIAssistPickerStudent[];
    onPickStudent: (student: AIAssistPickerStudent) => void;
}

const StudentSection = ({
    testId,
    title,
    students,
    onPickStudent
}: StudentSectionProps): JSX.Element => (
    <Box data-testid={testId}>
        <Typography fontWeight={600} sx={{ mb: 0.75 }} variant="body2">
            {title}
        </Typography>
        <Stack direction="row" flexWrap="wrap" gap={1}>
            {students.map((student) => (
                <Button
                    key={student.id}
                    onClick={() => onPickStudent(student)}
                    size="small"
                    variant="outlined"
                >
                    {student.name}
                </Button>
            ))}
        </Stack>
    </Box>
);

interface StudentPickerProps {
    recentStudents: AIAssistPickerStudent[];
    myStudents: AIAssistPickerStudent[];
    isLoading: boolean;
    onPickStudent: (student: AIAssistPickerStudent) => void;
}

export const StudentPicker = ({
    recentStudents,
    myStudents,
    isLoading,
    onPickStudent
}: StudentPickerProps): JSX.Element => {
    const { t } = useTranslation();

    if (isLoading) {
        return (
            <Stack
                alignItems="center"
                justifyContent="center"
                sx={{ minHeight: 120 }}
            >
                <CircularProgress size={20} />
            </Stack>
        );
    }

    return (
        <Stack spacing={2}>
            {recentStudents.length > 0 && (
                <StudentSection
                    testId="ai-assist-student-section-recent"
                    title={t('aiAssist.recentStudents', 'Recent students')}
                    students={recentStudents}
                    onPickStudent={onPickStudent}
                />
            )}
            {myStudents.length > 0 && (
                <StudentSection
                    testId="ai-assist-student-section-mine"
                    title={t('aiAssist.myStudents', 'My students')}
                    students={myStudents}
                    onPickStudent={onPickStudent}
                />
            )}
        </Stack>
    );
};
