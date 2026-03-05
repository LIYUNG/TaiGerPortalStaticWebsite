import { useState, useCallback, type MouseEvent } from 'react';

export interface UseSurveyEditableLocalStateReturn {
    baseDocsflagOffcanvas: boolean;
    baseDocsflagOffcanvasButtonDisable: boolean;
    anchorEl: HTMLElement | null;
    openPopover: boolean;
    closeOffcanvasWindow: () => void;
    openOffcanvasWindow: () => void;
    setOffcanvasSaving: (saving: boolean) => void;
    handleClosePopover: () => void;
    handleRowClick: (event: MouseEvent<HTMLElement>) => void;
}

export function useSurveyEditableLocalState(): UseSurveyEditableLocalStateReturn {
    const [baseDocsflagOffcanvas, setBaseDocsflagOffcanvas] = useState(false);
    const [
        baseDocsflagOffcanvasButtonDisable,
        setBaseDocsflagOffcanvasButtonDisable
    ] = useState(false);
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

    const closeOffcanvasWindow = useCallback(() => {
        setBaseDocsflagOffcanvas(false);
    }, []);

    const openOffcanvasWindow = useCallback(() => {
        setBaseDocsflagOffcanvas(true);
    }, []);

    const setOffcanvasSaving = useCallback((saving: boolean) => {
        setBaseDocsflagOffcanvasButtonDisable(saving);
        if (!saving) setBaseDocsflagOffcanvas(false);
    }, []);

    const handleClosePopover = useCallback(() => {
        setAnchorEl(null);
    }, []);

    const handleRowClick = useCallback((event: MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    }, []);

    return {
        baseDocsflagOffcanvas,
        baseDocsflagOffcanvasButtonDisable,
        anchorEl,
        openPopover: Boolean(anchorEl),
        closeOffcanvasWindow,
        openOffcanvasWindow,
        setOffcanvasSaving,
        handleClosePopover,
        handleRowClick
    };
}
