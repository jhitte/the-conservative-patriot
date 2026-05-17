"use client";

import React, { useState } from 'react';
import { Menu, X, GitBranch, RefreshCw } from 'lucide-react';

interface NavbarProps {
  onRefresh?: () => void;
  lastUpdated?: string | null;
  isRefreshing?: boolean;
}

export default function Navbar({ onRefresh, lastUpdated, isRefreshing }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
    setIsOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0F172A]/95 backdrop-blur-lg border-b border-[#334155]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
        {/* Logo - more compact on mobile */}
        <a 
          href="#hero" 
          onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          className="flex items-center gap-2 sm:gap-3 group min-w-0"
        >
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            <span className="text-2xl sm:text-3xl" aria-label="American flag">🇺🇸</span>
            <div className="min-w-0">
              <div className="font-semibold text-lg sm:text-xl tracking-[-0.02em] text-white group-hover:text-[#14B8A6] transition-colors leading-none whitespace-nowrap">
                The Conservative Patriot
              </div>
              <div className="hidden sm:block text-[10px] text-[#64748B] -mt-0.5 tracking-[0.5px]">CONSERVATIVE FIRST • BALANCED</div>
            </div>
          </div>
        </a>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <button onClick={() => scrollTo('live')} className="nav-link">Live Wires</button>
          <button onClick={() => scrollTo('highlights')} className="nav-link">Highlights</button>
          <button onClick={() => scrollTo('submit')} className="nav-link">Suggest a Link</button>
          <a 
            href="https://github.com/jhitte/the-conservative-patriot" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-[#94A3B8] hover:text-[#14B8A6] transition-colors"
          >
            <GitBranch className="w-4 h-4" /> GitHub
          </a>
        </div>

        {/* Right side actions - hidden on mobile */}
        <div className="hidden md:flex items-center gap-3">
          {lastUpdated && (
            <div className="text-xs text-[#64748B] font-mono pr-2 border-r border-[#334155] whitespace-nowrap">
              {lastUpdated}
            </div>
          )}
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="btn-secondary text-sm px-4 py-1.5 flex items-center gap-2 disabled:opacity-60"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          )}
        </div>

        {/* Mobile */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 text-[#F1F5F9]"
          aria-label="Menu"
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="mobile-menu md:hidden border-t border-[#334155] bg-[#1E2937] px-6 py-6 flex flex-col gap-4 text-base">
          <button onClick={() => scrollTo('live')} className="text-left py-1">Live Wires</button>
          <button onClick={() => scrollTo('highlights')} className="text-left py-1">Highlights</button>
          <button onClick={() => scrollTo('submit')} className="text-left py-1">Suggest a Link</button>
          <div className="pt-3 border-t border-[#334155] flex flex-col gap-3">
            <a href="https://github.com/jhitte/the-conservative-patriot" target="_blank" rel="noopener" className="flex items-center gap-2 text-[#14B8A6]">
              <GitBranch className="w-4 h-4" /> View on GitHub
            </a>
            {onRefresh && (
              <button onClick={() => { onRefresh(); setIsOpen(false); }} className="btn-primary w-full justify-center">
                Refresh Live Feeds
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
