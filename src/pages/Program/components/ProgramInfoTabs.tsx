import React, { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { Compare as CompareIcon, Info as InfoIcon } from '@mui/icons-material';
import {
    Box,
    Button,
    Card,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Tabs,
    Tab,
    Typography
} from '@mui/material';
import { is_TaiGer_AdminAgent } from '@taiger-common/core';
import { LinkableNewlineText } from '../../Utils/checking-functions';
import {
    IS_DEV,
    convertDate,
    COUNTRIES_MAPPING,
    english_test_hand_after,
    german_test_hand_after,
    program_fields_application_dates,
    program_fields_english_languages_test,
    program_fields_other_test,
    program_fields_others,
    program_fields_overview,
    program_fields_special_documents,
    program_fields_special_notes,
    programField2Label
} from '@utils/contants';
import { HighlightTextDiff } from '../../Utils/diffChecker';
import { a11yProps, CustomTabPanel } from '@components/Tabs';
import type { IUser } from '@taiger-common/model';
import type { SingleProgramViewProgram } from '../SingleProgramView';

interface ProgramVersionChange {
    originalValues?: Record<string, string>;
    updatedValues?: Record<string, string>;
    changedBy?: string;
    changedAt?: string;
    changeRequest?: string;
}

export interface ProgramInfoTabsProps {
    program: SingleProgramViewProgram;
    versions: { changes?: ProgramVersionChange[] };
    value: number;
    handleChange: (event: React.SyntheticEvent, newValue: number) => void;
    setDiffModalShow?: () => void;
    user?: IUser | null;
}

const convertToText = (
    value: string | boolean | string[] | undefined | null
): string | undefined => {
    if (!value) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (Array.isArray(value)) return value.join(', ');
};

const ProgramInfoTabs = ({
    program,
    versions,
    value,
    handleChange,
    setDiffModalShow,
    user
}: ProgramInfoTabsProps) => {
    const { t } = useTranslation();

    return (
        <>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs
                    aria-label="basic tabs example"
                    onChange={handleChange}
                    scrollButtons="auto"
                    value={value}
                    variant="scrollable"
                >
                    <Tab label={t('Overview')} {...a11yProps(value, 0)} />
                    <Tab
                        label={t('Application Deadline', { ns: 'common' })}
                        {...a11yProps(value, 1)}
                    />
                    <Tab
                        label={t('Specific Requirements', { ns: 'common' })}
                        {...a11yProps(value, 2)}
                    />
                    <Tab
                        label={t('Special Documents', { ns: 'common' })}
                        {...a11yProps(value, 3)}
                    />
                    <Tab label={t('Others')} {...a11yProps(value, 4)} />
                    {(versions?.changes?.length ?? 0) > 0 ? (
                        <Tab
                            label={t('Edit History', { ns: 'common' })}
                            {...a11yProps(value, 5)}
                        />
                    ) : null}
                </Tabs>
            </Box>

            <CustomTabPanel index={0} value={value}>
                <Card>
                    <Grid container spacing={2} sx={{ p: 2 }}>
                        {program_fields_overview.map((program_field, i) => (
                            <Fragment key={i}>
                                <Grid item md={4} xs={12}>
                                    <Typography fontWeight="bold">
                                        {t(`${program_field.name}`, {
                                            ns: 'common'
                                        })}
                                    </Typography>
                                </Grid>
                                <Grid item md={8} xs={12}>
                                    <LinkableNewlineText
                                        text={program[
                                            program_field.prop
                                        ]?.toString() ?? ''}
                                    />
                                </Grid>
                            </Fragment>
                        ))}
                    </Grid>
                </Card>
            </CustomTabPanel>

            <CustomTabPanel index={1} value={value}>
                <Card>
                    <Grid container spacing={2} sx={{ p: 2 }}>
                        {program_fields_application_dates.map(
                            (program_field, i) => (
                                <Fragment key={i}>
                                    <Grid item md={4} xs={12}>
                                        <Typography fontWeight="bold">
                                            {t(`${program_field.name}`, {
                                                ns: 'common'
                                            })}
                                        </Typography>
                                    </Grid>
                                    <Grid item md={8} xs={12}>
                                        <LinkableNewlineText
                                            text={program[program_field.prop]?.toString() ?? ''}
                                        />
                                    </Grid>
                                </Fragment>
                            )
                        )}
                    </Grid>
                </Card>
            </CustomTabPanel>

            <CustomTabPanel index={2} value={value}>
                <Card>
                    <Grid container spacing={2} sx={{ p: 2 }}>
                        {[...english_test_hand_after].map(
                            (program_field, i) => (
                                <Fragment key={i}>
                                    <Grid item md={4} xs={6}>
                                        <Typography fontWeight="bold">
                                            {t(`${program_field.name}`, {
                                                ns: 'common'
                                            })}
                                        </Typography>
                                    </Grid>
                                    <Grid item md={8} xs={6}>
                                        <LinkableNewlineText
                                            text={program[
                                                program_field.prop
                                            ]?.toString() ?? ''}
                                        />
                                    </Grid>
                                </Fragment>
                            )
                        )}
                        {program_fields_english_languages_test.map(
                            (program_field, i) => (
                                <Fragment key={i}>
                                    <Grid item md={2} xs={6}>
                                        <Typography fontWeight="bold">
                                            {t(`${program_field.name}`, {
                                                ns: 'common'
                                            })}
                                        </Typography>
                                    </Grid>
                                    <Grid item md={2} xs={6}>
                                        <LinkableNewlineText
                                            text={program[program_field.prop]?.toString() ?? ''}
                                        />
                                    </Grid>
                                    <Grid item md={2} xs={3}>
                                        {program[
                                            `${program_field.prop}_reading`
                                        ] ? (
                                            <Typography fontWeight="bold">
                                                {t('Reading', { ns: 'common' })}
                                                :{' '}
                                                {
                                                    program[
                                                        `${program_field.prop}_reading`
                                                    ]
                                                }
                                            </Typography>
                                        ) : null}{' '}
                                    </Grid>
                                    <Grid item md={2} xs={3}>
                                        {program[
                                            `${program_field.prop}_listening`
                                        ] ? (
                                            <Typography fontWeight="bold">
                                                {t('Listening', {
                                                    ns: 'common'
                                                })}
                                                :{' '}
                                                {
                                                    program[
                                                        `${program_field.prop}_listening`
                                                    ]
                                                }
                                            </Typography>
                                        ) : null}{' '}
                                    </Grid>
                                    <Grid item md={2} xs={3}>
                                        {program[
                                            `${program_field.prop}_speaking`
                                        ] ? (
                                            <Typography fontWeight="bold">
                                                {t('Speaking', {
                                                    ns: 'common'
                                                })}
                                                :{' '}
                                                {
                                                    program[
                                                        `${program_field.prop}_speaking`
                                                    ]
                                                }
                                            </Typography>
                                        ) : null}{' '}
                                    </Grid>
                                    <Grid item md={2} xs={3}>
                                        {program[
                                            `${program_field.prop}_writing`
                                        ] ? (
                                            <Typography fontWeight="bold">
                                                {t('Writing', { ns: 'common' })}
                                                :{' '}
                                                {
                                                    program[
                                                        `${program_field.prop}_writing`
                                                    ]
                                                }
                                            </Typography>
                                        ) : null}
                                    </Grid>
                                </Fragment>
                            )
                        )}
                        {[
                            ...german_test_hand_after,
                            ...program_fields_other_test,
                            ...program_fields_special_notes
                        ].map((program_field, i) => (
                            <Fragment key={i}>
                                <Grid item md={4} xs={12}>
                                    <Typography fontWeight="bold">
                                        {t(`${program_field.name}`, {
                                            ns: 'common'
                                        })}
                                    </Typography>
                                </Grid>
                                <Grid item md={8} xs={12}>
                                    <LinkableNewlineText
                                        text={program[
                                            program_field.prop
                                        ]?.toString() ?? ''}
                                    />
                                </Grid>
                            </Fragment>
                        ))}
                    </Grid>
                </Card>
            </CustomTabPanel>

            <CustomTabPanel index={3} value={value}>
                <Card>
                    <Grid container spacing={2} sx={{ p: 2 }}>
                        {program_fields_special_documents.map(
                            (program_field, i) => (
                                <Fragment key={i}>
                                    <Grid item md={4} xs={12}>
                                        <Typography fontWeight="bold">
                                            {t(`${program_field.name}`, {
                                                ns: 'common'
                                            })}
                                        </Typography>
                                    </Grid>
                                    <Grid item md={8} xs={12}>
                                        <LinkableNewlineText
                                            text={convertToText(
                                                program[program_field.prop] as string | boolean | string[] | undefined | null
                                            ) ?? ''}
                                        />
                                    </Grid>
                                </Fragment>
                            )
                        )}
                    </Grid>
                </Card>
            </CustomTabPanel>

            <CustomTabPanel index={4} value={value}>
                <Card>
                    <Grid container spacing={2} sx={{ p: 2 }}>
                        {program_fields_others.map((program_field, i) => (
                            <Fragment key={i}>
                                <Grid item md={4} xs={12}>
                                    <Typography fontWeight="bold">
                                        {t(`${program_field.name}`, {
                                            ns: 'common'
                                        })}
                                    </Typography>
                                </Grid>
                                <Grid item md={8} xs={12}>
                                    <LinkableNewlineText
                                        text={program[program_field.prop]?.toString() ?? ''}
                                    />
                                </Grid>
                            </Fragment>
                        ))}
                        <Grid item md={4} xs={12}>
                            <Typography fontWeight="bold">
                                {t('Country', { ns: 'common' })}
                            </Typography>
                        </Grid>
                        <Grid item md={8} xs={12}>
                            <span>
                                <img
                                    alt="Logo"
                                    src={`/assets/logo/country_logo/svg/${program.country}.svg`}
                                    style={{
                                        maxWidth: '32px',
                                        maxHeight: '32px'
                                    }}
                                    title={COUNTRIES_MAPPING[program.country as keyof typeof COUNTRIES_MAPPING]}
                                />
                            </span>
                        </Grid>
                        {program.application_portal_a ? (
                            <>
                                <Grid item md={4} xs={12}>
                                    <Typography fontWeight="bold">
                                        Portal Link 1
                                    </Typography>
                                </Grid>
                                <Grid item md={8} xs={12}>
                                    <LinkableNewlineText
                                        text={program.application_portal_a?.toString() ?? ''}
                                    />
                                </Grid>
                                <Grid item md={4} xs={12}>
                                    <Typography fontWeight="bold">
                                        Portal Instructions 1
                                    </Typography>
                                </Grid>
                                <Grid item md={8} xs={12}>
                                    <LinkableNewlineText
                                        text={
                                            program.application_portal_a_instructions?.toString() ?? ''
                                        }
                                    />
                                </Grid>
                            </>
                        ) : null}
                        {program.application_portal_b ? (
                            <>
                                <Grid item md={4} xs={12}>
                                    <Typography fontWeight="bold">
                                        Portal Link 2
                                    </Typography>
                                </Grid>
                                <Grid item md={8} xs={12}>
                                    <LinkableNewlineText
                                        text={program.application_portal_b?.toString() ?? ''}
                                    />
                                </Grid>
                                <Grid item md={4} xs={12}>
                                    <Typography fontWeight="bold">
                                        Portal Instructions 2
                                    </Typography>
                                </Grid>
                                <Grid item md={8} xs={12}>
                                    <LinkableNewlineText
                                        text={
                                            program.application_portal_b_instructions?.toString() ?? ''
                                        }
                                    />
                                </Grid>
                            </>
                        ) : null}
                        <Grid item md={4} xs={12}>
                            <Typography fontWeight="bold">
                                {t('Last update', { ns: 'common' })}
                            </Typography>
                        </Grid>
                        <Grid item md={8} xs={12}>
                            <Typography fontWeight="bold">
                                {convertDate(program.updatedAt as string)}
                            </Typography>
                        </Grid>
                        {user && is_TaiGer_AdminAgent(user as IUser) ? (
                            <>
                                <Grid item md={4} xs={12}>
                                    <Typography>
                                        {t('Updated by', { ns: 'common' })}
                                    </Typography>
                                </Grid>
                                <Grid item md={8} xs={12}>
                                    <Typography>
                                        {program.whoupdated}
                                    </Typography>
                                </Grid>
                                <Grid item md={4} xs={12}>
                                    <Typography>
                                        {t('Group', { ns: 'common' })}
                                    </Typography>
                                </Grid>
                            </>
                        ) : null}
                    </Grid>
                </Card>
            </CustomTabPanel>

            {(versions?.changes?.length ?? 0) > 0 ? (
                <CustomTabPanel
                    index={5}
                    style={{ width: '100%', overflowY: 'auto' }}
                    value={value}
                >
                    {IS_DEV ? (
                        <Button onClick={() => setDiffModalShow?.()}>
                            <CompareIcon fontSize="small" /> Incoming changes -
                            Compare
                        </Button>
                    ) : null}
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>
                                    <strong>{t('#', { ns: 'common' })}</strong>
                                </TableCell>
                                <TableCell>
                                    <strong>
                                        {t('Changed By', { ns: 'common' })}
                                    </strong>
                                </TableCell>
                                <TableCell>
                                    <strong>
                                        {t('Field', { ns: 'common' })}
                                    </strong>
                                </TableCell>
                                <TableCell>
                                    <strong>
                                        {t('Content', { ns: 'common' })}
                                    </strong>
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {versions.changes!
                                .slice()
                                .reverse()
                                .map((change, index) => {
                                    const reverseIndex = versions.changes?.length
                                        ? versions.changes.length - index
                                        : index;
                                    const keys = Object.keys({
                                        ...change.originalValues,
                                        ...change.updatedValues
                                    });
                                    return (
                                        <Fragment key={index}>
                                            <TableRow />
                                            <TableRow>
                                                <TableCell
                                                    rowSpan={
                                                        (keys?.length || 0) + 1
                                                    }
                                                >
                                                    <Typography>
                                                        {reverseIndex}{' '}
                                                        {change?.changeRequest ? (
                                                            <div
                                                                title={`from change request ${change?.changeRequest}`}
                                                            >
                                                                <InfoIcon fontSize="small" />
                                                            </div>
                                                        ) : null}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell
                                                    rowSpan={
                                                        (keys?.length || 0) + 1
                                                    }
                                                >
                                                    <div>
                                                        {change.changedBy}
                                                    </div>
                                                    <div>
                                                        {convertDate(
                                                            change.changedAt ?? ''
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                            {keys.map((key, i) => (
                                                <TableRow key={i}>
                                                    <TableCell>
                                                        {t(
                                                            programField2Label?.[
                                                                key
                                                            ] || key,
                                                            { ns: 'common' }
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <HighlightTextDiff
                                                            original={
                                                                change
                                                                    ?.originalValues?.[
                                                                    key
                                                                ]
                                                            }
                                                            updated={
                                                                change
                                                                    ?.updatedValues?.[
                                                                    key
                                                                ]
                                                            }
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </Fragment>
                                    );
                                })}
                        </TableBody>
                    </Table>
                </CustomTabPanel>
            ) : null}
        </>
    );
};

export default ProgramInfoTabs;
