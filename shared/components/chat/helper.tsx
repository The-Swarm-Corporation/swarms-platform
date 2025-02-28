import { FileText, Image, Video, Music, File } from 'lucide-react';
import { FileWithPreview } from './hooks/useFileUpload';

export interface MessageObj {
  role: string;
  content: string;
  timestamp?: string;
}

export const getFileIcon = (file: FileWithPreview) => {
  switch (file.type) {
    case 'document':
      return <FileText className="w-6 h-6" />;
    case 'image':
      // eslint-disable-next-line jsx-a11y/alt-text
      return <Image className="w-6 h-6" />;
    case 'video':
      return <Video className="w-6 h-6" />;
    case 'audio':
      return <Music className="w-6 h-6" />;
    default:
      return <File className="w-6 h-6" />;
  }
};

export const parseJSON = (data: any) => {
  try {
    return typeof data === 'string' ? JSON.parse(data) : data;
  } catch {
    return data;
  }
};
