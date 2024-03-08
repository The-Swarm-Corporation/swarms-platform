'use client';
import { QueryClient, QueryClientProvider } from 'react-query';
import PanelLayoutSidebar from './sidebar';

const queryClient = new QueryClient();
const PanelLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <div className="flex flex-row w-screen h-screen">
        {/* sidebar */}
        <div className="flex flex-col flex-1 flex-shrink w-1/6 h-screen border-r border-gray-900">
          <PanelLayoutSidebar />
        </div>
        {/* content */}
        <div className="flex flex-col flex-5 w-5/6 h-full overflow-scroll p-8">
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        </div>
      </div>
    </>
  );
};

export default PanelLayout;
