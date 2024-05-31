import Pricing from '@/modules/pricing';
import CodeSampleSection from './components/code-sample-section';
import CompaniesSection from './components/companies-section';
import HeroSection from './components/hero-section';
import OpenSourceSection from './components/open-source-section';

export default function Landing() {
  return (
    <>
      <HeroSection />
      <CompaniesSection />
      <CodeSampleSection />
      <OpenSourceSection />
      <Pricing />
    </>
  );
}
