import React, { useState } from 'react';
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
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useTranslation } from 'react-i18next';
import {
    calculateApplicationLockStatus,
    APPROVAL_COUNTRIES
} from '../../Demo/Utils/checking-functions';
import { refreshApplication } from '../../api';
import { is_TaiGer_role } from '@taiger-common/core';
import { useAuth } from '../AuthProvider';
import { useSnackBar } from '../../contexts/use-snack-bar';
import DEMO from '../../store/constant';

const ApplicationLockControl = ({ application }) => {
    const { user } = useAuth();
    const { t } = useTranslation();
    const { setMessage, setSeverity, setOpenSnackbar } = useSnackBar();
    const [openDialog, setOpenDialog] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    if (!application || !application.programId) {
        return null;
    }

    // For approval countries: use program-level lock status (check program staleness)
    // For non-approval countries: use application-level lock status (check program staleness + application.isLocked)
    // Always use calculateApplicationLockStatus for consistency - it handles both cases correctly
    const program = application.programId;
    const countryCode = program?.country
        ? String(program.country).toLowerCase()
        : null;
    const isInApprovalCountry = countryCode
        ? APPROVAL_COUNTRIES.includes(countryCode)
        : false;

    // Always use calculateApplicationLockStatus - it correctly handles approval countries
    // by checking program staleness and returning unlocked if not stale
    const lockStatus = calculateApplicationLockStatus(application);
    const isLocked = lockStatus.isLocked;

    const getLockReasonText = () => {
        switch (lockStatus.reason) {
            case 'NON_APPROVAL_COUNTRY':
                return t('Non-approval country. Unlock to modify documents.', {
                    ns: 'common'
                });
            case 'STALE_DATA':
                return t(
                    'Stale data (≥6 months old). Program must be refreshed first.',
                    { ns: 'common' }
                );
            default:
                return t('Application is locked', { ns: 'common' });
        }
    };

    const handleUnlock = async () => {
        setIsLoading(true);
        try {
            // For non-approval countries: set application isLocked to false
            // Note: Approval countries use program-level locking, so unlock button shouldn't show
            const response = await refreshApplication(application._id);
            // postData returns response.data, so check response.success directly
            if (response?.success) {
                // Close dialog first
                setOpenDialog(false);

                // Refresh the browser automatically
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
                error.message ||
                    t('An error occurred. Please try again.', { ns: 'common' })
            );
            setOpenSnackbar(true);
        } finally {
            setIsLoading(false);
        }
    };

    // Calculate program link first
    const programId = program?._id?.toString() || program?._id;
    const programLink = programId ? DEMO.SINGLE_PROGRAM_LINK(programId) : null;

    // Show "Check Program" button:
    // - For approval countries: always show when locked
    // - For non-approval countries: always show when locked
    const shouldShowCheckProgramButton = isLocked && programLink;

    // Show unlock button for non-approval countries:
    // - Always show when locked (regardless of application.isLocked value)
    // - Only for non-approval countries
    // - User has permission
    // Note: For non-approval countries, both "Check Program" and "Unlock Application" buttons can be visible
    const shouldShowUnlockButton =
        !isInApprovalCountry && isLocked && is_TaiGer_role(user);

    // Disable unlock button when program is stale (STALE_DATA)
    // User must check/unlock the program first
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
                            ? t('Please check the program to unlock first', {
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
                <Tooltip title={t('Check program', { ns: 'common' })}>
                    <IconButton
                        color="primary"
                        component="a"
                        data-testid="check-program-button"
                        href={programLink}
                        size="small"
                        target="_blank"
                    >
                        <VisibilityIcon fontSize="small" />
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
