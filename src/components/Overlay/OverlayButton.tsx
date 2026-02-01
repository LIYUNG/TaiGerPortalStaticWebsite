import { useState, useRef } from 'react';
import LockIcon from '@mui/icons-material/Lock';
import { Button, Tooltip } from '@mui/material';

interface OverlayButtonProps {
    text: string;
}

const OverlayButton = ({ text }: OverlayButtonProps) => {
    const [show, setShow] = useState(false);
    const target = useRef<HTMLButtonElement>(null);
    return (
        <Tooltip title={text}>
            <Button onClick={() => setShow(!show)} ref={target}>
                <LockIcon />
            </Button>
        </Tooltip>
    );
};

export default OverlayButton;
