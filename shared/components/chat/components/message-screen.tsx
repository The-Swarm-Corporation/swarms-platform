import { ComponentType, ReactNode } from 'react';

interface MessageScreenProps {
  containerClass?: string;
  boxClass?: string;
  borderClass?: string;
  icon?: ComponentType<any>;
  iconClass?: string;
  title?: string;
  children?: ReactNode;
}

export default function MessageScreen({
  containerClass = 'h-screen w-full bg-zinc-900',
  boxClass = 'bg-zinc-800/50 rounded-lg shadow-xl',
  borderClass = 'border border-zinc-700/50',
  icon: Icon,
  iconClass = 'h-12 w-12 mb-2',
  title,
  children,
}: MessageScreenProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center ${containerClass}`}
    >
      <div
        className={`flex flex-col gap-4 items-center max-w-md px-6 py-8 ${boxClass} ${borderClass}`}
      >
        {Icon && <Icon className={iconClass} />}
        {title && <h1 className="text-2xl text-center">{title}</h1>}
        {children}
      </div>
    </div>
  );
}
