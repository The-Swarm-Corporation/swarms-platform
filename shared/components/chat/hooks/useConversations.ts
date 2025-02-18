'use client';

import { useState, useEffect } from 'react';
import {
  Message,
  Conversation,
  ConversationMetadata,
} from '@/shared/components/chat/types';
import { db } from '../mock/db';

export function useConversations() {
  const [conversations, setConversations] = useState<ConversationMetadata[]>(
    [],
  );
  const [activeConversation, setActiveConversation] =
    useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      setIsLoading(true);
      const list = await db.listConversations();
      setConversations(list);

      if (!activeConversation && list.length > 0) {
        const conversation = await db.getConversation(list[0].id);
        setActiveConversation(conversation || null);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Failed to load conversations'),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const createConversation = async (name: string) => {
    try {
      const conversation = await db.createConversation(name);
      setConversations((prev) => [conversation, ...prev]);
      setActiveConversation(conversation);
      return conversation;
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Failed to create conversation'),
      );
      throw err;
    }
  };

  const switchConversation = async (id: string) => {
    try {
      const conversation = await db.getConversation(id);
      if (conversation) {
        setActiveConversation(conversation);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Failed to switch conversation'),
      );
      throw err;
    }
  };

  const deleteConversation = async (id: string) => {
    try {
      await db.deleteConversation(id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeConversation?.id === id) {
        const remaining = conversations.filter((c) => c.id !== id);
        if (remaining.length > 0) {
          const conversation = await db.getConversation(remaining[0].id);
          setActiveConversation(conversation || null);
        } else {
          setActiveConversation(null);
        }
      }
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Failed to delete conversation'),
      );
      throw err;
    }
  };

  const addMessage = async (message: Omit<Message, 'id'>) => {
    if (!activeConversation) throw new Error('No active conversation');
    try {
      const newMessage = await db.addMessage(activeConversation.id, message);
      setActiveConversation((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          messages: [...prev.messages, newMessage],
          updatedAt: new Date().toISOString(),
        };
      });
      await loadConversations(); // Refresh list to update order
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to add message'));
      throw err;
    }
  };

  const exportConversation = async (id: string) => {
    try {
      const json = await db.exportConversation(id);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `conversation-${id}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Failed to export conversation'),
      );
      throw err;
    }
  };

  return {
    conversations,
    activeConversation,
    isLoading,
    error,
    createConversation,
    switchConversation,
    deleteConversation,
    addMessage,
    exportConversation,
  };
}
