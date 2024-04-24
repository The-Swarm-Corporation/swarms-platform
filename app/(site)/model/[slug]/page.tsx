import ModelModule from '@/modules/model';

const Model = ({
  params
}: {
  params: {
    slug: string;
  };
}) => {
  return <ModelModule slug={params.slug} />;
};

export default Model;
