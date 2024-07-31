import ToolModule from '@/modules/tool';
export const dynamic = 'force-dynamic';

const Tool = ({
  params,
}: {
  params: {
    id: string;
  };
}) => {
  return <ToolModule id={params.id} />;
};

export default Tool;
