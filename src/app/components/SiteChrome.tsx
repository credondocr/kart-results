"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import FeedbackWidget from "./FeedbackWidget";

/**
 * Chrome del sitio público. En /admin* y /perfil se ocultan Navbar,
 * Footer y feedback: el admin tiene su shell y el perfil es una vista
 * enfocada (con enlace de vuelta propio).
 */
export default function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "";
  const bare = pathname.startsWith("/admin") || pathname.startsWith("/perfil");

  if (bare) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main id="main-content" className="flex-grow">{children}</main>
      <Footer />
      <FeedbackWidget />
    </>
  );
}

