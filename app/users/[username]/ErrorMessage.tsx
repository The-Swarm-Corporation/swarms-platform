'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export default function ErrorMessage() {
  const router = useRouter();

  const handleGoBack = () => {
    try {
      router.back();
    } catch (error) {
      // Fallback to home if back navigation fails
      router.push('/');
    }
  };

  const handleGoHome = () => {
    try {
      router.push('/');
    } catch (error) {
      // If push fails, try replace
      router.replace('/');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black relative overflow-hidden">
      {/* Animated background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,0,0,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,0,0,0.1)_1px,transparent_1px)] bg-[size:20px_20px] [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black_70%)]" />
      
      {/* Glowing orb effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-transparent to-transparent animate-pulse" />
      
      <div className="relative mb-8">
        <div className="absolute inset-0 blur-2xl opacity-40 animate-pulse bg-gradient-to-tr from-red-600 via-red-500 to-red-400 rounded-full w-48 h-48" />
        <div className="relative flex items-center justify-center w-48 h-48">
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
            <circle cx="60" cy="60" r="55" stroke="#ff0000" strokeWidth="4" opacity="0.4" />
            <text x="50%" y="54%" textAnchor="middle" fill="#ff0000" fontSize="48" fontWeight="bold" dy=".3em" opacity="0.8">?</text>
          </svg>
        </div>
      </div>
      
      <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 drop-shadow-[0_0_8px_rgba(255,0,0,0.5)] relative">
        <span className="relative z-10">User Not Found</span>
        <span className="absolute inset-0 blur-sm text-red-500/50">User Not Found</span>
      </h1>
      
      <p className="text-lg text-red-200/80 mb-8 max-w-md text-center font-light tracking-wide">
        Sorry, the user you are looking for does not exist or has not published their profile yet.
      </p>
      
      <div className="flex gap-4">
        <button
          type="button"
          onClick={handleGoBack}
          className="px-6 py-2 rounded-lg bg-gradient-to-r from-red-900 to-red-700 text-white font-semibold shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 border border-red-500/30 hover:border-red-500/50 hover:shadow-red-500/20 hover:shadow-lg cursor-pointer select-none"
        >
          Go Back
        </button>
        <button
          type="button"
          onClick={handleGoHome}
          className="px-6 py-2 rounded-lg bg-gradient-to-r from-red-800 to-red-600 text-white font-semibold shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 border border-red-500/30 hover:border-red-500/50 hover:shadow-red-500/20 hover:shadow-lg cursor-pointer select-none"
        >
          Home
        </button>
      </div>
    </div>
  );
} 