import type { Metadata } from 'next';
import { Archivo, Geist, Geist_Mono, Inter } from 'next/font/google';
import './globals.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { AuthProvider } from '@/contexts/AuthContext';
import GoogleAnalytics from './components/GoogleAnalytics';

const archivo = Archivo({
  variable: '--font-archivo',
  subsets: ['latin'],
  display: 'swap',
});

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Inicio | Costa Rica Kart Championship',
  description: 'Costa Rica Kart Championship.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <head>
        <meta name="theme-color" content="#070A14" />
      </head>
      <body className={`${archivo.variable} ${geistSans.variable} ${geistMono.variable} ${inter.variable} antialiased min-h-screen flex flex-col`}>
        <GoogleAnalytics />
        <AuthProvider>
          <a href="#main-content" className="skip-link">Saltar al contenido</a>
          <Navbar />
          <main id="main-content" className="flex-grow">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
