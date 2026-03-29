import { useTranslation } from 'react-i18next';
import Filter1OutlinedIcon from '@mui/icons-material/Filter1Outlined';
import Filter2OutlinedIcon from '@mui/icons-material/Filter2Outlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Grid,
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

type PortalCredentialsApplicationBlockProps = {
    program: IProgramWithId;
    appId: string;
    credentials: PortalCredentialFields;
    isChanged: boolean;
    isUpdateLoaded: boolean;
    isSubmittingThisApp: boolean;
    onCredentialFieldChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => void;
    onUpdateClick: () => void;
};

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
    credentials,
    isChanged,
    isUpdateLoaded,
    isSubmittingThisApp,
    onCredentialFieldChange,
    onUpdateClick
}: PortalCredentialsApplicationBlockProps) {
    const { t } = useTranslation();
    const hasAnyPortal = Boolean(
        program.application_portal_a || program.application_portal_b
    );
    const programHref = `/programs/${program._id.toString()}`;
    const programTitle = `${program.school} — ${program.program_name} — ${program.semester} — ${program.degree}`;
    const saveDisabled = !isUpdateLoaded || !isChanged || isSubmittingThisApp;
    const saveTooltip = (() => {
        if (isSubmittingThisApp || !isUpdateLoaded) {
            return t('Saving…', { defaultValue: 'Saving…' });
        }
        if (!isChanged) {
            return t('portalCreds.saveDisabledHint', {
                defaultValue:
                    'Change account or password above, then press Save'
            });
        }
        return t('portalCreds.saveEnabledHint', {
            defaultValue: 'Save these credentials for this program'
        });
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
                                        ? t('Updating')
                                        : t('Update', { ns: 'common' })}
                                </Button>
                            </span>
                        </Tooltip>
                    ) : null}
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
                                {t('Please register and provide credentials')}
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
                                    {t('Account', { ns: 'common' })}
                                </Typography>
                            </Grid>
                            <Grid item {...fieldGridProps}>
                                <Typography
                                    color="text.secondary"
                                    variant="caption"
                                    sx={{ fontWeight: 600, letterSpacing: 0.3 }}
                                >
                                    {t('Password', { ns: 'common' })}
                                </Typography>
                            </Grid>
                            <Grid item {...fieldGridProps}>
                                <Typography
                                    color="text.secondary"
                                    variant="caption"
                                    sx={{ fontWeight: 600, letterSpacing: 0.3 }}
                                >
                                    {t('Link', { ns: 'common' })}
                                </Typography>
                            </Grid>
                            <Grid item {...fieldGridProps}>
                                <Typography
                                    color="text.secondary"
                                    variant="caption"
                                    sx={{ fontWeight: 600, letterSpacing: 0.3 }}
                                >
                                    {t('Instructions')}
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
                                        <TextField
                                            fullWidth
                                            autoComplete="off"
                                            color="primary"
                                            id={`${appId}_application_portal_a_account`}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <PersonOutlineIcon
                                                            aria-hidden
                                                            color="action"
                                                            fontSize="small"
                                                        />
                                                    </InputAdornment>
                                                )
                                            }}
                                            label={t('Account', {
                                                ns: 'common'
                                            })}
                                            margin="dense"
                                            onChange={onCredentialFieldChange}
                                            size="small"
                                            value={credentials.account_portal_a}
                                        />
                                    </Grid>
                                    <Grid item {...fieldGridProps}>
                                        <TextField
                                            fullWidth
                                            autoComplete="off"
                                            color="primary"
                                            id={`${appId}_application_portal_a_password`}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <LockOutlinedIcon
                                                            aria-hidden
                                                            color="action"
                                                            fontSize="small"
                                                        />
                                                    </InputAdornment>
                                                )
                                            }}
                                            label={t('Password', {
                                                ns: 'common'
                                            })}
                                            margin="dense"
                                            onChange={onCredentialFieldChange}
                                            size="small"
                                            type="text"
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
                                                {t('Link', { ns: 'common' })}
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
                                                {t('Instructions')}
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
                                    label={t('Application portal B', {
                                        defaultValue: 'Application portal B'
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
                                        <TextField
                                            fullWidth
                                            autoComplete="off"
                                            color="secondary"
                                            id={`${appId}_application_portal_b_account`}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <PersonOutlineIcon
                                                            aria-hidden
                                                            color="action"
                                                            fontSize="small"
                                                        />
                                                    </InputAdornment>
                                                )
                                            }}
                                            label={t('Account', {
                                                ns: 'common'
                                            })}
                                            margin="dense"
                                            onChange={onCredentialFieldChange}
                                            size="small"
                                            value={credentials.account_portal_b}
                                        />
                                    </Grid>
                                    <Grid item {...fieldGridProps}>
                                        <TextField
                                            fullWidth
                                            autoComplete="off"
                                            color="secondary"
                                            id={`${appId}_application_portal_b_password`}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <LockOutlinedIcon
                                                            aria-hidden
                                                            color="action"
                                                            fontSize="small"
                                                        />
                                                    </InputAdornment>
                                                )
                                            }}
                                            label={t('Password', {
                                                ns: 'common'
                                            })}
                                            margin="dense"
                                            onChange={onCredentialFieldChange}
                                            size="small"
                                            type="text"
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
                                                {t('Link', { ns: 'common' })}
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
                                                {t('Instructions')}
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
