import { Link as LinkDom } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Box,
    Button,
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
import { CountryFlag } from '@components/CountryFlag';
import { COUNTRIES_MAPPING } from '@utils/contants';
import { calculateProgramLockStatus } from '../../Utils/util_functions';
import type { ProgramsTableProgramRow } from '../ProgramsTable';

export type ProgramResultRow = ProgramsTableProgramRow & {
    country?: string;
    degree?: string;
    semester?: string;
    lang?: string;
    toefl?: string;
    ielts?: string;
    application_deadline?: string;
    isPrivateSchool?: boolean;
    isPartnerSchool?: boolean;
    isNC?: boolean;
};

export interface ProgramResultCardProps {
    program: ProgramResultRow;
    selected: boolean;
    onToggleSelect: (programId: string) => void;
}

/** One "label: value" fact, hidden entirely when the program has no value. */
const Meta = ({ label, value }: { label: string; value?: string }) =>
    value ? (
        <Typography color="text.secondary" component="span" variant="caption">
            <Box component="span" sx={{ color: 'text.primary' }}>
                {label}:
            </Box>{' '}
            {value}
        </Typography>
    ) : null;

export const ProgramResultCard = ({
    program,
    selected,
    onToggleSelect
}: ProgramResultCardProps) => {
    const { t } = useTranslation();
    const programId = String(program._id ?? '');
    const singleLink = DEMO.SINGLE_PROGRAM_LINK(programId);
    const lockStatus = calculateProgramLockStatus(program as never);

    return (
        <Card
            sx={{
                '&:hover': { borderColor: 'primary.main' },
                borderColor: selected ? 'primary.main' : undefined
            }}
            variant="outlined"
        >
            <CardContent
                sx={{
                    alignItems: 'flex-start',
                    display: 'flex',
                    gap: 1.5,
                    '&:last-child': { pb: 2 }
                }}
            >
                <Checkbox
                    checked={selected}
                    inputProps={{
                        'aria-label': `${t('Select', { ns: 'common', defaultValue: 'Select' })} ${program.program_name ?? ''}`
                    }}
                    onChange={() => onToggleSelect(programId)}
                    size="small"
                    sx={{ mt: -0.5 }}
                />

                <SchoolAvatar school={program.school} size={40} />

                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box
                        sx={{
                            alignItems: 'center',
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 1
                        }}
                    >
                        <Link
                            component={LinkDom}
                            sx={{ fontWeight: 600 }}
                            target="_blank"
                            to={singleLink}
                            underline="hover"
                            variant="subtitle1"
                        >
                            {program.program_name}
                        </Link>
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
                        color="text.secondary"
                        component={LinkDom}
                        target="_blank"
                        to={singleLink}
                        underline="hover"
                        variant="body2"
                    >
                        {program.school}
                    </Link>

                    <Box
                        sx={{
                            columnGap: 2,
                            display: 'flex',
                            flexWrap: 'wrap',
                            mt: 0.75,
                            rowGap: 0.5
                        }}
                    >
                        <Meta
                            label={t('Degree', { ns: 'common' })}
                            value={program.degree}
                        />
                        {program.country ? (
                            <Typography
                                color="text.secondary"
                                component="span"
                                sx={{
                                    alignItems: 'center',
                                    display: 'inline-flex',
                                    gap: 0.5
                                }}
                                variant="caption"
                            >
                                <CountryFlag
                                    country={program.country}
                                    size={16}
                                />
                                {COUNTRIES_MAPPING[
                                    program.country as keyof typeof COUNTRIES_MAPPING
                                ] ?? program.country}
                            </Typography>
                        ) : null}
                        <Meta
                            label={t('Semester', { ns: 'common' })}
                            value={program.semester}
                        />
                        <Meta
                            label={t('Language', { ns: 'common' })}
                            value={program.lang}
                        />
                        <Meta
                            label={t('TOEFL', { ns: 'common' })}
                            value={program.toefl}
                        />
                        <Meta
                            label={t('IELTS', { ns: 'common' })}
                            value={program.ielts}
                        />
                        <Meta
                            label={t('Deadline', { ns: 'common' })}
                            value={program.application_deadline}
                        />
                    </Box>

                    <Box
                        sx={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 0.5,
                            mt: 1
                        }}
                    >
                        {program.isPrivateSchool ? (
                            <Chip
                                color="secondary"
                                label={t('Private', {
                                    ns: 'common',
                                    defaultValue: 'Private'
                                })}
                                size="small"
                            />
                        ) : null}
                        {program.isPartnerSchool ? (
                            <Chip
                                color="success"
                                label={t('Partner', {
                                    ns: 'common',
                                    defaultValue: 'Partner'
                                })}
                                size="small"
                            />
                        ) : null}
                        {program.isNC ? (
                            <Chip
                                color="warning"
                                label={t('NC', {
                                    ns: 'common',
                                    defaultValue: 'NC'
                                })}
                                size="small"
                            />
                        ) : null}
                        {(program.programSubjects ?? []).map((subject) => (
                            <Chip key={subject} label={subject} size="small" />
                        ))}
                        {(program.tags ?? []).map((tag) => (
                            <Chip
                                color="info"
                                key={tag}
                                label={tag}
                                size="small"
                                variant="outlined"
                            />
                        ))}
                    </Box>
                </Box>

                <Button
                    component={LinkDom}
                    size="small"
                    sx={{ flexShrink: 0 }}
                    target="_blank"
                    to={singleLink}
                    variant="contained"
                >
                    {t('View Details', {
                        ns: 'common',
                        defaultValue: 'View Details'
                    })}
                </Button>
            </CardContent>
        </Card>
    );
};

export default ProgramResultCard;
