'use client';
import { useEffect, useState } from 'react';
import ReactPrismjs from '@uiw/react-prismjs';
import '@/shared/styles/prism-one-dark.css';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-bash';
import { cn } from '@/shared/utils/cn';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { useToast } from '../ui/Toasts/use-toast';
import { Copy } from 'lucide-react';

export interface ICodeBoxItems {
  title?: string;
  sourceCode: string;
}

export type ISampleCodes = Record<string, ICodeBoxItems>;

interface ICodeBoxProps {
  value?: string;
  initLanguage?: string;
  sampleCodes: ISampleCodes;
  classes?: {
    root?: string;
    title?: string;
    content?: string;
  };
  hideList?: boolean;
}

const CodeBox = ({
  sampleCodes,
  initLanguage,
  classes,
  value,
  hideList,
}: ICodeBoxProps) => {
  const [selectedLanguage, setSelectedLanguage] = useState(
    initLanguage || Object.keys(sampleCodes)[0],
  );
  const [copied, setCopied] = useState<boolean>(false);

  const toast = useToast();
  useEffect(() => {
    if (value) {
      setSelectedLanguage(value);
    }
  }, [value]);

  const handleCopy = () => {
    const sourceCode = sampleCodes[selectedLanguage].sourceCode;
    navigator.clipboard.writeText(sourceCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
    toast.toast({ title: 'Copied to clipboard' });
  };

  return (
    <div
      className={cn(
        'rounded-xl bg-primary border-primary border-2',
        classes?.root,
      )}
    >
      <div
        className={cn('p-2 flex justify-center items-center', classes?.title)}
      >
        <div className='flex w-full items-center'>
          <p className="flex-1 text-start">
            {sampleCodes[selectedLanguage].title}
          </p>
          <button
            className="btn luma-button flex-center medium light solid variant-color-light no-icon"
            type="button"
            onClick={handleCopy}
          >
            <Copy />
          </button>
        </div>

        {hideList
          ? null
          : Object.keys(sampleCodes).length > 1 && (
            <div className="w-fit">
              <Select
                onValueChange={setSelectedLanguage}
                value={selectedLanguage}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="model" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(sampleCodes).map((language, index) => (
                    <SelectItem
                      key={`SELECT_ITEM_${language}_${index}`}
                      value={language}
                    >
                      {language}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
      </div>
      <ReactPrismjs
        className={cn('!m-0 !bg-[rgb(0 0 0)] rounded-b-xl', classes?.content)}
        prefixCls="prism"
        language={selectedLanguage}
        source={sampleCodes[selectedLanguage].sourceCode}
      />
    </div>
  );
};

export default CodeBox;
