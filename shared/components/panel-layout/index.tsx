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
      <PlatformNavBar user={user} />
      <div className="mt-16 md:mt-20 flex flex-row w-screen h-screen min-h-screen max-md:flex-col">
        {/* sidebar */}
        <PanelLayoutSidebar />
        {/* content */}
        {/* <Navbar /> */}
        <div className="flex container lg:max-w-full lg:px-12 h-full mx-auto py-8 max-lg:z-10">
          {children}
        </div>
      </div>
      <LayoutModals />
    </>
  );
};

export default PanelLayout;
