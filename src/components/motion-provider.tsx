'use client';

import { MotionConfig } from 'framer-motion';

/**
 * Applies `prefers-reduced-motion` to every Framer Motion animation in the app.
 *
 * With `reducedMotion="user"`, Motion keeps opacity and colour transitions but
 * disables transform and layout animation for visitors who have asked their OS
 * to reduce motion — so the site still reads as animated without the sliding,
 * scaling, and parallax that trigger vestibular discomfort. Everything stays
 * fully animated for everyone else.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
