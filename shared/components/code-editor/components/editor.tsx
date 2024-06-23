'use client';

import AceEditor from 'react-ace';

// languages
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/mode-golang';
import 'ace-builds/src-noconflict/mode-python';

// themes
import 'ace-builds/src-noconflict/theme-twilight';
import 'ace-builds/src-noconflict/theme-cobalt';
import 'ace-builds/src-noconflict/theme-dracula';
import 'ace-builds/src-noconflict/theme-monokai';

import '../styles.css';
import Image from 'next/image';
import { getEditorCode, getLangFileName } from '../config';
import { useEditorContext } from '../../ui/editor.provider';
import { forwardRef, useImperativeHandle, useRef } from 'react';
interface CodeEditorProps {
  resHeight?: number;
  readonly?: boolean;
}

const CodeEditor = forwardRef(
  ({ resHeight = 500, readonly = false }: CodeEditorProps, ref) => {
    const {
      language,
      theme,
      padding,
      codeValue,
      model,
      handleCodeValueChange,
    } = useEditorContext();
    const file = getLangFileName(language?.name);
    const code = getEditorCode(language?.name, model);

    const aceEditorRef = useRef(null);

    useImperativeHandle(ref, () => ({
      getEditorInstance: () => (aceEditorRef?.current as any)?.editor,
    }));

    return (
      <div className="code-container" style={{ padding: 'auto' }}>
        <div className="code-title h-[52px] px-4 flex items-center justify-between bg-black bg-opacity-80">
          <div className="dots flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-[#ff5656]"></div>
            <div className="w-3 h-3 rounded-full bg-[#ffbc6a] "></div>
            <div className="w-3 h-3 rounded-full bg-[#67f772] "></div>
          </div>

          <div className="input-contol w-full">
            <input
              type="text"
              readOnly
              value={file}
              className="w-full text-[hsla(0,0%,100%,.6)]  outline-none font-medium 
                  text-center bg-transparent"
              style={{
                lineHeight: '1.8rem',
              }}
            />
          </div>

          <div
            className="icon flex justify-center items-center p-1 bg-black
                 bg-opacity-30 rounded-sm"
          >
            <Image
              src={language.icon}
              alt={language.name}
              width={33}
              height={33}
              style={{ objectFit: 'contain' }}
            />
          </div>
        </div>
        <AceEditor
          ref={aceEditorRef}
          value={codeValue || code}
          readOnly={readonly}
          name="UNIQUE_ID_OF_DIV"
          theme={theme}
          mode={language?.name.toLowerCase()}
          wrapEnabled
          fontSize={14}
          height={`calc(${resHeight}px - ${padding} - ${padding} - 52px)`}
          highlightActiveLine={false}
          showGutter={false}
          onChange={handleCodeValueChange}
          showPrintMargin={false}
          editorProps={{ $blockScrolling: true }}
          className="code-editor"
        />
      </div>
    );
  },
);

export default CodeEditor;
