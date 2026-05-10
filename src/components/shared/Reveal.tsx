"use client";

import { useEffect } from "react";

/**
 * Adds `.reveal` class to all `.section` elements once mounted, then attaches
 * an IntersectionObserver that flips them to `.in` when scrolled into view.
 * Hero gets a separate `hero-anim` class right after mount for the staggered
 * entrance animation.
 */
export function Reveal() {
  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>(".section");
    sections.forEach((el) => el.classList.add("reveal"));
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.08 },
    );
    sections.forEach((el) => io.observe(el));

    const hero = document.querySelector(".hero");
    if (hero) {
      requestAnimationFrame(() =>
        setTimeout(() => hero.classList.add("hero-anim"), 60),
      );
    }

    return () => io.disconnect();
  }, []);
  return null;
}
