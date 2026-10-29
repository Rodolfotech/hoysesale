import type { ReactNode } from 'react';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      <div className="flex flex-col min-h-screen">
        {children}
        <Footer />
      </div>
    </>
  );
}
