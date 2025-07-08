'use client';

import { useState } from 'react';
import Modal from '@/shared/components/modal';
import { Button } from '@/shared/components/ui/button';
import { Search, ShoppingCart, Zap } from 'lucide-react';

interface MarketplaceOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MarketplaceOnboardingModal = ({ isOpen, onClose }: MarketplaceOnboardingModalProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Discover",
      description: "Search and explore our marketplace for AI tools, agents, and prompts - both free and premium options available.",
      icon: <Search className="w-12 h-12 text-primary" />,
    },
    {
      title: "Choose",
      description: "Select the perfect tools for your needs. Compare features, reviews, and pricing to make informed decisions.",
      icon: <ShoppingCart className="w-12 h-12 text-primary" />,
    },
    {
      title: "Use",
      description: "Instantly start using your selected tools. Integrate them into your workflow and boost your productivity.",
      icon: <Zap className="w-12 h-12 text-primary" />,
    },
  ];

  const handleComplete = () => {
    // Mark as completed in localStorage
    localStorage.setItem('hasSeenMarketplaceOnboarding', 'true');
    onClose();
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleComplete} // Even if they close the modal, mark it as seen
      showHeader={false}
      showClose={true}
      className="sm:max-w-xl"
      overlayClassName="backdrop-blur-sm bg-black/30"
    >
      <div className="flex flex-col items-center p-6">
        <h2 className="text-2xl font-bold mb-8">Welcome to Swarms Marketplace</h2>
        
        <div className="w-full flex items-center justify-center mb-8">
          {steps[currentStep].icon}
        </div>

        <h3 className="text-xl font-semibold mb-2">{steps[currentStep].title}</h3>
        <p className="text-center text-muted-foreground mb-8">
          {steps[currentStep].description}
        </p>

        <div className="flex items-center gap-2 mb-6">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-2 w-2 rounded-full transition-all duration-200 ${
                index === currentStep ? 'bg-primary w-4' : 'bg-gray-300 dark:bg-gray-700'
              }`}
            />
          ))}
        </div>

        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={handleComplete}
          >
            Skip
          </Button>
          <Button
            onClick={handleNext}
          >
            {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default MarketplaceOnboardingModal; 