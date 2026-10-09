'use client';
import React, { useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

// import { useAuth } from '@/contexts/AuthContext';
// import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { LoginForm } from '@/components/auth/LoginForm';
import SearchPalette from './SearchPalette';

const SearchIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    aria-hidden="true"
  >
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

const Navbar: React.FC = () => {
  // const { user, logout } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchButtonRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  const closeSearch = () => {
    setSearchOpen(false);
    searchButtonRef.current?.focus();
  };

  const isActive = (path: string) =>
    path === "/"
      ? pathname === "/" || pathname.startsWith("/Campeonato")
      : pathname.startsWith(path);

  const linkClass = (path: string) =>
    `relative text-sm font-semibold uppercase tracking-[0.12em] transition-colors ${
      isActive(path) ? "text-white" : "text-[#9BA3BD] hover:text-white"
    }`;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0A0920]/85 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left side: Logo and Title */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3">
              <Image
                src="/logos/acek.png"
                alt="Logo"
                width={50}
                height={50}
                className="h-10 w-auto sm:h-12 cursor-pointer"
              />
              <span className="font-display font-black uppercase tracking-tight text-white text-base sm:text-lg md:text-xl leading-none">
                Costa Rica <span className="text-[#4C8DFF]">Kart</span> Championship
              </span>
            </Link>
          </div>

          {/* Mobile menu buttons */}
          <div className="flex items-center gap-4 sm:hidden">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="text-[#9BA3BD] hover:text-white"
              aria-label="Buscar"
            >
              <SearchIcon />
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:text-[#4C8DFF]"
              aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={isMenuOpen}
            >
              <svg
                className="h-6 w-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden sm:flex items-center gap-8">
            <Link href="/" className={linkClass("/")}>
              Campeonato
              {isActive("/") && (
                <span className="absolute -bottom-[21px] left-0 right-0 h-0.5 bg-[#4C8DFF]" />
              )}
            </Link>
            <Link href="/equipos" className={linkClass("/equipos")}>
              Equipos
              {isActive("/equipos") && (
                <span className="absolute -bottom-[21px] left-0 right-0 h-0.5 bg-[#4C8DFF]" />
              )}
            </Link>
            <Link href="/campeones" className={linkClass("/campeones")}>
              Campeones
              {isActive("/campeones") && (
                <span className="absolute -bottom-[21px] left-0 right-0 h-0.5 bg-[#4C8DFF]" />
              )}
            </Link>
            <Link href="/faq" className={linkClass("/faq")}>
              FAQ
              {isActive("/faq") && (
                <span className="absolute -bottom-[21px] left-0 right-0 h-0.5 bg-[#4C8DFF]" />
              )}
            </Link>
            <button
              ref={searchButtonRef}
              type="button"
              onClick={() => setSearchOpen(true)}
              className="search-trigger"
              aria-label="Buscar"
            >
              <SearchIcon />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div
          className={`${isMenuOpen ? 'block' : 'hidden'
            } sm:hidden pb-4 space-y-2`}
        >
          <Link
            href="/"
            className={`block px-3 py-2 rounded-md text-sm font-semibold uppercase tracking-wider transition-colors text-white hover:bg-white/5 ${isActive('/') ? 'bg-white/10' : ''
              }`}
            onClick={() => setIsMenuOpen(false)}
          >
            Campeonato
          </Link>
          <Link
            href="/equipos"
            className={`block px-3 py-2 rounded-md text-sm font-semibold uppercase tracking-wider transition-colors text-white hover:bg-white/5 ${isActive('/equipos') ? 'bg-white/10' : ''
              }`}
            onClick={() => setIsMenuOpen(false)}
          >
            Equipos
          </Link>
          <Link
            href="/campeones"
            className={`block px-3 py-2 rounded-md text-sm font-semibold uppercase tracking-wider transition-colors text-white hover:bg-white/5 ${isActive('/campeones') ? 'bg-white/10' : ''
              }`}
            onClick={() => setIsMenuOpen(false)}
          >
            Campeones
          </Link>
          <Link
            href="/faq"
            className={`block px-3 py-2 rounded-md text-sm font-semibold uppercase tracking-wider transition-colors text-white hover:bg-white/5 ${isActive('/faq') ? 'bg-white/10' : ''
              }`}
            onClick={() => setIsMenuOpen(false)}
          >
            FAQ
          </Link>
        </div>
      </div>

      {/* Login Modal */}
      <Modal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        title="Iniciar Sesión"
      >
        <LoginForm onSuccess={() => setShowLoginModal(false)} />
      </Modal>

      {searchOpen && <SearchPalette onClose={closeSearch} />}
    </nav>
  );
};

export default Navbar;
