'use client';

import BasicOnboardingModal from '@/shared/components/basic-onboarding-modal';
import UsernameModal from '@/shared/components/username-modal';
import { trpc } from '@/shared/utils/trpc/trpc';
import React from 'react';

export default function LayoutModals() {
  const { data, isLoading } = trpc.main.getUser.useQuery();

  if (!data) return null;

  if (isLoading) return null;

  const username = data?.username;

  return username ? <BasicOnboardingModal /> : <UsernameModal />;
}
