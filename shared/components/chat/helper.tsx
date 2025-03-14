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

export const buildSwarmTask = (
  messages: Tables<'swarms_cloud_chat_messages'>[] = [],
  latestUserMessage: string,
) => {
  const conversationHistory = messages.length
    ? messages
        .filter((msg) => msg.role === 'user' || msg.role === 'assistant')
        .map((msg) => {
          const parsedContent = JSON.parse(msg?.content as string);
          return parsedContent
            .map(
              (item: any) =>
                `${item.role}: ${item.content.replace(/\n/g, ' ')}`,
            )
            .join('\n');
        })
        .join('\n')
    : null;

  const task = conversationHistory
    ? {
        task: `Conversation History:\n${conversationHistory}\n\nCurrent Question: ${latestUserMessage}`,
      }
    : {
        task: `Current Question: ${latestUserMessage}`,
      };

  return task;
};

export const buildSwarmTaskForEdit = (
  messages: Tables<'swarms_cloud_chat_messages'>[] = [],
  updatedMessage: Tables<'swarms_cloud_chat_messages'>,
  userMessage: string,
) => {
  const updatedTimestamp = updatedMessage.timestamp
    ? new Date(updatedMessage.timestamp).getTime()
    : 0;

  const priorMessages = messages.filter((msg) => {
    if (!msg.timestamp || msg.id === updatedMessage.id) return false;
    return new Date(msg.timestamp).getTime() < updatedTimestamp;
  });

  const conversationHistory = priorMessages.length
    ? priorMessages
        .filter((msg) => msg.role === 'user' || msg.role === 'assistant')
        .map((msg) => {
          const parsedContent = JSON.parse(msg?.content as string);
          return parsedContent
            .map((item: any) => `${item.role}: ${item.content.replace(/\n/g, ' ')}`)
            .join('\n');
        })
        .join('\n')
    : null;

  const task = conversationHistory
    ? {
        task: `Conversation History:\n${conversationHistory}\n\nCurrent Question: ${userMessage}`,
      }
    : {
        task: `Current Question: ${userMessage}`,
      };

  return task;
};
