import { useToast } from '@/shared/components/ui/Toasts/use-toast';
import useSubscription from '@/shared/hooks/subscription';
import { trpc } from '@/shared/utils/trpc/trpc';
import { ChatCompletionMessageParam } from 'openai/resources';
import { useEffect, useRef, useState } from 'react';

/**
 * Custom hook for managing playground functionality.
 * @returns An object containing various state variables and functions related to the playground.
 */
const usePlayground = () => {
  const models = trpc.playground.models.useQuery();
  const playgroundApiKey = trpc.playground.getPlaygroundApiKey.useQuery();
  const [systemMessage, setSystemMessage] = useState<string>('');
  // config
  const [temperature, setTemperature] = useState<number>(0.8);
  const [topP, setTopP] = useState<number>(0.9);
  const [maxTokens, setMaxTokens] = useState<number>(1024);
  // messages
  const [messages, setMessages] = useState<ChatCompletionMessageParam[]>([
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text: 'Hello',
        },
      ],
    },
  ]);

  const [selectedModelId, setSelectedModelId] = useState<string>(
    models.data?.[0].id || '',
  );
  const addMessage = () => {
    const newMessages = [...messages];
    newMessages.push({
      role: 'user',
      content: [
        {
          type: 'text',
          text: '',
        },
      ],
    });
    setMessages(newMessages);
  };

  useEffect(() => {
    if (models.isFetched && models.data) {
      const firstModelId = models?.data?.[0]?.id;
      if (firstModelId) {
        setSelectedModelId(firstModelId);
      }
    }
  }, [models.isFetched]);

  const [isSending, setIsSending] = useState(false);

  const selectedModel = models.data?.find(
    (model) => model.id === selectedModelId,
  );
  const fetchControllerRef = useRef(new AbortController());

  const subscription = useSubscription();
  const toast = useToast();
  const submit = async () => {
    if (playgroundApiKey.isLoading) {
      toast.toast({
        title: 'Api Key not loaded yet',
      });
      return;
    }
    if (isSending) {
      // cancel
      fetchControllerRef.current.abort();
      setIsSending(false);
    } else {
      setIsSending(true);

      const model_api_endpoint = selectedModel?.api_endpoint;
      const url = `${model_api_endpoint ?? 'https://api.swarms.world/v1'}/chat/completions`;

      const messagesToSend = messages.map((message) => ({
        ...message,
      }));
      if (systemMessage.trim() != '') {
        messagesToSend.push({
          role: 'system',
          content: systemMessage,
        });
      }
      const data = {
        model: selectedModel?.unique_name,
        messages: messagesToSend,
        temperature,
        top_p: topP,
        max_tokens: maxTokens,
        // for next version
        /*         functions: [
          {
            name: 'detection',
            description: 'Detect objects in the image.',
            parameters: {
              type: 'object',
              properties: {
                objects: {
                  type: 'array',
                  description: 'The objects present in the image.',
                  items: {
                    type: 'string',
                    enum: ['dog', 'person', 'tree', 'path', 'sun']
                  }
                },
                animals: {
                  type: 'array',
                  description: 'The animals present in the image.',
                  items: {
                    type: 'string',
                    enum: ['dog']
                  }
                },
                people: {
                  type: 'boolean',
                  description: 'Whether there are people in the image.',
                  enum: [true]
                }
              }
            }
          }
        ] */
      };

      // Send the request
      fetch(url, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${playgroundApiKey.data}`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          console.log('Success:', data);
          const message = data.choices[0].message as ChatCompletionMessageParam;
          console.log('message', message);

          //   append
          const newMessages = [...messages];
          newMessages.push(message);
          setMessages(newMessages);
        })
        .catch((error) => {
          console.error('Error:', error);
          toast.toast({
            title: 'Error',
            description: error.message,
            variant: 'destructive',
          });
        })
        .finally(() => {
          setIsSending(false);
        });

      //
    }
  };
  return {
    temperature,
    setTemperature,
    topP,
    setTopP,
    maxTokens,
    setMaxTokens,
    systemMessage,
    setSystemMessage,
    messages,
    submit,
    addMessage,
    setMessages,
    models,
    selectedModel,
    selectedModelId,
    setSelectedModelId,
    isSending,
    playgroundApiKey,
  };
};

export default usePlayground;
