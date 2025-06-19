import PricingCards from './components/pricing-cards';

const Pricing = () => {
  return (
    <section className="min-h-screen bg-black relative overflow-hidden">
      {/* Grid pattern overlay (optional, can be removed for pure black) */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center justify-center max-w-7xl px-4 sm:px-6 lg:px-8 py-16 mx-auto lg:py-24">
        <PricingCards page='pricing' />
      </div>
    </section>
  );
};

export default Pricing;
