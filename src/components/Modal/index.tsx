import React from 'react';
import { Box, Modal } from '@mui/material';

interface ModalNewProps {
    open: boolean;
    onClose: () => void;
    children: React.ReactNode;
    width?: string;
    height?: string;
}

export default function ModalNew(props: ModalNewProps): JSX.Element {
    return (
        <Modal
            aria-labelledby="contained-modal-title-vcenter"
            onClose={props.onClose}
            open={props.open}
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '5px'
            }}
        >
            <Box
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: props.width || '60%',
                    maxWidth: '80%',
                    maxHeight: props.height || '80vh',
                    overflow: 'auto',
                    bgcolor: 'background.paper',
                    boxShadow: 24,
                    p: 4
                }}
            >
                {props.children}
            </Box>
        </Modal>
    );
}
