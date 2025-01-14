import PromptModule from '@/modules/prompt';
export const dynamic = 'force-dynamic';

const Prompt = ({
  params,
}: {
      params: any;
}) => {
  return <PromptModule id={params.id} />;
};

export default Prompt;
