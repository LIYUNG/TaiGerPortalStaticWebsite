import React, { useState, useRef } from 'react';
import { Button, Tooltip } from '@mui/material';

const OverlayButton = ({ text, children, startIcon, variant = 'outlined' }) => {
    const [show, setShow] = useState(false);
    const target = useRef(null);
    return (
        <Tooltip title={text}>
            <Button
                onClick={() => setShow(!show)}
                ref={target}
                startIcon={startIcon}
                variant={variant}
            >
                {children}
            </Button>
        </Tooltip>
    );
};

export default OverlayButton;
