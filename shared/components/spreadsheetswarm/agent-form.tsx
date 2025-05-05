'use client';

import React from 'react';
import { Button } from '../ui/button';
import Input from '../ui/Input/Input';
import { Input as TempInput } from '@/shared/components/ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

import { Trash2, Sparkles, Loader2, FileText } from 'lucide-react';
import { DraggedFile } from './hook';

type Agent = {
  name?: string;
  description?: string;
  systemPrompt?: string;
  llm?: string;
  temperature?: number;
  maxTokens?: number;
  maxLoops?: number;
  role?: string;
};

type Props = {
  mode: 'add' | 'edit';
  agent: Agent;
  setAgent: (agent: Agent) => void;
  onSubmit: () => void;
  models: string[];
  roles: string[];
  isSubmitting: boolean;
  isOptimizing: boolean;
  onOptimizePrompt: () => void;
  onFileDrop?: (e: React.DragEvent<HTMLDivElement>) => void;
  files?: DraggedFile[];
  setFiles?: (files: DraggedFile[]) => void;
};

const AgentForm = ({
  mode,
  agent,
  setAgent,
  onSubmit,
  models,
  roles,
  isSubmitting,
  isOptimizing,
  onOptimizePrompt,
  onFileDrop,
  files = [],
  setFiles,
}: Props) => {
  const handleChange = (field: keyof Agent, value: any) => {
    setAgent({ ...agent, [field]: value });
  };

  return (
    <div className="grid gap-4 py-4">
      <InputField
        label="Name"
        id="name"
        value={agent.name ?? ''}
        onChange={(val) => handleChange('name', val)}
      />
      <InputField
        label="Description"
        id="description"
        value={agent.description ?? ''}
        onChange={(val) => handleChange('description', val)}
      />

      <div>
        <Label htmlFor="systemPrompt">System Prompt</Label>
        <div className="relative">
          <Textarea
            id="systemPrompt"
            value={agent.systemPrompt || ''}
            onChange={(e) => handleChange('systemPrompt', e.target.value)}
            className="pr-10 shadow"
          />
          <Button
            size="sm"
            variant="ghost"
            className="absolute right-2 top-2"
            onClick={onOptimizePrompt}
            disabled={isOptimizing}
          >
            {isOptimizing ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}
          </Button>
        </div>
      </div>

      <SelectField
        id="llm"
        label="LLM"
        value={agent.llm ?? 'gpt-4o'}
        options={models}
        onChange={(val) => handleChange('llm', val)}
        placeholder="Select LLM"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="temperature">
            Temperature ({agent.temperature ?? 0.7})
          </Label>
          <TempInput
            id="temperature"
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={agent.temperature ?? 0.7}
            onChange={(e) =>
              handleChange('temperature', parseFloat(e.target.value))
            }
            className="w-full"
          />
        </div>

        <InputField
          label="Max Tokens"
          id="maxTokens"
          type="number"
          value={(agent.maxTokens ?? 2048) as unknown as string}
          onChange={(val) => handleChange('maxTokens', parseInt(val))}
          min="1"
          max="8192"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-2.5">
        <SelectField
          id="role"
          label="Role"
          value={agent.role ?? 'worker'}
          options={roles}
          onChange={(val) => handleChange('role', val)}
        />
        <InputField
          label="Max Loops"
          id="maxLoops"
          type="number"
          value={(agent.maxLoops ?? 1) as unknown as string}
          onChange={(val) => handleChange('maxLoops', parseInt(val))}
          min="1"
        />
      </div>

      {mode === 'add' && (
        <div
          className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors"
          onDragOver={(e) => e.preventDefault()}
          onDrop={onFileDrop}
        >
          <FileText className="mx-auto size-6 mb-2" />
          <p className="text-sm font-medium mb-1">Drag and drop files here</p>
          <p className="text-xs text-muted-foreground">
            Supports PDF, TXT, CSV
          </p>
        </div>
      )}

      {mode === 'add' && files.length > 0 && setFiles && (
        <div>
          {files.map((file, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-2 bg-secondary rounded mb-2"
            >
              <span className="flex items-center">
                <FileText className="size-4 mr-2" />
                {file.name}
              </span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  setFiles(files.filter((_, index) => index !== i))
                }
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <Button
        onClick={onSubmit}
        disabled={isSubmitting}
        className="flex items-center gap-2 shadow hover:shadow-lg -mb-5"
      >
        <span>{mode === 'edit' ? 'Update Agent' : 'Add Agent'}</span>
        {isSubmitting && <Loader2 className="size-4 animate-spin" />}
      </Button>
    </div>
  );
};

export default AgentForm;

export const InputField = ({
  label,
  id,
  value,
  onChange,
  type = 'text',
  min,
  max,
  ...rest
}: {
  label: string;
  id: string;
  value: string;
  onChange: (val: string) => void;
  type?: string;
  min?: string;
  max?: string;
}) => (
  <div>
    <Label htmlFor={id} className="mb-2.5 block">
      {label}
    </Label>
    <Input
      id={id}
      type={type}
      value={value}
      onChange={(value) => onChange(value)}
      className="w-full shadow-[0_1px_3px_rgba(0,0,0,0.12),_0_1px_2px_rgba(0,0,0,0.24)] bg-white dark:bg-black  ring-offset-background focus-visible:ring-primary focus-visible:ring-2 focus-visible:ring-offset-0 "
      {...rest}
    />
  </div>
);

// SelectField.tsx
export const SelectField = ({
  label,
  value,
  options,
  onChange,
  placeholder = 'Select',
  id,
}: {
  label: string;
  id: string;
  options: string[];
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}) => (
  <div>
    <Label htmlFor={id} className="mb-2.5 block">
      {label}
    </Label>
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full shadow">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt} value={opt}>
            {opt.charAt(0).toUpperCase() + opt.slice(1)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);
