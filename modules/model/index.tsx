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
import EntityComponent from '@/shared/components/entity';

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
    <EntityComponent
      title="Model"
      tags={tags}
      usecases={usecases}
      name={model.name ?? ''}
      description={model.description ?? ''}
    >
      <div className="mt-10 py-8">
        <Tabs className="flex  flex-col gap-4 w-auto" defaultValue="playground">
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
    </EntityComponent>
  );
};

export default Model;
