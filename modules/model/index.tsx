import Card3D, { CardBody, CardItem } from '@/shared/components/3d-card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/shared/components/ui/tabs';
import VlmPlayground from '@/shared/components/vlm-playground';
import { getURL } from '@/shared/utils/helpers';
import { trpcApi } from '@/shared/utils/trpc/trpc';
import { redirect } from 'next/navigation';
import MarkdownPreview from './components/markdown-preview';

const Model = async ({ slug }: { slug: string }) => {
  const model = await trpcApi.explorer.getModelBySlug.query(slug);
  if (!model) {
    redirect('/404');
  }
  const tags = model.tags?.split(',') || [];
  const usecases = (model.use_cases ?? []) as {
    title: string;
    description: string;
  }[];
  const modelCardData = model.model_card_md ?? '';

  return (
    <>
      <div className="max-w-6xl px-6 mx-auto">
        <div className="flex flex-col py-16">
          {/* header */}
          <h2 className="">Model</h2>
          <h1 className="text-6xl">{model.name}</h1>
          <div className="text-base mt-4 text-gray-400">
            {model.description}
          </div>
          <div className="flex gap-2 mt-4 select-none flex-wrap">
            {tags.map((tag) => (
              <div className="text-sm px-2 py-1 rounded-2xl !text-red-500/70 border border-red-500/70">
                {tag}
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <h2 className="text-4xl">Usecases</h2>
          <div className="flex gap-2 flex-col md:flex-row">
            {usecases.map((usecase) => (
              <Card3D containerClassName="flex-1 " className="inter-var w-full">
                <CardBody className="bg-gray-50 relative group/card dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-auto h-[180px] rounded-xl p-6 border flex flex-col ">
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
                {model.model_type == 'vision' && (
                  <VlmPlayground model={model.unique_name} />
                )}
              </TabsContent>
              <TabsContent className="m-0" value={'card'}>
                <MarkdownPreview content={modelCardData} />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default Model;
