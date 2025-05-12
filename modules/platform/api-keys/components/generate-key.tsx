'use client';

import { Button } from '@/shared/components/ui/button';
import Input from '@/shared/components/ui/Input/Input';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog';

import Link from 'next/link';
import { PLATFORM } from '@/shared/utils/constants';
import LoadingSpinner from '@/shared/components/loading-spinner';
import { Dispatch, SetStateAction } from 'react';

interface GenerateKeyProps {
  page?: 'api-key' | 'telemetry';
  addApiKey: any;
  setGeneratedKey: Dispatch<SetStateAction<string | null>>;
  generatedKey: string | null;
  keyName: string;
  setKeyName: Dispatch<SetStateAction<string>>;
  generate: () => void;
}

export default function GenerateKeyComponent({
  page,
  addApiKey,
  setGeneratedKey,
  generatedKey,
  keyName,
  setKeyName,
  generate,
}: GenerateKeyProps) {
  return (
    <div className={page === 'api-key' ? 'mt-4' : ''}>
      {page === 'telemetry' && generatedKey ? (
        <Button
          onClick={generate}
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          Copy API key
        </Button>
      ) : (
        <Dialog>
          <DialogTrigger asChild>
            {page === 'telemetry' ? (
              <Button className="bg-red-600 hover:bg-red-700 text-white">
                Create API Key
              </Button>
            ) : (
              <Button
                onClick={() => {
                  setGeneratedKey(null);
                }}
                variant="outline"
                className="shadow-none"
              >
                Create new API key
              </Button>
            )}
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {generatedKey ? 'Generated key' : 'Create new API key'}
              </DialogTitle>
            </DialogHeader>
            <div className="gap-2 py-4">
              {generatedKey ? (
                <div>
                  <p className="text-muted-foreground">
                    Please copy the key below. You will not be able to see it
                    again.
                  </p>
                  <Input
                    value={generatedKey}
                    className="my-2 w-full"
                    readOnly
                  />
                  <Link href={PLATFORM.EXPLORER} target="_blank">
                    <Button
                      className="mt-4 hover:bg-red-900"
                      variant={'default'}
                    >
                      Explore Models and Swarms
                    </Button>
                  </Link>
                </div>
              ) : (
                <div>
                  <label htmlFor="name" className="text-right">
                    Name
                  </label>
                  <Input
                    id="name"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        generate();
                      }
                    }}
                    value={keyName}
                    className="my-2 w-full"
                    onChange={(value) => {
                      setKeyName(value);
                    }}
                  />
                </div>
              )}
            </div>

            {!generatedKey && (
              <DialogFooter>
                <Button
                  disabled={addApiKey.isPending}
                  type="button"
                  onClick={generate}
                >
                  Generate key{' '}
                  {addApiKey?.isPending && (
                    <LoadingSpinner size={19} className="ml-2" />
                  )}
                </Button>
              </DialogFooter>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
