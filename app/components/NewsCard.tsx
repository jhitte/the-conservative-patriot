"use client";

import React from 'react';
import { ExternalLink, Copy, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import type { NewsItem } from '@/lib/types';

interface NewsCardProps {
  item: NewsItem;
}

const leanBadgeClass: Record<string, string> = {
  Left: 'badge-left',
  Center: 'badge-center',
  Right: 'badge-right',
  Wire: 'badge-wire',
};

export default function NewsCard({ item }: NewsCardProps) {
  const timeAgo = formatDistanceToNow(new Date(item.publishedAt), { addSuffix: true });
  const isVeryRecent = Date.now() - new Date(item.publishedAt).getTime() < 1000 * 60 * 45; // < 45 min

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(item.url);
      toast.success('Link copied to clipboard');
    } catch {
      toast.error('Could not copy link');
    }
  };

  const handleOpen = () => {
    window.open(item.url, '_blank', 'noopener,noreferrer');
  };



  const handleNativeShare = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (navigator.share) {
      try {
        await navigator.share({
          title: item.title,
          text: `From The Conservative Patriot`,
          url: item.url,
        });
      } catch (error) {
        // User cancelled or error
      }
    } else {
      // Fallback to copy
      handleCopy(e);
    }
  };

  return (
    <div 
      className="news-card group flex h-[118px] md:h-auto md:flex-col overflow-hidden cursor-pointer active:bg-[#1E2937] md:active:bg-transparent"
      onClick={handleOpen}
    >
      {/* Thumbnail */}
      <div className="relative w-[95px] md:w-full h-full md:aspect-video bg-[#0F172A] overflow-hidden flex-shrink-0">
        {item.image ? (
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/images/placeholder-news-card.jpg';
            }}
          />
        ) : (
          <img
            src="/images/placeholder-news-card.jpg"
            alt="The Conservative Patriot"
            className="w-full h-full object-cover opacity-80"
          />
        )}
      </div>

      {/* Content */}
      <div className="p-3 md:p-5 flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Meta */}
        <div className="flex items-center justify-between gap-2 mb-1 text-[10px] md:text-xs">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className={`badge ${leanBadgeClass[item.lean]} text-[9px] md:text-[10px]`}>
              {item.lean}
            </span>
            <span className="font-semibold text-[#CBD5E1] truncate text-[10px] md:text-xs">{item.source}</span>
          </div>
          <div className="meta flex items-center gap-1 text-[9px] md:text-[10px] flex-shrink-0">
            <Clock className="w-2.5 h-2.5 md:w-3 md:h-3" />
            {timeAgo}
          </div>
        </div>

        {/* Title */}
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="font-semibold text-[13px] md:text-[15px] leading-tight tracking-[-0.01em] hover:text-[#5EEAD4] transition-colors line-clamp-3 md:line-clamp-2 mb-1 flex-1"
        >
          {item.title}
        </a>

        {/* Summary only on desktop */}
        {item.summary && (
          <p className="hidden md:block text-[12.5px] text-[#94A3B8] leading-snug line-clamp-2">
            {item.summary}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="hidden md:flex px-4 md:px-5 pb-3 pt-2.5 border-t border-[#334155] items-center justify-between gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleOpen();
          }}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#14B8A6] hover:text-[#5EEAD4] transition-colors py-1 px-1 -ml-1"
        >
          Read full story <ExternalLink className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-center gap-1">
          {/* X.com Share */}
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`${item.title} via The Conservative Patriot`)}&url=${encodeURIComponent(item.url)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="p-2 sm:p-1.5 rounded-lg hover:bg-[#334155] transition-colors active:bg-[#334155] flex items-center justify-center"
            aria-label="Share on X"
            title="Share on X"
          >
            <img 
              src="/icons/x-share-button.png" 
              alt="Share on X" 
              className="w-5 h-5 object-contain" 
            />
          </a>

          {/* Copy Link */}
          <button
            onClick={handleCopy}
            className="p-2.5 sm:p-2 rounded-full hover:bg-[#334155] text-[#64748B] hover:text-[#CBD5E1] transition-colors active:bg-[#334155]"
            aria-label="Copy link"
            title="Copy link"
          >
            <Copy className="w-4 h-4" />
          </button>

          {isVeryRecent && (
            <span className="text-[10px] font-bold tracking-[1px] px-2 py-px rounded bg-[#14B8A6]/10 text-[#14B8A6]">
              BREAKING
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
