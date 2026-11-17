import type { Metadata, Viewport } from "next";
import { Archivo, IBM_Plex_Mono } from "next/font/google";

import "./globals.css";
import "./home.css";
import "./forge/forge.css";
import { Cursor } from "@/components/fx/Cursor";
import { Hud } from "@/components/fx/Hud";
import { Preloader } from "@/components/fx/Preloader";
import { Scene } from "@/components/fx/Scene";
import { SmoothScroll } from "@/components/fx/SmoothScroll";
import { TransitionProvider } from "@/components/fx/Transition";
import { Footer } from "@/components/site/Footer";
import { Nav } from "@/components/site/Nav";
import { SITE } from "@/lib/site";

const sans = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-sans",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  openGraph: {
    type: "website",
    siteName: SITE.name,
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0b0b",
  colorScheme: "dark",
};

// Runs before first paint: skip the boot sequence on repeat visits this session.
const BOOT_SCRIPT = `try{if(sessionStorage.getItem("migaku.booted")){document.documentElement.dataset.skipIntro="true"}}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: BOOT_SCRIPT }} />
        <noscript>
          <style>{`.preloader{display:none!important}.reveal,.words .wi,.intro,.hl-in{opacity:1!important;transform:none!important}`}</style>
        </noscript>
      </head>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <Preloader />
        <SmoothScroll />
        <Scene />
        <TransitionProvider>
          <Nav />
          <main id="main">{children}</main>
          <Footer />
        </TransitionProvider>
        <Hud />
        <Cursor />
        <div className="grain" aria-hidden="true" />
      </body>
    </html>
  );
}
