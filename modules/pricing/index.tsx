import PricingCards from './components/pricing-cards';

const Pricing = () => {
  return (
    <section className="bg-background relative overflow-hidden">
      <div className="relative flex flex-col items-center justify-center max-w-6xl px-8 py-12 mx-auto lg:py-24">
        <div>
          <span className="text-6xl font-bold tracking-wide capitalize">
            Pricing
          </span>
        </div>
        <div className="mt-8">
          <PricingCards page='pricing' />
        </div>
      </div>
    </section>
  );
};

export default Pricing;
