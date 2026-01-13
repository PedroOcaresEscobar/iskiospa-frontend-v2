import { Footer } from '@/components/navigations/Footer';
import { Navbar } from '@/components/navigations/Navbar';
import React, { Children, type ReactNode } from 'react';
import { Outlet } from 'react-router-dom';



export const MainLayout = () => {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="sticky top-0 z-50 w-full">
          <Navbar />
        </header>
  
        <main className="flex-1 w-full">
          <div className="w-full  2xl:w-[80vw] 2xl:px-0 2xl:mx-auto">
            <Outlet />
          </div>
        </main>
  
        <div className="mt-auto w-full">
          <Footer />
        </div>
      </div>
    );
}