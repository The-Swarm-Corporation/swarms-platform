'use client';
import { useState } from 'react';
import { trpc } from '@/shared/utils/trpc/trpc';
import { Button } from '../ui/Button';
import LoadingSpinner from '../loading-spinner';
import EditorProvider from '../ui/editor.provider';
import Playground from './playground';
import { EditorType } from '../code-editor/type';

interface Props {
  model: string;
}
const VlmPlayground = ({ model }: Props) => {
  const [selectedImageData, setSelectedImageData] = useState<string>(
    'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/674c9c37-b716-4dae-af4a-b34e252c9cb6/width=450/00050-2430021382.jpeg',
  );

  const [temperature, setTemperature] = useState<number>(0.8);
  const [input, setInput] = useState<string>('Describe what is in the image');

  const publicPlaygroundVlm =
    trpc.publicPlayground.vlmMessageCompletion.useMutation();
  const [responseMsg, setResponseMsg] = useState<number>(0);
  const submit = async () => {
    const startTime = new Date().getTime();
    await publicPlaygroundVlm.mutateAsync({
      model,
      content: input,
      image_url: selectedImageData,
      temperature,
    });
    const endTime = new Date().getTime();
    setResponseMsg(endTime - startTime);
  };
  return (
    <EditorProvider model={model}>
      <div className="flex flex-col gap-4">
        <div className="flex md:flex-row gap-4 flex-col">
          <Playground
            {...{
              selectedImageData,
              temperature,
              input,
              setInput,
              setSelectedImageData,
              setTemperature,
            }}
            type={EditorType.language}
          />

          <div className="flex flex-col md:w-1/2 w-full bg-gray-500/5 rounded-md p-2">
            <h2>Response</h2>
            <div className="mt-2">
              <pre className="text-sm text-pretty">
                {publicPlaygroundVlm.isPending && <LoadingSpinner />}
                {!publicPlaygroundVlm.isPending && (
                  <>
                    {publicPlaygroundVlm.data}
                    <br />
                    <br />
                    {/* time */}
                    {responseMsg > 0 && (
                      <>[{(responseMsg / 1000).toFixed(2)}s]</>
                    )}
                  </>
                )}
              </pre>
            </div>
          </div>
        </div>
        <div className="w-full flex justify-center">
          <Button
            onClick={submit}
            className="w-[200px]"
            disabled={publicPlaygroundVlm.isPending}
          >
            {publicPlaygroundVlm.isPending ? 'loading...' : 'Run'}
          </Button>
        </div>
      </div>
    </EditorProvider>
  );
};

export default VlmPlayground;
