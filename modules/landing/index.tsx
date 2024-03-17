import FeaturesSection from './components/features-section';
import HeroSection from './components/hero-section';
import OpenSourceSection from './components/open-source-section';
import PanelSection from './components/panel-section';
export default function Landing() {
  return (
    <>
      <HeroSection />
      <OpenSourceSection />
      <PanelSection />
      <FeaturesSection />
    </>
  );
}
