import Link from "next/link";
import Image from "next/image";

const NAV_SECTIONS = [
  {
    title: "Campeonato",
    links: [
      { href: "/Campeonato", label: "Tablas" },
      { href: "/campeones", label: "Campeones" },
      { href: "/estadisticas", label: "Estadísticas" },
      { href: "/eventos", label: "Eventos" },
    ],
  },
  {
    title: "Paddock",
    links: [
      { href: "/equipos", label: "Equipos" },
      { href: "/en-vivo", label: "En vivo", live: true },
      { href: "/transmisiones", label: "Transmisiones" },
      { href: "/galeria", label: "Galería" },
      { href: "/inscribir", label: "Inscribirme" },
    ],
  },
  {
    title: "Info",
    links: [
      { href: "/noticias", label: "Noticias" },
      { href: "/faq", label: "FAQ" },
      { href: "/reglamento", label: "Reglamento" },
      { href: "/contacto", label: "Contacto" },
    ],
  },
];

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-[var(--line)] bg-[#080B16]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_2fr]">
          {/* Marca */}
          <div>
            <Link href="/" className="inline-flex items-center gap-3">
              <Image
                src="/logos/acek.png"
                alt="ACEK"
                width={48}
                height={48}
                className="h-11 w-auto"
              />
              <span className="font-display text-base font-black uppercase leading-none tracking-tight text-white">
                Costa Rica <span className="text-[#4C8DFF]">Kart</span>
                <br />
                Championship
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-[var(--text-dim)]">
              El sitio oficial del CRKC: posiciones, inscripciones y
              transmisiones del karting nacional.
            </p>

            {/* Redes sociales ACEK */}
            <div className="mt-5 flex items-center gap-3">
              <a
                href="https://www.youtube.com/channel/UC6yXqyJ5ms7XfxaIpgZ0TFg"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="ACEK en YouTube"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--line)] text-[var(--text-dim)] transition-colors hover:border-[#4C8DFF]/60 hover:text-white"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                  <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.5 31.5 0 0 0 0 12a31.5 31.5 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.5 31.5 0 0 0 24 12a31.5 31.5 0 0 0-.5-5.8zM9.6 15.6V8.4l6.2 3.6-6.2 3.6z" />
                </svg>
              </a>
              <a
                href="https://www.instagram.com/acekeskartismo/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="ACEK en Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--line)] text-[var(--text-dim)] transition-colors hover:border-[#4C8DFF]/60 hover:text-white"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="2" aria-hidden="true">
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                </svg>
              </a>
              <a
                href="https://www.facebook.com/ACEKCR/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="ACEK en Facebook"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--line)] text-[var(--text-dim)] transition-colors hover:border-[#4C8DFF]/60 hover:text-white"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                  <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.79-4.7 4.53-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.89v2.26h3.32l-.53 3.49h-2.79V24C19.61 23.1 24 18.1 24 12.07z" />
                </svg>
              </a>
            </div>

            <a
              href="https://www.youtube.com/@teleredtelevision5270"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--text-dim)] transition-colors hover:text-white"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
                <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.5 31.5 0 0 0 0 12a31.5 31.5 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.5 31.5 0 0 0 24 12a31.5 31.5 0 0 0-.5-5.8zM9.6 15.6V8.4l6.2 3.6-6.2 3.6z" />
              </svg>
              Telered en YouTube
            </a>
          </div>

          {/* Links */}
          <nav
            aria-label="Footer"
            className="grid grid-cols-2 gap-8 sm:grid-cols-3"
          >
            {NAV_SECTIONS.map((section) => (
              <div key={section.title}>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-dim)]">
                  {section.title}
                </p>
                <ul className="mt-3 space-y-2">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-[#9BA3BD] transition-colors hover:text-white"
                      >
                        {"live" in link && link.live ? (
                          <span
                            className="inline-block h-1.5 w-1.5 rounded-full bg-red-500"
                            aria-hidden="true"
                          />
                        ) : null}
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-2 border-t border-[var(--line)] pt-6 sm:flex-row sm:items-center">
          <p className="text-xs text-[var(--text-dim)]">
            © {year} ACEK — Asociación de Corredores de Kartismo
          </p>
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--text-dim)]">
            Pista · Puntos · Pasión
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
