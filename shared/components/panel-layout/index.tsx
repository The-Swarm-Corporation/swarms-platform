import PanelLayoutSidebar from './components/sidebar/sidebar';
import PlatformNavBar from './components/navbar/navbar';
import LayoutModals from './components/modal';

const PanelLayout = async ({ children }: { children: React.ReactNode }) => {

  return (
    <>
      <PlatformNavBar />
      <div className="panel-layout-wrapper mt-16 md:mt-20 flex flex-row w-screen h-screen min-h-screen max-md:flex-col">
        <PanelLayoutSidebar />
        <div className="main-wrapper-all flex container lg:max-w-7xl h-full mx-auto py-8 max-md:!px-4">
          {children}
        </div>
      </div>
      <LayoutModals />
    </>
  );
};

export default PanelLayout;
