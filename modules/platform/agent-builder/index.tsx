'use client';

import { Button } from '@/shared/components/ui/Button';
import Checkbox from '@/shared/components/ui/checkbox';
import Input from '@/shared/components/ui/Input';
import { Textarea } from '@/shared/components/ui/textarea';
import { useToast } from '@/shared/components/ui/Toasts/use-toast';
import { ChangeEvent, FormEvent, useState } from 'react';

interface ApiRequest {
  request: string;
  response: string;
}

const initialStates = {
  agentName: '',
  systemPrompt: '',
  agentDescription: '',
  modelName: '',
  maxLoops: 10,
  autosave: true,
  dynamicTemperatureEnabled: true,
  dashboard: false,
  verbose: false,
  streamingOn: true,
  savedStatePath: '',
  sop: '',
  sopList: [] as string[],
  userName: '',
  retryAttempts: 3,
  contextLength: 1024,
  task: '',
  apiRequests: [] as ApiRequest[],
};

type StateKeys = keyof typeof initialStates;

export default function AgentBuilder() {
  const toast = useToast();
  const [states, setStates] = useState(initialStates);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;
    const key = name as StateKeys;
    setStates((prev) => ({
      ...prev,
      [key]: type === 'number' ? Number(value) : value,
    }));
  };

  const handleCheckboxChange = (
    name: string,
    checked: boolean | 'indeterminate',
  ) => {
    setStates((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    return toast.toast({ description: 'Feature to be added soon!' });
    const newApiRequest: ApiRequest = {
      request: states.task,
      response: 'This is a sample response from the AI agent.',
    };
    setStates((prev) => ({
      ...prev,
      apiRequests: [...prev.apiRequests, newApiRequest],
    }));
  };

  return (
    <div className="w-full">
      <h1 className="text-3xl font-extrabold sm:text-4xl">
        Agent Configuration
      </h1>
      <div className="flex h-screen w-full mt-4 md:mt-8 flex-col md:flex-row">
        <div className="w-full md:w-1/3 bg-background p-6 md:border-r">
          <form onSubmit={handleSubmit} className="grid gap-4">
            {Object.keys(initialStates)
              .slice(0, -1)
              .map((key) => {
                const stateKey = key as StateKeys;
                if (typeof initialStates[stateKey] === 'boolean') {
                  return (
                    <div key={key} className="flex items-center gap-2">
                      <Checkbox
                        id={key}
                        checked={states[key as keyof typeof states] as boolean}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange(key, checked)
                        }
                      />
                      <label htmlFor={key} className="capitalize">
                        {key.split(/(?=[A-Z])/).join(' ')}
                      </label>
                    </div>
                  );
                } else if (
                  key === 'sopList' ||
                  key === 'task' ||
                  key === 'systemPrompt'
                ) {
                  return (
                    <div key={key}>
                      <label htmlFor={key} className="capitalize mb-1 block">
                        {key.split(/(?=[A-Z])/).join(' ')}
                      </label>
                      <Textarea
                        id={key}
                        name={key}
                        value={states[key as keyof typeof states] as string}
                        onChange={handleChange}
                      />
                    </div>
                  );
                } else {
                  return (
                    <div key={key}>
                      <label htmlFor={key} className="capitalize mb-1 block">
                        {key.split(/(?=[A-Z])/).join(' ')}
                      </label>
                      <Input
                        id={key}
                        name={key}
                        isEvent
                        type={
                          typeof initialStates[stateKey] === 'number'
                            ? 'number'
                            : 'text'
                        }
                        value={
                          states[key as keyof typeof states] as string | number
                        }
                        onChange={handleChange as any}
                      />
                    </div>
                  );
                }
              })}
            <Button disabled type="submit">
              Submit
            </Button>
          </form>
        </div>
        <div className="flex-1 grid grid-cols-1 gap-4 p-6">
          <div className="border rounded-lg p-4">
            <h3 className="text-xl font-bold mb-4">API Requests</h3>
            <div className="space-y-4">
              {states.apiRequests.map((request, index) => (
                <div key={index}>
                  <div className="font-medium">Request:</div>
                  <pre className="bg-muted p-2 rounded-md">
                    {request.request}
                  </pre>
                  <div className="font-medium mt-2">Response:</div>
                  <pre className="bg-muted p-2 rounded-md">
                    {request.response}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
