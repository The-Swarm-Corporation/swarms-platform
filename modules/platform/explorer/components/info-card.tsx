'use client'
import { cn } from '@/shared/utils/cn';
import { ShareDetails, formatPrice, getTruncatedString, makeUrl, openShareWindow } from '@/shared/utils/helpers';
import { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import { useQueryMutation } from '../../settings/organization/hooks/organizations';
import { useToast } from '@/shared/components/ui/Toasts/use-toast';
import { Facebook, Linkedin, Send, Share2, Twitter } from 'lucide-react';
import Modal from '@/shared/components/modal';
import useToggle from '@/shared/hooks/toggle';

interface Props {
  title: string;
  description: string;
  icon: ReactNode;
  className?: string;
  btnLabel?: string;
  input?: number | null;
  output?: number | null;
  isRating?: boolean;
  promptId?: any;
  link: string
}

const shareDetails: ShareDetails = {
  message: "Check out this cool model/prompt/swarm on the swarms platform!",
  link: "https://swarms.world/model/qwen-vl",
  subject: "Check this out!"
};

const collapsedMenu = 'collapsedMenu';

const InfoCard = ({
  title,
  description,
  icon,
  className,
  btnLabel,
  input,
  output,
  isRating,
  promptId,
  link
}: Props) => {

  const [isShowShareModalOpen, setIsShowModalOpen] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const toast = useToast();

  const { isOff, setOn, setOff, toggle } = useToggle();

  const { query } = useQueryMutation();

  const handleRatingClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!query.members.data?.length) {
      e.preventDefault();
      toast.toast({ description: 'Organization has no members' });
    }
  };

  const handleShowShareModal = () => {
    setOn();
    setIsShowModalOpen(true);
  }

  const handleCloseModal = () => {
    setIsShowModalOpen(false);
    setOff()
  }

  const handleCopy = () => {
    navigator.clipboard.writeText("https://swarms.world/model/qwen-vl").then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  
  const handleShareWithTweet = () => openShareWindow('twitter', shareDetails);
  const handleShareWithLinkedIn = () => openShareWindow('linkedin', shareDetails);
  const handleShareWithFacebook = () => openShareWindow('facebook', shareDetails);
  const handleShareWithEmail = () => openShareWindow('email', shareDetails);
  
  const renderPrice = (label: string, price: number) => (
    <li className="pricing-unit">
      <span className="font-semibold">{label}</span>
      <span>{formatPrice(price)}/1M Tokens</span>
    </li>
  );

  return (
    <div
      className={cn(
        'relative flex gap-4 p-4 px-3 border border-primary rounded-lg overflow-hidden group',
        className,
      )}
    >
      <div className="flex items-center justify-center w-10 h-10 bg-primary text-white rounded-full aspect-square">
        {icon}
      </div>
      <div className="h-4/5 flex flex-col overflow-y-auto no-scrollbar">
        <div className="flex flex-col gap-2 flex-grow">
          <h1 className="text-xl sm:text-2xl font-bold">{title}</h1>
          <span title={description} className="text-sm">
            {getTruncatedString(description, 100)}
          </span>
        </div>

        {(input || output) && (
          <ul className="p-0 my-3 flex items-center gap-2">
            {input && renderPrice('Input', input)}
            {output && renderPrice('Output', output)}
          </ul>
        )}
      </div>

      <div className='cursor-pointer' onClick={handleShowShareModal}>
        <svg
          width="95"
          height="25"
          viewBox="0 0 95 25"
          xmlns="http://www.w3.org/2000/svg"
          className="rating-svg absolute right-[150px] bottom-0 scale-x-[2.5] scale-y-[1.8] fill-[#FB0101]"
        >
          <path
            d="M21 0H95V25H0L21 0Z"
            className="fill-[#b42020]"
          />
        </svg>
        <div className="absolute right-[150px] bottom-0 text-white px-4 py-1">
          <div className="relative flex items-center justify-center gap-2 w-[80px]">
            <span>Share</span>
            <Share2 />
          </div>
        </div>
      </div>

      <Link
        href={link && link}
        target="_blank"
      >
        <div>
          <svg
            width="95"
            height="25"
            viewBox="0 0 95 25"
            xmlns="http://www.w3.org/2000/svg"
            className="preview-svg absolute right-0 bottom-0 scale-x-[2.5] scale-y-[1.8] fill-[#FB0101]"
          >
            <path
              d="M21 0H95V25H0L21 0Z"
              className="fill-[#FB0101]"
            />
          </svg>
          <div className="absolute right-0 bottom-0 text-white px-4 py-1">
            <div className="relative flex items-center justify-center gap-2 w-[110px]">
              <span>{btnLabel || 'Preview'}</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M5.74999 2H4.99999V3.5H5.74999H11.4393L2.21966 12.7197L1.68933 13.25L2.74999 14.3107L3.28032 13.7803L12.4988 4.56182V10.25V11H13.9988V10.25V3C13.9988 2.44772 13.5511 2 12.9988 2H5.74999Z"
                  fill="white"
                />
              </svg>
            </div>
          </div>
        </div>
      </Link>
      {isShowShareModalOpen && (
        <Modal
          isOpen={isShowShareModalOpen}
          onClose={handleCloseModal}
          title="Share the Assets"
          className="flex flex-col items-center justify-center"
        >
          <div className='flex flex-wrap gap-16'>
            <span className='flex flex-col items-center justify-center cursor-pointer' onClick={handleShareWithTweet}>
              <Twitter />Tweet
            </span>
            <span className='flex flex-col items-center justify-center cursor-pointer' onClick={handleShareWithLinkedIn}>
              <Linkedin />Post
            </span>
            <span className='flex flex-col items-center justify-center cursor-pointer' onClick={handleShareWithFacebook}>
              <Facebook />Share
            </span>
            <span className='flex flex-col items-center justify-center cursor-pointer' onClick={handleShareWithEmail}>
              <Send />Email
            </span>
          </div>
          <div className='w-full h-[1px] bg-white' />
          <div className='flex items-start justify-start w-full flex-col'>
            <span>
              Share the link:
            </span>
            <div className="flex items-center justify-start w-full mt-2">
              <input
                type="text"
                readOnly
                className="luma-input w-full border-[1px] rounded-lg p-2"
                value="https://swarms.world/model/qwen-vl"
              />
              <div className="ticket-share-url-copy ml-2">
                <button
                  className="btn luma-button flex-center medium light solid variant-color-light no-icon"
                  type="button"
                  onClick={handleCopy}
                >
                  <div className="label">{copied ? 'Copied' : 'Copy'}</div>
                </button>
              </div>
            </div>
          </div>

        </Modal>
      )}

    </div>
  );
};

export default InfoCard;
