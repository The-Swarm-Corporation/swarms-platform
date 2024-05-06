'use client';

import CodeBox, { ISampleCodes } from '@/shared/components/code-box';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/shared/components/ui/tabs';
import TabsData from './data';
import { useEffect, useState } from 'react';

interface IStepProps {
  title: string;
  description: string;
  sourceCode: ISampleCodes;
}
const Step = ({ title, description, sourceCode }: IStepProps) => {
  return (
    <div className="flex h-full max-sm:flex-col max-sm:gap-8">
      <div className="flex w-[50%] flex-col sm:me-4 max-sm:w-[100%] gap-4">
        <h4 className="text-4xl font-bold max-sm:text-center">{title}</h4>
        <p className="text-lg max-sm:text-center">{description}</p>
      </div>
      <div className="min-w-[50%] max-w-[50%] max-sm:min-w-[100%] max-sm:max-w-[100%] sm:ms-4">
        <CodeBox
          sampleCodes={sourceCode}
          classes={{
            root: 'w-full max-w-[100%]',
            content: 'h-[60vh] w-full overflow-auto ',
          }}
        />
      </div>
    </div>
  );
};

const CodeSampleSection = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (window && window.innerWidth < 768) {
      setIsMobile(true);
    }
  }, []);

  return (
    <div className="container p-10 bg-background">
      <h2 className="text-8xl max-sm:text-4xl font-bold text-center mb-12">
        Get Started
      </h2>
      <Tabs
        className="flex flex-col justify-center items-center gap-6"
        defaultValue="0"
      >
        <TabsList orientation={isMobile ? 'vertical' : 'horizontal'}>
          {Object.values(TabsData).map((tab, index) => (
            <TabsTrigger key={`TAB_HEADER_${index}`} value={String(index)}>
              {tab.title}
            </TabsTrigger>
          ))}
        </TabsList>
        {Object.values(TabsData).map((tab, index) => (
          <TabsContent key={`TAB_CONTENT_${index}`} value={String(index)}>
            <Step
              title={tab.title}
              description={tab.description}
              sourceCode={tab.sampleCodes}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default CodeSampleSection;
