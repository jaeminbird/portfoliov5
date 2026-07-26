"use client"
import { useEffect, useState } from "react";
import { motion, AnimatePresence, Transition } from "framer-motion";
import Image from "next/image";
import { IconBrandLinkedinFilled, IconBrandGithubFilled } from '@tabler/icons-react';
import { useBreakpoint } from "@/hooks/use-breakpoint";
import { useScrollToSection } from "@/hooks/use-scroll-to-section";
import { COLORS, LINKS, SPRING_INTERACTIVE } from "@/lib/constants";

const CURRENT_YEAR = new Date().getFullYear();

// ---------------------------------------------------------------------------
// MenuButton — animated hamburger ↔ X toggle (SVG).
// Uses three `<motion.line>` elements that rotate/fade between states.
// ---------------------------------------------------------------------------

interface LineProps {
  stroke?: string;
  strokeWidth?: number;
  strokeLinecap?: "round" | "inherit" | "butt" | "square";
  vectorEffect?: string;
  initial?: string;
  animate?: string;
  transition?: Transition;
  [key: string]: unknown;
}

interface MenuButtonProps {
  isOpen?: boolean;
  color?: string;
  strokeWidth?: string | number;
  transition?: Transition;
  lineProps?: LineProps;
  width?: string | number;
  height?: string | number;
  onClick?: () => void;
  className?: string;
}

function MenuButton({
  isOpen = false,
  width = 24,
  height = 24,
  strokeWidth = 1,
  color = COLORS.accent,
  transition = {},
  lineProps = {},
  ...props
}: MenuButtonProps) {
  const variant = isOpen ? "opened" : "closed";

  const top = { closed: { rotate: 0, translateY: 0 }, opened: { rotate: 45, translateY: 2 } };
  const center = { closed: { opacity: 1 }, opened: { opacity: 0 } };
  const bottom = { closed: { rotate: 0, translateY: 0 }, opened: { rotate: -45, translateY: -2 } };

  const combinedLineProps = {
    stroke: color,
    strokeWidth: strokeWidth as number,
    vectorEffect: "non-scaling-stroke",
    initial: "closed",
    animate: variant,
    transition,
    ...lineProps,
  };

  const unitHeight = 4;
  const unitWidth = (unitHeight * (width as number)) / (height as number);

  return (
    <motion.svg
      viewBox={`0 0 ${unitWidth} ${unitHeight}`}
      overflow="visible"
      preserveAspectRatio="none"
      width={width}
      height={height}
      {...props}
    >
      <motion.line x1="0" x2={unitWidth} y1="0" y2="0" variants={top}    {...combinedLineProps} />
      <motion.line x1="0" x2={unitWidth} y1="2" y2="2" variants={center} {...combinedLineProps} />
      <motion.line x1="0" x2={unitWidth} y1="4" y2="4" variants={bottom} {...combinedLineProps} />
    </motion.svg>
  );
}

// ---------------------------------------------------------------------------
// NavLink — desktop slide-up hover link. Previously copy-pasted 3×.
// ---------------------------------------------------------------------------

interface NavLinkProps {
  href: string;
  label: string;
  scrolled: boolean;
  onClick: (e: React.MouseEvent) => void;
}

function NavLink({ href, label, scrolled, onClick }: NavLinkProps) {
  const textColor = scrolled ? 'text-white' : 'text-[#3B3B3B]';
  const spanColor = scrolled ? 'text-white' : `text-[${COLORS.accent}]`;
  const spanStyle = scrolled ? undefined : { color: COLORS.accent };

  return (
    <div className="overflow-hidden leading-none" style={{ height: '1.25rem' }}>
      <motion.a
        href={href}
        className={`text-xl font-medium flex flex-col leading-none ${textColor}`}
        style={{ fontFamily: 'var(--font-fredoka)' }}
        onClick={onClick}
        whileHover={{ y: '-1.25rem' }}
        transition={{ duration: 0.2 }}
      >
        <span className={spanColor} style={spanStyle}>{label}</span>
        <span className={spanColor} style={spanStyle}>{label}</span>
      </motion.a>
    </div>
  );
}

// ---------------------------------------------------------------------------
// MobileNavLink — full-screen overlay link with staggered entrance.
// ---------------------------------------------------------------------------

interface MobileNavLinkProps {
  href: string;
  label: string;
  delay: number;
  onClick: (e: React.MouseEvent) => void;
  external?: boolean;
}

function MobileNavLink({ href, label, delay, onClick, external }: MobileNavLinkProps) {
  return (
    <motion.a
      href={href}
      className="text-5xl font-bold"
      style={{ fontFamily: 'var(--font-fredoka)', color: COLORS.accent }}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {label}
    </motion.a>
  );
}

// ---------------------------------------------------------------------------
// StickyHeader (default export)
// ---------------------------------------------------------------------------

export default function StickyHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { isMobile } = useBreakpoint();
  const scrollToSection = useScrollToSection(100);

  // The overlay only exists on mobile, so resizing to desktop implicitly
  // closes it — no effect needed to sync the two.
  const menuOpen = mobileNavOpen && isMobile;

  // Track scroll position to toggle header background.
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll while the mobile overlay is open.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : 'auto';
    return () => { document.body.style.overflow = 'auto'; };
  }, [menuOpen]);

  /** Navigate to a section, closing the mobile menu in the process. */
  const handleNavClick = (id: string) => (e: React.MouseEvent) => {
    setMobileNavOpen(false);
    scrollToSection(id, e);
  };

  // Navigation items — single source of truth for both desktop & mobile.
  const navItems = [
    { id: 'about', label: 'ABOUT' },
    { id: 'projects', label: 'PROJECTS' },
    { id: 'footer', label: 'CONNECT' },
  ] as const;

  return (
    // The header itself is transparent but full-width, so without
    // pointer-events-none its 80px band would swallow every click and text
    // selection at the top of the page. Interactive children opt back in.
    <header
      className="fixed top-0 inset-x-0 z-50 h-20 flex items-center font-fredoka pointer-events-none"
      style={{ fontFamily: 'var(--font-fredoka)' }}
    >
      {/* ── Logo (left) ─────────────────────────────────────────────── */}
      <motion.div
        className="absolute left-6 md:left-12 z-[70] pointer-events-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="w-[29px] h-[29px] cursor-pointer"
          whileHover={!isMobile ? { rotate: 218 } : undefined}
          animate={menuOpen ? { rotate: 218 } : { rotate: 0 }}
          transition={{ duration: 0.5 }}
          onClick={() => {
            if (window.location.pathname !== '/') {
              window.location.href = '/';
            } else {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
        >
          <Image src="/logo.svg" alt="Logo" width={29} height={29} unoptimized />
        </motion.div>
      </motion.div>

      {/* ── Desktop navigation pill (center) ─────────────────────────── */}
      <motion.div
        className={`absolute hidden md:block md:left-1/2 md:transform md:-translate-x-1/2 px-4 py-2 rounded-full pointer-events-auto transition-all duration-300 ${scrolled
            ? 'border border-transparent'
            : 'bg-white border border-transparent'
          }`}
        style={scrolled ? { backgroundColor: COLORS.accent } : undefined}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <nav className="flex items-center space-x-8">
          {navItems.map((item) => (
            <NavLink
              key={item.id}
              href={`#${item.id}`}
              label={item.label}
              scrolled={scrolled}
              onClick={handleNavClick(item.id)}
            />
          ))}
        </nav>
      </motion.div>

      {/* ── Mobile hamburger (right) ────────────────────────────────── */}
      <div className="absolute right-6 md:hidden z-[70] cursor-pointer pointer-events-auto">
        <MenuButton
          isOpen={menuOpen}
          onClick={() => setMobileNavOpen(!menuOpen)}
          strokeWidth="6"
          color={COLORS.accent}
          lineProps={{ strokeLinecap: "round" }}
          transition={SPRING_INTERACTIVE}
          width="24"
          height="24"
        />
      </div>

      {/* ── Mobile fullscreen overlay ───────────────────────────────── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 bg-white z-[60] flex flex-col items-center justify-center pointer-events-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <nav className="flex flex-col items-center space-y-12">
              <MobileNavLink href="#about" label="ABOUT" delay={0.1} onClick={handleNavClick('about')} />
              <MobileNavLink href="#projects" label="PROJECTS" delay={0.2} onClick={handleNavClick('projects')} />
              <MobileNavLink href={LINKS.resume} label="RESUME" delay={0.3} onClick={() => setMobileNavOpen(false)} external />
            </nav>

            {/* Overlay footer */}
            <motion.div
              className="absolute bottom-0 left-0 right-0 flex flex-col items-center pb-8 text-center text-sm text-gray-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex space-x-6 mb-4">
                <a href={LINKS.linkedin} className="hover:text-[#F8C46F] transition-colors">
                  <IconBrandLinkedinFilled size={24} />
                </a>
                <a href={LINKS.github} className="hover:text-[#F8C46F] transition-colors">
                  <IconBrandGithubFilled size={24} />
                </a>
              </div>
              <div className="mb-4">
                <a href={LINKS.email} className="hover:text-[#F8C46F]">jaeminbird@gmail.com</a>
              </div>
              <p className="text-xs">© {CURRENT_YEAR} All Rights Reserved</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}