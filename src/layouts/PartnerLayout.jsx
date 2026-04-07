import React from 'react';
import { Outlet } from 'react-router-dom';

const PartnerLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <header className="bg-white shadow-sm relative z-10 w-full px-4 text-center items-center flex justify-center py-4 border-b border-gray-200">
          <h1 className="text-xl md:text-2xl font-black text-gray-800 tracking-tight flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-box text-blue-600"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
            신일상재 <span className="text-blue-600 font-extrabold text-base md:text-xl">스마트 재고관리</span>
          </h1>
      </header>
      <main className="flex-grow w-full max-w-[1600px] mx-auto p-2 sm:p-4 md:p-6 pb-20">
        <Outlet />
      </main>
      <footer className="w-full bg-white text-gray-400 text-xs py-8 text-center border-t border-gray-200">
        <p>&copy; {new Date().getFullYear()} Shinil Sangjae Smart Inventory. All rights reserved.</p>
        <p className="mt-1 opacity-50">Powered by Supply Chain Solutions</p>
      </footer>
    </div>
  );
};

export default PartnerLayout;
