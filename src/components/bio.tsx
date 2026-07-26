'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useBreakpoint } from '@/hooks/use-breakpoint';
import { COLORS, LINKS } from '@/lib/constants';

// ---------------------------------------------------------------------------
// SlotMachine — cycles through tasks with a slot machine letter effect
// ---------------------------------------------------------------------------

const TASKS = ['AI', 'Research', 'Tennis', 'UI/UX', 'ML', 'WebDev', 'Pre-Sales'];
const RARE_TASK = 'your mom';
const RARE_CHANCE = 1 / 1000000;
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz/-';

function SlotMachine() {
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [displayText, setDisplayText] = useState(TASKS[0]);
  const [isScrambling, setIsScrambling] = useState(false);

  const scrambleToTask = useCallback((targetTask: string) => {
    setIsScrambling(true);
    const maxLength = Math.max(displayText.length, targetTask.length);
    let iteration = 0;
    const totalIterations = 12;

    const interval = setInterval(() => {
      iteration++;
      
      // Generate scrambled text
      const progress = iteration / totalIterations;
      const lockedChars = Math.floor(progress * targetTask.length);
      
      let newText = '';
      for (let i = 0; i < maxLength; i++) {
        if (i < lockedChars) {
          // This character is "locked in"
          newText += targetTask[i] || '';
        } else if (i < targetTask.length) {
          // Still scrambling this position
          newText += CHARS[Math.floor(Math.random() * CHARS.length)];
        }
      }
      
      setDisplayText(newText);

      if (iteration >= totalIterations) {
        clearInterval(interval);
        setDisplayText(targetTask);
        setIsScrambling(false);
      }
    }, 40);

    return () => clearInterval(interval);
  }, [displayText.length]);

  useEffect(() => {
    const cycleInterval = setInterval(() => {
      if (!isScrambling) {
        // 1 in 1 million chance for the rare task
        if (Math.random() < RARE_CHANCE) {
          scrambleToTask(RARE_TASK);
        } else {
          const nextIndex = (currentTaskIndex + 1) % TASKS.length;
          setCurrentTaskIndex(nextIndex);
          scrambleToTask(TASKS[nextIndex]);
        }
      }
    }, 2000);

    return () => clearInterval(cycleInterval);
  }, [currentTaskIndex, isScrambling, scrambleToTask]);

  return (
    <span
      className="inline-block font-mono"
      style={{ 
        color: COLORS.accent,
        minWidth: '7ch',
        textAlign: 'center'
      }}
    >
      {displayText}
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