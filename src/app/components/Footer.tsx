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
      { href: "/inscribir", label: "Inscribirme" },
    ],
  },
  {
    title: "Info",
    links: [
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
            <a
              href="https://www.youtube.com/@teleredtelevision5270"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--text-dim)] transition-colors hover:text-white"
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
