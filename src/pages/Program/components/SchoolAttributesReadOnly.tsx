import { Link as LinkDom } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Alert, Box, Chip, Link, Typography } from '@mui/material';

import DEMO from '@store/constant';

export interface SchoolAttributesReadOnlyProps {
    isPrivateSchool?: boolean;
    isPartnerSchool?: boolean;
}

/**
 * The school-level flags, shown but not editable on program pages.
 *
 * `isPrivateSchool` / `isPartnerSchool` belong to the SCHOOL, not the program:
 * School Configuration batch-writes them to every program of a school
 * (updateBatchSchoolAttributes). Editing them here would create a second source
 * of truth — the next School Config save would overwrite it, and a school whose
 * programs disagree splits into multiple rows in the distinct-schools
 * aggregation. So we display them and point at the one place that owns them.
 */
export const SchoolAttributesReadOnly = ({
    isPrivateSchool,
    isPartnerSchool
}: SchoolAttributesReadOnlyProps) => {
    const { t } = useTranslation();

    const yesNo = (value?: boolean) =>
        value
            ? t('Yes', { ns: 'common', defaultValue: 'Yes' })
            : t('No', { ns: 'common', defaultValue: 'No' });

    return (
        <Alert severity="info" variant="outlined">
            <Box
                sx={{
                    alignItems: 'center',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 1
                }}
            >
                <Typography variant="body2">
                    {t('School attributes', {
                        ns: 'common',
                        defaultValue: 'School attributes'
                    })}
                    :
                </Typography>
                <Chip
                    color={isPrivateSchool ? 'secondary' : 'default'}
                    label={`${t('Private university', {
                        ns: 'common',
                        defaultValue: 'Private university'
                    })}: ${yesNo(isPrivateSchool)}`}
                    size="small"
                />
                <Chip
                    color={isPartnerSchool ? 'success' : 'default'}
                    label={`${t('Partner school', {
                        ns: 'common',
                        defaultValue: 'Partner school'
                    })}: ${yesNo(isPartnerSchool)}`}
                    size="small"
                />
                <Typography color="text.secondary" variant="caption">
                    {t('These apply to every program of this school.', {
                        ns: 'common',
                        defaultValue:
                            'These apply to every program of this school.'
                    })}{' '}
                    <Link
                        component={LinkDom}
                        target="_blank"
                        to={DEMO.SCHOOL_CONFIG}
                        underline="hover"
                    >
                        {t('School Configuration', { ns: 'common' })}
                    </Link>
                </Typography>
            </Box>
        </Alert>
    );
};

export default SchoolAttributesReadOnly;
