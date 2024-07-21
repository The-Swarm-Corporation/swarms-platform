import { useRef } from 'react';
import Dropdown from './dropdown';
import { EditorType } from '../type';
import { themes } from '../config';
import { useEditorContext } from '@/shared/components/ui/editor.provider';

export default function ThemeSelector() {
  const { theme } = useEditorContext();

  const themeRef = useRef<HTMLDivElement>(null);

  return (
    <Dropdown
      ref={themeRef}
      label={theme}
      type={EditorType.theme}
      options={themes}
    />
  );
}
