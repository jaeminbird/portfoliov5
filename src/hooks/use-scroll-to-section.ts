'use client';

import { useCallback } from 'react';

/**
 * Returns a memoized function that smoothly scrolls to a DOM element by `id`.
 *
 * Replaces three near-identical implementations that existed in `page.tsx`,
 * `nav.tsx`, and `article.tsx`.
 *
 * If the target element isn't found on the current page, the function
 * navigates to `/#<id>` so the scroll happens after the page loads.
 *
 * @param offset - Pixels to subtract from the target's top position
 *                 (accounts for fixed headers). Defaults to 100.
 */
export function useScrollToSection(offset = 100) {
    return useCallback(
        (id: string, e?: React.MouseEvent) => {
            if (e) e.preventDefault();

            // If the section doesn't exist on this page, navigate home with hash.
            const section = document.getElementById(id);
            if (!section) {
                window.location.href = `/#${id}`;
                return;
            }

            const elementPosition = section.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.scrollY - offset;

            // A JS `behavior: 'smooth'` overrides the CSS `scroll-behavior`
            // rule, so reduced-motion has to be honoured explicitly here.
            const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

            window.scrollTo({ top: offsetPosition, behavior: reduced ? 'auto' : 'smooth' });
        },
        [offset],
    );
}
