import React from 'react';
import SwarmsHero from './modules/hero';
import SwarmsFeatures from './modules/features';
import SwarmsBenefits from './modules/benefits';
import SwarmsHowItWorks from './modules/how-it-works';
import SwarmsInstallation from './modules/installation';
import SwarmsGetStarted from './modules/get-started';
import dynamic from 'next/dynamic';

const SwarmsExamples = dynamic(() => import('./modules/examples'), {
  ssr: false,
});

export default function SwarmsPython() {
  return (
    <main className="container mx-auto px-4">
      <SwarmsHero />
      <SwarmsFeatures />
      <SwarmsBenefits />
      <SwarmsHowItWorks />
      <SwarmsInstallation />
      <SwarmsExamples />
      <SwarmsGetStarted />
    </main>
  );
}
