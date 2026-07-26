'use client';

import { useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { projectData, FilterCategory } from '../data/projects';
import { useBreakpoint } from '@/hooks/use-breakpoint';
import { COLORS } from '@/lib/constants';

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

/** Overlay that wipes left-to-right when switching filter categories. */
const overlayVariants: Variants = {
  hidden: { x: '-100%', opacity: 0 },
  visible: { x: 0, opacity: 1 },
  exit: { x: '100%', opacity: 0 },
};

/** Staggered entrance for the project grid container. */
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { delayChildren: 0.05, staggerChildren: 0.06 },
  },
};

/** Bouncy pop-in for individual project cards. */
const projectVariants: Variants = {
  hidden: { opacity: 0, y: 60, scale: 0.7 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const FILTER_CATEGORIES: FilterCategory[] = ['All', 'Featured', 'ML/AI', 'Full Stack'];

/** Blur placeholder shared across all project thumbnails. */
const BLUR_PLACEHOLDER =
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+Rj9PmP/Z';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Returns the number of projects matching a given filter category. */
function getProjectCount(category: FilterCategory): number {
  if (category === 'All') return projectData.length;
  if (category === 'Featured') return projectData.filter(p => p.featured).length;
  return projectData.filter(p => p.categories.includes(category)).length;
}

/**
 * Splits a project title into lines that fit within the available card width.
 *
 * Uses character-count heuristics per breakpoint to approximate when the
 * browser would wrap text. This keeps the pill-shaped title tags visually
 * consistent across screen sizes.
 *
 * Takes the resolved character budget rather than a raw pixel width: the
 * width was only ever compared against three thresholds, and depending on it
 * forced this component to re-render on every pixel of a window drag.
 */
function groupWordsByLines(title: string, maxLineLength: number): string[][] {
  const words = title.split(' ');
  const lines: string[][] = [];
  let currentLine: string[] = [];

  let currentLength = 0;

  words.forEach(word => {
    const wouldExceed =
      currentLength + word.length + (currentLine.length > 0 ? 1 : 0) > maxLineLength;

    if (wouldExceed && currentLine.length > 0) {
      lines.push(currentLine);
      currentLine = [word];
      currentLength = word.length;
    } else {
      currentLine.push(word);
      currentLength += word.length + (currentLine.length > 1 ? 1 : 0);
    }
  });

  if (currentLine.length > 0) lines.push(currentLine);
  return lines;
}

// ---------------------------------------------------------------------------
// ProjectTitleTag — the pill-shaped label below each project card.
// ---------------------------------------------------------------------------

function ProjectTitleTag({ line, isMobile }: { line: string; isMobile: boolean }) {
  if (isMobile) {
    return (
      <div className="overflow-hidden rounded-sm">
        <motion.div
          className="text-white px-2 md:px-3 py-1 md:py-2 text-xs md:text-sm font-medium select-none"
          style={{ backgroundColor: COLORS.accent }}
          whileHover={{ scale: 1.05, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)' }}
        >
          {line}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-sm">
      <motion.div className="bg-black text-white px-2 md:px-3 py-1 md:py-2 text-xs md:text-sm font-medium select-none">
        <div className="overflow-hidden leading-tight" style={{ height: '1.2em' }}>
          <motion.div className="flex flex-col leading-tight group-hover:-translate-y-[1.2em] transition-transform duration-200">
            <span className="block select-none">{line}</span>
            <span className="block select-none">{line}</span>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Projects (default export)
// ---------------------------------------------------------------------------

export default function Projects() {
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('Featured');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { isMobile, isSm, isMd, isLg } = useBreakpoint();

  // Character budget per breakpoint — same thresholds the pixel width encoded.
  const maxLineLength = isLg ? 50 : isMd ? 22 : isSm ? 30 : 20;

  const filteredProjects = projectData.filter(project => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Featured') return project.featured;
    return project.categories.includes(activeFilter);
  });

  /** Triggers the overlay wipe animation before swapping the filter. */
  const handleFilterChange = (newFilter: FilterCategory) => {
    if (newFilter === activeFilter) return;

    setIsTransitioning(true);
    setTimeout(() => setActiveFilter(newFilter), 100);
    setTimeout(() => setIsTransitioning(false), 600);
  };

  return (
    <div className="bg-white font-[family-name:var(--font-atkinson-hyperlegible)] pb-8 md:pb-20 overflow-hidden">
      <motion.div
        className="w-full px-8 pt-4 pb-8 md:w-[80vw] md:mx-auto md:px-6 md:py-0 lg:px-0"
        layout
        transition={{ layout: { duration: 0.4, ease: 'easeInOut' } }}
      >
        {/* ── Filter bar ──────────────────────────────────────────────── */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-3 items-center justify-center mb-6">
            {FILTER_CATEGORIES.map(category => (
              <div key={category} className="overflow-hidden rounded-xl group">
                <motion.button
                  onClick={() => handleFilterChange(category)}
                  className={`px-4 py-2.5 text-sm font-medium rounded-xl duration-200 flex-shrink-0 border border-black cursor-pointer select-none ${activeFilter === category
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-black border-black hover:bg-gray-50'
                    }`}
                  style={{ minWidth: 'fit-content' }}
                  disabled={isTransitioning}
                >
                  {!isMobile ? (
                    <div className="overflow-hidden leading-tight" style={{ height: '1.2em' }}>
                      <motion.div className="flex flex-col leading-tight group-hover:-translate-y-[1.2em] transition-transform duration-200">
                        <span className="whitespace-nowrap block select-none">
                          {category} ({getProjectCount(category)})
                        </span>
                        <span className="whitespace-nowrap block select-none">
                          {category} ({getProjectCount(category)})
                        </span>
                      </motion.div>
                    </div>
                  ) : (
                    <span className="whitespace-nowrap select-none">
                      {category} ({getProjectCount(category)})
                    </span>
                  )}
                </motion.button>
              </div>
            ))}
          </div>

          <div className="text-center">
            <span className="text-sm font-medium text-gray-500 uppercase tracking-[0.2em]">
              {isMobile ? 'Tap for details' : 'Click for details'}
            </span>
          </div>
        </div>

        {/* ── Project grid ────────────────────────────────────────────── */}
        <motion.div
          className="pt-6 relative overflow-hidden"
          layout
          transition={{ layout: { duration: 0.4, ease: 'easeInOut' } }}
        >
          {/* White overlay wipe during filter transition */}
          <AnimatePresence mode="wait">
            {isTransitioning && (
              <motion.div
                key="overlay"
                className="absolute inset-0 bg-white z-10 pointer-events-none"
                variants={overlayVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1.0] }}
              />
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeFilter}
              className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 w-full"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              layout
              transition={{ layout: { duration: 0.4, ease: 'easeInOut' } }}
            >
              {filteredProjects.map(project => (
                <Link key={project.id} href={`/projects/${project.id}`}>
                  <motion.div
                    className="group cursor-pointer flex flex-col w-full"
                    variants={projectVariants}
                    layout
                    transition={{
                      layout: { duration: 0.4, ease: 'easeInOut' },
                      duration: 0.3,
                      ease: [0.68, -0.55, 0.265, 1.55],
                      opacity: { duration: 0.15, ease: [0.25, 0.1, 0.25, 1.0] },
                    }}
                  >
                    <div className="flex flex-col h-full w-full">
                      {/* Thumbnail */}
                      <motion.div
                        className="w-full aspect-square rounded-3xl mb-2 group-hover:-translate-y-4 transition-transform duration-300 overflow-hidden flex items-center justify-center bg-gray-100"
                        style={{ aspectRatio: '1/1' }}
                      >
                        <div className="relative w-[70%] h-[70%]">
                          <Image
                            src={project.image}
                            alt={project.title}
                            fill
                            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            className="rounded-3xl object-contain"
                            loading="lazy"
                            quality={85}
                            placeholder="blur"
                            blurDataURL={BLUR_PLACEHOLDER}
                          />
                        </div>
                      </motion.div>

                      {/* Title pills */}
                      <div className="h-[3.2em] flex flex-col justify-start self-start w-full">
                        <div className="flex flex-col gap-1">
                          {groupWordsByLines(project.title, maxLineLength).map((line, lineIndex) => (
                            <div key={lineIndex} className="flex gap-1">
                              <ProjectTitleTag line={line.join(' ')} isMobile={isMobile} />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Empty state */}
        <AnimatePresence>
          {filteredProjects.length === 0 && !isTransitioning && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-16"
              layout
            >
              <p className="text-gray-500 text-lg">No projects found in this category.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}