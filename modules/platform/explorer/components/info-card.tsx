'use client'
import { cn } from '@/shared/utils/cn';
import { ShareDetails, formatPrice, getTruncatedString, openShareWindow } from '@/shared/utils/helpers';
import { ReactNode, useEffect, useState } from 'react';
import { useQueryMutation } from '../../settings/organization/hooks/organizations';
import { useToast } from '@/shared/components/ui/Toasts/use-toast';
import { Ellipsis, Facebook, Linkedin, Send, SquareArrowOutUpRight, ThumbsUp, Twitter, User } from 'lucide-react';
import Modal from '@/shared/components/modal';
import useToggle from '@/shared/hooks/toggle';
import Image from 'next/image';
import ShareImage from '@/public/images/card/share.png';
import CommentImage from '@/public/images/card/blogging.png'
import ThumbupImageClick from '@/public/images/card/thumb-up-1.png'
import ThumbupImage from '@/public/images/card/thumb-up.png'

import Link from 'next/link';
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
  link: string;
  userId?: string
}

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
  userId,
  link
}: Props) => {

  const [isButtonHover, setIsButtonHover] = useState(false);
  const [isShowShareModalOpen, setIsShowModalOpen] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [userData, setUserData] = useState<any>(null);
  const [isClickedThumbup, setIsClickedThumbup] = useState<boolean>(false);
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

  const handleClickThumbup = () => {
    setIsClickedThumbup(!isClickedThumbup)
  }

  const handleCloseModal = () => {
    setIsShowModalOpen(false);
    setOff()
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(`https://swarms.world${link}`).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const shareDetails: ShareDetails = {
    message: "Check out this cool model/prompt/swarm on the swarms platform!",
    link: `https://swarms.world${link}`,
    subject: "Check this out!"
  };

  const handleShareWithTweet = () => openShareWindow('twitter', shareDetails);
  const handleShareWithLinkedIn = () => openShareWindow('linkedin', shareDetails);
  const handleShareWithFacebook = () => openShareWindow('facebook', shareDetails);
  const handleShareWithEmail = () => openShareWindow('email', shareDetails);

  const renderPrice = (label: string, price: number, index: number) => (
    <li className={`flex flex-col text-sm ${index === 0 ? 'ml-auto' : ''}`}>
      <span className="">{label} Tokens</span>
      <span className='ml-auto'>{formatPrice(price)}/1M</span>
    </li>
  );

  useEffect(() => {
    const fetchUserData = async () => {

      if (userId) {
        try {
          const response = await fetch(`/api/user/getUser?userId=${userId}`);
          const data = await response.json();
          setUserData(data);
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };

    fetchUserData();
  }, [userId]);

  return (
    <div
      className={cn(
        'relative flex gap-4 p-4 border border-primary rounded-lg overflow-hidden group',
        className,
      )}
    >
      <div className="flex items-center justify-center h-10 bg-primary text-white rounded-full aspect-square">
        {icon}
      </div>
      <div className="h-full flex flex-col overflow-y-auto no-scrollbar w-full">
        <div className="flex flex-col gap-2 flex-grow">
          <h1 className="text-xl sm:text-2xl font-bold">{title}</h1>
          {
            userData && (<div className='flex items-center justify-start'>
              <User />
              <span className='ml-1'>
                {userData?.username}
              </span>
            </div>
            )
          }
          <div className='flex items-center justify-start w-full h-full'>
            <span title={description} className="text-md">
              {getTruncatedString(description, 100)}
            </span>
          </div>
        </div>
        <div className='w-full'>
          {(input || output) && (
            <ul className="p-0 flex items-center gap-2 ml-auto">
              {[
                input ? { label: 'Input', price: input } : null,
                output ? { label: 'Output', price: output } : null,
              ]
                .filter((item): item is { label: string; price: number } => item !== null)
                .map((item, index) => renderPrice(item.label, item.price, index))}
            </ul>
          )}
        </div>


      </div>
      <div className='flex flex-col justify-end'>
        <div className='flex flex-col justify-end items-center ml-auto bg-gray-200 rounded-md p-2 w-[42px]'>
          <Link href={link && link}
            target="_blank">
            <SquareArrowOutUpRight color='red' className='cursor-pointer hover:scale-125' />
          </Link>
          <Image src={ShareImage} alt='Share' width={20} height={20} className='mt-4 cursor-pointer hover:scale-125' onClick={handleShowShareModal} />
          {isClickedThumbup ? <Image src={ThumbupImageClick} alt='Like' className='mt-4 cursor-pointer hover:scale-125' onClick={handleClickThumbup} /> : <ThumbsUp color='red' className='mt-4 cursor-pointer hover:scale-125' onClick={handleClickThumbup} />}
          <Image src={CommentImage} alt='more' width={20} height={20} className='mt-4 cursor-pointer hover:scale-125' />
        </div>
      </div>

      {
        isShowShareModalOpen && (
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
                  value={`https://swarms.world${link}`}
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
