'use client';

import React, { Dispatch, SetStateAction, useRef, useState } from 'react';
import { languages } from '../code-editor/config';
import { cn } from '@/shared/utils/cn';
import CodePlayground from '../code-editor';
import Input from '../ui/Input';
import { Slider } from '../ui/slider';
import { useEditorContext } from '../ui/editor.provider';
import { EditorType, LanguageType } from '../code-editor/type';

interface PlaygroundProps {
  temperature: number;
  input: string;
  type: EditorType;
  selectedImageData: string;
  setSelectedImageData: Dispatch<SetStateAction<string>>;
  setTemperature: Dispatch<SetStateAction<number>>;
  setInput: Dispatch<SetStateAction<string>>;
}

export default function Playground({
  selectedImageData,
  temperature,
  input,
  setSelectedImageData,
  setTemperature,
  setInput,
}: PlaygroundProps) {
  const { handleChange } = useEditorContext();
  const sampleModes = [{ name: 'Try', icon: '' }, ...languages];
  const [selectedSampleMode, setSelectedSampleMode] = useState<
    (typeof sampleModes)[number]
  >(sampleModes[0]);

  const fileRef = useRef<HTMLInputElement | null>(null);

  function handleModeChange(mode: LanguageType) {
    setSelectedSampleMode(mode);
    handleChange?.(EditorType.language, mode);
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const reader = new FileReader();
    reader.onload = (_e) => {
      setSelectedImageData(_e.target?.result as string);
    };
    file && reader.readAsDataURL(file);
  };

  return (
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
        {sampleModes.map((mode) => {
          return (
            <button
              key={mode.name}
              onClick={() => handleModeChange(mode)}
              className={cn(
                `px-3 py-1 text-sm rounded-xl text-muted-foreground border border-transparent`,
                selectedSampleMode.name === mode.name
                  ? 'border bg-gray-700 text-white'
                  : '',
              )}
            >
              {mode.name}
            </button>
          );
        })}
      </div>
      {selectedSampleMode.name !== 'Try' && (
        <div className="mt-4 h-full  relative">
          <CodePlayground />
        </div>
      )}
      {selectedSampleMode.name === 'Try' && (
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
  );
}
