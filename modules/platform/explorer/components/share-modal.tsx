import React from 'react';
import Image from 'next/image';
import Modal from '@/shared/components/modal';
import { ShareDetails, openShareWindow } from '@/shared/utils/helpers';
import { Button } from '@/shared/components/ui/Button';
import { useToast } from '@/shared/components/ui/Toasts/use-toast';

interface ShareModalProps {
  link?: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ShareModal({ isOpen, onClose, link }: ShareModalProps) {
  const toast = useToast();
  const shareDetails: ShareDetails = {
    message: 'Check out this cool model/prompt/swarm on the swarms platform!',
    link: `https://swarms.world${link}`,
    subject: 'Check this out!',
  };

  const handleCopy = () => {
    navigator.clipboard
      .writeText(`https://swarms.world${link}`)
      .then(() => {
        toast.toast({ title: 'Copied to clipboard' });
      })
      .catch((e) => console.error(e));
  };

  const data = [
    {
      icon: '/twitter.svg',
      text: 'Tweet',
      func: () => openShareWindow('twitter', shareDetails),
      bgColor: 'aliceblue',
    },
    {
      icon: '/linkedin.svg',
      text: 'Post',
      func: () => openShareWindow('linkedin', shareDetails),
      bgColor: '#d8d8d8',
    },
    {
      icon: '/facebook.svg',
      text: 'Share',
      func: () => openShareWindow('facebook', shareDetails),
      bgColor: '#eceff5',
    },
    {
      icon: '/reddit.svg',
      text: 'Submit',
      func: () => openShareWindow('reddit', shareDetails),
      bgColor: '#fdd9ce',
    },
    {
      icon: '/hackernews.svg',
      text: 'Post',
      func: () => openShareWindow('hackernews', shareDetails),
      bgColor: '#f5f5f5',
    },
    {
      icon: '/email.svg',
      text: 'Email',
      func: () => openShareWindow('email', shareDetails),
      bgColor: '#fdd9ce',
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Share"
      className="flex flex-col items-start justify-center max-sm:max-w-[320px]"
    >
      <div className="relative flex items-center pt-0.5 w-full">
        <div className="grow border-t border-gray-300 dark:border-zinc-800" />
      </div>
      <div className="w-full">
        <span className="mb-2 text-sm text-gray-400">Share the link via</span>
        <ul className="flex flex-wrap gap-6 md:gap-10 justify-start w-full my-4 p-0">
          {data.map((item, index) => (
            <li
              key={index}
              className="flex flex-col items-center justify-center cursor-pointer"
              onClick={item.func}
            >
              <div
                style={{ backgroundColor: item.bgColor }}
                className="rounded-full p-1.5 h-[41px] md:h-[61px] w-[41px] md:w-[61px] flex items-center justify-center"
              >
                <Image src={item.icon} alt={item.text} width={25} height={25} />
              </div>
              <span className="text-sm mt-1">{item.text}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="relative flex items-center pt-0.5 w-full">
        <div className="grow border-t border-gray-300 dark:border-zinc-800" />
      </div>
      <div className="flex items-start justify-start w-full flex-col">
        <span className="text-sm text-gray-400">Or copy link</span>
        <div className="flex items-center w-full sm:w-[95%] border-[1px] rounded-lg p-2 mt-2">
          <input
            type="text"
            readOnly
            className="bg-transparent w-full px-2"
            value={`https://swarms.world${link}`}
          />
          <Button onClick={handleCopy}>Copy</Button>
        </div>
      </div>
    </Modal>
  );
}
