import { Link as LinkDom } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Link,
    Typography
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

import DEMO from '@store/constant';

export type InterviewRow = Record<string, unknown>;

export interface InterviewCardProps {
    interview: InterviewRow;
    canAssign: boolean;
    onAssign: (interview: InterviewRow) => void;
}

const STATUS_COLOR: Record<
    string,
    'default' | 'info' | 'primary' | 'success' | 'warning'
> = {
    Open: 'default',
    Scheduled: 'info',
    Trained: 'primary',
    Interviewed: 'success',
    Closed: 'default',
    'N/A': 'warning'
};

const str = (value: unknown): string => (value == null ? '' : String(value));

const MetaItem = ({ label, value }: { label: string; value?: string }) =>
    value ? (
        <Box sx={{ minWidth: 0 }}>
            <Typography color="text.secondary" variant="caption">
                {label}
            </Typography>
            <Typography variant="body2">{value}</Typography>
        </Box>
    ) : null;

export const InterviewCard = ({
    interview,
    canAssign,
    onAssign
}: InterviewCardProps) => {
    const { t } = useTranslation();
    const status = str(interview.status);
    const studentLink = DEMO.STUDENT_DATABASE_STUDENTID_LINK(
        str(interview.student_id),
        DEMO.PROFILE_HASH
    );
    const interviewLink = DEMO.INTERVIEW_SINGLE_LINK(str(interview.id));

    return (
        <Card sx={{ mb: 1.5 }} variant="outlined">
            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Box
                    sx={{
                        alignItems: 'center',
                        display: 'flex',
                        gap: 1,
                        justifyContent: 'space-between'
                    }}
                >
                    <Link
                        component={LinkDom}
                        sx={{ fontWeight: 600, minWidth: 0 }}
                        target="_blank"
                        to={studentLink}
                        underline="hover"
                        variant="subtitle2"
                    >
                        {str(interview.firstname_lastname)}
                    </Link>
                    {status ? (
                        <Chip
                            color={STATUS_COLOR[status] ?? 'default'}
                            label={status}
                            size="small"
                        />
                    ) : null}
                </Box>

                <Link
                    component={LinkDom}
                    sx={{ display: 'block', mb: 1 }}
                    target="_blank"
                    to={interviewLink}
                    underline="hover"
                    variant="body2"
                >
                    {str(interview.program_name)}
                </Link>

                <Box
                    sx={{
                        display: 'grid',
                        gap: 1,
                        gridTemplateColumns: 'repeat(2, 1fr)'
                    }}
                >
                    <MetaItem
                        label={t('Trainer', { ns: 'common' })}
                        value={str(interview.trainer_name) || '—'}
                    />
                    <MetaItem
                        label={t('Training Time', { ns: 'interviews' })}
                        value={str(interview.start) || '—'}
                    />
                    <MetaItem
                        label={t('Official Interview Time', {
                            ns: 'interviews'
                        })}
                        value={str(interview.interview_date) || '—'}
                    />
                </Box>

                {(interview.isDuplicate || canAssign) && (
                    <Box
                        sx={{
                            alignItems: 'center',
                            display: 'flex',
                            gap: 1,
                            justifyContent: 'space-between',
                            mt: 1
                        }}
                    >
                        {interview.isDuplicate ? (
                            <Chip
                                color="warning"
                                icon={<WarningAmberIcon />}
                                label={t('Duplicate', { ns: 'common' })}
                                size="small"
                                variant="outlined"
                            />
                        ) : (
                            <span />
                        )}
                        {canAssign ? (
                            <Button
                                color="success"
                                onClick={() => onAssign(interview)}
                                size="small"
                                startIcon={<PersonAddIcon />}
                                variant="outlined"
                            >
                                {t('Assign', { ns: 'common' })}
                            </Button>
                        ) : null}
                    </Box>
                )}
            </CardContent>
        </Card>
    );
};

export default InterviewCard;
