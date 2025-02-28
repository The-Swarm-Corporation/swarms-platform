import React from 'react';
import Markdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import styles from './styles.module.css';
import { cn } from '@/shared/utils/cn';
import remarkGfm from 'remark-gfm';

export default function MarkdownComponent({ text, className }: { text: string; className?: string }) {
  return (
    <Markdown
      className={cn('prose w-full space-y-4 px-2', className, styles['rich-text'])}
      remarkPlugins={[remarkGfm]}
      components={{
        code({ children, className, node, ...rest }) {
          const match = /language-(\w+)/.exec(className || '');

          return match ? (
            <SyntaxHighlighter PreTag="div" language={match[1]} style={dracula}>
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          ) : (
            <code {...rest} className={className}>
              {children}
            </code>
          );
        },
      }}
    >
      {text || ''}
    </Markdown>
  );
}