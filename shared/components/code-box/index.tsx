import { useState } from 'react';
import ReactPrismjs from '@uiw/react-prismjs';
import '@/shared/styles/prism-one-dark.css';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-go';

import { cn } from '@/shared/utils/cn';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/shared/components/ui/select';

interface CodeBoxItems {
  title?: string;
  sourceCode: string;
}

interface ICodeBoxProps {
  initLanguage?: string;
  sampleCodes: Record<string, CodeBoxItems>;
  classes?: {
    root?: string;
    title?: string;
    content?: string;
  };
}

const CodeBox = ({ sampleCodes, initLanguage, classes }: ICodeBoxProps) => {
  const [selectedLanguage, setSelectedLanguage] = useState(
    initLanguage || Object.keys(sampleCodes)[0]
  );

  return (
    <div className={cn('rounded-lg bg-slate-900', classes?.root)}>
      <div
        className={cn('p-2 flex justify-center items-center', classes?.title)}
      >
        <p className="flex-1">{sampleCodes[selectedLanguage].title}</p>
        {Object.keys(sampleCodes).length > 1 && (
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
        className={cn(
          '!m-0 !bg-[rgb(22 24 29)] rounded-b-lg',
          classes?.content
        )}
        prefixCls="prism"
        language={selectedLanguage}
        source={sampleCodes[selectedLanguage].sourceCode}
      />
    </div>
  );
};

export default CodeBox;
