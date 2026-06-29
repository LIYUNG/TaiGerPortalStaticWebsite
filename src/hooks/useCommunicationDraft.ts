import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { OutputData } from '@editorjs/editorjs';

import { getCommunicationDraftQuery } from '@/api/query';
import {
    saveCommunicationDraft,
    saveCommunicationDraftAiSuggestion,
    deleteCommunicationDraft,
    uploadCommunicationDraftFiles,
    deleteCommunicationDraftFile,
    type CommunicationDraftResponse,
    type CommunicationDraftFile
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
    /** Provenance of the saved draft ('ai' once an AI reply was inserted). */
    draftSource?: 'human' | 'ai';
    /** A generated-but-not-yet-approved AI reply (raw markdown), or '' if none. */
    pendingSuggestion: string;
    /** Persist a generated-but-unapproved AI suggestion so it survives reload. */
    savePendingSuggestion: (
        suggestion: string,
        aiModel?: string
    ) => Promise<void>;
    /** Clear the persisted pending AI suggestion. */
    clearPendingSuggestion: () => Promise<void>;
    /** Persist the given content as an AI-sourced draft (immediate, not debounced). */
    saveAiDraft: (content: OutputData, aiModel?: string) => Promise<void>;
    /** Attachments staged on the draft (upload-on-attach). */
    draftFiles: CommunicationDraftFile[];
    /** True while an attach upload is in flight. */
    isAttaching: boolean;
    /** True once the draft query has resolved. */
    isDraftLoaded: boolean;
    status: DraftStatus;
    /** Debounced autosave; empty content deletes the draft server-side. */
    saveDraft: (content: OutputData) => void;
    /** Discard the draft + its staged S3 files (explicit discard). */
    clearDraft: () => void;
    /** Upload files to the draft (attach); returns the created file refs. */
    attachFiles: (
        files: FileList | File[]
    ) => Promise<CommunicationDraftFile[]>;
    /** Delete one staged file from S3 + the draft (unattach). */
    removeFile: (path: string) => Promise<void>;
    /** Refetch the draft (e.g. after send, which consumes it server-side). */
    invalidateDraft: () => void;
    /** Optimistically clear the cached draft (text + files) without a request. */
    resetDraftCache: () => void;
}

/**
 * Server-side, per-(user, student) message draft for the communication chat —
 * loads the saved draft, autosaves on type (debounced), and clears on send.
 */
const useCommunicationDraft = (
    studentId?: string
): UseCommunicationDraftResult => {
    const queryClient = useQueryClient();
    const { data, isSuccess } = useQuery(
        getCommunicationDraftQuery(studentId ?? '')
    );
    const [status, setStatus] = useState<DraftStatus>('idle');
    const [isAttaching, setIsAttaching] = useState(false);
    const timerRef = useRef<number | null>(null);
    // Normalized message queued for persistence ('' means delete); null = none.
    const pendingRef = useRef<string | null>(null);

    const draftQueryKey = useMemo(
        () => ['communications', studentId ?? '', 'draft'] as const,
        [studentId]
    );
    const draftFiles = useMemo<CommunicationDraftFile[]>(
        () =>
            (data as CommunicationDraftResponse | undefined)?.data?.files ?? [],
        [data]
    );

    const draftSource = (data as CommunicationDraftResponse | undefined)?.data
        ?.source;

    const pendingSuggestion =
        (data as CommunicationDraftResponse | undefined)?.data
            ?.aiPendingSuggestion ?? '';

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
            // Always PUT (even for empty text): the backend keeps the draft if it
            // still has attachments and only deletes a truly-empty one. Crucially,
            // seed the query cache with the saved result so a remount (e.g.
            // reopening a mobile Drawer) restores the latest draft instead of the
            // pre-typing cached value — the query's staleTime would otherwise
            // skip the refetch and serve the stale empty draft.
            const res = await saveCommunicationDraft(studentId, message);
            queryClient.setQueryData(draftQueryKey, res);
            setStatus('saved');
        } catch {
            setStatus('error');
        }
    }, [studentId, queryClient, draftQueryKey]);

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

    // Persist an AI-generated reply as the draft, immediately (no debounce) and
    // stamped with source: 'ai' so it survives reload and can be audited on
    // send. Seeds the query cache with the saved result.
    const saveAiDraft = useCallback(
        async (content: OutputData, aiModel?: string) => {
            if (!studentId) return;
            if (timerRef.current) {
                window.clearTimeout(timerRef.current);
                timerRef.current = null;
            }
            pendingRef.current = null;
            setStatus('saving');
            try {
                const res = await saveCommunicationDraft(
                    studentId,
                    JSON.stringify(content),
                    { source: 'ai', aiModel }
                );
                // The axios instance resolves 4xx (validateStatus < 500), so a
                // failed save would otherwise look like success and the draft
                // would silently vanish on reload. Verify and surface it.
                if (!(res as CommunicationDraftResponse | undefined)?.success) {
                    throw new Error('Draft was not saved.');
                }
                queryClient.setQueryData(draftQueryKey, res);
                setStatus('saved');
            } catch (error) {
                setStatus('error');
                throw error;
            }
        },
        [studentId, queryClient, draftQueryKey]
    );

    // Persist a generated-but-unapproved AI suggestion (immediate). Seeds the
    // query cache so the suggestion panel survives reload. Does not touch the
    // editable draft message.
    const savePendingSuggestion = useCallback(
        async (suggestion: string, aiModel?: string) => {
            if (!studentId) return;
            const res = await saveCommunicationDraftAiSuggestion(
                studentId,
                suggestion,
                aiModel
            );
            if (!(res as CommunicationDraftResponse | undefined)?.success) {
                throw new Error('Suggestion was not saved.');
            }
            queryClient.setQueryData(draftQueryKey, res);
        },
        [studentId, queryClient, draftQueryKey]
    );

    const clearPendingSuggestion = useCallback(
        () => savePendingSuggestion(''),
        [savePendingSuggestion]
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

    // Refetch the draft without deleting anything — used after send (the server
    // already consumed the draft) and after attach/unattach.
    const invalidateDraft = useCallback(() => {
        if (timerRef.current) {
            window.clearTimeout(timerRef.current);
            timerRef.current = null;
        }
        pendingRef.current = null;
        void queryClient.invalidateQueries({ queryKey: draftQueryKey });
        setStatus('idle');
    }, [queryClient, draftQueryKey]);

    // Optimistic clear: set the cached draft to empty so the composer's
    // attachment list disappears immediately on send (the background refetch
    // confirms). On a failed send the caller refetches to bring it back.
    const resetDraftCache = useCallback(() => {
        if (timerRef.current) {
            window.clearTimeout(timerRef.current);
            timerRef.current = null;
        }
        pendingRef.current = null;
        queryClient.setQueryData(draftQueryKey, {
            success: true,
            data: null
        });
        setStatus('idle');
    }, [queryClient, draftQueryKey]);

    const attachFiles = useCallback(
        async (files: FileList | File[]): Promise<CommunicationDraftFile[]> => {
            if (!studentId) return [];
            const list = Array.from(files);
            if (list.length === 0) return [];
            const formData = new FormData();
            list.forEach((file) => formData.append('files', file));
            setIsAttaching(true);
            try {
                const res = await uploadCommunicationDraftFiles(
                    studentId,
                    formData
                );
                // The axios instance resolves 4xx (validateStatus < 500), so a
                // 404/400 would otherwise look like a silent no-op — surface it.
                const body = res?.data as
                    | { success?: boolean; message?: string; data?: unknown }
                    | undefined;
                if (!body?.success) {
                    throw new Error(body?.message ?? 'Failed to attach file.');
                }
                await queryClient.invalidateQueries({
                    queryKey: draftQueryKey
                });
                return res?.data?.data?.files ?? [];
            } finally {
                setIsAttaching(false);
            }
        },
        [studentId, queryClient, draftQueryKey]
    );

    const removeFile = useCallback(
        async (path: string) => {
            if (!studentId) return;
            const res = await deleteCommunicationDraftFile(studentId, path);
            const body = res?.data as
                | { success?: boolean; message?: string }
                | undefined;
            if (!body?.success) {
                throw new Error(body?.message ?? 'Failed to remove file.');
            }
            await queryClient.invalidateQueries({ queryKey: draftQueryKey });
        },
        [studentId, queryClient, draftQueryKey]
    );

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

    return {
        draft,
        draftSource,
        pendingSuggestion,
        savePendingSuggestion,
        clearPendingSuggestion,
        saveAiDraft,
        draftFiles,
        isAttaching,
        isDraftLoaded: isSuccess,
        status,
        saveDraft,
        clearDraft,
        attachFiles,
        removeFile,
        invalidateDraft,
        resetDraftCache
    };
};

export default useCommunicationDraft;
