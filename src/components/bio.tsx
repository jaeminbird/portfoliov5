'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, animate, useMotionValue, useTransform } from 'framer-motion';
import { useBreakpoint } from '@/hooks/use-breakpoint';
import { COLORS, LINKS } from '@/lib/constants';

// ---------------------------------------------------------------------------
// SlotMachine — cycles through tasks behind a sweeping asterisk
//
// The `*` is the leading edge of a wipe: it sweeps left to erase the current
// word, the word is swapped while nothing is visible, then it sweeps right to
// draw the new one. Positions are in `ch` units, which are exact here because
// --font-mono resolves to Geist Mono — so the wipe rides the character grid
// with no DOM measurement.
// ---------------------------------------------------------------------------

const TASKS = ['AI', 'Research', 'Tennis', 'UI/UX', 'ML', 'WebDev', 'Pre-Sales'];
const RARE_TASK = 'your mom';
const RARE_CHANCE = 1 / 1000000;

/** Slot is sized to the widest word plus its asterisk, so the line never reflows. */
const SLOT_CH = Math.max(...[...TASKS, RARE_TASK].map((w) => w.length)) + 1;

/** Left edge of a word, centering the word+asterisk pair within the slot. */
const wordLeft = (word: string) => (SLOT_CH - (word.length + 1)) / 2;

const REST_MS = 2000;
const HIDE_SEC = 0.35;
const REVEAL_SEC = 0.4;

function SlotMachine() {
  const [word, setWord] = useState(TASKS[0]);

  // Read inside the clip transform, which must see the current word without
  // being torn down and rebuilt on every swap. Written only from the effect
  // below, alongside setWord — never during render.
  const wordRef = useRef(TASKS[0]);

  // Position of the asterisk, in ch from the left edge of the slot.
  const starX = useMotionValue(wordLeft(TASKS[0]) + TASKS[0].length);

  const starLeft = useTransform(starX, (x) => `${x}ch`);

  // Everything to the right of the asterisk is clipped away, so the word is
  // only ever visible up to wherever the asterisk currently sits.
  const wordClip = useTransform(starX, (x) => {
    const current = wordRef.current;
    const revealed = Math.min(Math.max(x - wordLeft(current), 0), current.length);
    return `inset(0 ${current.length - revealed}ch 0 0)`;
  });

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let playing: ReturnType<typeof animate> | undefined;
    let index = 0;

    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        timer = setTimeout(resolve, ms);
      });

    const run = async () => {
      while (!cancelled) {
        await wait(REST_MS);
        if (cancelled) return;

        // 1 in a million chance for the rare task.
        const next =
          Math.random() < RARE_CHANCE
            ? RARE_TASK
            : TASKS[(index = (index + 1) % TASKS.length)];

        const nextLeft = wordLeft(next);

        // Sweep far enough left to erase the outgoing word *and* to leave the
        // incoming one clipped to zero width, so the swap is never visible.
        playing = animate(starX, Math.min(wordLeft(wordRef.current), nextLeft), {
          duration: HIDE_SEC,
          ease: 'easeIn',
        });
        await playing.finished.catch(() => {});
        if (cancelled) return;

        wordRef.current = next;
        setWord(next);

        playing = animate(starX, nextLeft + next.length, {
          duration: REVEAL_SEC,
          ease: 'easeOut',
        });
        await playing.finished.catch(() => {});
      }
    };

    run();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      playing?.stop();
    };
  }, [starX]);

  return (
    <span
      className="relative inline-block font-mono align-baseline"
      style={{ color: COLORS.accent, width: `${SLOT_CH}ch` }}
    >
      {/* Holds the line box open — the word and asterisk are both absolute. */}
      <span aria-hidden className="invisible">&nbsp;</span>

      <motion.span
        className="absolute top-0 whitespace-pre"
        style={{
          left: `${wordLeft(word)}ch`,
          width: `${word.length}ch`,
          clipPath: wordClip,
        }}
      >
        {word}
      </motion.span>

      <motion.span className="absolute top-0" style={{ left: starLeft }} aria-hidden>
        *
      </motion.span>
    </span>
  );
}

// ---------------------------------------------------------------------------
// Shared bio paragraph — used by both mobile and desktop layouts so the
// actual copy is defined in one place.
// ---------------------------------------------------------------------------

function BioContent({ labelClass, taskClass, resumeClass }: { labelClass: string; taskClass: string; resumeClass: string }) {
  return (
    <div className="flex flex-col items-center">
      <p className={labelClass}>i do</p>
      <p className={taskClass}>
        <SlotMachine />
      </p>
      <p className={`${resumeClass} mt-8`}>
        check out my{' '}
        <a
          href={LINKS.resume}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline transition-all duration-200"
          style={{ color: COLORS.accent }}
        >
          resume
        </a>
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// NameHeading — the "hello i'm" + "jae*" heading, shared across layouts.
// ---------------------------------------------------------------------------

function NameHeading({
  greetingClass,
  nameClass,
}: {
  greetingClass: string;
  nameClass: string;
}) {
  return (
    <>
      <motion.div
        className="mb-4"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <p className={greetingClass}>hello i&apos;m</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        viewport={{ once: true }}
        className="relative flex items-center justify-center"
      >
        <h1 className={`${nameClass} font-bold text-black tracking-tight leading-none`}>
          jae
        </h1>
        <span
          className={`${nameClass} font-bold tracking-tight leading-none`}
          style={{ color: COLORS.accent, marginLeft: '0.1em' }}
        >
          *
        </span>
      </motion.div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Bio (default export)
// ---------------------------------------------------------------------------

export default function Bio() {
  const { isLg } = useBreakpoint();

  // ── Mobile layout (< lg) ────────────────────────────────────────────────
  if (!isLg) {
    return (
      <div className="bg-white">
        <div className="w-full px-6 py-8">
          <div className="flex flex-col items-center gap-10">
            {/* Name heading */}
            <div className="w-full flex flex-col items-center justify-center text-center">
              <NameHeading
                greetingClass="text-3xl md:text-5xl text-gray-600 font-light tracking-wide"
                nameClass="text-7xl md:text-9xl"
              />
            </div>

            {/* Bio text */}
            <div className="w-full flex justify-center">
              <div className="w-[80%]">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  viewport={{ once: true }}
                  className="flex justify-center"
                >
                  <BioContent
                    labelClass="text-3xl md:text-4xl text-black font-light"
                    taskClass="text-3xl md:text-4xl font-bold"
                    resumeClass="text-lg md:text-xl text-black font-light"
                  />
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Desktop layout (≥ lg) ───────────────────────────────────────────────
  return (
    <div className="bg-white" style={{ height: '600px' }}>
      <div className="w-[70vw] mx-auto py-16 h-full">
        <div className="flex items-center h-full gap-0">
          {/* Left column — name (40%) */}
          <div className="w-2/5 flex flex-col items-center justify-center text-center">
            <NameHeading
              greetingClass="text-6xl text-gray-600 font-light tracking-wide"
              nameClass="text-[12rem] xl:text-[14rem]"
            />
          </div>

          {/* Right column — bio text (60%) */}
          <div className="w-3/5 pl-12 h-full flex items-center justify-center">
            <div className="w-[80%]">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
                className="flex justify-center w-full"
              >
                <BioContent
                  labelClass="text-4xl xl:text-5xl text-black font-light"
                  taskClass="text-4xl xl:text-5xl font-bold"
                  resumeClass="text-xl xl:text-2xl text-black font-light"
                />
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}