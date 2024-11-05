import { createClient } from '@/shared/utils/supabase/server';
import PanelLayoutSidebar from './components/sidebar/sidebar';
import PlatformNavBar from './components/navbar/navbar';
import LayoutModals from './components/modal';

const PanelLayout = async ({ children }: { children: React.ReactNode }) => {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      <div className="flex flex-col min-h-screen bg-background">
        <PlatformNavBar user={user} />
        <div className="flex flex-1 pt-16 md:pt-20">
          <PanelLayoutSidebar user={user} />
          <main className="flex-1 px-4 py-8 lg:px-8">
            <div className="max-w-7xl mx-auto">{children}</div>
          </main>
        </div>
        <LayoutModals />
      </div>
    </>
  );
};

export default PanelLayout;
