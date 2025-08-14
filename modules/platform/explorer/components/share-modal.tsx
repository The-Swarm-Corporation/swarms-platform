import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Modal from '@/shared/components/modal';
import { ShareDetails, openShareWindow } from '@/shared/utils/helpers';
import { Button } from '@/shared/components/ui/button';
import { useToast } from '@/shared/components/ui/Toasts/use-toast';

interface ShareModalProps {
  link?: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ShareModal({ isOpen, onClose, link }: ShareModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [resolvedShareUrl, setResolvedShareUrl] = useState<string>(
    `https://swarms.world${link ?? ''}`
  );
  const toast = useToast();

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setIsVisible(true), 60);
      return () => clearTimeout(timer);
    }
    setIsVisible(false);
  }, [isOpen]);

  useEffect(() => {
    const fallbackUrl = `https://swarms.world${link ?? ''}`;
    if (!link && typeof window !== 'undefined') {
      setResolvedShareUrl(window.location.href);
    } else {
      setResolvedShareUrl(fallbackUrl);
    }
  }, [link]);

  const shareDetails: ShareDetails = useMemo(
    () => ({
      message: 'Check out this on the swarms platform!',
      link: resolvedShareUrl,
      subject: 'Check this out!',
    }),
    [resolvedShareUrl]
  );

  const handleCopy = useCallback(() => {
    const write = async () => {
      try {
        await navigator.clipboard.writeText(resolvedShareUrl);
        setCopied(true);
        toast.toast({ title: 'Link copied to clipboard' });
        setTimeout(() => setCopied(false), 1600);
      } catch (e) {
        // Fallback if clipboard API not available
        try {
          const textArea = document.createElement('textarea');
          textArea.value = resolvedShareUrl;
          textArea.style.position = 'fixed';
          textArea.style.left = '-9999px';
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
          setCopied(true);
          toast.toast({ title: 'Link copied to clipboard' });
          setTimeout(() => setCopied(false), 1600);
        } catch (err) {
          console.error(err);
        }
      }
    };
    void write();
  }, [resolvedShareUrl, toast]);

  const handleNativeShare = useCallback(async () => {
    if (typeof navigator !== 'undefined' && (navigator as any).share) {
      try {
        await (navigator as any).share({
          title: 'Swarms',
          text: 'Check this out on Swarms',
          url: resolvedShareUrl,
        });
      } catch (e) {
        // Ignore if user cancels
      }
    } else {
      handleCopy();
    }
  }, [resolvedShareUrl, handleCopy]);

  const platforms = [
    { id: 'twitter', icon: '/twitter.svg', label: 'Tweet', bg: 'bg-[aliceblue]' },
    { id: 'linkedin', icon: '/linkedin.svg', label: 'Post', bg: 'bg-[#d8d8d8]' },
    { id: 'facebook', icon: '/facebook.svg', label: 'Share', bg: 'bg-[#eceff5]' },
    { id: 'reddit', icon: '/reddit.svg', label: 'Submit', bg: 'bg-[#fdd9ce]' },
    { id: 'hackernews', icon: '/hackernews.svg', label: 'Post', bg: 'bg-[#f5f5f5]' },
    { id: 'email', icon: '/email.svg', label: 'Email', bg: 'bg-[#fdd9ce]' },
  ] as const;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Share"
      className={`w-full max-w-lg sm:max-w-xl md:max-w-2xl transition-all duration-300 ease-out ${
        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
      } border border-gray-200 dark:border-zinc-800 rounded-xl shadow-xl bg-white/70 dark:bg-zinc-950/70 backdrop-blur-md`}
    >
      <div onClick={(e) => e.stopPropagation()} className="w-full">
        <div className="px-5 pt-4">
          <h3 className="text-base md:text-lg font-semibold tracking-tight">Share this</h3>
          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Spread the word using your favorite platform, or copy the link.
          </p>
        </div>

        <div className="px-4 md:px-5 mt-4">
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {platforms.map((p) => (
              <button
                key={p.id}
                type="button"
                aria-label={`Share via ${p.label}`}
                onClick={() => openShareWindow(p.id as any, shareDetails)}
                className="group flex flex-col items-center gap-2 focus:outline-none"
              >
                <span
                  className={`inline-flex items-center justify-center ${p.bg} rounded-full h-12 w-12 sm:h-14 sm:w-14 ring-1 ring-black/5 dark:ring-white/10 shadow-sm transition-all duration-200 group-hover:shadow-md group-hover:-translate-y-0.5`}
                >
                  <Image src={p.icon} alt={p.label} width={24} height={24} />
                </span>
                <span className="text-[11px] sm:text-xs text-gray-700 dark:text-gray-300">
                  {p.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="px-4 md:px-5 mt-5">
          <div className="flex items-center justify-between gap-2 py-3 px-3 sm:px-4 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60">
            <div className="min-w-0 flex-1">
              <label htmlFor="share-url" className="sr-only">
                Share URL
              </label>
              <input
                id="share-url"
                type="text"
                readOnly
                value={resolvedShareUrl}
                className="bg-transparent w-full text-xs sm:text-sm md:text-base px-1 outline-none text-gray-800 dark:text-gray-100 truncate"
              />
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                onClick={handleCopy}
                className={`h-8 sm:h-9 px-3 text-xs sm:text-sm transition-colors ${
                  copied ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {copied ? 'Copied' : 'Copy'}
              </Button>
              <Button
                onClick={handleNativeShare}
                className="h-8 sm:h-9 px-3 text-xs sm:text-sm bg-gray-900 hover:bg-black dark:bg-zinc-800 dark:hover:bg-zinc-700"
              >
                Share
              </Button>
            </div>
          </div>
        </div>

        <div className="px-4 md:px-5 pb-4 mt-4">
          <div className="w-full h-px bg-gray-200 dark:bg-zinc-800" />
          <div className="flex items-center justify-end mt-3">
            <Button
              onClick={onClose}
              className="h-8 sm:h-9 px-3 text-xs sm:text-sm bg-transparent hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-zinc-800"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
