'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useBreakpoint } from '@/hooks/use-breakpoint';
import { COLORS, LINKS } from '@/lib/constants';

const CURRENT_YEAR = new Date().getFullYear();

// ---------------------------------------------------------------------------
// FooterLink — slide-up hover link. Previously copy-pasted 4×.
// ---------------------------------------------------------------------------

interface FooterLinkProps {
  href: string;
  label: string;
  external?: boolean;
}

function FooterLink({ href, label, external }: FooterLinkProps) {
  return (
    <div className="overflow-hidden leading-none mb-2 sm:mb-0" style={{ height: '1.25rem' }}>
      <motion.a
        href={href}
        className="text-lg md:text-xl font-medium flex flex-col leading-none"
        whileHover={{ y: '-1.25rem' }}
        transition={{ duration: 0.2 }}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        <span>{label}</span>
        <span>{label}</span>
      </motion.a>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Footer (default export)
// ---------------------------------------------------------------------------

interface FooterProps {
  className?: string;
  width?: '60vw' | '80vw';
}

export default function Footer({ className = '', width = '80vw' }: FooterProps) {
  const { isMobile } = useBreakpoint();
  const footerWidth = isMobile ? '100%' : width;

  const socialLinks: FooterLinkProps[] = [
    { href: LINKS.email, label: 'Email' },
    { href: LINKS.linkedin, label: 'LinkedIn', external: true },
    { href: LINKS.github, label: 'GitHub', external: true },
    { href: LINKS.resume, label: 'Resume', external: true },
  ];

  return (
    <div className="w-full px-6 md:px-0">
      <footer
        className={`flex flex-col justify-between px-8 md:px-12 pt-4 md:pt-6 pb-0 relative overflow-hidden rounded-t-2xl md:mx-auto ${className}`}
        style={{ backgroundColor: COLORS.accent, width: footerWidth }}
      >
        <div className="relative z-10 flex flex-col w-full h-full">
          {/* Call to action */}
          <div className="w-full mb-8 md:mb-12">
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-fredoka text-white leading-none mb-2">
              learning more
            </h3>
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-fredoka text-white leading-none">
              every day
            </h3>
          </div>

          {/* Social links */}
          <div className="w-full mb-8 md:mb-12">
            <div className="flex flex-col sm:flex-row xl:flex-row gap-2 sm:gap-4 xl:gap-8 text-white">
              {socialLinks.map((link) => (
                <FooterLink key={link.label} {...link} />
              ))}
            </div>
          </div>

          {/* Decorative logo — clipped to right edge */}
          <div className="absolute top-1/2 -translate-y-1/2 -right-34 md:-right-44 lg:-right-44 pointer-events-none">
            <Image
              src="/logo.svg"
              alt=""
              width={300}
              height={300}
              className="w-48 h-48 md:w-64 md:h-64 brightness-0 invert"
              unoptimized
            />
          </div>

          {/* Copyright */}
          <div className="w-full mt-auto pb-2 md:pb-3">
            <p className="text-sm md:text-base text-white">
              © {CURRENT_YEAR} All rights reserved
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}