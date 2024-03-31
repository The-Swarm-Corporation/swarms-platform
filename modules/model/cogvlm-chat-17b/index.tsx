'use client';
import Card3D, { CardBody, CardItem } from '@/shared/components/3d-card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/shared/components/ui/tabs';
import VlmPlayground from '@/shared/components/vlm-playground';
import { useQuery } from '@tanstack/react-query';
import MarkdownPreview from '@uiw/react-markdown-preview';

// create components soon
const CogvlmModel = () => {
  const tags: string[] = [
    'vision',
    'function calling',
    'visual question answering'
  ];

  const modelCard = useQuery({
    queryKey: ['cogvlm-model-card'],
    queryFn: async () => {
      const response = await fetch('/models/cogvlm.md');
      return response.text();
    }
  });

  const usecases = [
    {
      title: 'Image Captioning',
      description:
        'Generate a descriptive caption for an image, providing context and understanding of the visual content.'
    },
    {
      title: 'Visual Question Answering',
      description:
        'Answer questions about an image, demonstrating the model’s ability to understand visual elements.'
    },
    {
      title: 'Visual Reasoning',
      description:
        'Perform complex reasoning tasks based on visual input, showcasing the model’s cognitive capabilities.'
    }
  ];
  return (
    <>
      <div className="max-w-6xl px-6 mx-auto">
        <div className="flex flex-col py-16">
          {/* header */}
          <h2 className="">Model</h2>
          <h1 className="text-6xl">Cogvlm-17b</h1>
          <div className="text-base mt-4 text-gray-400">
            Groundbreaking multimodal model designed to understand and reason
            about visual elements in images.
          </div>
          <div className="flex gap-2 mt-4 select-none">
            {tags.map((tag) => (
              <div className="text-sm text-gray-400 px-2 py-1 rounded-2xl !text-cyan-500/70 border border-cyan-500/70">
                {tag}
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <h2 className="text-4xl">Usecases</h2>
          <div className="flex gap-2">
            {usecases.map((usecase) => (
              <Card3D
                containerClassName="flex-1 max-w-sm"
                className="inter-var"
              >
                <CardBody className="bg-gray-50 relative group/card  dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-auto h-auto rounded-xl p-6 border">
                  <CardItem
                    translateZ="50"
                    className="text-xl font-bold text-neutral-600 dark:text-white"
                  >
                    {usecase.title}
                  </CardItem>
                  <CardItem
                    as="p"
                    translateZ="60"
                    className="text-neutral-500 text-sm max-w-sm mt-2 dark:text-neutral-300"
                  >
                    {usecase.description}
                  </CardItem>
                </CardBody>
              </Card3D>
            ))}
          </div>
        </div>
        <div className="mt-10 py-8">
          <Tabs
            className="flex  flex-col gap-4 w-auto"
            defaultValue="playground"
          >
            <TabsList className="flex justify-start w-auto">
              <TabsTrigger value={'playground'}>Playground</TabsTrigger>
              <TabsTrigger value={'card'}>Model Card</TabsTrigger>
            </TabsList>
            <div className="p-4 rounded-xl overflow-hidden !bg-gray-500/10">
              <TabsContent className="m-0" value={'playground'}>
                <VlmPlayground model="cogvlm-chat-17b" />
              </TabsContent>
              <TabsContent className="m-0" value={'card'}>
                <MarkdownPreview
                  className="!bg-transparent"
                  source={
                    modelCard.isLoading
                      ? '## Loading model card...'
                      : modelCard.data
                  }
                />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default CogvlmModel;
