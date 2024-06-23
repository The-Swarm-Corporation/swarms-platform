import { Dispatch, SetStateAction } from 'react';

export enum EditorType {
  language = 'LANGUAGE',
  theme = 'THEME',
  background = 'BACKGROUND',
  padding = 'PADDING',
}

export type LanguageType = { name: string; icon: string };
export type LanguageProps = LanguageType[];

export interface CodeEditorProps {
  theme: string;
  language: LanguageType;
  model: string;
  padding: string;
  codeValue?: string;
  setLanguage?: Dispatch<SetStateAction<LanguageType>>;
  setCodeValue?: Dispatch<SetStateAction<string>>;
  handleChange?: (type: EditorType, value: LanguageType | string) => void;
  handleCodeValueChange?: (value: string) => void;
}

export interface DropdownProps {
  label: string;
  options: string[] | LanguageProps;
  type: EditorType;
  handleChange?: (type: EditorType, value: LanguageType | string) => void;
}
