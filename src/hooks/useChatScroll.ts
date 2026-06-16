import { useEffect, useLayoutEffect, useRef } from 'react';
import type { RefObject } from 'react';

// How close to the top (px) the reader must scroll before the previous page of
// older messages is loaded.
const TOP_LOAD_THRESHOLD_PX = 80;

// Scroll mutations live in module-scope helpers so the element is a plain
// parameter rather than a value reached through a hook argument.
const pinToBottom = (el: HTMLDivElement) => {
    el.scrollTop = el.scrollHeight;
};

const restoreScrollOffset = (el: HTMLDivElement, prevScrollHeight: number) => {
    el.scrollTop = el.scrollHeight - prevScrollHeight;
};

interface UseChatScrollOptions {
    // The scrollable message pane.
    scrollRef: RefObject<HTMLDivElement | null>;
    // Size of the live thread. Growing it (initial load + sending a message)
    // pins the pane to the newest message.
    threadLength: number;
    // Size of the older-messages list prepended above. Growing it keeps the
    // reader's position instead of jumping upward.
    upperThreadLength: number;
    // Loads the previous page of older messages — invoked when the reader
    // reaches the top.
    loadOlder: () => void;
    // Whether older messages can be loaded right now (false while a load is in
    // flight, when none remain, or when another mode owns the scroll).
    canLoadOlder: boolean;
}

// Chat-style scroll behaviour shared by the communication pages: open pinned to
// the newest message, and lazily load older messages when the reader scrolls to
// the top (preserving their position so the view doesn't jump).
function useChatScroll({
    scrollRef,
    threadLength,
    upperThreadLength,
    loadOlder,
    canLoadOlder
}: UseChatScrollOptions): void {
    // True while a "load older" request is in flight — blocks re-entry within a
    // single scroll burst, before `canLoadOlder` has re-rendered.
    const loadingRef = useRef(false);
    // Pane scrollHeight captured just before older messages prepend, used to
    // restore the reader's position afterwards.
    const prevScrollHeightRef = useRef(0);

    // Pin to the newest message on load and whenever a new message arrives.
    useEffect(() => {
        const el = scrollRef?.current;
        if (el) {
            pinToBottom(el);
        }
    }, [scrollRef, threadLength]);

    // After older messages prepend, restore the offset so the message the reader
    // was looking at stays put (runs before paint to avoid a visible jump).
    useLayoutEffect(() => {
        const el = scrollRef?.current;
        if (el && loadingRef.current) {
            restoreScrollOffset(el, prevScrollHeightRef.current);
            loadingRef.current = false;
        }
    }, [scrollRef, upperThreadLength]);

    // Auto-load the previous page when the reader scrolls to the top.
    useEffect(() => {
        const el = scrollRef?.current;
        if (!el) {
            return;
        }
        const handleScroll = () => {
            if (loadingRef.current || !canLoadOlder) {
                return;
            }
            if (el.scrollTop <= TOP_LOAD_THRESHOLD_PX) {
                loadingRef.current = true;
                prevScrollHeightRef.current = el.scrollHeight;
                loadOlder();
            }
        };
        el.addEventListener('scroll', handleScroll, { passive: true });
        return () => el.removeEventListener('scroll', handleScroll);
    }, [scrollRef, canLoadOlder, loadOlder]);
}

export default useChatScroll;
