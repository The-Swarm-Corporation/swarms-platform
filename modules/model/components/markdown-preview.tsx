'use client';
import ReactMarkdownPreview from '@uiw/react-markdown-preview';

const MarkdownPreview = ({ content }: { content: string }) => {
  return (
    <ReactMarkdownPreview
      className="!bg-transparent !text-white"
      source={content}
    />
  );
};

export default MarkdownPreview;
