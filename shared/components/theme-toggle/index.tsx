'use client';

import dynamic from 'next/dynamic';
import { useTheme } from 'next-themes';
import { useState } from 'react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { SINGLE, themeOptions, themes, THEMES } from '@/shared/constants/theme';

const ThemeCard = dynamic(() => import('./components/theme-card'), {
  ssr: false,
});

export default function ThemeToggle() {
  const { setTheme, theme, resolvedTheme } = useTheme();
  const [themeOption, setThemeOption] = useState(
    theme === THEMES.SYSTEM ? THEMES.SYSTEM : SINGLE,
  );

  const placeholder = themeOptions.find(
    (option) => option.value === themeOption,
  )?.label;

  function handleThemeOptionChange(value: string) {
    setThemeOption(value);

    if (value === THEMES.SYSTEM) return setTheme(THEMES.SYSTEM);
    return setTheme(THEMES.DARK);
  }

  return (
    <div>
      <h2 className="text-xl font-bold">Theme Mode</h2>

      <span className="mt-4 text-sm text-muted-foreground">
        Select theme card or sync platform with your system theme
      </span>

      <div className="mt-1 mb-6">
        <Select
          onValueChange={(value) => {
            handleThemeOptionChange(value);
          }}
          value={themeOption}
        >
          <SelectTrigger className="xl:w-2/4">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {themeOptions?.map((option) => (
              <SelectItem key={option.label} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-center gap-4">
        {themes.map((item) => (
          <ThemeCard
            key={item}
            themeLabel={item}
            disabled={theme === THEMES.SYSTEM}
            isSelected={resolvedTheme === item}
            handleTheme={() => setTheme(item)}
          />
        ))}
      </div>
    </div>
  );
}
