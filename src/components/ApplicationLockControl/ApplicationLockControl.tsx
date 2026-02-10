import { useState } from 'react';
import {
    IconButton,
    Tooltip,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import { useTranslation } from 'react-i18next';
import {
    calculateApplicationLockStatus,
    APPROVAL_COUNTRIES
} from '../../pages/Utils/util_functions';
import { refreshApplication } from '@api';
import {
    is_TaiGer_Admin,
    is_TaiGer_Agent,
    type UserProps
} from '@taiger-common/core';
import { useAuth } from '../AuthProvider';
import { useSnackBar } from '../../contexts/use-snack-bar';
import DEMO from '../../store/constant';
import { type IApplication, type IProgram } from '@taiger-common/model';
import { ApplicationId, ProgramId } from '@api/types';

interface ApplicationLockControlProps {
    application: IApplication;
}

const ApplicationLockControl = ({
    application
}: ApplicationLockControlProps): JSX.Element | null => {
    const { user } = useAuth();
    const { t } = useTranslation();
    const { setMessage, setSeverity, setOpenSnackbar } = useSnackBar();
    const [openDialog, setOpenDialog] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    if (!application || !application.programId) {
        return null;
    }

    const program = application.programId as unknown as IProgram;
    const countryCode = program?.country
        ? String(program.country).toLowerCase()
        : null;
    const isInApprovalCountry = countryCode
        ? APPROVAL_COUNTRIES.includes(countryCode)
        : false;

    const lockStatus = calculateApplicationLockStatus(application);
    const isLocked = lockStatus.isLocked;

    const getLockReasonText = (): string => {
        switch (lockStatus.reason) {
            case 'NON_APPROVAL_COUNTRY':
                return t('Non-approval country. Unlock to modify documents.', {
                    ns: 'common'
                });
            case 'STALE_DATA':
                return t(
                    'Program data is outdated (≥6 months old). Please verify program requirements are up to date.',
                    { ns: 'common' }
                );
            default:
                return t('Application is locked', { ns: 'common' });
        }
    };

    const handleUnlock = async (): Promise<void> => {
        setIsLoading(true);
        try {
            const response = await refreshApplication(
                application._id as ApplicationId
            );
            if (response?.success) {
                setOpenDialog(false);
                window.location.reload();
            } else {
                console.error(
                    '[ApplicationLockControl] Unlock failed - response:',
                    response
                );
                setSeverity('error');
                setMessage(
                    t('Failed to unlock application. Please try again.', {
                        ns: 'common'
                    })
                );
                setOpenSnackbar(true);
            }
        } catch (error) {
            console.error('[ApplicationLockControl] Failed to unlock:', error);
            setSeverity('error');
            setMessage(
                (error as Error).message ||
                    t('An error occurred. Please try again.', { ns: 'common' })
            );
            setOpenSnackbar(true);
        } finally {
            setIsLoading(false);
        }
    };

    const programId = program?._id?.toString?.() ?? (program?._id as ProgramId);
    const programLink = programId ? DEMO.SINGLE_PROGRAM_LINK(programId) : null;

    const canUseLockControls =
        user != null &&
        (is_TaiGer_Admin(user as UserProps) ||
            is_TaiGer_Agent(user as UserProps));

    const shouldShowCheckProgramButton =
        isLocked && programLink && canUseLockControls;

    const shouldShowUnlockButton =
        !isInApprovalCountry && isLocked && canUseLockControls;

    const isUnlockButtonDisabled = lockStatus.reason === 'STALE_DATA';

    return (
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
            <Tooltip
                title={
                    isLocked
                        ? getLockReasonText()
                        : t('Application is unlocked', { ns: 'common' })
                }
            >
                <Chip
                    color={isLocked ? 'warning' : 'default'}
                    icon={isLocked ? <LockOutlinedIcon /> : <LockOpenIcon />}
                    label={
                        isLocked
                            ? t('Locked', { ns: 'common' })
                            : t('Unlocked', { ns: 'common' })
                    }
                    size="small"
                    variant={isLocked ? 'filled' : 'outlined'}
                />
            </Tooltip>

            {shouldShowUnlockButton && (
                <Tooltip
                    title={
                        isUnlockButtonDisabled
                            ? t('Please verify the program before unlock', {
                                  ns: 'common'
                              })
                            : t('Unlock application', { ns: 'common' })
                    }
                >
                    <span>
                        <IconButton
                            color="primary"
                            data-testid="unlock-application-button"
                            disabled={isUnlockButtonDisabled}
                            onClick={() => {
                                if (!isUnlockButtonDisabled) {
                                    setOpenDialog(true);
                                }
                            }}
                            size="small"
                        >
                            <LockOpenIcon fontSize="small" />
                        </IconButton>
                    </span>
                </Tooltip>
            )}

            {shouldShowCheckProgramButton && programLink && (
                <Tooltip
                    title={t('Verify program requirements are up to date', {
                        ns: 'common'
                    })}
                >
                    <IconButton
                        color="primary"
                        component="a"
                        data-testid="verify-program-button"
                        href={programLink}
                        size="small"
                        target="_blank"
                    >
                        <FactCheckIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            )}

            <Dialog
                onClose={() => {
                    setOpenDialog(false);
                }}
                open={openDialog}
            >
                <DialogTitle>
                    {t('Unlock Application', { ns: 'common' })}
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        {t(
                            'Are you sure you want to unlock this application? This will allow document modifications to proceed.',
                            { ns: 'common' }
                        )}
                    </Typography>
                    <Typography
                        color="text.secondary"
                        sx={{ display: 'block', mt: 1 }}
                        variant="caption"
                    >
                        {t('Reason', { ns: 'common' })}: {getLockReasonText()}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button
                        disabled={isLoading}
                        onClick={() => {
                            setOpenDialog(false);
                        }}
                    >
                        {t('Cancel', { ns: 'common' })}
                    </Button>
                    <Button
                        color="primary"
                        disabled={isLoading}
                        onClick={handleUnlock}
                        variant="contained"
                    >
                        {isLoading
                            ? t('Unlocking...', { ns: 'common' })
                            : t('Unlock', { ns: 'common' })}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ApplicationLockControl;
