import ModelModule from '@/modules/model';
export const dynamic = 'force-dynamic';
const Model = ({
  params,
}: {
  params: {
    slug: string;
  };
}) => {
  return <ModelModule slug={params.slug} />;
};

export default Model;
