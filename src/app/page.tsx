'use client'

import { motion, useScroll, useTransform } from "framer-motion";
import StickyHeader from "@/components/nav";
import Logo from "@/components/logo";
import Bumper from "@/components/bumper";
import Projects from "@/components/projects";
import Footer from "@/components/footer";
import Bio from "@/components/bio";
import Experience from "@/components/experience";
import { useScrollToSection } from "@/hooks/use-scroll-to-section";
import { COLORS } from "@/lib/constants";

export default function Home() {
  const { scrollY } = useScroll();
  const scrollToSection = useScrollToSection(50);

  // Lightweight parallax — fades & lifts the scroll indicator as user scrolls.
  const parallaxY = useTransform(scrollY, [0, 200], [0, -60]);
  const opacity = useTransform(scrollY, [0, 100], [1, 0]);
  // Opacity alone doesn't stop hit-testing: once faded out, this fixed
  // full-width strip would keep swallowing clicks and text selection at the
  // bottom of every page.
  const ctaPointerEvents = useTransform(opacity, (v) => (v < 0.05 ? 'none' : 'auto'));

  return (
    <div className="min-h-svh bg-white">
      <StickyHeader />

      <main>
        {/* Hero — full-viewport logo section */}
        <section className="min-h-svh flex flex-col items-center justify-center relative">
          <Logo />

          {/* Scroll CTA — parallaxes away on scroll */}
          <motion.div
            className="fixed bottom-8 w-full flex justify-center cursor-pointer"
            style={{ y: parallaxY, opacity, pointerEvents: ctaPointerEvents }}
            onClick={() => scrollToSection('about')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="text-center">
              <p className="text-xs uppercase tracking-widest text-gray-600 mb-1">
                SCROLL TO
              </p>
              <p className="text-sm font-medium" style={{ color: COLORS.accent }}>
                EXPLORE
              </p>
            </div>
          </motion.div>
        </section>

        <Bumper number="01" sectionHeader="ABOUT" id="about" />

        <section id="experience">
          <Bio />
          <Experience />
        </section>

        <Bumper number="02" sectionHeader="PROJECTS" id="projects" />

        <section>
          <Projects />
        </section>
      </main>

      {/* Outside <main> so it lands in the contentinfo landmark — Footer
          renders a real <footer> element. */}
      <section id="footer">
        <Footer />
      </section>
    </div>
  );
}