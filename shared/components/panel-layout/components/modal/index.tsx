"use client";

import BasicOnboardingModal from '@/shared/components/basic-onboarding-modal';
import UsernameModal from '@/shared/components/username-modal';
import { trpc } from '@/shared/utils/trpc/trpc';
import React from 'react';

export default function LayoutModals() {
  const username = trpc.main.getUser.useQuery().data?.username;

  return username ? <BasicOnboardingModal /> : <UsernameModal />;
}
