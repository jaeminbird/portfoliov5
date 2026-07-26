'use client';

import { useSyncExternalStore } from 'react';
import { BREAKPOINTS } from '@/lib/constants';

/**
 * Reactive breakpoint state, backed by `matchMedia`.
 *
 * Previously this polled `window.innerWidth` from a `resize` listener, which
 * fired on every pixel of a drag and returned a fresh object each time — so
 * all five consumers re-rendered continuously even though their booleans only
 * flip at a threshold. `matchMedia` notifies only on actual crossings, and a
 * single module-level store serves every consumer from one subscription.
 *
 * Queries use media range syntax (`width < 768px`) rather than `max-width:
 * 767.98px`, so they express the same comparison the old JS did — exactly,
 * including at fractional widths from browser zoom.
 *
 * @example
 * ```ts
 * const { isMobile, isLg } = useBreakpoint();
 * ```
 */
export interface BreakpointState {
    /** True when `width < BREAKPOINTS.xs` (480px). */
    isXs: boolean;
    /** True when `width < BREAKPOINTS.md` (768px). */
    isMobile: boolean;
    /** True when `width >= BREAKPOINTS.sm` (640px). */
    isSm: boolean;
    /** True when `width >= BREAKPOINTS.md` (768px). */
    isMd: boolean;
    /** True when `width >= BREAKPOINTS.lg` (1024px). */
    isLg: boolean;
    /** True when `width >= BREAKPOINTS.lg` AND `width < BREAKPOINTS.xl`. */
    isLgOnly: boolean;
    /** True when `width >= BREAKPOINTS.xl` (1280px). */
    isXl: boolean;
}

const QUERIES: Record<keyof BreakpointState, string> = {
    isXs: `(width < ${BREAKPOINTS.xs}px)`,
    isMobile: `(width < ${BREAKPOINTS.md}px)`,
    isSm: `(width >= ${BREAKPOINTS.sm}px)`,
    isMd: `(width >= ${BREAKPOINTS.md}px)`,
    isLg: `(width >= ${BREAKPOINTS.lg}px)`,
    isLgOnly: `(${BREAKPOINTS.lg}px <= width < ${BREAKPOINTS.xl}px)`,
    isXl: `(width >= ${BREAKPOINTS.xl}px)`,
};

const KEYS = Object.keys(QUERIES) as (keyof BreakpointState)[];

/**
 * Used for BOTH the server render and the client's first render pass, so the
 * hydrated HTML always matches. Describes a >= xl desktop, which is the same
 * layout the previous implementation emitted — but unlike the old default
 * (which claimed width 1024 while also setting `isXl: true` and
 * `isLgOnly: false`) every flag here is mutually consistent.
 */
const SSR_DEFAULT: BreakpointState = {
    isXs: false,
    isMobile: false,
    isSm: true,
    isMd: true,
    isLg: true,
    isLgOnly: false,
    isXl: true,
};

let snapshot: BreakpointState = SSR_DEFAULT;
let lists: MediaQueryList[] | null = null;

/**
 * Every consuming component, so a single media-query change can notify all of
 * them. Each subscriber must NOT own its own change handler: `refresh()`
 * reports whether it mutated the snapshot, so the first handler to run would
 * consume the change and leave the rest believing nothing had happened.
 */
const listeners = new Set<() => void>();

function read(): BreakpointState {
    const next = {} as BreakpointState;
    const source = lists;
    KEYS.forEach((key, i) => {
        next[key] = source ? source[i].matches : window.matchMedia(QUERIES[key]).matches;
    });
    return next;
}

/**
 * Replaces the snapshot only when a flag actually changed, so its identity stays
 * stable and `useSyncExternalStore` can bail out of the re-render.
 */
function refresh(): boolean {
    const next = read();
    if (KEYS.every((key) => next[key] === snapshot[key])) return false;
    snapshot = next;
    return true;
}

function broadcast() {
    if (!refresh()) return;
    for (const listener of listeners) listener();
}

function subscribe(onStoreChange: () => void): () => void {
    // The first subscriber lazily creates the MediaQueryLists and attaches the
    // one shared handler.
    if (!lists) {
        lists = KEYS.map((key) => window.matchMedia(QUERIES[key]));
        for (const list of lists) list.addEventListener('change', broadcast);
        refresh();
    }

    listeners.add(onStoreChange);

    // Cover any change between the render that produced the snapshot and this
    // subscription — including the initial move off the SSR default.
    broadcast();

    return () => {
        listeners.delete(onStoreChange);

        if (listeners.size === 0 && lists) {
            for (const list of lists) list.removeEventListener('change', broadcast);
            lists = null;
        }
    };
}

const getSnapshot = () => snapshot;
const getServerSnapshot = () => SSR_DEFAULT;

export function useBreakpoint(): BreakpointState {
    return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
