'use client';
import { QueryClient, QueryClientProvider } from 'react-query';
import PanelLayoutSidebar from './sidebar';
import { ThemeProvider } from '../ui/theme-provider';

const queryClient = new QueryClient();
const PanelLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <div className="flex flex-row w-screen h-screen">
        {/* sidebar */}
        <div className="flex flex-col flex-shrink-0 w-[250px] h-screen border-r border-gray-900">
          <PanelLayoutSidebar />
        </div>
        {/* content */}
        <div className="flex flex-col flex-5 w-full h-full overflow-scroll p-8">
          <QueryClientProvider client={queryClient}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
          </QueryClientProvider>
        </div>
      </div>
    </>
  );
};

export default PanelLayout;
