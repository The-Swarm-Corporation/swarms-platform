import { FileText, Image, Video, Music, File } from 'lucide-react';
import { FileWithPreview } from './hooks/useFileUpload';
import { Tables } from '@/types_db';

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

export async function uploadFileWithProgress(
  uploadUrl: string,
  file: File,
  onProgress: (progress: number) => void,
) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', uploadUrl);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const progress = Math.round((event.loaded / event.total) * 100);
        onProgress(progress);
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        onProgress(100);
        resolve();
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    };

    xhr.onerror = () => reject(new Error('Network error during file upload'));
    xhr.send(file);
  });
}

export function transformMessages(
  messages: Tables<'swarms_cloud_chat_messages'>[] = [],
) {
  return messages.flatMap((msg) => {
    try {
      let parsedContent = JSON.parse(msg?.content as string);

      if (!Array.isArray(parsedContent)) return [];

      return parsedContent
        .filter(
          (entry) =>
            msg.role.toLowerCase() !== 'assistant' ||
            entry.role.toLowerCase() !== 'user',
        )
        .map((entry) => ({
          role: entry.role,
          content: entry.content
            .replace(/Time:\s\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}\s*/g, '')
            .trim(),
        }));
    } catch (error) {
      console.error('Error parsing content:', error);
      return [];
    }
  });
}

export function transformEditMessages(
  messages: Tables<'swarms_cloud_chat_messages'>[] = [],
  updatedMessage: Tables<'swarms_cloud_chat_messages'>,
) {
  const updatedTimestamp = updatedMessage.timestamp
    ? new Date(updatedMessage.timestamp).getTime()
    : 0;

  const priorMessages = messages.filter((msg) => {
    if (!msg.timestamp || msg.id === updatedMessage.id) return false;
    return new Date(msg.timestamp).getTime() < updatedTimestamp;
  });

  return priorMessages.flatMap((msg) => {
    try {
      let parsedContent = JSON.parse(msg?.content as string);

      if (!Array.isArray(parsedContent)) return [];

      return parsedContent
        .filter(
          (entry) =>
            msg.role.toLowerCase() !== 'assistant' ||
            entry.role.toLowerCase() !== 'user',
        )
        .map((entry) => ({
          role: entry.role,
          content: entry.content
            .replace(/Time:\s\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}\s*/g, '')
            .trim(),
        }));
    } catch (error) {
      console.error('Error parsing content:', error);
      return [];
    }
  });
}
