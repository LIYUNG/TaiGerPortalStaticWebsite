import { createContext, useContext, useState, type ReactNode } from 'react';
import { Alert, AlertColor, Snackbar } from '@mui/material';

export interface SnackBarContextValue {
    setOpenSnackbar: (open: boolean) => void;
    setSeverity: (severity: AlertColor) => void;
    setMessage: (message: string) => void;
}

const SnackBarContext = createContext<SnackBarContextValue | undefined>(
    undefined
);

interface SnackBarProviderProps {
    children: ReactNode;
}

export const SnackBarProvider = ({
    children
}: SnackBarProviderProps): JSX.Element => {
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [severity, setSeverity] = useState<AlertColor>('success');
    const [message, setMessage] = useState('');

    return (
        <SnackBarContext.Provider
            value={{
                setOpenSnackbar,
                setSeverity,
                setMessage
            }}
        >
            <Snackbar
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                autoHideDuration={6000}
                onClose={() => setOpenSnackbar(false)}
                open={openSnackbar}
            >
                <Alert
                    onClose={() => setOpenSnackbar(false)}
                    severity={severity}
                    sx={{ width: '100%', border: '1px solid #000' }}
                    variant="standard"
                >
                    {message}
                </Alert>
            </Snackbar>
            {children}
        </SnackBarContext.Provider>
    );
};

export const useSnackBar = (): SnackBarContextValue => {
    const context = useContext(SnackBarContext);
    if (context === undefined) {
        throw new Error('useSnackBar must be used within a SnackBarProvider');
    }
    return context;
};
