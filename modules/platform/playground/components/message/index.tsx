'use client';

import { useRef, useState } from 'react';
import {
  ChatCompletionContentPart,
  ChatCompletionMessageParam,
} from 'openai/resources';
import { cn } from '@/shared/utils/cn';
import { CircleMinus, ImagePlus, Trash } from 'lucide-react';

const ImageMessageRender = ({
  url,
  remove,
}: {
  url: string;
  remove: () => void;
}) => {
  return (
    <div className="w-full relative">
      <div
        onClick={remove}
        className="absolute top-2 right-2 z-10 p-2 transition-all bg-red-500 rounded-md group-hover:opacity-100 opacity-0 cursor-pointer text-white/80"
      >
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
  updateContentText,
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
  const rowsLen = Math.min(20, Math.max(4, text.split('\n').length));
  return (
    <div className="w-full">
      <textarea
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={cn(
          'w-full p-1 bg-transparent focus:bg-background focus:outline-2 outline-purple-500 border border-gray-700/50 focus:border-none rounded-md resize-none overflow-scroll',
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
  supportImage,
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
    text: string | ChatCompletionContentPart,
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
            text: newMessage.content,
          },
        ];
      }
      // if an image already exists, remove it
      if (newMessage.content?.some((content) => content.type === 'image_url')) {
        newMessage.content = newMessage.content?.filter(
          (content) => content.type !== 'image_url',
        );
      }

      // convert image file to base64 and then append
      const reader = new FileReader();
      reader.onload = (_e) => {
        if (typeof newMessage.content == 'object') {
          newMessage.content?.push({
            type: 'image_url',
            image_url: {
              url: _e.target?.result as string,
            },
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
        (content) => content.type !== 'image_url',
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
      <div className="border-b-2 border-gray-700/50 group flex flex-col">
        <div
          className={cn(
            'flex flex-col px-4',
            'hover:bg-gray-700/50 rounded-md',
            isFocused && 'bg-gray-700/50',
          )}
        >
          <div className="flex py-4">
            <div
              className="w-3/12 select-none cursor-pointer -translate-x-3 xl:translate-x-0"
              onClick={toggleRole}
            >
              <span
                className={cn(
                  'text-xs xl:text-sm group-hover:bg-gray-700 group-hover:text-white p-1 rounded-lg uppercase',
                  isFocused && 'bg-gray-700 text-white',
                )}
              >
                {message.role}
              </span>
            </div>
            <div className="flex-grow group-hover:flex-grow-0 group-hover:w-8/12">
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
                      isFocused && 'border-white/80 text-white/80',
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
            <div className="flex justify-end group-hover:w-1/12">
              <CircleMinus
                onClick={remove}
                className={cn(
                  'text-white/80 group-hover:opacity-100 opacity-0 transition-all cursor-pointer',
                  isFocused && 'opacity-100',
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

export { MessageItem, ImageMessageRender, TextMessageRender };
