'use client';

import { cn } from '@/shared/utils/cn';
import { trpc } from '@/shared/utils/trpc/trpc';
import { User } from '@supabase/supabase-js';
import Image from 'next/image';
import React from 'react';

interface AvatarProps {
  user?: User;
  userId?: string;
  showUsername?: boolean;
  showBorder?: boolean;
  title?: string;
  profileName?: string;
}

export default function Avatar({
  userId = '',
  user,
  title,
  showBorder,
  profileName,
  showUsername,
}: AvatarProps) {
  const { data } = trpc.main.getUserById.useQuery({
    userId: userId,
  });
  const avatar = (user ? user.user_metadata?.avatar_url : data?.avatar) || '';
  const username = user
    ? user.user_metadata.user_name || profileName
    : data?.username;

  return (
    <div title={title} className="flex items-center">
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
}
