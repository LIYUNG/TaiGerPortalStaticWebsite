import { useEffect, useLayoutEffect, useRef } from 'react';
import type { RefObject } from 'react';

// How close to the top (px) the reader must scroll before the previous page of
// older messages is loaded.
const TOP_LOAD_THRESHOLD_PX = 80;
// How close to the bottom (px) still counts as "at the bottom" — within this the
// pane stays glued to the newest message as it grows.
const NEAR_BOTTOM_PX = 120;
// Re-pin to the bottom at these delays (ms) after the thread changes, so late
// content that grows the pane (EditorJS initialising, images loading) can't
// leave the initial scroll short of the bottom.
const SETTLE_DELAYS_MS = [60, 180, 400];

// Scroll mutations live in module-scope helpers so the element is a plain
// parameter rather than a value reached through a hook argument.
const pinToBottom = (el: HTMLDivElement) => {
    el.scrollTop = el.scrollHeight;
};

// Restore the offset after older messages prepend so the reader's viewport
// stays on the same message (no upward jump).
const restoreScrollOffset = (
    el: HTMLDivElement,
    prevScrollTop: number,
    prevScrollHeight: number
) => {
    el.scrollTop = prevScrollTop + (el.scrollHeight - prevScrollHeight);
};

const distanceFromBottom = (el: HTMLDivElement) =>
    el.scrollHeight - el.scrollTop - el.clientHeight;

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
    // Pane scroll position captured just before older messages prepend, used to
    // restore the reader's position afterwards.
    const prevScrollHeightRef = useRef(0);
    const prevScrollTopRef = useRef(0);
    // Whether the pane should stay glued to the bottom as it grows; cleared once
    // the reader scrolls up, re-armed when they return to the bottom.
    const stickToBottomRef = useRef(true);
    // Last observed scrollTop, used to detect the scroll *direction* so we only
    // load older messages on a genuine upward scroll — never from the initial
    // pin-to-bottom or the position restore after a load (which would otherwise
    // trigger spurious back-to-back loads).
    const lastScrollTopRef = useRef(0);

    // Pin to the newest message on load and whenever a new message arrives,
    // re-pinning briefly afterwards so async content growth can't leave us short.
    useEffect(() => {
        const el = scrollRef?.current;
        if (!el) {
            return;
        }
        stickToBottomRef.current = true;
        pinToBottom(el);
        const timers = SETTLE_DELAYS_MS.map((delay) =>
            window.setTimeout(() => {
                const node = scrollRef?.current;
                if (node && stickToBottomRef.current) {
                    pinToBottom(node);
                }
            }, delay)
        );
        return () => timers.forEach((id) => window.clearTimeout(id));
    }, [scrollRef, threadLength]);

    // After older messages prepend, restore the offset so the message the reader
    // was looking at stays put (runs before paint to avoid a visible jump).
    useLayoutEffect(() => {
        const el = scrollRef?.current;
        if (el && loadingRef.current) {
            restoreScrollOffset(
                el,
                prevScrollTopRef.current,
                prevScrollHeightRef.current
            );
            loadingRef.current = false;
        }
    }, [scrollRef, upperThreadLength]);

    // Track scroll position: load older messages when the reader scrolls UP to
    // the top, and remember whether they're glued to the bottom.
    useEffect(() => {
        const el = scrollRef?.current;
        if (!el) {
            return;
        }
        lastScrollTopRef.current = el.scrollTop;
        const handleScroll = () => {
            const scrollTop = el.scrollTop;
            const scrolledUp = scrollTop < lastScrollTopRef.current;
            lastScrollTopRef.current = scrollTop;
            stickToBottomRef.current = distanceFromBottom(el) <= NEAR_BOTTOM_PX;
            if (loadingRef.current || !canLoadOlder) {
                return;
            }
            // Only when the pane actually scrolls, the reader is moving up, and
            // they've reached the top — not on programmatic pins/restores.
            const isScrollable = el.scrollHeight - el.clientHeight > 1;
            if (
                isScrollable &&
                scrolledUp &&
                scrollTop <= TOP_LOAD_THRESHOLD_PX
            ) {
                loadingRef.current = true;
                prevScrollHeightRef.current = el.scrollHeight;
                prevScrollTopRef.current = scrollTop;
                loadOlder();
            }
        };
        el.addEventListener('scroll', handleScroll, { passive: true });
        return () => el.removeEventListener('scroll', handleScroll);
    }, [scrollRef, canLoadOlder, loadOlder]);
}

export default useChatScroll;
