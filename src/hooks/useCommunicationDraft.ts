import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { OutputData } from '@editorjs/editorjs';

import { getCommunicationDraftQuery } from '@/api/query';
import {
    saveCommunicationDraft,
    deleteCommunicationDraft,
    type CommunicationDraftResponse
} from '@/api/apis';

export type DraftStatus = 'idle' | 'saving' | 'saved' | 'error';

// Debounce window for autosave-on-type. Long enough that continuous typing
// produces at most ~1 request/sec; short enough to feel "saved as you go".
const DEBOUNCE_MS = 800;

const hasBlocks = (content?: OutputData | null): boolean =>
    Boolean(content?.blocks && content.blocks.length > 0);

export interface UseCommunicationDraftResult {
    /** The saved draft (parsed) for this thread, or null. */
    draft: OutputData | null;
    /** True once the draft query has resolved. */
    isDraftLoaded: boolean;
    status: DraftStatus;
    /** Debounced autosave; empty content deletes the draft server-side. */
    saveDraft: (content: OutputData) => void;
    /** Immediately clear the draft (e.g. after sending). */
    clearDraft: () => void;
}

/**
 * Server-side, per-(user, student) message draft for the communication chat —
 * loads the saved draft, autosaves on type (debounced), and clears on send.
 */
const useCommunicationDraft = (
    studentId?: string
): UseCommunicationDraftResult => {
    const { data, isSuccess } = useQuery(
        getCommunicationDraftQuery(studentId ?? '')
    );
    const [status, setStatus] = useState<DraftStatus>('idle');
    const timerRef = useRef<number | null>(null);
    // Normalized message queued for persistence ('' means delete); null = none.
    const pendingRef = useRef<string | null>(null);

    const draft = useMemo<OutputData | null>(() => {
        const message = (data as CommunicationDraftResponse | undefined)?.data
            ?.message;
        if (!message) return null;
        try {
            const parsed = JSON.parse(message) as OutputData;
            return hasBlocks(parsed) ? parsed : null;
        } catch {
            return null;
        }
    }, [data]);

    const flush = useCallback(async () => {
        if (!studentId || pendingRef.current === null) return;
        const message = pendingRef.current;
        pendingRef.current = null;
        try {
            if (message === '') {
                await deleteCommunicationDraft(studentId);
            } else {
                await saveCommunicationDraft(studentId, message);
            }
            setStatus('saved');
        } catch {
            setStatus('error');
        }
    }, [studentId]);

    const saveDraft = useCallback(
        (content: OutputData) => {
            if (!studentId) return;
            pendingRef.current = hasBlocks(content)
                ? JSON.stringify(content)
                : '';
            if (timerRef.current) window.clearTimeout(timerRef.current);
            setStatus('saving');
            timerRef.current = window.setTimeout(() => {
                timerRef.current = null;
                void flush();
            }, DEBOUNCE_MS);
        },
        [studentId, flush]
    );

    const clearDraft = useCallback(() => {
        if (timerRef.current) {
            window.clearTimeout(timerRef.current);
            timerRef.current = null;
        }
        pendingRef.current = null;
        if (studentId) {
            void deleteCommunicationDraft(studentId).catch(() => undefined);
        }
        setStatus('idle');
    }, [studentId]);

    // Flush a pending save when unmounting / switching threads so the last few
    // keystrokes aren't lost on quick navigation.
    useEffect(
        () => () => {
            if (timerRef.current) {
                window.clearTimeout(timerRef.current);
                timerRef.current = null;
                void flush();
            }
        },
        [flush]
    );

    return { draft, isDraftLoaded: isSuccess, status, saveDraft, clearDraft };
};

export default useCommunicationDraft;
