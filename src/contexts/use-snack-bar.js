import React, { createContext, useContext, useState } from 'react';
import { Alert, Snackbar } from '@mui/material';

const SnackBarContext = createContext();

export const SnackBarProvider = ({ children }) => {
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [severity, setSeverity] = useState('success'); // 'success' or 'error'
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

export const useSnackBar = () => {
    return useContext(SnackBarContext);
};
