"use client";

import { createContext, useContext, useState } from 'react';
import { CodeEditorProps, EditorType, LanguageType } from '../code-editor/type';
import {
  languages,
  paddings,
  themes,
} from '../code-editor/config';

export const EditorContext = createContext<CodeEditorProps>({
  theme: '',
  language: { name: '', icon: '' },
  padding: '',
  model: "",
  codeValue: '',
});

export default function EditorProvider({
  children,
  model
}: {
  children: React.ReactNode;
  model: string;
}) {
  const [language, setLanguage] = useState<LanguageType>(languages[0]);
  const [theme, setTheme] = useState<string>(themes[0]);
  const [padding, setPadding] = useState(paddings[2]);
  const [codeValue, setCodeValue] = useState<string>("");

  function handleCodeValueChange(newCode: string) {
    setCodeValue(newCode);
  }

  async function handleLanguageChange(newLanguage: LanguageType) {
    setLanguage(newLanguage);
  }

  function handleChange(type: EditorType, newContent: LanguageType | string) {
    switch (type) {
      case EditorType.language: {
        return handleLanguageChange(newContent as LanguageType);
      }
      case EditorType.theme: {
        return setTheme(newContent as string);
      }
      case EditorType.padding: {
        return setPadding(newContent as string);
      }
      default:
        throw new Error(`${type} is invalid`);
    }
  }
  return (
    <EditorContext.Provider
      value={{
        theme,
        model,
        language,
        padding,
        codeValue,
        handleChange,
        handleCodeValueChange,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
}

export const useEditorContext = () => useContext(EditorContext);
