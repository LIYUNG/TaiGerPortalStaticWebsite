import { Typography, Card, Box, Stack, Divider } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LanguageIcon from '@mui/icons-material/Language';
import SchoolIcon from '@mui/icons-material/School';

import type {
    IDocumentthreadPopulated,
    IProgramWithId
} from '@taiger-common/model';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@mui/material';

interface ProgramDetailsCardProps {
    thread: IDocumentthreadPopulated;
    programGradient: { start: string; end: string };
}

const ProgramDetailsCard = ({
    thread,
    programGradient
}: ProgramDetailsCardProps) => {
    const theme = useTheme();
    const { t } = useTranslation();

    if (!thread.program_id) {
        return null;
    }

    return (
        <Card
            sx={{
                borderRadius: 2,
                boxShadow: theme.shadows[1],
                border: `1px solid ${theme.palette.divider}`
            }}
        >
            <Box
                sx={{
                    background: `linear-gradient(135deg, ${programGradient.start} 0%, ${programGradient.end} 100%)`,
                    color: 'white',
                    p: 1.5
                }}
            >
                <Stack alignItems="center" direction="row" spacing={0.75}>
                    <SchoolIcon fontSize="small" />
                    <Typography fontWeight="600" variant="subtitle1">
                        {t('Program Details')}
                    </Typography>
                </Stack>
            </Box>
            <Box sx={{ p: 2 }}>
                <Stack spacing={2}>
                    <Stack
                        alignItems="center"
                        direction="row"
                        justifyContent="space-between"
                    >
                        <Stack
                            alignItems="center"
                            direction="row"
                            spacing={0.75}
                        >
                            <AccessTimeIcon
                                color="action"
                                sx={{ fontSize: 18 }}
                            />
                            <Typography color="text.secondary" variant="body2">
                                {t('Semester', { ns: 'common' })}
                            </Typography>
                        </Stack>
                        <Typography fontWeight="600" variant="body2">
                            {(thread.program_id as IProgramWithId).semester}
                        </Typography>
                    </Stack>
                    <Divider />
                    <Stack
                        alignItems="center"
                        direction="row"
                        justifyContent="space-between"
                    >
                        <Stack
                            alignItems="center"
                            direction="row"
                            spacing={0.75}
                        >
                            <LanguageIcon
                                color="action"
                                sx={{ fontSize: 18 }}
                            />
                            <Typography color="text.secondary" variant="body2">
                                {t('Program Language', { ns: 'common' })}
                            </Typography>
                        </Stack>
                        <Typography fontWeight="600" variant="body2">
                            {(thread.program_id as IProgramWithId).lang}
                        </Typography>
                    </Stack>
                </Stack>
            </Box>
        </Card>
    );
};

export default ProgramDetailsCard;
