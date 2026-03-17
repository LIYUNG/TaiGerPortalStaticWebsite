import { useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type {
    ConfirmDialogVariant,
    RequireTypedConfirmOptions
} from './ConfirmDialog';

export interface ConfirmDialogConfig {
    title: ReactNode;
    content: ReactNode;
    variant?: ConfirmDialogVariant;
    confirmLabel?: ReactNode;
    cancelLabel?: ReactNode;
    onConfirm?: () => void;
    confirmDisabled?: boolean;
    requireTypedConfirm?: RequireTypedConfirmOptions;
}

const defaultConfig: ConfirmDialogConfig = {
    title: '',
    content: ''
};

export interface UseConfirmDialogReturn {
    open: boolean;
    openDialog: (config: ConfirmDialogConfig) => void;
    closeDialog: () => void;
    dialogConfig: ConfirmDialogConfig;
}

/**
 * Hook for a reusable confirm/alert dialog. Open with openDialog(config);
 * close with closeDialog() (e.g. from onClose or after onConfirm).
 * Render <ConfirmDialog open={open} onClose={closeDialog} {...dialogConfig} />
 * and pass confirmDisabled from outside if it changes (e.g. mutation isPending).
 */
export function useConfirmDialog(): UseConfirmDialogReturn {
    const [open, setOpen] = useState(false);
    const [dialogConfig, setDialogConfig] = useState<ConfirmDialogConfig>(defaultConfig);

    const openDialog = useCallback((config: ConfirmDialogConfig) => {
        setDialogConfig(config);
        setOpen(true);
    }, []);

    const closeDialog = useCallback(() => {
        setOpen(false);
    }, []);

    return {
        open,
        openDialog,
        closeDialog,
        dialogConfig
    };
}
