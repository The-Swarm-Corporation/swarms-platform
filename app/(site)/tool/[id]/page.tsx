import ToolModule from '@/modules/tool';
export const dynamic = 'force-dynamic';

const Tool = async ({
  params,
}: any) => {
  const resolvedParams = await params;
  return <ToolModule id={resolvedParams.id} />;
};

export default Tool;
