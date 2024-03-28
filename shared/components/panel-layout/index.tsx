'use client';
import PanelLayoutSidebar from './sidebar';
import { ThemeProvider } from '../ui/theme-provider';
import { TrpcProvider } from '@/shared/utils/trpc/trpc-provider';
import BasicOnboardingModal from '../basic-onboarding-modal';

const PanelLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
      >
        <TrpcProvider>
          <div className="flex flex-row w-screen h-screen">
            {/* sidebar */}
            <div className="flex flex-col flex-shrink-0 w-[250px] h-screen border-r border-gray-900">
              <PanelLayoutSidebar />
            </div>
            {/* content */}
            <div className="flex container h-full overflow-scroll mx-auto py-8">
              {children}
            </div>
          </div>
          <BasicOnboardingModal />
        </TrpcProvider>
      </ThemeProvider>
    </>
  );
};

export default PanelLayout;
