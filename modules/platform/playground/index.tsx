'use client';

import { Textarea } from '@/shared/components/ui/textarea';
import { useRef, useState } from 'react';
import {
  ChatCompletionContentPart,
  ChatCompletionMessageParam
} from 'openai/resources';
import { cn } from '@/shared/utils/cn';
import { CircleMinus, ImagePlus, Plus, Trash } from 'lucide-react';
import usePlayground from './hooks/playground';
import LoadingSpinner from '@/shared/components/loading-spinner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/shared/components/ui/select';
import { Button } from '@/shared/components/ui/Button';
import { Slider } from '@/shared/components/ui/slider';

const ImageMessageRender = ({
  url,
  remove
}: {
  url: string;
  remove: () => void;
}) => {
  return (
    <div className="w-full relative">
      <div onClick={remove} className="absolute top-2 right-2 z-10 p-2 transition-all bg-red-500 rounded-md group-hover:opacity-100 opacity-0 cursor-pointer text-white/80">
        <Trash size={20} />
      </div>
      <img
        src={url}
        alt="image"
        className="w-full h-full aspect-square object-contain rounded-md border-2 border-white/50"
      />
    </div>
  );
};
const TextMessageRender = ({
  content,
  setIsFocused,
  updateContentText
}: {
  content: ChatCompletionContentPart | string;
  setIsFocused: (isFocused: boolean) => void;
  updateContentText: (text: string) => void;
}) => {
  let text = '';
  if (typeof content === 'string') {
    text = content;
  } else if (content.type === 'text') {
    text = content.text;
  }
  // min 1 row, max 10 rows
  const rowsLen = Math.min(20, Math.max(4, text.split('\n').length));
  return (
    <div className="w-full">
      <textarea
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={cn(
          'w-full p-1 bg-transparent focus:bg-background focus:outline-2 outline-purple-500 rounded-md resize-none overflow-scroll'
        )}
        value={text}
        onChange={(e) => updateContentText(e.target.value)}
        rows={rowsLen}
      />
    </div>
  );
};

const MessageItem = ({
  message,
  update,
  remove,
  supportImage
}: {
  message: ChatCompletionMessageParam;
  update: (message: ChatCompletionMessageParam) => void;
  remove: () => void;
  supportImage?: boolean;
}) => {
  const imageFileRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const toggleRole = () => {
    const newMessage = { ...message };
    newMessage.role = message.role === 'user' ? 'assistant' : 'user';
    update(newMessage);
  };
  const updateContentText = (
    index: number,
    text: string | ChatCompletionContentPart
  ) => {
    const newMessage = { ...message };

    if (index === -1) {
      newMessage.content = text as string;
    } else {
      const content = newMessage.content?.[index] as ChatCompletionContentPart;
      if (content.type === 'text') {
        content.text = text as string;
      }
    }
    update(newMessage);
  };

  const onChooseFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const newMessage = { ...message };
      // if its text, convert to array
      if (typeof newMessage.content === 'string') {
        newMessage.content = [
          {
            type: 'text',
            text: newMessage.content
          }
        ];
      }
      // if an image already exists, remove it
      if (newMessage.content?.some((content) => content.type === 'image_url')) {
        newMessage.content = newMessage.content?.filter(
          (content) => content.type !== 'image_url'
        );
      }

      // convert image file to base64 and then append
      const reader = new FileReader();
      reader.onload = (_e) => {
        if (typeof newMessage.content == 'object') {
          newMessage.content?.push({
            type: 'image_url',
            image_url: {
              url: _e.target?.result as string
            }
          });
          update(newMessage);
        }
      };
      reader.readAsDataURL(file);

      // reset input
      e.target.value = '';
    }
  };
  const hasImage =
    typeof message.content === 'object' &&
    (message.content ?? []).some((content) => content.type === 'image_url');

  const removeImage = () => {
    const newMessage = { ...message };
    // if its array , remove the last image
    if (typeof newMessage.content === 'object') {
      newMessage.content = newMessage.content?.filter(
        (content) => content.type !== 'image_url'
      );
      update(newMessage);
    }
  };
  return (
    <>
      <input
        ref={imageFileRef}
        hidden
        type="file"
        accept="image/*"
        onChange={onChooseFile}
      />
      <div className="border-b-2 border-gray-700/50 group">
        <div
          className={cn(
            'flex flex-col px-4',
            'hover:bg-gray-700/50 rounded-md',
            isFocused && 'bg-gray-700/50'
          )}
        >
          <div className="flex py-4">
            <div
              className="w-3/12 select-none cursor-pointer"
              onClick={toggleRole}
            >
              <span
                className={cn(
                  'text-sm group-hover:bg-gray-700 p-1 rounded-lg text-white uppercase',
                  isFocused && 'bg-gray-700'
                )}
              >
                {message.role}
              </span>
            </div>
            <div className="w-8/12">
              {message.content &&
                typeof message.content === 'object' &&
                message.content.map((content, j) => {
                  {
                    /* text */
                  }
                  if (content.type === 'text') {
                    return (
                      <TextMessageRender
                        key={j}
                        content={content}
                        setIsFocused={setIsFocused}
                        updateContentText={(text) => updateContentText(j, text)}
                      />
                    );
                  }
                  if (content.type === 'image_url' && supportImage) {
                    return (
                      <ImageMessageRender
                        remove={removeImage}
                        key={j}
                        url={content.image_url.url}
                      />
                    );
                  }
                  return null;
                })}
              {typeof message.content === 'string' && (
                <TextMessageRender
                  content={message.content}
                  setIsFocused={setIsFocused}
                  updateContentText={(text) => updateContentText(-1, text)}
                />
              )}
              {
                // add image
                supportImage && !hasImage && (
                  <div
                    className={cn(
                      'mt-1 p-2 border inline-flex justify-center items-center rounded-md group-hover:border-white/80 group-hover:text-white/80 text-white/60  cursor-pointer transition-all',
                      isFocused && 'border-white/80 text-white/80'
                    )}
                    onClick={() => {
                      imageFileRef.current?.click();
                    }}
                  >
                    <ImagePlus size={20} />
                  </div>
                )
              }
            </div>
            <div className="w-1/12 flex justify-end">
              <CircleMinus
                onClick={remove}
                className={cn(
                  'text-white/80 group-hover:opacity-100 opacity-0 transition-all cursor-pointer',
                  isFocused && 'opacity-100'
                )}
                size={20}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
const Playground = () => {
  const playground = usePlayground();
  const messages = playground.messages;

  return (
    <div className="w-full flex flex-col">
      <h1 className="text-3xl font-extrabold text-white sm:text-4xl">
        Playground
      </h1>
      <div className="w-full h-full flex gap-4 py-4 overflow-hidden px-1">
        <div className="w-2/6 ">
          <Textarea
            className="h-full resize-none"
            placeholder="You are a helpful assistant"
          />
        </div>
        <div className="w-3/6 ">
          <div className={
            cn(
              "h-full overflow-auto pb-16",
              playground.isSending && "opacity-80 pointer-events-none"
            )
          }>
            {/* messages */}
            {messages.map((msg, i) => {
              return (
                <MessageItem
                  key={i}
                  supportImage={
                    msg.role === 'user' &&
                    playground.selectedModel?.model_type == 'vision'
                  }
                  message={msg}
                  update={(message) => {
                    const newMessages = [...messages];
                    newMessages[i] = message;
                    playground.setMessages(newMessages);
                  }}
                  remove={
                    messages.length > 1
                      ? () => {
                          const newMessages = [...messages];
                          newMessages.splice(i, 1);
                          playground.setMessages(newMessages);
                        }
                      : () => {}
                  }
                />
              );
            })}
            {/* add message */}
            <div
              onClick={playground.addMessage}
              className="w-full flex gap-2 py-3 p-2  px-4 cursor-pointer hover:bg-gray-700/50 rounded-md"
            >
              <Plus size={20} />
              <span>Add message</span>
            </div>
          </div>
          <div className="sticky bottom-0">
            <Button
              disabled={playground.models.isLoading}
              onClick={playground.submit}
              className={cn(
                'w-auto p-2 bg-primary rounded-md text-white transition-all',
                playground.isSending && 'bg-gray-600/90 hover:bg-gray-600'
              )}
            >
              {playground.isSending ? 'cancel' : 'Submit'}
            </Button>
          </div>
        </div>
        <div className="w-1/6 flex flex-col gap-8">
          {/* loading */}
          {playground.models.isLoading && (
            <div className="w-full flex justify-center items-center">
              <LoadingSpinner />
            </div>
          )}
          {playground.models.isFetched && (
            <>
              {/* models */}

              <div>
                <Select
                  onValueChange={(value) => {
                    playground.setSelectedModelId(value);
                  }}
                  value={playground.selectedModelId}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="model" />
                  </SelectTrigger>
                  <SelectContent>
                    {playground.models.data?.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        {model.unique_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* temereture */}
              <div className="w-full flex flex-col gap-2 ">
                <span className="flex justify-between">
                  <span>Temperature:</span>
                  <span>{playground.temperature}</span>
                </span>
                <Slider
                  value={[playground.temperature]}
                  onValueChange={(v) => {
                    playground.setTemperature(v[0]);
                  }}
                  max={2}
                  step={0.1}
                />
              </div>
              {/* top p */}
              <div className="w-full flex flex-col gap-2">
                <span className="flex justify-between">
                  <span>Top p:</span>
                  <span>{playground.topP}</span>
                </span>
                <Slider
                  value={[playground.topP]}
                  onValueChange={(v) => {
                    playground.setTopP(v[0]);
                  }}
                  max={1}
                  step={0.1}
                />
              </div>
              {/* max tokens */}
              <div className="w-full flex flex-col gap-2">
                <span className="flex justify-between">
                  <span>Max tokens:</span>
                  <span>{playground.maxTokens}</span>
                </span>
                <Slider
                  value={[playground.maxTokens]}
                  onValueChange={(v) => {
                    playground.setMaxTokens(v[0]);
                  }}
                  max={8096}
                  step={64}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Playground;
