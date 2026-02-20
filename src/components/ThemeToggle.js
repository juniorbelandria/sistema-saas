'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-14 h-7 rounded-full bg-default-200 animate-pulse" />
    );
  }

  const isDark = theme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={`relative inline-flex items-center w-14 h-7 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
        isDark 
          ? 'bg-gradient-to-r from-slate-700 to-slate-800' 
          : 'bg-gradient-to-r from-sky-400 to-blue-500'
      }`}
      aria-label="Toggle theme"
    >
      <span
        className={`inline-block w-6 h-6 transform transition-transform duration-300 ease-in-out rounded-full bg-white shadow-lg flex items-center justify-center ${
          isDark ? 'translate-x-7' : 'translate-x-0.5'
        }`}
      >
        {isDark ? (
          <Moon className="w-4 h-4 text-slate-700" />
        ) : (
          <Sun className="w-4 h-4 text-sky-500" />
        )}
      </span>
    </button>
  );
}
