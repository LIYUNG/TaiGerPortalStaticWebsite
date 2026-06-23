import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import Filter1OutlinedIcon from '@mui/icons-material/Filter1Outlined';
import Filter2OutlinedIcon from '@mui/icons-material/Filter2Outlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Grid,
    IconButton,
    InputAdornment,
    Link,
    Paper,
    Stack,
    TextField,
    Tooltip,
    Typography
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import type { IProgramWithId } from '@taiger-common/model';

import { LinkableNewlineText } from '../Utils/checking-functions';
import type { PortalCredentialFields } from './portalCredentialsUtils';

/**
 * Copy text to the clipboard, falling back to a hidden textarea + execCommand
 * for browsers / non-secure (http) contexts where navigator.clipboard is absent.
 */
async function copyTextToClipboard(text: string): Promise<void> {
    if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return;
    }
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    try {
        document.execCommand('copy');
    } finally {
        document.body.removeChild(textarea);
    }
}

type CredentialTextFieldProps = {
    id: string;
    label: string;
    value: string;
    color: 'primary' | 'secondary';
    startIcon: React.ReactNode;
    onChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => void;
};

/**
 * A portal credential input (account or password) with a one-click copy button
 * in the trailing adornment. The icon briefly turns into a check on success.
 */
function CredentialTextField({
    id,
    label,
    value,
    color,
    startIcon,
    onChange
}: CredentialTextFieldProps) {
    const { t } = useTranslation('portalManagement');
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        if (!value) {
            return;
        }
        try {
            await copyTextToClipboard(value);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1500);
        } catch {
            // Silently ignore — copying is a convenience, the value is still visible.
        }
    };

    const copyTooltip = (() => {
        if (!value) {
            return t('portalCreds.nothingToCopy');
        }
        return copied ? t('portalCreds.copied') : t('portalCreds.copy');
    })();

    return (
        <TextField
            fullWidth
            autoComplete="off"
            color={color}
            id={id}
            InputProps={{
                startAdornment: (
                    <InputAdornment position="start">
                        {startIcon}
                    </InputAdornment>
                ),
                endAdornment: (
                    <InputAdornment position="end">
                        <Tooltip title={copyTooltip}>
                            <span>
                                <IconButton
                                    aria-label={t('portalCreds.copy')}
                                    disabled={!value}
                                    edge="end"
                                    onClick={handleCopy}
                                    size="small"
                                >
                                    {copied ? (
                                        <CheckOutlinedIcon
                                            color="success"
                                            fontSize="small"
                                        />
                                    ) : (
                                        <ContentCopyOutlinedIcon fontSize="small" />
                                    )}
                                </IconButton>
                            </span>
                        </Tooltip>
                    </InputAdornment>
                )
            }}
            label={label}
            margin="dense"
            onChange={onChange}
            size="small"
            type="text"
            value={value}
        />
    );
}

type PortalCredentialsApplicationBlockProps = {
    program: IProgramWithId;
    appId: string;
    /** Submission state: '-' = not yet, 'O' = submitted, 'X' = withdrawn. */
    closed: string;
    credentials: PortalCredentialFields;
    isChanged: boolean;
    isUpdateLoaded: boolean;
    isSubmittingThisApp: boolean;
    onCredentialFieldChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => void;
    onUpdateClick: () => void;
};

/**
 * Read-only badge showing whether this application has been submitted on the
 * university's own system. The value is managed on the Applications page; here
 * it is shown for at-a-glance reference. '-' = not yet, 'O' = submitted,
 * 'X' = withdrawn.
 */
function SubmissionStatusChip({ closed }: { closed: string }) {
    const { t } = useTranslation('portalManagement');

    if (closed === 'X') {
        return (
            <Chip
                color="error"
                icon={<CancelOutlinedIcon />}
                label={t('portalCreds.withdrawn')}
                size="small"
                sx={{ fontWeight: 600, width: 'fit-content' }}
                variant="outlined"
            />
        );
    }

    const submitted = closed === 'O';
    return (
        <Chip
            color={submitted ? 'success' : 'default'}
            icon={
                submitted ? (
                    <CheckCircleOutlineIcon />
                ) : (
                    <RadioButtonUncheckedIcon />
                )
            }
            label={
                submitted
                    ? t('portalCreds.submitted')
                    : t('portalCreds.notSubmitted')
            }
            size="small"
            sx={{ fontWeight: 600, width: 'fit-content' }}
            variant={submitted ? 'filled' : 'outlined'}
        />
    );
}

function shouldShowMissingCredentialsWarning(
    program: IProgramWithId,
    creds: PortalCredentialFields
): boolean {
    const portalAIncomplete =
        Boolean(program.application_portal_a) &&
        (!creds.account_portal_a || !creds.password_portal_a);
    const portalBIncomplete =
        Boolean(program.application_portal_b) &&
        (!creds.account_portal_b || !creds.password_portal_b);
    return portalAIncomplete || portalBIncomplete;
}

const fieldGridProps = {
    xs: 12,
    sm: 6,
    md: 3
} as const;

/**
 * One decided application: program header, optional warning, portal A/B rows.
 */
export function PortalCredentialsApplicationBlock({
    program,
    appId,
    closed,
    credentials,
    isChanged,
    isUpdateLoaded,
    isSubmittingThisApp,
    onCredentialFieldChange,
    onUpdateClick
}: PortalCredentialsApplicationBlockProps) {
    const { t } = useTranslation('portalManagement');
    const { t: tTrans } = useTranslation();
    const hasAnyPortal = Boolean(
        program.application_portal_a || program.application_portal_b
    );
    const programHref = `/programs/${program._id.toString()}`;
    const programTitle = `${program.school} — ${program.program_name} — ${program.semester} — ${program.degree}`;
    const saveDisabled = !isUpdateLoaded || !isChanged || isSubmittingThisApp;
    const saveTooltip = (() => {
        if (isSubmittingThisApp || !isUpdateLoaded) {
            return t('portalCreds.saving');
        }
        if (!isChanged) {
            return t('portalCreds.saveDisabledHint');
        }
        return t('portalCreds.saveEnabledHint');
    })();

    return (
        <Paper
            component="section"
            elevation={0}
            sx={{
                p: { xs: 2, sm: 2.5 },
                borderRadius: 2,
                border: 1,
                borderColor: 'divider',
                borderLeftWidth: 4,
                borderLeftColor: 'primary.main',
                bgcolor: (th) =>
                    alpha(
                        th.palette.primary.main,
                        th.palette.mode === 'dark' ? 0.08 : 0.04
                    )
            }}
            variant="outlined"
        >
            <Stack spacing={2.5}>
                <Stack
                    alignItems={{ xs: 'stretch', sm: 'flex-start' }}
                    direction={{ xs: 'column', sm: 'row' }}
                    justifyContent="space-between"
                    spacing={2}
                >
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                            component="h3"
                            variant="subtitle1"
                            sx={{
                                fontWeight: 600,
                                lineHeight: 1.4,
                                wordBreak: 'break-word'
                            }}
                        >
                            <Link
                                href={programHref}
                                rel="noopener noreferrer"
                                target="_blank"
                                underline="hover"
                                sx={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 0.5,
                                    fontWeight: 'inherit',
                                    color: 'primary.main'
                                }}
                            >
                                {programTitle}
                                <OpenInNewIcon
                                    aria-hidden
                                    sx={{ fontSize: 18, opacity: 0.85 }}
                                />
                            </Link>
                        </Typography>
                    </Box>
                    <Stack
                        alignItems="center"
                        direction="row"
                        flexWrap="wrap"
                        justifyContent="flex-end"
                        spacing={1.5}
                        useFlexGap
                    >
                        <SubmissionStatusChip closed={closed} />
                        {hasAnyPortal ? (
                            <Tooltip title={saveTooltip}>
                                <span>
                                    <Button
                                        color="primary"
                                        disabled={saveDisabled}
                                        onClick={onUpdateClick}
                                        size="medium"
                                        startIcon={
                                            !isUpdateLoaded ||
                                            isSubmittingThisApp ? (
                                                <CircularProgress
                                                    aria-hidden
                                                    color="inherit"
                                                    size={18}
                                                    thickness={5}
                                                />
                                            ) : (
                                                <SaveOutlinedIcon aria-hidden />
                                            )
                                        }
                                        sx={{ flexShrink: 0, minWidth: 128 }}
                                        variant="contained"
                                    >
                                        {!isUpdateLoaded || isSubmittingThisApp
                                            ? tTrans('Updating')
                                            : tTrans('Update', {
                                                  ns: 'common'
                                              })}
                                    </Button>
                                </span>
                            </Tooltip>
                        ) : null}
                    </Stack>
                </Stack>

                {hasAnyPortal ? (
                    <>
                        {shouldShowMissingCredentialsWarning(
                            program,
                            credentials
                        ) ? (
                            <Alert
                                icon={<WarningAmberOutlinedIcon />}
                                severity="warning"
                                sx={{
                                    borderRadius: 2,
                                    bgcolor: (th) =>
                                        alpha(th.palette.warning.main, 0.08),
                                    border: 1,
                                    borderColor: 'warning.light'
                                }}
                                variant="outlined"
                            >
                                {t('portalCreds.missingCredentialsWarning')}
                            </Alert>
                        ) : null}

                        <Grid
                            container
                            columnSpacing={2}
                            rowSpacing={1}
                            sx={{
                                display: { xs: 'none', md: 'flex' },
                                mb: 0.5
                            }}
                        >
                            <Grid item {...fieldGridProps}>
                                <Typography
                                    color="text.secondary"
                                    variant="caption"
                                    sx={{ fontWeight: 600, letterSpacing: 0.3 }}
                                >
                                    {tTrans('Account', { ns: 'common' })}
                                </Typography>
                            </Grid>
                            <Grid item {...fieldGridProps}>
                                <Typography
                                    color="text.secondary"
                                    variant="caption"
                                    sx={{ fontWeight: 600, letterSpacing: 0.3 }}
                                >
                                    {tTrans('Password', { ns: 'common' })}
                                </Typography>
                            </Grid>
                            <Grid item {...fieldGridProps}>
                                <Typography
                                    color="text.secondary"
                                    variant="caption"
                                    sx={{ fontWeight: 600, letterSpacing: 0.3 }}
                                >
                                    {tTrans('Link', { ns: 'common' })}
                                </Typography>
                            </Grid>
                            <Grid item {...fieldGridProps}>
                                <Typography
                                    color="text.secondary"
                                    variant="caption"
                                    sx={{ fontWeight: 600, letterSpacing: 0.3 }}
                                >
                                    {tTrans('Instructions')}
                                </Typography>
                            </Grid>
                        </Grid>

                        {program.application_portal_a ? (
                            <Stack spacing={1}>
                                <Chip
                                    color="primary"
                                    icon={<Filter1OutlinedIcon />}
                                    label={t('Application portal A', {
                                        defaultValue: 'Application portal A'
                                    })}
                                    size="small"
                                    sx={{
                                        fontWeight: 600,
                                        width: 'fit-content'
                                    }}
                                    variant="outlined"
                                />
                                <Grid
                                    container
                                    columnSpacing={2}
                                    rowSpacing={2}
                                >
                                    <Grid item {...fieldGridProps}>
                                        <CredentialTextField
                                            color="primary"
                                            id={`${appId}_application_portal_a_account`}
                                            label={tTrans('Account', {
                                                ns: 'common'
                                            })}
                                            onChange={onCredentialFieldChange}
                                            startIcon={
                                                <PersonOutlineIcon
                                                    aria-hidden
                                                    color="action"
                                                    fontSize="small"
                                                />
                                            }
                                            value={credentials.account_portal_a}
                                        />
                                    </Grid>
                                    <Grid item {...fieldGridProps}>
                                        <CredentialTextField
                                            color="primary"
                                            id={`${appId}_application_portal_a_password`}
                                            label={tTrans('Password', {
                                                ns: 'common'
                                            })}
                                            onChange={onCredentialFieldChange}
                                            startIcon={
                                                <LockOutlinedIcon
                                                    aria-hidden
                                                    color="action"
                                                    fontSize="small"
                                                />
                                            }
                                            value={
                                                credentials.password_portal_a
                                            }
                                        />
                                    </Grid>
                                    <Grid item {...fieldGridProps}>
                                        <Box
                                            sx={{
                                                pt: { xs: 0, md: 0.5 },
                                                minHeight: 40,
                                                p: 1.5,
                                                borderRadius: 1,
                                                bgcolor: 'action.hover'
                                            }}
                                        >
                                            <Typography
                                                color="text.secondary"
                                                sx={{
                                                    display: { md: 'none' },
                                                    mb: 0.5
                                                }}
                                                variant="caption"
                                            >
                                                {tTrans('Link', {
                                                    ns: 'common'
                                                })}
                                            </Typography>
                                            <LinkableNewlineText
                                                text={
                                                    program.application_portal_a ??
                                                    ''
                                                }
                                            />
                                        </Box>
                                    </Grid>
                                    <Grid item {...fieldGridProps}>
                                        <Box
                                            sx={{
                                                pt: { xs: 0, md: 0.5 },
                                                minHeight: 40,
                                                p: 1.5,
                                                borderRadius: 1,
                                                bgcolor: 'action.hover'
                                            }}
                                        >
                                            <Typography
                                                color="text.secondary"
                                                sx={{
                                                    display: { md: 'none' },
                                                    mb: 0.5
                                                }}
                                                variant="caption"
                                            >
                                                {tTrans('Instructions')}
                                            </Typography>
                                            <LinkableNewlineText
                                                text={
                                                    program.application_portal_a_instructions ??
                                                    ''
                                                }
                                            />
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Stack>
                        ) : null}

                        {program.application_portal_b ? (
                            <Stack spacing={1}>
                                <Chip
                                    color="secondary"
                                    icon={<Filter2OutlinedIcon />}
                                    label={t('portalCreds.portalB')}
                                    size="small"
                                    sx={{
                                        fontWeight: 600,
                                        width: 'fit-content'
                                    }}
                                    variant="outlined"
                                />
                                <Grid
                                    container
                                    columnSpacing={2}
                                    rowSpacing={2}
                                >
                                    <Grid item {...fieldGridProps}>
                                        <CredentialTextField
                                            color="secondary"
                                            id={`${appId}_application_portal_b_account`}
                                            label={tTrans('Account', {
                                                ns: 'common'
                                            })}
                                            onChange={onCredentialFieldChange}
                                            startIcon={
                                                <PersonOutlineIcon
                                                    aria-hidden
                                                    color="action"
                                                    fontSize="small"
                                                />
                                            }
                                            value={credentials.account_portal_b}
                                        />
                                    </Grid>
                                    <Grid item {...fieldGridProps}>
                                        <CredentialTextField
                                            color="secondary"
                                            id={`${appId}_application_portal_b_password`}
                                            label={tTrans('Password', {
                                                ns: 'common'
                                            })}
                                            onChange={onCredentialFieldChange}
                                            startIcon={
                                                <LockOutlinedIcon
                                                    aria-hidden
                                                    color="action"
                                                    fontSize="small"
                                                />
                                            }
                                            value={
                                                credentials.password_portal_b
                                            }
                                        />
                                    </Grid>
                                    <Grid item {...fieldGridProps}>
                                        <Box
                                            sx={{
                                                pt: { xs: 0, md: 0.5 },
                                                minHeight: 40,
                                                p: 1.5,
                                                borderRadius: 1,
                                                bgcolor: 'action.hover'
                                            }}
                                        >
                                            <Typography
                                                color="text.secondary"
                                                sx={{
                                                    display: { md: 'none' },
                                                    mb: 0.5
                                                }}
                                                variant="caption"
                                            >
                                                {tTrans('Link', {
                                                    ns: 'common'
                                                })}
                                            </Typography>
                                            <LinkableNewlineText
                                                text={
                                                    program.application_portal_b ??
                                                    ''
                                                }
                                            />
                                        </Box>
                                    </Grid>
                                    <Grid item {...fieldGridProps}>
                                        <Box
                                            sx={{
                                                pt: { xs: 0, md: 0.5 },
                                                minHeight: 40,
                                                p: 1.5,
                                                borderRadius: 1,
                                                bgcolor: 'action.hover'
                                            }}
                                        >
                                            <Typography
                                                color="text.secondary"
                                                sx={{
                                                    display: { md: 'none' },
                                                    mb: 0.5
                                                }}
                                                variant="caption"
                                            >
                                                {tTrans('Instructions')}
                                            </Typography>
                                            <LinkableNewlineText
                                                text={
                                                    program.application_portal_b_instructions ??
                                                    ''
                                                }
                                            />
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Stack>
                        ) : null}
                    </>
                ) : null}
            </Stack>
        </Paper>
    );
}
