'use client';

import React, { useEffect, useRef, useState } from 'react';
import { trpc } from '@/shared/utils/trpc/trpc';
import { Tables } from '@/types_db';
import { v4 as uuidv4 } from 'uuid';
import { useOnClickOutside } from '@/shared/hooks/onclick-outside';
import { useToast } from '@/shared/components/ui/Toasts/use-toast';
import { ChatComponentProps } from './prompt';

export default function usePromptChat({
  promptId,
  systemPrompt,
  userId,
  model = 'gpt-4',
}: ChatComponentProps) {
  const [input, setInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<
    Tables<'swarms_cloud_prompts_chat_test'>[]
  >([]);
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [streamedResponse, setStreamedResponse] = useState('');
  const [editingMessageId, setEditingMessageId] = useState('');
  const [editInput, setEditInput] = useState('');
  const [abortReader, setAbortReader] =
    useState<ReadableStreamDefaultReader | null>(null);
  const [usedTokens, setUsedTokens] = useState(0);

  const [isStreaming, setIsStreaming] = useState(false);

  const latestMessageRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const fetchMessages = trpc.explorer.getPromptChats.useQuery(
    { promptId, userId },
    { enabled: false },
  );
  const fetchMutation = trpc.explorer.savePromptChat.useMutation();
  const editMutation = trpc.explorer.editPromptChat.useMutation();
  const deductCredit = trpc.explorer.deductCredit.useMutation();
  const deleteMutation = trpc.explorer.deletePromptChat.useMutation();

  const messageId = uuidv4();

  const handleInputBlur = () => {
    setEditInput('');
    setEditingMessageId('');
  };

  useOnClickOutside(textareaRef, handleInputBlur);

  useEffect(() => {
    if (streamedResponse) {
      if (!editingMessageId) {
        setMessages((prev) =>
          prev.map((m, index) =>
            index === prev.length - 1 ? { ...m, text: streamedResponse } : m,
          ),
        );
      } else {
        setMessages((prev) =>
          prev.map((m) =>
            m.response_id === `${editingMessageId}_agent`
              ? { ...m, text: streamedResponse }
              : m,
          ),
        );
      }
    }
  }, [streamedResponse, editingMessageId]);

  useEffect(() => {
    if (!messages.length) {
      fetchMessages.refetch().then(({ data }) => {
        if (data) setMessages(data);
      });
    }
  }, [fetchMessages, messages]);

  useEffect(() => {
    if (latestMessageRef.current && isExpanded) {
      latestMessageRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
      });
    }
  }, [isExpanded]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    setIsLoading(true);
    setIsStreaming(true);

    const newUserMessage = {
      text: input,
      sender: 'user',
      prompt_id: promptId,
      user_id: userId,
      response_id: `${messageId}`,
    } as Tables<'swarms_cloud_prompts_chat_test'>;

    setMessages((prev) => [...prev, newUserMessage]);

    const aiResponse = {
      text: '',
      sender: 'agent',
      prompt_id: promptId,
      user_id: userId,
      response_id: `${messageId}_agent`,
    } as Tables<'swarms_cloud_prompts_chat_test'>;

    setMessages((prev) => [...prev, aiResponse]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, systemPrompt, userId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.toast({
          title: errorData.error || 'An error has occurred',
          variant: 'destructive',
        });
        return;
      }

      const reader = response.body?.getReader();
      setAbortReader(reader ?? null);

      const decoder = new TextDecoder();
      let completeText = '';

      while (reader) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        completeText += chunk;

        setStreamedResponse(completeText);
      }

      const headerToken = Number(response.headers.get('X-Used-Tokens')) || 0;
      setUsedTokens(headerToken);

      if (headerToken) {
        deductCredit.mutateAsync({ userId, amount: headerToken });
      }
      fetchMutation.mutateAsync([
        { ...newUserMessage },
        { ...aiResponse, text: completeText },
      ]);
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Streaming stopped by user.');
      } else {
        console.error('Error:', error);
        toast.toast({
          title:
            error?.error ||
            error ||
            error?.message ||
            'Error fetching response',
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
      setAbortReader(null);
      setInput('');
    }
  };

  const handleStop = async () => {
    if (abortReader) {
      abortReader.cancel();
      setIsStreaming(false);
      setAbortReader(null);

      if (usedTokens) {
        deductCredit.mutateAsync({ userId, amount: usedTokens });
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setInput(e.target.value);

  const handleEditMessage = (responseId: string) => {
    setEditingMessageId(responseId);

    const messageToEdit = messages.find((m) => m.response_id === responseId);
    setEditInput(messageToEdit?.text || '');
  };

  const handleSendEdit = async (responseId: string) => {
    if (!editInput.trim() || !responseId || isLoading) return;
    setIsLoading(true);
    setIsStreaming(true);

    setMessages((prev) =>
      prev.map((m) =>
        m.response_id === responseId ? { ...m, text: editInput } : m,
      ),
    );

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: editInput, systemPrompt, userId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.toast({
          title: errorData.error || 'An error has occurred',
          variant: 'destructive',
        });
        return;
      }

      const reader = response.body?.getReader();
      setAbortReader(reader ?? null);

      const decoder = new TextDecoder();
      let completeText = '';

      while (reader) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        completeText += chunk;

        setStreamedResponse(completeText);
      }

      const headerToken = Number(response.headers.get('X-Used-Tokens')) || 0;
      setUsedTokens(headerToken);

      if (headerToken) {
        deductCredit.mutateAsync({ userId, amount: headerToken });
      }

      editMutation.mutateAsync({
        promptId,
        responseId,
        userId,
        userText: editInput,
        agentText: completeText,
      });
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Streaming stopped by user.');
      } else {
        console.error('Error editing message:', error);
        toast.toast({
          title:
            error?.error || error || error?.message || 'Error editing message',
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
      handleInputBlur();
      setIsStreaming(false);
      setAbortReader(null);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    setMessages((prev: any) => prev.filter((m: any) => m.id !== messageId));

    if (!messageId) return;
    await deleteMutation.mutateAsync({ messageId, promptId, userId });
  };

  return {
    input,
    isExpanded,
    isLoading,
    editInput,
    messages,
    isStreaming,
    textareaRef,
    editingMessageId,
    latestMessageRef,
    handleSend,
    handleStop,
    setEditInput,
    setIsExpanded,
    handleSendEdit,
    handleInputBlur,
    handleEditMessage,
    handleInputChange,
    handleDeleteMessage,
  };
}
