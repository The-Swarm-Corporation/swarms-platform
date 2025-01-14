import ToolModule from '@/modules/tool';
export const dynamic = 'force-dynamic';

const Tool = ({
  params,
}: any) => {
  return <ToolModule id={params.id} />;
};

export default Tool;
