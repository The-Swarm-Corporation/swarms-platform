import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Modal from '@/shared/components/modal';
import { ShareDetails, openShareWindow } from '@/shared/utils/helpers';
import { Button } from '@/shared/components/ui/button';
import { useToast } from '@/shared/components/ui/Toasts/use-toast';

interface ShareModalProps {
  link?: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ShareModal({ isOpen, onClose, link }: ShareModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const toast = useToast();
  
  useEffect(() => {
    if (isOpen) {
      // Add a small delay for the animation
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

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
      className={`flex flex-col items-start justify-center max-sm:max-w-[320px] transition-all duration-300 ease-in-out ${
        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
      } border-2 border-gray-800 rounded-lg`}
    >
      <div className="relative flex items-center pt-0.5 w-full">
        <div className="grow border-t border-gray-300 dark:border-zinc-800" />
      </div>
      <div className="w-full px-4">
        <span className="mb-2 text-sm text-gray-400">Share the link via</span>
        <ul className="flex flex-wrap gap-4 md:gap-6 lg:gap-10 justify-start w-full my-4 p-0">
          {data.map((item, index) => (
            <li
              key={index}
              className="flex flex-col items-center justify-center cursor-pointer transform transition-transform hover:scale-110"
              onClick={item.func}
            >
              <div
                style={{ backgroundColor: item.bgColor }}
                className="rounded-full p-1.5 h-[41px] md:h-[51px] lg:h-[61px] w-[41px] md:w-[51px] lg:w-[61px] flex items-center justify-center transition-all duration-200 hover:shadow-lg"
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
      <div className="flex items-start justify-start w-full flex-col px-4 pb-4">
        <span className="text-sm text-gray-400">Or copy link</span>
        <div className="flex items-center w-full border-[1px] rounded-lg p-2 mt-2">
          <input
            type="text"
            readOnly
            className="bg-transparent w-full px-2 text-sm md:text-base"
            value={`https://swarms.world${link}`}
          />
          <Button 
            onClick={handleCopy}
            className="ml-2 transition-all duration-200 bg-blue-600 hover:bg-blue-900"
          >
            Copy
          </Button>
        </div>
      </div>
    </Modal>
  );
}
