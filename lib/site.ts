/**
 * Site-wide settings. Edit this file to change the lab's name, links and
 * operator details — nothing else hardcodes them.
 */
export const SITE = {
  name: "MiGaKu Labs",
  shortName: "MiGaKu",
  tagline: "An independent lab for practical AI tools.",
  description:
    "MiGaKu Labs designs, tests and ships practical AI instruments. First off the bench: Prompt Forge, a seven-model prompt optimizer and polisher.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://migakulabs.vercel.app",
  founded: "2026",
  /** Shown on the About page. Write it in your own words. */
  operator: {
    role: "Founder & operator",
    bio: "I build small, sharp AI tools that I actually use every day, then open them up so other people can use them too. Every instrument here starts as a problem I had, gets rebuilt until it is genuinely useful, and only then goes live.",
  },
  links: {
    github: "https://github.com/Captainkoala72",
    source: "https://github.com/Captainkoala72/migakulabs",
  },
} as const;

export const NAV = [
  { href: "/forge", label: "Prompt Forge", code: "01" },
  { href: "/lab", label: "Lab", code: "02" },
  { href: "/about", label: "About", code: "03" },
] as const;
