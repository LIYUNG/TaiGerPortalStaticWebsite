import { Link as LinkDom } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Box,
    Card,
    CardContent,
    Checkbox,
    Chip,
    Link,
    Typography
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LockOpenIcon from '@mui/icons-material/LockOpen';

import DEMO from '@store/constant';
import { SchoolAvatar } from '@components/SchoolAvatar';
import { calculateProgramLockStatus } from '../../Utils/util_functions';
import type { ProgramsTableProgramRow } from '../ProgramsTable';

export type ProgramCardRow = ProgramsTableProgramRow & {
    country?: string;
    degree?: string;
    semester?: string;
    lang?: string;
    toefl?: string;
    ielts?: string;
    application_deadline?: string;
    updatedAt?: string;
};

export interface ProgramCardProps {
    program: ProgramCardRow;
    selected: boolean;
    onToggleSelect: (programId: string) => void;
}

const MetaItem = ({ label, value }: { label: string; value?: string }) =>
    value ? (
        <Box sx={{ minWidth: 0 }}>
            <Typography color="text.secondary" variant="caption">
                {label}
            </Typography>
            <Typography noWrap variant="body2">
                {value}
            </Typography>
        </Box>
    ) : null;

export const ProgramCard = ({
    program,
    selected,
    onToggleSelect
}: ProgramCardProps) => {
    const { t } = useTranslation();
    const programId = String(program._id ?? '');
    const lockStatus = calculateProgramLockStatus(program as never);
    const singleLink = DEMO.SINGLE_PROGRAM_LINK(programId);

    return (
        <Card
            sx={{
                mb: 1.5,
                border: (theme) =>
                    `1px solid ${selected ? theme.palette.primary.main : theme.palette.divider}`
            }}
            variant="outlined"
        >
            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Checkbox
                        checked={selected}
                        inputProps={{
                            'aria-label': t('Select program', { ns: 'common' })
                        }}
                        onChange={() => onToggleSelect(programId)}
                        size="small"
                        sx={{ mt: -0.5, ml: -0.5 }}
                    />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box
                            sx={{
                                alignItems: 'center',
                                display: 'flex',
                                gap: 1,
                                justifyContent: 'space-between'
                            }}
                        >
                            <Box
                                sx={{
                                    alignItems: 'center',
                                    display: 'flex',
                                    gap: 1,
                                    minWidth: 0
                                }}
                            >
                                <SchoolAvatar
                                    school={program.school}
                                    size={24}
                                />
                                <Link
                                    component={LinkDom}
                                    sx={{ fontWeight: 600 }}
                                    target="_blank"
                                    to={singleLink}
                                    underline="hover"
                                    variant="subtitle2"
                                >
                                    {program.school}
                                </Link>
                            </Box>
                            {lockStatus.isLocked ? (
                                <Chip
                                    color="warning"
                                    icon={<LockOutlinedIcon fontSize="small" />}
                                    label={t('Locked', { ns: 'common' })}
                                    size="small"
                                />
                            ) : (
                                <Chip
                                    icon={<LockOpenIcon fontSize="small" />}
                                    label={t('Unlocked', { ns: 'common' })}
                                    size="small"
                                    variant="outlined"
                                />
                            )}
                        </Box>
                        <Link
                            component={LinkDom}
                            target="_blank"
                            to={singleLink}
                            underline="hover"
                            variant="body2"
                        >
                            {program.program_name}
                        </Link>

                        <Box
                            sx={{
                                display: 'grid',
                                gap: 1,
                                gridTemplateColumns: 'repeat(4, 1fr)',
                                mt: 1
                            }}
                        >
                            <MetaItem
                                label={t('Degree', { ns: 'common' })}
                                value={program.degree}
                            />
                            <MetaItem
                                label={t('Country', { ns: 'common' })}
                                value={program.country}
                            />
                            <MetaItem
                                label={t('Semester', { ns: 'common' })}
                                value={program.semester}
                            />
                            <MetaItem
                                label={t('Language', { ns: 'common' })}
                                value={program.lang}
                            />
                            <MetaItem
                                label={t('TOEFL', { ns: 'common' })}
                                value={program.toefl}
                            />
                            <MetaItem
                                label={t('IELTS', { ns: 'common' })}
                                value={program.ielts}
                            />
                            <MetaItem
                                label={t('Deadline', { ns: 'common' })}
                                value={program.application_deadline}
                            />
                        </Box>

                        {program.updatedAt ? (
                            <Typography
                                color="text.secondary"
                                sx={{
                                    display: 'block',
                                    mt: 1,
                                    textAlign: 'right'
                                }}
                                variant="caption"
                            >
                                {t('Last update', { ns: 'common' })}:{' '}
                                {new Date(
                                    program.updatedAt
                                ).toLocaleDateString()}
                            </Typography>
                        ) : null}
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
};

export default ProgramCard;
