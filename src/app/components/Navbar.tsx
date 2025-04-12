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
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 bg-[#0E0C2E] shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left side: Logo and Season Dropdown */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3">
              <Image
                src="/logos/acek.png"
                alt="Logo"
                width={50}
                height={50}
                className="h-12 w-auto cursor-pointer"
              />
              <span className="text-white font-bold text-xl">
                CR Kart Championship
              </span>
            </Link>
          </div>

          {/* Right side: Navigation Links */}
          <div className="flex items-center space-x-8">
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
