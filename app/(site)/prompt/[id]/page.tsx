import PromptModule from '@/modules/prompt';
export const dynamic = 'force-dynamic';

const Prompt = ({
  params,
}: {
  params: {
    id: string;
  };
}) => {
  return <PromptModule id={params.id} />;
};

export default Prompt;
