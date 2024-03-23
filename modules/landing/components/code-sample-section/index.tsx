"use client";

import CodeBox, { ISampleCodes } from "@/shared/components/code-box";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import TabsData from './data';

interface IStepProps {
  title: string;
  description: string;
  sourceCode: ISampleCodes;
}
const Step = ( { title, description, sourceCode} : IStepProps) => {
    return(
      <div className="flex h-full max-sm:flex-col">
        <div className="flex w-[50%] max-sm:flex-col flex-col me-4">
          <h4 className="text-4xl font-bold">{title}</h4>
          <p className="text-lg">{description}</p>
        </div>
        {/*  max-sm:min-w-[100%] max-sm:max-w-[100%] */}
        <div className="min-w-[50%] max-w-[50%] ms-4">
          <CodeBox
            sampleCodes={sourceCode}  
            classes={{
              root: 'w-full',
              content: 'h-[60vh] w-full overflow-auto'
            }}
          />
        </div>
      </div>
    )
}

const CodeSampleSection = () => {
  return (
    <div className="container p-10">
      <h2 className="text-8xl max-sm:text-6xl font-bold text-center mb-12">Code Samples</h2>
      <Tabs className="flex flex-col justify-center items-center gap-6"  defaultValue="0">
        <TabsList orientation="vertical">
          {Object.values(TabsData).map((tab, index) => (
            <TabsTrigger key={`TAB_HEADER_${index}`} value={String(index)}>{tab.title}</TabsTrigger>
          ))}
        </TabsList>
        {Object.values(TabsData).map((tab, index) => (
          <TabsContent key={`TAB_CONTENT_${index}`} value={String(index)}>
            <Step title={tab.title} description={tab.description} sourceCode={tab.sampleCodes} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default CodeSampleSection;