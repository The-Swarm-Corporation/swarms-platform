'use client';

import { cn } from '@/shared/utils/cn';
import { trpc } from '@/shared/utils/trpc/trpc';
import { User } from '@supabase/supabase-js';
import Image from 'next/image';
import React from 'react';
import Link from 'next/link';

interface AvatarProps {
  user?: User;
  explorerUser?: any;
  userId?: string;
  className?: string;
  showUsername?: boolean;
  showBorder?: boolean;
  title?: string;
  profileName?: string;
  isClickable?: boolean;
}

export default function Avatar({
  userId = '',
  user,
  title,
  explorerUser,
  showBorder,
  profileName,
  showUsername,
  className,
  isClickable = true,
}: AvatarProps) {
  const shouldFetchUser = !explorerUser && !user && Boolean(userId);

  const { data } = trpc.main.getUserById.useQuery(
    { userId },
    { enabled: shouldFetchUser },
  );

  const avatar =
    explorerUser?.avatar_url ||
    user?.user_metadata?.avatar_url ||
    data?.avatar ||
    '';

  const username =
    explorerUser?.username ||
    user?.user_metadata?.user_name ||
    profileName ||
    data?.username ||
    '';

  const content = (
    <div title={title} className={cn('flex items-center', className)}>
      {avatar ? (
        <div
          className={cn(
            'relative h-8 w-8 rounded-full',
            showBorder && 'border border-destructive p-1',
          )}
        >
          <Image
            src={avatar}
            alt={username || 'user'}
            fill
            className="rounded-full"
          />
        </div>
      ) : (
        username && (
          <div className="bg-secondary flex justify-center items-center h-8 w-8 rounded-full uppercase">
            {username?.charAt(0)}
          </div>
        )
      )}
      {showUsername && username && (
        <p className="ml-1 md:ml-2 text-primary text-xs md:text-sm font-semibold">
          {username}
        </p>
      )}
    </div>
  );

  if (isClickable && username) {
    return (
      <Link href={`/users/${username}`} className="hover:opacity-80 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
}
