import PromptModule from '@/modules/prompt';
export const dynamic = 'force-dynamic';

const Prompt = async ({
  params,
}: {
      params: any;
}) => {
  const resolvedParams = await params;
  return <PromptModule id={resolvedParams.id} />;
};

export default Prompt;
