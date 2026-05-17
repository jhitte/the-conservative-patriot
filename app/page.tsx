"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Search, Send, ExternalLink } from 'lucide-react';
import Navbar from './components/Navbar';
import NewsCard from './components/NewsCard';
import SubmitModal from './components/SubmitModal';
import type { NewsItem, Lean } from '@/lib/types';
import { siteConfig } from '@/lib/config';
import { categoryKeywords } from '@/lib/feeds';
import { formatDistanceToNow } from 'date-fns';

type ViewpointFilter = 'All' | Lean;
type TimeFilter = 'All' | '1h' | '6h' | '24h';

const CATEGORIES = ['All', 'Politics', 'Elections', 'Economy', 'World', 'Courts'] as const;

export default function TheConservativePatriot() {
  const [liveItems, setLiveItems] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [viewpoint, setViewpoint] = useState<ViewpointFilter>('All');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('All');
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>('All');

  // Modal
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);

  // Fetch live feeds
  const fetchLive = async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    setError(null);

    try {
      const res = await fetch('/api/live', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to load feeds');

      const data = await res.json();
      setLiveItems(data.items || []);
      const updated = data.meta?.lastUpdated ? formatDistanceToNow(new Date(data.meta.lastUpdated), { addSuffix: true }) : 'just now';
      setLastUpdated(`Updated ${updated}`);
    } catch (e: any) {
      setError(e.message || 'Could not load live feeds. Showing curated only.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLive();
    // Auto-refresh every 6 minutes while tab is visible
    const interval = setInterval(() => {
      if (!document.hidden) fetchLive();
    }, 1000 * 60 * 6);
    return () => clearInterval(interval);
  }, []);

  // Filtered + sorted live items
  const filteredItems = useMemo(() => {
    let result = [...liveItems];

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.source.toLowerCase().includes(q) ||
          (i.summary && i.summary.toLowerCase().includes(q))
      );
    }

    // Viewpoint
    if (viewpoint !== 'All') {
      result = result.filter((i) => i.lean === viewpoint);
    }

    // Time
    const now = Date.now();
    if (timeFilter !== 'All') {
      const cutoff =
        timeFilter === '1h' ? 60 * 60 * 1000 :
        timeFilter === '6h' ? 6 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
      result = result.filter((i) => now - new Date(i.publishedAt).getTime() < cutoff);
    }

    // Category filtering - now actually works for all categories
    if (category !== 'All') {
      const keywords = categoryKeywords[category] || [];
      if (keywords.length > 0) {
        result = result.filter(item => {
          const text = `${item.title} ${item.summary || ''}`.toLowerCase();
          return keywords.some(k => text.includes(k));
        });
      }
    }

    return result.slice(0, 60);
  }, [liveItems, searchQuery, viewpoint, timeFilter, category]);

  const handleRefresh = () => fetchLive(true);

  const clearFilters = () => {
    setSearchQuery('');
    setViewpoint('All');
    setTimeFilter('All');
    setCategory('All');
  };

  const activeFilterCount = [viewpoint !== 'All', timeFilter !== 'All', category !== 'All', !!searchQuery].filter(Boolean).length;

  return (
    <>
      <Navbar 
        onRefresh={handleRefresh} 
        lastUpdated={lastUpdated} 
        isRefreshing={isRefreshing} 
      />

      {/* HERO with patriotic background */}
      <section id="hero" className="relative pt-28 sm:pt-24 pb-14 border-b border-[#334155] overflow-hidden">
        {/* Hero Background Image - stronger patriotic presence */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/hero-patriotic.jpg" 
            alt="American flag and Constitution" 
            className="w-full h-full object-cover opacity-72"
            style={{ objectPosition: 'center 40%' }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0F172A]/48 via-[#0F172A]/55 to-[#0F172A]" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          {/* "We the People" overlay - top left, elegant and subtle */}
          <div className="absolute top-4 left-6 md:top-6 md:left-8 text-left z-20">
            <p className="font-serif text-lg md:text-xl text-white/90 tracking-[1.5px] drop-shadow-md">
              We the People
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-black/40 backdrop-blur border border-white/30 text-white text-xs font-bold tracking-[2px] mb-5">
            LIVE • CONSERVATIVE FIRST • BALANCED SOURCES
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[64px] leading-none font-semibold tracking-[-3px] sm:tracking-[-3.2px] mb-4 text-white drop-shadow-[0_4px_16px_rgb(0,0,0,0.75)]">
            The Conservative Patriot
          </h1>
          <p className="max-w-xl mx-auto text-2xl tracking-tight text-[#E0E7FF] drop-shadow-[0_2px_10px_rgb(0,0,0,0.6)] mb-8">
            {siteConfig.tagline}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
            <button 
              onClick={() => document.getElementById('live')?.scrollIntoView({ behavior: 'smooth' })}
              className="btn-primary text-base px-9 py-3.5 w-full sm:w-auto"
            >
              See Live Wires
            </button>
            <button 
              onClick={() => setIsSubmitOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-white bg-white/10 px-9 py-3.5 text-base font-semibold text-white hover:bg-white hover:text-[#0F172A] transition-all w-full sm:w-auto backdrop-blur"
            >
              <Send className="w-4 h-4" /> Suggest a Story
            </button>
          </div>

          <div className="mt-6 text-xs text-[#CBD5E1]/80">
            Conservative-first • Includes Breitbart, Fox, National Review, X accounts + liberal sources for balance
          </div>
        </div>
      </section>

      {/* LIVE WIRES */}
      <section id="live" className="max-w-7xl mx-auto px-6 pt-10 pb-16 scroll-mt-16">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
          <div>
            <div className="uppercase tracking-[2px] text-xs font-semibold text-[#14B8A6] mb-1">LIVE FROM THE WIRES • CONSERVATIVE FIRST</div>
            <h2 className="section-title">Live Wires</h2>
          </div>
          <div className="text-sm text-[#94A3B8]">
            {filteredItems.length} stories • Auto-refreshes every few minutes
          </div>
        </div>

        {/* Search + Filters */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-[#64748B]" />
            <input
              type="text"
              placeholder="Search headlines, sources, or keywords..."
              className="form-input pl-11 text-base h-12"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filter rows - horizontal scroll on mobile for better UX */}
          <div className="space-y-3">
            {/* Viewpoint + Time filters - scrollable on mobile */}
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory">
              <div className="flex gap-2 flex-nowrap">
                {/* Viewpoint */}
                {(['All', 'Left', 'Center', 'Right', 'Wire'] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => setViewpoint(v)}
                    className={`filter-pill snap-start ${viewpoint === v ? 'active' : ''}`}
                  >
                    {v}
                  </button>
                ))}

                <div className="w-px h-6 bg-[#334155] mx-1 self-center flex-shrink-0" />

                {/* Time */}
                {(['All', '1h', '6h', '24h'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTimeFilter(t)}
                    className={`filter-pill snap-start ${timeFilter === t ? 'active' : ''}`}
                  >
                    {t === 'All' ? 'All time' : `Last ${t}`}
                  </button>
                ))}

                {activeFilterCount > 0 && (
                  <button 
                    onClick={clearFilters} 
                    className="filter-pill text-[#F87171] border-[#F87171]/40 snap-start flex-shrink-0"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Category pills - also scrollable */}
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 snap-x snap-mandatory">
              <div className="flex gap-2 flex-nowrap">
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCategory(c)}
                    className={`filter-pill snap-start ${category === c ? 'active' : ''}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card h-44 animate-pulse bg-[#1E2937]" />
            ))}
          </div>
        ) : error && liveItems.length === 0 ? (
          <div className="card p-8 text-center text-[#94A3B8]">
            {error}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="card p-10 text-center">
            <p className="text-lg mb-2">No stories match your current filters.</p>
            <button onClick={clearFilters} className="text-[#14B8A6] hover:underline">Clear all filters</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((item) => (
              <NewsCard key={item.id} item={item} />
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <button onClick={() => setIsSubmitOpen(true)} className="btn-accent text-sm px-6 py-2.5">
            Don’t see an important story? Suggest it →
          </button>
        </div>

        <div className="disclaimer mt-8 max-w-3xl mx-auto text-center">
          Live Wires are pulled automatically from public RSS feeds of the listed outlets. 
          We do not host, edit, or endorse the content. Source and viewpoint are shown clearly for transparency.
        </div>
      </section>

      {/* HIGHLIGHTS / CURATED */}
      <section id="highlights" className="bg-[#1E2937] py-12 border-y border-[#334155] scroll-mt-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-6">
            <div>
              <div className="uppercase tracking-[2px] text-xs font-semibold text-[#14B8A6] mb-1">EDITOR’S PICKS</div>
              <h2 className="section-title">Curated Highlights</h2>
            </div>
            <div className="hidden md:block text-sm text-[#94A3B8]">Hand-selected context and analysis</div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Placeholder curated cards until you add real ones in lib/curated.ts */}
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="badge badge-center">CENTER</span>
                <span className="text-sm font-semibold">RealClearPolitics</span>
              </div>
              <a href="https://www.realclearpolitics.com" target="_blank" className="font-semibold text-lg leading-tight hover:text-[#5EEAD4] block mb-2">
                Inside the 2026 Midterm Map: Where the Real Battle for the House Is Happening
              </a>
              <p className="text-sm text-[#94A3B8]">District-level fundraising, polling averages, and early indicators for control of the House in the final two years of the administration.</p>
              <div className="mt-4 text-xs text-[#64748B]">Added manually • High signal</div>
            </div>
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="badge badge-wire">WIRE</span>
                <span className="text-sm font-semibold">Associated Press</span>
              </div>
              <a href="https://apnews.com" target="_blank" className="font-semibold text-lg leading-tight hover:text-[#5EEAD4] block mb-2">
                How the Latest Tariff Round Is Playing Out for Manufacturers and Consumers
              </a>
              <p className="text-sm text-[#94A3B8]">Clean data-driven look at price effects, supply chain shifts, and which states are most exposed.</p>
              <div className="mt-4 text-xs text-[#64748B]">Added manually • High signal</div>
            </div>
          </div>

          <div className="text-center mt-6 text-xs text-[#64748B]">
            Want your favorite analysis piece here permanently? Use the Suggest button — we review every submission.
          </div>
        </div>
      </section>

      {/* SUBMIT / ABOUT */}
      <section id="submit" className="max-w-4xl mx-auto px-6 py-16 text-center scroll-mt-16">
        <div className="max-w-xl mx-auto">
          <div className="uppercase tracking-[2px] text-xs font-semibold text-[#14B8A6] mb-3">COMMUNITY POWERED</div>
          <h2 className="section-title mb-4">Help us surface the stories that matter.</h2>
          <p className="text-lg text-[#CBD5E1] mb-8">
            The best tips come from readers. Submit a link and it goes straight to our GitHub for review. 
            High-signal suggestions often become permanent curated highlights.
          </p>

          <button 
            onClick={() => setIsSubmitOpen(true)} 
            className="btn-primary text-lg px-10 py-4"
          >
            Suggest a Breaking Story
          </button>

          <div className="mt-10 text-xs text-[#64748B] space-y-1">
            <div>Every submission creates a GitHub issue with a ready-to-paste code snippet.</div>
            <div>No login required. We moderate for quality and balance.</div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#334155] bg-[#0F172A] py-10 text-sm">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-y-8 text-[#94A3B8]">
          <div>
            <div className="font-semibold text-white tracking-tight mb-2">{siteConfig.name}</div>
            <div className="max-w-xs text-xs">High-quality US political and breaking news links, aggregated automatically from reputable sources across the political spectrum.</div>
          </div>
          <div className="md:text-right text-xs space-y-1">
            <div>Not affiliated with any political party or news outlet.</div>
            <div>We link to original sources — we do not host or produce the content.</div>
            <div className="pt-3 text-[#475569]">
              Built with Next.js &amp; deployed on Vercel •{' '}
              <a href="https://github.com/jhitte/the-conservative-patriot" target="_blank" className="hover:text-white underline underline-offset-2">Open source on GitHub</a>
            </div>
          </div>
        </div>
      </footer>

      <SubmitModal isOpen={isSubmitOpen} onClose={() => setIsSubmitOpen(false)} />
    </>
  );
}
