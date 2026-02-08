import { useState } from 'react';

export interface UseDialogReturn {
    open: boolean;
    setOpen: (open: boolean) => void;
    title: string;
    setTitle: (title: string) => void;
    content: string;
    setContent: (content: string) => void;
    onConfirm: (() => void) | null;
    setOnConfirm: (fn: (() => void) | null) => void;
    onCancel: (() => void) | null;
    setOnCancel: (fn: (() => void) | null) => void;
}

export const useDialog = (initialOpen = false): UseDialogReturn => {
    const [open, setOpen] = useState(initialOpen);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [onConfirm, setOnConfirm] = useState<(() => void) | null>(null);
    const [onCancel, setOnCancel] = useState<(() => void) | null>(null);
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
