'use client';

import { Textarea } from '@/shared/components/ui/textarea';
import { cn } from '@/shared/utils/cn';
import { LoaderCircle, Plus } from 'lucide-react';
import usePlayground from './hooks/playground';
import LoadingSpinner from '@/shared/components/loading-spinner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Button } from '@/shared/components/ui/Button';
import { Slider } from '@/shared/components/ui/slider';
import { MessageItem } from './components/message';

const Playground = () => {
  const playground = usePlayground();
  const messages = playground.messages;

  return (
    <div className="w-full flex flex-col h-full">
      <h1 className="text-3xl font-extrabold sm:text-4xl">Playground</h1>
      <div className="w-full h-full flex gap-4 py-4 overflow-hidden px-1 max-md:flex-col-reverse mt-4 sm:mt-0">
        <div className="max-lg:hidden w-2/6 h-full">
          <Textarea
            className="h-full resize-none"
            placeholder="You are a helpful assistant"
          />
        </div>
        <div className="w-4/6 max-md:w-full">
          <div
            className={cn(
              'h-full overflow-auto pb-16',
              playground.isSending && 'opacity-80 pointer-events-none',
            )}
          >
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
              className="w-full flex gap-2 py-3 p-2  px-4 cursor-pointer hover:bg-gray-700/50 hover:text-white rounded-md mt-2"
            >
              <Plus size={20} />
              <span>Add message</span>
            </div>
          </div>
          <div className="sticky bottom-0">
            <Button
              disabled={
                playground.models.isLoading ||
                playground.playgroundApiKey.isLoading
              }
              onClick={playground.submit}
              className={cn(
                'flex gap-2 w-auto p-2 bg-primary rounded-md text-white transition-all',
                playground.isSending && 'bg-gray-600/90 hover:bg-gray-600',
              )}
            >
              <span>{playground.isSending ? 'cancel' : 'Submit'}</span>
              {playground.isSending && (
                <LoaderCircle size={16} className="animate-spin" />
              )}
            </Button>
          </div>
        </div>
        <div className="w-2/6 flex flex-col gap-4 max-md:w-full ">
          {/* loading */}
          {playground.models.isLoading && (
            <div className="w-full flex justify-center items-center">
              <LoadingSpinner />
            </div>
          )}
          {playground.models.isFetched && (
            <>
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
              {/* models */}
              {/*               {playground.selectedModel?.support_functions && (
                <div>
                  <Button className="w-full" variant={'outline'}>
                    Functions
                  </Button>
                </div>
              )} */}
              <div className="flex flex-col gap-4 w-full">
                {/* temereture */}
                <div className="w-full flex flex-col gap-2">
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
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Playground;
