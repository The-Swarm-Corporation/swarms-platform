import React from 'react';
import { cn } from '@/shared/utils/cn';
import Logo from '@/shared/components/icons/Logo';

interface ThemeCardProps {
  themeLabel: string;
  disabled?: boolean;
  isSelected?: boolean;
  handleTheme: () => void;
}

export default function ThemeCard({
  themeLabel,
  disabled,
  isSelected,
  handleTheme,
}: ThemeCardProps) {
  const isDark = themeLabel !== 'light';

  function handleClick() {
    if (disabled) return;
    handleTheme();
  }

  return (
    <div
      className={cn(
        'w-full relative cursor-pointer',
        disabled ? 'opacity-30 cursor-not-allowed' : '',
      )}
      onClick={handleClick}
    >
      <div className="absolute inset-0 bg-transparent" />
      <div
        className={cn(
          'flex flex-col items-center p-2 mx-auto gap-3 rounded-tl-sm rounded-tr-sm text-center border',
          isDark ? 'bg-black' : 'bg-white',
        )}
      >
        <Logo width={30} height={30} />
        <div className="flex flex-col rounded-xl overflow-hidden">
          <span className="w-full bg-primary text-white p-1 text-[10px]">
            Terminal
          </span>
          <span
            className={cn(
              'p-2 pb-0 text-[10px]',
              isDark ? 'text-white' : 'text-black',
            )}
          >
            pip3 install -U swarms
          </span>
        </div>
      </div>

      <div className="flex items-center text-sm gap-2 bg-foreground text-secondary rounded-bl-sm rounded-br-sm border-gray-700/100 border-t-2 py-2 px-4">
        <div
          className={cn(
            'w-4 h-4 flex relative items-center justify-center border border-gray-400 rounded-sm',
            isSelected
              ? "bg-primary before:content-['✔'] before:absolute before:inline-block before:text-xs before:text-white"
              : '',
          )}
        />
        <span className="first-letter:capitalize">
          {themeLabel} {isDark && '(default)'}
        </span>
      </div>
    </div>
  );
}
