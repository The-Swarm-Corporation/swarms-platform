import { KeyRound, Loader, X } from 'lucide-react';
import MessageScreen from '../chat/components/message-screen';
import Link from 'next/link';
import { Button } from '../ui/button';

export const LayoutLoader = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 top-0 z-[5000] flex h-screen w-screen items-center justify-center bg-background/80 backdrop-blur-sm text-center">
      <div className="animate-spin duration-1000">
        <Loader className="h-6 w-6 text-foreground" />
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
      iconClass="h-12 w-12 text-foreground mb-2"
      title="API Key Required"
      borderClass="border border-border"
      containerClass="fixed bottom-0 left-0 right-0 top-0 z-[5000] flex h-screen w-screen items-center justify-center bg-background/80 backdrop-blur-sm"
      boxClass="relative"
    >
      <X
        className="text-foreground absolute top-4 right-4 cursor-pointer hover:text-muted-foreground transition-colors"
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
      <p className="text-center text-sm text-muted-foreground">
        You&apos;ll need an API key to interact to with your telemetry.
      </p>
      <Link
        href="https://swarms.world/platform/api-keys"
        target="_blank"
        className="mt-6"
      >
        <Button className="bg-foreground text-background hover:bg-foreground/90">
          <KeyRound size={20} className="mr-2" /> Create API Key
        </Button>
      </Link>
    </MessageScreen>
  );
};
