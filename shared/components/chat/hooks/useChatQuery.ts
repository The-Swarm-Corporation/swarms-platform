'use client';

import { trpc } from '@/shared/utils/trpc/trpc';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';

export default function useChatQuery() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeConversationId = searchParams?.get('conversationId') || '';
  const sharedConversationId = searchParams?.get('shareId') || '';

  const sharedConversation = trpc.chat.getSharedConversation.useQuery(
    { conversationId: activeConversationId, shareId: sharedConversationId },
    {
      enabled: activeConversationId !== '' && sharedConversationId !== '',
      refetchOnWindowFocus: false,
    },
  );

  const updateQueryParams = (conversationId: string) => {
    const newSearchParams = new URLSearchParams(searchParams ?? '');
    newSearchParams.set('conversationId', conversationId);

    router.push(`${pathname}?${newSearchParams.toString()}`);
  };

  const getConversationUrl = (id: string) => {
    const params = new URLSearchParams(searchParams ?? '');
    params.set('conversationId', id);
    return `${pathname}?${params.toString()}`;
  };

  return {
    activeConversationId,
    sharedConversationId,
    sharedConversation,
    sharedConversations: [sharedConversation.data],
    updateQueryParams,
    getConversationUrl,
  };
}
