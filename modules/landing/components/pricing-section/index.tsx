import Pricing from '@/shared/components/pricing';

const PricingSection = () => {
  return (
    <div className="flex flex-col container mx-auto bg-background">
      <div className="flex flex-col justify-center items-center m-10 ">
        <h1 className="text-6xl font-bold">Pricing</h1>
      </div>
      <Pricing />
    </div>
  );
};

export default PricingSection;
