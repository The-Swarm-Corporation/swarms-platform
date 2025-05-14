import { KeyRound, Loader, X } from 'lucide-react';
import MessageScreen from '../chat/components/message-screen';
import Link from 'next/link';
import { Button } from '../ui/button';

export const LayoutLoader = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 top-0 z-[5000] flex h-screen w-screen items-center justify-center bg-[rgba(0,0,0,0.9)] text-center">
      <div className="animate-spin duration-1000">
        <Loader color="#fff" size={25} />
      </div>
    </div>
  );
};

export const MessageComponent = ({
  handleCloseMessage,
}: {
  handleCloseMessage: () => void;
}) => {
  return (
    <MessageScreen
      icon={KeyRound}
      iconClass="h-12 w-12 text-yellow-500 mb-2"
      title="API Key Required"
      borderClass="border border-zinc-700/50"
      containerClass="fixed bottom-0 left-0 right-0 top-0 z-[5000] flex h-screen w-screen items-center justify-center bg-[rgba(0,0,0,0.9)]"
      boxClass="relative"
    >
      <X
        className="text-white absolute top-4 right-4 cursor-pointer"
        role="button"
        tabIndex={0}
        onClick={handleCloseMessage}
        aria-label="Close message"
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleCloseMessage();
          }
        }}
      />
      <p className="text-center text-sm text-zinc-300">
        You&apos;ll need an API key to interact to with your telemetry.
      </p>
      <Link
        href="https://swarms.world/platform/api-keys"
        target="_blank"
        className="mt-6"
      >
        <Button className="bg-primary hover:bg-primary/80">
          <KeyRound size={20} className="mr-2" /> Create API Key
        </Button>
      </Link>
    </MessageScreen>
  );
};
