import { useState } from 'react';

export const useDialog = (initialOpen = false) => {
    const [open, setOpen] = useState(initialOpen);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [onConfirm, setOnConfirm] = useState(null);
    const [onCancel, setOnCancel] = useState(null);
    return {
        open,
        setOpen,
        title,
        setTitle,
        content,
        setContent,
        onConfirm,
        setOnConfirm,
        onCancel,
        setOnCancel
    };
};
