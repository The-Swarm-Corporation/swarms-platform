'use client';
import { cn } from '@/shared/utils/cn';
import { useEffect, useRef, useState } from 'react';
import CodeBox from '../code-box';
import {
  VLM_SAMPLE_GO,
  VLM_SAMPLE_JS,
  VLM_SAMPLE_PY,
} from '@/shared/data/vlm-sample';
import { Slider } from '../ui/slider';
import Input from '../ui/Input';
import { trpc } from '@/shared/utils/trpc/trpc';
import { Button } from '../ui/Button';
import LoadingSpinner from '../loading-spinner';

interface Props {
  model: string;
}
const VlmPlayground = ({ model }: Props) => {
  /*   const [responseMode, setResponseMode] = useState<'text' | 'json' | string>(
    'text'
  ); */
  const sampleModes = ['try', 'python', 'javascript', 'go'];
  const [selectedSampleMode, setSelectedSampleMode] =
    useState<(typeof sampleModes)[number]>('try');

  const fileRef = useRef<HTMLInputElement | null>(null);
  const [selectedImageData, setSelectedImageData] = useState<string>('');
  useEffect(() => {
    setSelectedImageData(
      'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/674c9c37-b716-4dae-af4a-b34e252c9cb6/width=450/00050-2430021382.jpeg',
    );
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const reader = new FileReader();
    reader.onload = (_e) => {
      setSelectedImageData(_e.target?.result as string);
    };
    file && reader.readAsDataURL(file);
  };

  // temp
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
    <div className="flex flex-col gap-4">
      <div className="flex md:flex-row gap-4 flex-col">
        <div className="flex flex-col md:w-1/2 w-full overflow-hidden rounded-md bg-gray-500/5 h-full p-2">
          <h2>Input</h2>
          <input
            type="file"
            hidden
            ref={fileRef}
            accept="image/*"
            onChange={handleFileChange}
          />
          {/* modes */}
          <div className="flex gap-1 mt-2">
            {sampleModes.map((mode) => (
              <button
                key={mode}
                onClick={() => setSelectedSampleMode(mode)}
                className={cn(
                  `px-3 py-1 text-xs rounded-xl text-muted-foreground border border-transparent`,
                  selectedSampleMode === mode
                    ? 'border bg-gray-700 text-white'
                    : '',
                )}
              >
                {mode}
              </button>
            ))}
          </div>
          {selectedSampleMode !== 'try' && (
            <div className="mt-4 h-full  relative">
              <CodeBox
                hideList
                classes={{
                  content: 'overflow-auto h-content h-[400px]',
                  root: 'h-full',
                }}
                value={selectedSampleMode}
                initLanguage={selectedSampleMode}
                sampleCodes={{
                  python: {
                    sourceCode: VLM_SAMPLE_PY,
                    title: 'main.py',
                  },
                  javascript: {
                    sourceCode: VLM_SAMPLE_JS,
                    title: 'index.js',
                  },
                  go: {
                    sourceCode: VLM_SAMPLE_GO,
                    title: 'main.go',
                  },
                }}
              />
            </div>
          )}
          {selectedSampleMode === 'try' && (
            <>
              <div className="flex flex-col gap-2 mt-8 h-[400px]">
                <h2 className="text-sm">upload Image</h2>
                <img
                  className="w-full h-full object-cover rounded-xl overflow-hidden"
                  src={selectedImageData}
                  alt="selected image"
                />
                <button
                  onClick={() => fileRef.current?.click()}
                  className="w-full px-4 py-2 bg-cyan-500 text-white rounded-xl"
                >
                  Upload Image
                </button>
              </div>
              {/* input */}
              <div className="mt-4">
                <label className="text-sm" htmlFor="prompt">
                  Prompt
                </label>
                <Input
                  value={input}
                  onChange={(v) => setInput(v)}
                  className="w-full rounded-md !bg-transparent"
                  id="prompt"
                  placeholder="Describe what is in the image"
                />
              </div>
              {/* params */}
              <div className="flex flex-col mt-4">
                {/* temp */}
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between">
                    <span>Temperature</span>
                    <span>{temperature}</span>
                  </div>
                  <Slider
                    min={0}
                    max={1}
                    step={0.1}
                    value={[temperature]}
                    onValueChange={(value) => setTemperature(value[0])}
                  />
                </div>
                {/* top-p */}
              </div>
            </>
          )}
        </div>
        <div className="flex flex-col md:w-1/2 w-full bg-gray-500/5 rounded-md p-2">
          <h2>Response</h2>
          {/*           <div className="mt-2">
            {['text', 'json'].map((mode) => (
              <button
                key={mode}
                onClick={() => setResponseMode(mode)}
                className={cn(
                  `px-3 py-1 text-xs rounded-xl text-muted-foreground border border-transparent`,
                  responseMode === mode ? 'border bg-gray-700 text-white' : ''
                )}
              >
                {mode}
              </button>
            ))}
          </div> */}
          <div className="mt-2">
            <pre className="text-sm text-pretty">
              {publicPlaygroundVlm.isPending && <LoadingSpinner />}
              {!publicPlaygroundVlm.isPending && (
                <>
                  {publicPlaygroundVlm.data}
                  <br />
                  <br />
                  {/* time */}
                  {responseMsg > 0 && <>[{(responseMsg / 1000).toFixed(2)}s]</>}
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
  );
};

export default VlmPlayground;
