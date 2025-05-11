'use client';

import { cn } from '@/shared/utils/cn';
import Link from 'next/link';
import { Bolt, CheckCircle, Gem, PackageOpen, Sparkles } from 'lucide-react';
import React, { useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { checkUserSession } from '@/shared/utils/auth-helpers/server';
import useSubscription from '@/shared/hooks/subscription';
import LoadingSpinner from '@/shared/components/loading-spinner';
import { Button } from '@/shared/components/ui/button';
import { PLATFORM } from '@/shared/utils/constants';

export interface PricingCardProps {
  title: string;
  description: string;
  price:
    | string
    | { monthly: string; discount: string; annually: string; lifetime: string };
  link: string;
  index: number;
  lifetime_description?: string;
  subtitle?: string;
  page?: 'pricing' | 'account';
  content: Record<string, string>;
  isAnnually: boolean;
  isLifetime: boolean;
}

export default function PricingCard({
  title,
  description,
  price,
  link,
  index,
  subtitle,
  content,
  isAnnually,
  isLifetime,
  page,
  lifetime_description,
}: PricingCardProps) {
  const subscription = useSubscription();
  const lowerTitle = title.toLowerCase();

  const isPremium = lowerTitle === 'premium';
  const isEnterprise = lowerTitle === 'enterprise';
  const isFree = lowerTitle === 'free';

  const displayPrice = useMemo(() => {
    if (typeof price === 'string') return price;
    if (isLifetime) return Number(price.lifetime).toLocaleString();
    return isAnnually ? price.discount : price.monthly;
  }, [price, isAnnually, isLifetime]);

  const showAnnualStrike = useMemo(() => {
    return typeof price !== 'string' && price.annually && isAnnually;
  }, [price, isAnnually]);

  const getPlanIcon = () => {
    if (isPremium) return <Bolt />;
    if (isFree) return <PackageOpen />;
    return <Gem />;
  };

  const handlePaymentSession = async () => {
    await checkUserSession();

    const productId = isLifetime
      ? process.env.NEXT_PUBLIC_STRIPE_LIFETIME_SUBSCRIPTION_PRODUCT_ID
      : isAnnually
        ? process.env.NEXT_PUBLIC_STRIPE_YEARLY_SUBSCRIPTION_PRODUCT_ID
        : process.env.NEXT_PUBLIC_STRIPE_MONTHLY_SUBSCRIPTION_PRODUCT_ID;

    const productType = isLifetime ? 'one_time' : 'recurring';
    const cancelPath = page === 'account' ? PLATFORM.ACCOUNT : '/pricing';

    subscription.createSubscriptionPortal(
      productId ?? '',
      productType,
      cancelPath,
    );
  };

  const renderPriceSection = () => {
    if (isEnterprise) return null;

    return (
      <div className="my-8 flex">
        {showAnnualStrike && (
          <sup className="text-sm font-bold text-white uppercase lg:text-xl line-through">
            ${(price as any).annually}
          </sup>
        )}
        <p className="flex items-end">
          <span className="text-2xl font-bold text-white uppercase lg:text-5xl">
            ${displayPrice}
          </span>
          {!isLifetime && (
            <span className="ml-1 text-sm font-medium text-white">
              {isEnterprise ? '/user' : ''} <br />
              {isAnnually ? '/year' : '/month'}
            </span>
          )}
        </p>
      </div>
    );
  };

  const renderActionButton = () => {
    const sharedClasses = cn(
      'items-center justify-between uppercase inline-flex w-full font-medium px-6 py-2.5 text-center',
      'duration-200 border border-white/5 dark:border-white/10 rounded-xl h-14',
      'focus:outline-none focus-visible:outline-black text-base focus-visible:ring-black',
    );

    if (isEnterprise) {
      return (
        <Link
          href="https://cal.com/swarms"
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            sharedClasses,
            'text-white bg-white/10 dark:bg-white/5 hover:bg-white/10 hover:border-white/10 lg:mt-28',
          )}
        >
          {page === 'pricing' ? 'Get Started' : 'Contact us'}
        </Link>
      );
    }

    if (isPremium) {
      return (
        <Button
          onClick={handlePaymentSession}
          className={cn(
            sharedClasses,
            'text-black bg-white hover:bg-white/20 hover:border-white hover:text-white',
          )}
          disabled={subscription.createSubscriptionPortalLoading}
          aria-disabled={subscription.createSubscriptionPortalLoading}
        >
          <span>{page === 'pricing' ? 'Get Started' : 'Subscribe'}</span>
          {index === 1 && subscription.createSubscriptionPortalLoading && (
            <span className="ml-2">
              <LoadingSpinner />
            </span>
          )}
        </Button>
      );
    }

    return (
      <Link
        href="/"
        className={cn(
          sharedClasses,
          'text-white bg-white/10 dark:bg-white/5 hover:bg-white/10 hover:border-white/10',
        )}
      >
        {page === 'pricing' ? 'Get Started' : 'Free Access'}
      </Link>
    );
  };

  return (
    <div className="max-w-sm">
      <div className="flex flex-col">
        <div
          className={cn(
            'p-8 shadow-2xl rounded-3xl bg-black ring-1 ring-white/10 border',
            isPremium && 'bg-primary',
          )}
        >
          <div className="flex items-center gap-3 text-white">
            {getPlanIcon()}
            <p className="text-base font-bold capitalize">{title}</p>
          </div>
          <p className="mt-3 text-sm font-medium text-white">
            {isLifetime ? lifetime_description || description : description}{' '}
            {page === 'account' && (
              <Link
                href="/pricing"
                className={cn(
                  'underline',
                  isPremium ? 'text-black' : 'text-red-500',
                )}
              >
                Learn more
              </Link>
            )}
          </p>

          {renderPriceSection()}
          <div className="flex">{renderActionButton()}</div>
        </div>

        {page === 'pricing' && (
          <div className="px-8">
            <p className="flex items-center gap-1 mt-4 text-base drop-shadow-lg font-semibold text-primary lg:mt-8">
              <Sparkles size={12} /> {subtitle}:
            </p>
            <ul
              className="order-last gap-4 mt-4 space-y-3 text-gray-700 dark:text-gray-300 list-none"
              role="list"
            >
              {Object.keys(content).map((key) => (
                <li
                  key={key}
                  className="flex items-center mt-4 font-medium drop-shadow-md gap-2 text-sm"
                >
                  <CheckCircle className="size-4 text-gray-500" />
                  <span>{key}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
