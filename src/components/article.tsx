'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { ProjectInfo } from '../data/projects';
import Footer from './footer';
import StickyHeader from './nav';
import { useScrollToSection } from '@/hooks/use-scroll-to-section';
import { COLORS } from '@/lib/constants';

// ---------------------------------------------------------------------------
// Article sidebar sections — single source of truth for nav + scroll spy.
// ---------------------------------------------------------------------------

const SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'problem', label: 'Problem' },
  { id: 'solution', label: 'Solution' },
  { id: 'reflection', label: 'Reflection' },
] as const;

// ---------------------------------------------------------------------------
// ArticleSection — DRY component for Problem/Solution/Reflection blocks.
// Previously these three blocks were copy-pasted with only the title and
// content field differing.
// ---------------------------------------------------------------------------

interface ArticleSectionProps {
  id: string;
  title: string;
  content: string;
  fallback: string;
  sectionImage?: string;
  projectTitle: string;
}

function ArticleSection({
  id,
  title,
  content,
  fallback,
  sectionImage,
  projectTitle,
}: ArticleSectionProps) {
  return (
    <motion.section
      id={id}
      className="mb-16 md:mb-24"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
    >
      <div className="flex flex-col md:flex-row gap-6 md:gap-8 lg:gap-10 xl:gap-12">
        {/* Left — heading + optional image */}
        <div className="w-full md:w-2/5 lg:w-[35%]">
          <h2
            className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl xl:text-5xl font-bold leading-tight mb-4 md:mb-0"
            style={{ color: COLORS.accent }}
          >
            {title}
          </h2>

          {sectionImage && (
            <div
              className="w-full aspect-[4/3] rounded-lg overflow-hidden mt-4 flex items-center justify-center relative"
              style={{ backgroundColor: '#f5f5f5' }}
            >
              <Image
                src={sectionImage}
                alt={`${projectTitle} ${id} section`}
                fill
                sizes="(max-width: 768px) 90vw, 35vw"
                className="rounded-lg object-contain p-[7.5%]"
              />
            </div>
          )}
        </div>

        {/* Right — body text */}
        <div className="w-full md:w-3/5 lg:w-[65%] flex items-center">
          <p className="text-lg sm:text-xl md:text-xl lg:text-2xl leading-relaxed text-black">
            {content || fallback}
          </p>
        </div>
      </div>
    </motion.section>
  );
}

// ---------------------------------------------------------------------------
// MetadataField — Role / Platform / Stack field (used in mobile grid & desktop list).
// ---------------------------------------------------------------------------

interface MetadataFieldProps {
  label: string;
  value: string;
  className?: string;
}

function MetadataField({ label, value, className = '' }: MetadataFieldProps) {
  return (
    <>
      <div className={`text-left ${className}`}>
        <span
          className="uppercase tracking-wider font-medium"
          style={{ color: COLORS.accent }}
        >
          [ {label} ]
        </span>
      </div>
      <div className={`text-left ${className}`}>
        <span className="text-black font-light">{value}</span>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// ProjectArticle (default export)
// ---------------------------------------------------------------------------

interface ProjectArticleProps {
  project: ProjectInfo;
}

export default function ProjectArticle({ project }: ProjectArticleProps) {
  const [activeSection, setActiveSection] = useState('overview');
  const scrollToSection = useScrollToSection(100);

  /**
   * Scroll-spy — highlights the sidebar dot matching the visible section.
   *
   * Section offsets are measured once on mount (and again on resize) and
   * cached, so the scroll handler only reads `window.scrollY` per event
   * instead of calling `getElementById`/`offsetTop` on every tick.
   */
  useEffect(() => {
    type SectionRect = { id: string; top: number; bottom: number };
    let sectionRects: SectionRect[] = [];
    let overviewThreshold = 400;
    let offset = 150;

    const measure = () => {
      const isMobile = window.innerWidth < 768;
      offset = isMobile ? 100 : 150;
      overviewThreshold = isMobile ? 300 : 400;

      sectionRects = SECTIONS.slice(1).flatMap((section) => {
        const el = document.getElementById(section.id);
        if (!el) return [];
        const top = el.offsetTop - offset;
        return [{ id: section.id, top, bottom: top + el.offsetHeight }];
      });
    };

    const handleScroll = () => {
      const scrollPosition = window.scrollY;

      if (scrollPosition + offset < overviewThreshold) {
        setActiveSection('overview');
        return;
      }

      for (const rect of sectionRects) {
        if (scrollPosition >= rect.top && scrollPosition < rect.bottom) {
          setActiveSection(rect.id);
          return;
        }
      }
    };

    measure();
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', measure, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', measure);
    };
  }, []);

  /** Handle sidebar click — overview scrolls to top, others to their section. */
  const handleSidebarClick = (sectionId: string) => {
    if (sectionId === 'overview') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      scrollToSection(sectionId);
    }
  };

  const metadataFields = [
    { label: 'ROLE', value: project.role || 'Developer' },
    { label: 'PLATFORM', value: project.platform || 'Web Application' },
    { label: 'STACK', value: (project.stack || project.technologies).join(', ') },
  ];

  /**
   * The content sections (Problem, Solution, Reflection) that were
   * previously 3 identical copy-pasted blocks.
   */
  const contentSections = [
    {
      id: 'problem',
      title: 'PROBLEM',
      content: project.problem,
      fallback: 'Problem description not available for this project.',
      image: project.sectionImages?.problem,
    },
    {
      id: 'solution',
      title: 'SOLUTION',
      content: project.solution,
      fallback: 'Solution description not available for this project.',
      image: project.sectionImages?.solution,
    },
    {
      id: 'reflection',
      title: 'REFLECTION',
      content: project.reflection,
      fallback: 'Reflection not available for this project.',
      image: project.sectionImages?.reflection,
    },
  ];

  return (
    <div className="min-h-svh bg-white">
      <StickyHeader />

      {/* ── Sidebar navigation (desktop only) ──────────────────────────── */}
      <motion.div
        className="fixed left-4 lg:left-8 top-1/2 -translate-y-1/2 z-50 hidden xl:block"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex flex-col gap-6">
          {SECTIONS.map((section) => (
            <button
              key={section.id}
              onClick={() => handleSidebarClick(section.id)}
              className={`text-left transition-all duration-200 cursor-pointer ${activeSection === section.id
                  ? 'font-medium'
                  : 'text-gray-400 hover:text-gray-600'
                }`}
              style={{ color: activeSection === section.id ? COLORS.accent : undefined }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-3 h-3 rounded-full transition-all duration-200"
                  style={{
                    backgroundColor:
                      activeSection === section.id ? COLORS.accent : '#d1d5db',
                  }}
                />
                <span className="text-base uppercase tracking-wider">
                  {section.label}
                </span>
              </div>
            </button>
          ))}
        </div>
      </motion.div>

      {/* ── Main content ───────────────────────────────────────────────── */}
      <div className="w-[90vw] md:w-[70vw] lg:w-[60vw] mx-auto pt-20 md:pt-32 px-4 md:px-0">
        {/* Hero image */}
        <motion.div
          className="w-[80vw] md:w-[50vw] lg:w-[40vw] mx-auto aspect-[4/3] rounded-lg overflow-hidden mb-12 md:mb-16 flex items-center justify-center relative"
          style={{ backgroundColor: '#f5f5f5' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {project.heroImage ? (
            <Image
              src={project.heroImage}
              alt={`${project.title} hero image`}
              fill
              sizes="(max-width: 768px) 80vw, (max-width: 1024px) 50vw, 40vw"
              className="rounded-lg object-contain p-[7.5%]"
              priority
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-gray-600 text-2xl font-medium">
              {project.title}
            </div>
          )}
        </motion.div>

        {/* Overview section */}
        <motion.section
          id="overview"
          className="mb-16 md:mb-24"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* Left — title + description (80%) */}
            <div className="w-full lg:w-4/5">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-light mb-4 text-black leading-tight text-left">
                {project.title}
              </h1>
              <h2 className="text-3xl md:text-4xl font-light mb-8 lg:mb-12 text-gray-400 leading-tight text-left">
                {project.conceptSentence || 'A comprehensive solution'}
              </h2>
              <p className="text-xl md:text-2xl leading-relaxed text-black max-w-4xl text-left mb-8 lg:mb-0">
                {project.description}
              </p>
            </div>

            {/* Right — metadata (20%) */}
            <div className="w-full lg:w-1/5 lg:flex lg:items-center">
              <div className="w-full">
                {/* Mobile: 2-column grid */}
                <div
                  className="grid gap-x-4 gap-y-3 lg:hidden text-sm"
                  style={{ gridTemplateColumns: '1fr 2fr' }}
                >
                  {metadataFields.map((f) => (
                    <MetadataField key={f.label} {...f} />
                  ))}
                </div>

                {/* Desktop: vertical stack */}
                <div className="hidden lg:flex lg:flex-col lg:gap-8 text-base">
                  {metadataFields.map((f) => (
                    <div key={f.label}>
                      <div className="mb-2">
                        <span
                          className="uppercase tracking-wider font-medium"
                          style={{ color: COLORS.accent }}
                        >
                          [ {f.label} ]
                        </span>
                      </div>
                      <div className="text-black font-light">{f.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Content sections (Problem / Solution / Reflection) */}
        {contentSections.map((section) => (
          <ArticleSection
            key={section.id}
            id={section.id}
            title={section.title}
            content={section.content || ''}
            fallback={section.fallback}
            sectionImage={section.image}
            projectTitle={project.title}
          />
        ))}
      </div>

      <Footer width="60vw" />
    </div>
  );
}