'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

// import { useAuth } from '@/contexts/AuthContext';
// import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { LoginForm } from '@/components/auth/LoginForm';

const Navbar: React.FC = () => {
  // const { user, logout } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 bg-[#0E0C2E] shadow-lg z-50">
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
                className="h-12 w-auto cursor-pointer"
              />
              <span className="text-white font-bold text-xl hidden sm:block">
                Costa Rica Kart Championship
              </span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:text-blue-400 focus:outline-none"
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
          <div className="hidden sm:flex items-center space-x-8">
            <Link
              href="/"
              className={`text-white hover:text-blue-400 transition-colors ${isActive('/campeonato') ? 'text-blue-400' : ''
                }`}
            >
              Campeonato
            </Link>
            <Link
              href="/faq"
              className={`text-white hover:text-blue-400 transition-colors ${isActive('/faq') ? 'text-blue-400' : ''
                }`}
            >
              FAQ
            </Link>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div
          className={`${isMenuOpen ? 'block' : 'hidden'
            } sm:hidden pb-4 space-y-2`}
        >
          <Link
            href="/"
            className={`block px-3 py-2 rounded-md text-white hover:text-blue-400 hover:bg-[#1A1942] transition-colors ${isActive('/campeonato') ? 'text-blue-400 bg-[#1A1942]' : ''
              }`}
            onClick={() => setIsMenuOpen(false)}
          >
            Campeonato
          </Link>
          <Link
            href="/faq"
            className={`block px-3 py-2 rounded-md text-white hover:text-blue-400 hover:bg-[#1A1942] transition-colors ${isActive('/faq') ? 'text-blue-400 bg-[#1A1942]' : ''
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
    </nav>
  );
};

export default Navbar;
