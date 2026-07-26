'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { jobData, JobInfo } from '../data/experience';
import { useBreakpoint } from '@/hooks/use-breakpoint';
import { EASE_DEFAULT } from '@/lib/constants';

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

/**
 * Letter-by-letter staggered slide animation for the "EXPERIENCE" title.
 * Mobile: slides upward. Desktop: slides left with progressive fade-out.
 */
const mobileLetterVariants: Variants = {
  initial: { y: 0, opacity: 1 },
  slide: (index: number) => ({
    y: -200 - (index * 30),
    opacity: 0,
    transition: { duration: 0.6, delay: index * 0.06, ease: EASE_DEFAULT },
  }),
};

const desktopLetterVariants: Variants = {
  initial: { x: 0, opacity: 1 },
  slide: (index: number) => ({
    x: -600 - (index * 60),
    opacity: index >= 2 ? (index >= 4 ? 0 : 0.3) : 1,
    transition: { duration: 0.8, delay: index * 0.08, ease: EASE_DEFAULT },
  }),
};

/** Background mask that slides off to reveal job details underneath. */
function makeMobileBackgroundVariants(isXs: boolean): Variants {
  const charCount = isXs ? 10 : 9;
  return {
    initial: { y: 0 },
    slide: {
      y: -200 - (charCount * 30),
      transition: { duration: 0.6, delay: charCount * 0.06, ease: EASE_DEFAULT },
    },
  };
}

const desktopBackgroundVariants: Variants = {
  initial: { x: 0 },
  slide: {
    x: -600 - (9 * 60),
    transition: { duration: 0.8, delay: 9 * 0.08, ease: EASE_DEFAULT },
  },
};

/**
 * Directional slide for the job detail card. When switching between jobs,
 * the card slides in the direction determined by the job's list position
 * relative to the previous one (up/down on mobile, left/right on desktop).
 */
function makeInfoVariants(isMobile: boolean): Variants {
  return {
    initial: (direction: number) => ({
      x: isMobile ? direction : 0,
      y: isMobile ? 0 : direction,
      opacity: isMobile ? 0 : 1,
    }),
    animate: {
      x: 0, y: 0, opacity: 1,
      transition: { duration: 0.4, ease: EASE_DEFAULT },
    },
    exit: (direction: number) => ({
      x: isMobile ? -direction : 0,
      y: isMobile ? 0 : -direction,
      opacity: isMobile ? 0 : 1,
      transition: { duration: 0.3, ease: EASE_DEFAULT },
    }),
  };
}

// ---------------------------------------------------------------------------
// ExperienceTitle — renders the staggered "EXPERIENCE" letter animation.
// ---------------------------------------------------------------------------

function ExperienceTitle({
  variants,
  hoveredJob,
  isMobile,
}: {
  variants: Variants;
  hoveredJob: JobInfo | null;
  isMobile: boolean;
}) {
  const topWord = isMobile ? 'EXPER' : 'exper';
  const bottomWord = isMobile ? 'IENCE' : 'ience';

  const renderLetters = (word: string, indexOffset: number) =>
    word.split('').map((letter, index) => (
      <motion.span
        key={`${word}-${index}`}
        custom={index + indexOffset}
        variants={variants}
        animate={hoveredJob ? 'slide' : 'initial'}
        className={`inline-block relative ${isMobile ? 'text-black' : 'text-black text-center uppercase'}`}
        style={{ zIndex: 30 - (index + indexOffset) }}
      >
        {letter}
      </motion.span>
    ));

  if (isMobile) {
    return (
      <>
        <div className="relative flex justify-center mb-2">
          <div className="flex space-x-1">{renderLetters(topWord, 0)}</div>
        </div>
        <div className="relative flex justify-center">
          <div className="flex space-x-1">{renderLetters(bottomWord, 5)}</div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="relative flex-1 flex items-start">
        <div className="relative w-full">
          <div className="grid grid-cols-5 w-full">{renderLetters(topWord, 0)}</div>
        </div>
      </div>
      <div className="relative flex-1 flex items-end">
        <div className="relative w-full">
          <div className="grid grid-cols-5 w-full">{renderLetters(bottomWord, 5)}</div>
        </div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// JobDetailCard — shows title, dates, and description for a hovered/tapped job.
// ---------------------------------------------------------------------------

function JobDetailCard({
  job,
  isMobile,
  isLgOnly,
}: {
  job: JobInfo;
  isMobile: boolean;
  isLgOnly: boolean;
}) {
  const [firstWord, ...restWords] = job.title.split(' ');
  const remainingTitle = restWords.join(' ');

  if (isMobile) {
    return (
      <div className="max-w-md mx-auto px-4 py-6 w-full">
        <div className="mb-8">
          <div className="text-4xl font-light text-black leading-none mb-1 tracking-tight">
            {firstWord}
          </div>
          {remainingTitle && (
            <div className="text-4xl font-bold text-black leading-none tracking-tight mb-4">
              {remainingTitle}
            </div>
          )}
          <div className="flex items-center text-sm font-medium text-gray-600">
            <span>{job.startDate}</span>
            <div className="w-4 h-px bg-gray-400 mx-3" />
            <span>{job.endDate}</span>
          </div>
        </div>
        <div>
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
            Description
          </div>
          <div className="text-sm leading-relaxed text-black font-normal">
            {job.description}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`absolute inset-0 bg-white ${isLgOnly ? 'p-6' : 'p-8'} flex flex-col`}>
      <div className="flex justify-between items-start mb-16">
        <div className="flex-1">
          <div className="text-6xl font-light text-black leading-none mb-2 tracking-tight">
            {firstWord}
          </div>
          {remainingTitle && (
            <div className="text-6xl font-bold text-black leading-none tracking-tight">
              {remainingTitle}
            </div>
          )}
        </div>
        <div className="flex flex-col items-center">
          <div className="text-lg font-medium text-black mb-2">{job.endDate}</div>
          <div className="w-8 h-px bg-black mb-2" />
          <div className="text-lg font-medium text-black">{job.startDate}</div>
        </div>
      </div>
      <div className="flex-1 flex items-end">
        <div className="max-w-md">
          <div className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
            Description
          </div>
          <div className="text-base leading-relaxed text-black font-normal">
            {job.description}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Experience (default export)
// ---------------------------------------------------------------------------

export default function Experience() {
  const [hoveredJob, setHoveredJob] = useState<JobInfo | null>(null);
  const [previousJobIndex, setPreviousJobIndex] = useState<number | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { isLg, isXs, isLgOnly } = useBreakpoint();

  const isMobile = !isLg;
  const infoVariants = makeInfoVariants(isMobile);
  const mobileBackgroundVariants = makeMobileBackgroundVariants(isXs);

  // Clean up hover timeout on unmount.
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  // ── Interaction handlers ──────────────────────────────────────────────

  /** Mobile: toggle job selection on tap. */
  const handleJobToggle = (job: JobInfo) => {
    if (hoveredJob?.id === job.id) {
      setHoveredJob(null);
      setPreviousJobIndex(null);
    } else {
      if (hoveredJob) {
        setPreviousJobIndex(jobData.findIndex(j => j.id === hoveredJob.id));
      }
      setHoveredJob(job);
    }
  };

  /** Desktop: show job detail on mouse enter with debounced leave. */
  const handleMouseEnter = (job: JobInfo) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    if (hoveredJob) {
      setPreviousJobIndex(jobData.findIndex(j => j.id === hoveredJob.id));
    }
    setHoveredJob(job);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredJob(null);
      setPreviousJobIndex(null);
    }, 100);
  };

  /**
   * Compute slide direction for job detail transitions.
   * Positive = job below previous, negative = job above.
   */
  const getSlideDirection = (currentJob: JobInfo) => {
    if (previousJobIndex === null) return 0;
    const currentIndex = jobData.findIndex(j => j.id === currentJob.id);
    return currentIndex > previousJobIndex
      ? (isMobile ? 200 : 300)
      : (isMobile ? -200 : -300);
  };

  // ── Mobile layout (< lg) ───────────────────────────────────────────────
  if (isMobile) {
    return (
      <div className="bg-white" style={{ minHeight: 'calc(100vh - 160px)' }}>
        <div className="w-full px-6 py-8">
          {/* Animated title area with sliding reveal */}
          <div className="relative h-[35vh] overflow-hidden">
            {/* Job detail layer (behind title) */}
            <div className="absolute inset-0 z-0">
              <AnimatePresence>
                {hoveredJob && (
                  <motion.div
                    key={hoveredJob.id}
                    custom={getSlideDirection(hoveredJob)}
                    variants={infoVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="absolute inset-0 bg-white flex flex-col justify-center"
                  >
                    <JobDetailCard job={hoveredJob} isMobile isLgOnly={false} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* White mask that slides away */}
            <motion.div
              variants={mobileBackgroundVariants}
              animate={hoveredJob ? 'slide' : 'initial'}
              className="absolute inset-0 bg-white z-10"
            />

            {/* EXPERIENCE title */}
            <div className="text-[6rem] font-bold leading-tight relative z-20 h-full flex flex-col justify-center font-[700] text-center">
              <ExperienceTitle variants={mobileLetterVariants} hoveredJob={hoveredJob} isMobile />
            </div>
          </div>

          {/* Job list */}
          <div className="w-full">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-6 text-center">
              Select Experience
            </div>
            <div className="max-w-sm mx-auto">
              {jobData.map((job, index) => (
                <motion.button
                  key={job.id}
                  className="w-full text-left transition-all duration-200 relative"
                  onClick={() => handleJobToggle(job)}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className={`py-3 px-3 mx-0 my-1 transition-all duration-200 rounded-lg ${hoveredJob?.id === job.id
                      ? 'bg-black text-white'
                      : 'text-black hover:bg-gray-50'
                    }`}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="text-base font-medium mb-1">{job.company}</div>
                        <div className="text-xs opacity-70">{job.title}</div>
                      </div>
                      <div className="text-xs opacity-50 text-right ml-4">
                        <div>{job.endDate}</div>
                        <div>—</div>
                        <div>{job.startDate}</div>
                      </div>
                    </div>
                  </div>
                  {index !== jobData.length - 1 && (
                    <div className="absolute bottom-0 left-6 right-6 h-px bg-gray-200" />
                  )}
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Desktop layout (≥ lg) ──────────────────────────────────────────────
  return (
    <div className="bg-white" style={{ height: '600px' }}>
      <div className="w-[77vw] mx-auto py-16 h-full">
        <div className="flex">
          {/* Left — animated title + detail reveal */}
          <div className={`${isLgOnly ? 'w-[70%]' : 'w-[60%]'} relative h-96 flex flex-col overflow-hidden`}>
            <div className="absolute inset-0 z-0">
              <AnimatePresence>
                {hoveredJob && (
                  <motion.div
                    key={hoveredJob.id}
                    custom={getSlideDirection(hoveredJob)}
                    variants={infoVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="absolute inset-0 bg-white"
                  >
                    <JobDetailCard job={hoveredJob} isMobile={false} isLgOnly={isLgOnly} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <motion.div
              variants={desktopBackgroundVariants}
              animate={hoveredJob ? 'slide' : 'initial'}
              className="absolute inset-0 bg-white z-10"
            />

            <div className={`text-[12rem] font-bold leading-none relative z-20 h-full flex flex-col font-[700] ${isLgOnly ? 'px-2' : 'px-4'}`}>
              <ExperienceTitle variants={desktopLetterVariants} hoveredJob={hoveredJob} isMobile={false} />
            </div>
          </div>

          {/* Right — company list */}
          <div className={`${isLgOnly ? 'w-[30%]' : 'w-[40%]'} flex flex-col justify-center items-center`}>
            <div className="flex-[0.9] flex flex-col justify-center items-center">
              {jobData.map((job, index) => (
                <motion.div
                  key={job.id}
                  className={`text-3xl cursor-pointer relative text-center font-medium text-black ${index === 0 ? 'py-8' : 'py-8 -mt-4'
                    }`}
                  onMouseEnter={() => handleMouseEnter(job)}
                  onMouseLeave={handleMouseLeave}
                  whileHover={{ x: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <span className="relative">
                    {job.company}
                    <motion.div
                      className="absolute bottom-0 left-0 h-0.5 bg-current"
                      initial={{ width: 0 }}
                      whileHover={{ width: "100%" }}
                      transition={{ duration: 0.3 }}
                    />
                  </span>
                </motion.div>
              ))}
            </div>

            <div className="flex-[0.1] flex items-center justify-center">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-[0.2em] text-center">
                Hover for details
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
