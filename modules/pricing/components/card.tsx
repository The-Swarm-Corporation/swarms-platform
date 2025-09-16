'use client';

import { cn } from '@/shared/utils/cn';
import Link from 'next/link';
import { Bolt, CheckCircle, Gem, PackageOpen, Sparkles, ArrowRight, Star, Shield, Zap } from 'lucide-react';
import React, { useMemo } from 'react';
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
    if (isPremium) return <Zap className="w-6 h-6" />;
    if (isFree) return <PackageOpen className="w-6 h-6" />;
    return <Shield className="w-6 h-6" />;
  };

  const getPlanGradient = () => {
    if (isPremium) return 'from-red-500/20 via-red-600/20 to-red-500/20';
    if (isEnterprise) return 'from-green-500/20 via-green-600/20 to-green-500/20';
    return 'from-white/5 via-white/10 to-white/5';
  };

  const getPlanBorder = () => {
    if (isPremium) return 'border-red-500/30';
    if (isEnterprise) return 'border-green-500/30';
    return 'border-white/20';
  };

  const handlePaymentSession = async () => {
    await checkUserSession();

    const productId = isLifetime
      ? process.env.NEXT_PUBLIC_STRIPE_LIFETIME_SUBSCRIPTION_PRODUCT_ID
      : isAnnually
        ? process.env.NEXT_PUBLIC_STRIPE_YEARLY_SUBSCRIPTION_PRODUCT_ID
        : process.env.NEXT_PUBLIC_STRIPE_MONTHLY_SUBSCRIPTION_PRODUCT_ID;

    const productType = isLifetime ? 'one_time' : 'recurring';
    const cancelPath = page === 'account' ? `${PLATFORM.ACCOUNT}?payment_type=billing` : '/pricing';

    subscription.createSubscriptionPortal(
      productId ?? '',
      productType,
      cancelPath,
    );
  };

  const renderPriceSection = () => {
    if (isEnterprise) return null;

    return (
      <div className="my-8">
        {showAnnualStrike && (
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg font-semibold text-white/50 line-through">
              ${(price as any).annually}
            </span>
            <span className="px-2 py-1 bg-green-500/20 border border-green-500/30 rounded-full text-xs font-medium text-green-400">
              Save ${Number((price as any).annually) - Number(displayPrice)}
            </span>
          </div>
        )}
        <div className="flex items-baseline gap-2">
          <span className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
            ${displayPrice}
          </span>
          {!isLifetime && (
            <span className="text-lg font-medium text-white/60">
              {isEnterprise ? '/user' : ''} 
              {isAnnually ? '/year' : '/month'}
            </span>
          )}
        </div>
        {isLifetime && (
          <div className="flex items-center gap-2 mt-2">
            <Star className="w-4 h-4 text-white" />
            <span className="text-sm font-medium text-white">One-time payment</span>
          </div>
        )}
      </div>
    );
  };

  const renderActionButton = () => {
    if (isEnterprise) {
      return (
        <Link
          href="https://cal.com/swarms/swarms-onboarding-session?overlayCalendar=true"
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            'group relative w-full inline-flex items-center justify-center px-8 py-4 text-base font-semibold',
            'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
            'text-white rounded-2xl transition-all duration-300 transform hover:scale-[1.02]',
            'shadow-lg hover:shadow-green-500/25 border border-green-500/30',
            'focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:ring-offset-2 focus:ring-offset-black'
          )}
        >
          <span>{page === 'pricing' ? 'Contact Sales' : 'Contact us'}</span>
          <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      );
    }

    if (isPremium) {
      return (
        <Button
          onClick={handlePaymentSession}
          className={cn(
            'group relative w-full inline-flex items-center justify-center px-8 py-4 text-base font-semibold',
            'bg-gradient-to-r from-red-600 via-red-700 to-red-800 hover:from-red-700 hover:to-red-900',
            'text-white rounded-2xl transition-all duration-300 transform hover:scale-[1.02]',
            'shadow-lg hover:shadow-red-600/25 border border-red-600/30',
            'focus:outline-none focus:ring-2 focus:ring-red-600/50 focus:ring-offset-2 focus:ring-offset-black'
          )}
          disabled={subscription.createSubscriptionPortalLoading}
          aria-disabled={subscription.createSubscriptionPortalLoading}
        >
          <span>{page === 'pricing' ? 'Get Started' : 'Subscribe'}</span>
          {subscription.createSubscriptionPortalLoading ? (
            <LoadingSpinner className="ml-2" />
          ) : (
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          )}
        </Button>
      );
    }

    return (
      <Link
        href="/"
        className={cn(
          'group relative w-full inline-flex items-center justify-center px-8 py-4 text-base font-semibold',
          'bg-white/10 hover:bg-white/20 backdrop-blur-sm',
          'text-white rounded-2xl transition-all duration-300 transform hover:scale-[1.02]',
          'border border-white/20 hover:border-white/30',
          'focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-black'
        )}
      >
        <span>{page === 'pricing' ? 'Get Started' : 'Free Access'}</span>
        <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </Link>
    );
  };

  return (
    <div className="relative h-full">
      <div className={cn(
        'relative h-full p-8 rounded-3xl backdrop-blur-xl transition-all duration-500',
        isPremium
          ? 'bg-gradient-to-br from-red-900 via-red-950 to-black border-red-950 shadow-4xl'
          : 'bg-white/5 border border-white/10 hover:border-white/20 shadow-2xl',
        isEnterprise && 'bg-gradient-to-br from-green-500/10 via-green-600/10 to-green-500/10 border-green-500/20',
      )}>
        {/* Plan Badge */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={cn(
              'p-2 rounded-xl',
              isPremium && 'bg-red-900/60 border border-red-700',
              isEnterprise && 'bg-gradient-to-r from-green-500/20 to-green-600/20 border border-green-500/30',
              isFree && 'bg-white/10 border border-white/20'
            )}>
              {getPlanIcon()}
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{title}</h3>
              {isPremium && (
                <div className="flex items-center gap-1 mt-1">
                  <Sparkles className="w-3 h-3 text-red-400" />
                  <span className="text-xs font-medium text-red-400">Most Popular</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-white/70 text-sm leading-relaxed mb-6">
          {isLifetime ? lifetime_description || description : description}
          {page === 'account' && (
            <Link
              href="/pricing"
              className={cn(
                'ml-2 underline hover:no-underline transition-all',
                isPremium ? 'text-red-200' : 'text-white',
              )}
            >
              Learn more
            </Link>
          )}
        </p>

        {/* Price */}
        {renderPriceSection()}

        {/* Action Button */}
        <div className="mb-8">
          {renderActionButton()}
        </div>

        {/* Features List */}
        {page === 'pricing' && (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-1 h-6 rounded-full",
                isPremium && "bg-gradient-to-b from-red-500 to-red-700",
                isEnterprise && "bg-gradient-to-b from-green-500 to-green-700",
                isFree && "bg-gradient-to-b from-white to-white/60"
              )} />
              <h4 className="text-sm font-semibold text-white/90 uppercase tracking-wider">
                {subtitle}
              </h4>
            </div>
            <ul className="space-y-4">
              {Object.keys(content).map((key) => (
                <li
                  key={key}
                  className="flex items-start gap-3 text-sm text-white/80"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    <CheckCircle className={cn(
                      "w-4 h-4",
                      isPremium && "text-red-400",
                      isEnterprise && "text-green-400",
                      isFree && "text-white"
                    )} />
                  </div>
                  <span className="leading-relaxed">{key}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
