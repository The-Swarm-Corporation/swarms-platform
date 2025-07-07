'use client';

import React from 'react';
import Link from 'next/link';

interface MentionTextProps {
  text: string;
  className?: string;
}

export default function MentionText({ text, className = '' }: MentionTextProps) {
  const mentionRegex = /@([a-zA-Z0-9_]+)/g;
  
  const parts = text.split(mentionRegex);
  
  return (
    <span className={className}>
      {parts.map((part, index) => {
        const isUsername = index % 2 === 1;
        
        if (isUsername) {
          return (
            <Link
              key={index}
              href={`/users/${part}`}
              className="text-[#4ECDC4] hover:text-[#4ECDC4]/80 font-medium transition-colors duration-200 hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              @{part}
            </Link>
          );
        }
        
        return <span key={index}>{part}</span>;
      })}
    </span>
  );
}

export function useMentionDetection(text: string) {
  const mentionRegex = /@([a-zA-Z0-9_]+)/g;
  const mentions = React.useMemo(() => {
    const matches = text.match(mentionRegex);
    return matches ? Array.from(new Set(matches.map(m => m.substring(1)))) : [];
  }, [text]);
  
  return mentions;
}

export function extractMentions(text: string): string[] {
  const mentionRegex = /@([a-zA-Z0-9_]+)/g;
  const matches = text.match(mentionRegex);
  return matches ? Array.from(new Set(matches.map(m => m.substring(1)))) : [];
}

export function hasMentions(text: string): boolean {
  const mentionRegex = /@([a-zA-Z0-9_]+)/g;
  return mentionRegex.test(text);
}
