"use client";

import React, { useState } from 'react';
import { X, Copy, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { siteConfig, getGithubNewIssueUrl } from '@/lib/config';
import type { Lean } from '@/lib/types';

interface SubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SubmitModal({ isOpen, onClose }: SubmitModalProps) {
  const [form, setForm] = useState({
    url: '',
    title: '',
    source: '',
    lean: 'Center' as Lean,
    category: 'Politics',
    note: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.url) {
      toast.error('Please provide at least a URL');
      return;
    }

    setIsSubmitting(true);

    const snippet = `{
  title: "${form.title || 'Add title here'}",
  url: "${form.url}",
  source: "${form.source || 'Source name'}",
  lean: "${form.lean}",
  category: "${form.category}",
  publishedAt: "${new Date().toISOString()}",
  summary: "${form.note || ''}",
}`;

    const issueTitle = `New link suggestion: ${form.title || form.url.slice(0, 60)}`;
    const issueBody = `**Suggested via the website**

**URL:** ${form.url}
**Source:** ${form.source || '—'}
**Lean:** ${form.lean}
**Category:** ${form.category}

**Why it matters:**
${form.note || '_(add context here)_'}

---

**Ready-to-paste object for curated.ts:**
\`\`\`ts
${snippet}
\`\`\`

Please review and either:
- Add to \`lib/curated.ts\` (permanent highlight), or
- Star / close if it's already well covered in the live feeds.
`;

    try {
      await navigator.clipboard.writeText(snippet);
      const githubUrl = getGithubNewIssueUrl(issueTitle, issueBody);
      window.open(githubUrl, '_blank', 'noopener,noreferrer');

      toast.success('Copied snippet! Opening GitHub issue...');

      // Reset + close after short delay
      setTimeout(() => {
        setForm({ url: '', title: '', source: '', lean: 'Center', category: 'Politics', note: '' });
        onClose();
        setIsSubmitting(false);
      }, 1200);
    } catch (err) {
      toast.error('Clipboard failed — you can still open GitHub manually');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div 
        className="modal w-full max-w-lg sm:mx-0 bg-[#1E2937] border border-[#334155] rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[92dvh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-[#334155]">
          <div>
            <div className="font-semibold text-lg tracking-tight">Suggest a Link</div>
            <div className="text-xs text-[#64748B]">Help us surface important stories</div>
          </div>
          <button onClick={onClose} className="p-1 text-[#94A3B8] hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
          <div>
            <label className="block text-xs font-semibold tracking-wider text-[#94A3B8] mb-1.5">URL *</label>
            <input
              type="url"
              required
              placeholder="https://..."
              className="form-input"
              value={form.url}
              onChange={(e) => handleChange('url', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold tracking-wider text-[#94A3B8] mb-1.5">Title (optional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="Short headline"
                value={form.title}
                onChange={(e) => handleChange('title', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold tracking-wider text-[#94A3B8] mb-1.5">Source</label>
              <input
                type="text"
                className="form-input"
                placeholder="Fox News, NPR, Reuters..."
                value={form.source}
                onChange={(e) => handleChange('source', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold tracking-wider text-[#94A3B8] mb-1.5">Viewpoint Lean</label>
              <select
                className="form-input"
                value={form.lean}
                onChange={(e) => handleChange('lean', e.target.value)}
              >
                <option value="Left">Left-leaning</option>
                <option value="Center">Center / Neutral</option>
                <option value="Right">Right-leaning</option>
                <option value="Wire">Wire Service</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold tracking-wider text-[#94A3B8] mb-1.5">Category</label>
              <select
                className="form-input"
                value={form.category}
                onChange={(e) => handleChange('category', e.target.value)}
              >
                <option>Politics</option>
                <option>Elections</option>
                <option>Economy</option>
                <option>World</option>
                <option>Courts</option>
                <option>Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold tracking-wider text-[#94A3B8] mb-1.5">Why does this matter? (optional)</label>
            <textarea
              rows={3}
              className="form-input resize-y"
              placeholder="Quick context for the editorial team..."
              value={form.note}
              onChange={(e) => handleChange('note', e.target.value)}
            />
          </div>

          <div className="pt-2 text-[12px] text-[#64748B]">
            This will copy a ready-to-paste snippet and open a pre-filled GitHub issue on our repo.
            We review every submission.
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !form.url}
              className="btn-primary flex-1 disabled:opacity-60"
            >
              {isSubmitting ? 'Opening GitHub...' : 'Copy & Open GitHub Issue'}
            </button>
          </div>
        </form>

        <div className="bg-[#0F172A] px-6 py-3 text-center text-[11px] text-[#475569]">
          Thank you for helping keep the feed high-signal and balanced.
        </div>
      </div>
    </div>
  );
}
