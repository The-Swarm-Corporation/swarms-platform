'use client';
import MacbookScroll from '@/shared/components/macbook-scroll';
import ImageScreen from '@/public/images/panel-screen.png';

const PanelSection = () => {
  return (
    <div className="overflow-hidden bg-background w-full relative pt-28">
      <MacbookScroll
        title={
          <span className="text-4xl">
            <span className="text-primary">Swarm Platform </span>
            <br /> You Can Use and Test Our Models Easily
          </span>
        }
        src={ImageScreen}
        showGradient={false}
      />
    </div>
  );
};

export default PanelSection;
