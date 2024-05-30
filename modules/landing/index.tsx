import Pricing from '@/modules/pricing';
import CodeSampleSection from './components/code-sample-section';
import CompaniesSection from './components/companies-section';
import HeroSection from './components/hero-section';
import OpenSourceSection from './components/open-source-section';
import PricingSection from './components/pricing-section';
export default function Landing() {
  return (
    <>
      <HeroSection />
      <CompaniesSection />
      <CodeSampleSection />
      <PricingSection />
      <OpenSourceSection />
      <Pricing />
    </>
  );
}
