'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// import { useAuth } from '@/contexts/AuthContext';
// import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { LoginForm } from '@/components/auth/LoginForm';

const Navbar: React.FC = () => {
  // const { user, logout } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 bg-gray-800 shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left side: Logo and Season Dropdown */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3">
              <Image
                src="/logos/acek.webp"
                alt="Logo"
                width={50}
                height={50}
                className="h-12 w-auto cursor-pointer"
              />
              <span className="text-white font-bold text-xl">
                Costa Rica Kart Championship
              </span>
            </Link>
          </div>

          {/* Right side: Authentication */}
          {/* <div className="flex items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-300">{user.email}</span>
                <Button
                  onClick={logout}
                  variant="secondary"
                  size="sm"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => setShowLoginModal(true)}
                variant="primary"
                size="sm"
              >
                Login
              </Button>
            )}
          </div> */}
        </div>
      </div>

      <Modal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        title="Login"
      >
        <LoginForm onSuccess={() => setShowLoginModal(false)} />
      </Modal>
    </nav>
  );
};

export default Navbar;
