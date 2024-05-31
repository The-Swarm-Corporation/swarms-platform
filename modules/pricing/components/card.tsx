import { cn } from '@/shared/utils/cn';
import { Bolt, CheckCircle, Gem, PackageOpen, Sparkles } from 'lucide-react';
import Link from 'next/link';

export interface PricingCardProps {
  title: string;
  description: string;
  price: string | { monthly: string; discount: string; annually: string };
  link: string;
  subtitle?: string;
  content: Record<string, string>;
  isAnnually: boolean;
}

export default function PricingCard({
  title,
  description,
  price,
  link,
  subtitle,
  content,
  isAnnually,
}: PricingCardProps) {
  const pricing =
    typeof price === 'string'
      ? price
      : isAnnually
        ? price.discount
        : price.monthly;
  const isAnnualPrice =
    typeof price !== 'string' && price?.annually && isAnnually;
  const isPremium = title.toLowerCase() === 'premium';
  const isEnterprise = title.toLowerCase() === 'enterprise';

  function getIcon() {
    if (isPremium) return <Bolt />;

    if (title.toLowerCase() === 'free') return <PackageOpen />;

    return <Gem />;
  }

  const icon = getIcon();

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
            {icon}
            <p className="text-base font-bold capitalize">{title}</p>
          </div>
          <p className="mt-3 text-sm font-medium text-white">{description}</p>
          <div className="my-8 flex">
            {isAnnualPrice && (
              <sup className="text-sm font-bold text-white uppercase lg:text-xl line-through">
                ${price.annually}
              </sup>
            )}
            <p className="flex items-end">
              <span className="text-2xl font-bold text-white uppercase lg:text-5xl">
                ${pricing}
              </span>
              <span className="text-sm font-medium ml-1 text-white">
                {isEnterprise && '/user'} <br />{' '}
                {isAnnually ? '/year' : '/month'}
              </span>
            </p>
          </div>
          <div className="flex">
            <Link
              className={cn(
                'items-center justify-between inline-flex w-full font-medium px-6 py-2.5 text-center',
                ' duration-200 border',
                'border-white/5 dark:border-white/10 rounded-xl h-14 ',
                'focus:outline-none focus-visible:outline-black text-base focus-visible:ring-black',
                isPremium
                  ? 'text-black bg-white hover:bg-white/20 hover:border-white hover:text-white'
                  : 'text-white bg-white/10 dark:bg-white/5 hover:bg-white/10 hover:border-white/10',
              )}
              href="/platform/account"
            >
              Subscribe
            </Link>
          </div>
        </div>
        <div className="px-8">
          <p className="flex items-center gap-1 mt-4 text-base drop-shadow-lg font-semibold text-primary lg:mt-8">
            <Sparkles size={12} /> {subtitle}:
          </p>
          <ul
            className="order-last gap-4 mt-4 space-y-3 text-gray-700 dark:text-gray-300 list-none"
            role="list"
          >
            {Object.keys(content).map((key) => {
              return (
                <li
                  key={key}
                  className="flex items-center mt-4 font-medium drop-shadow-md gap-2 text-sm"
                >
                  <CheckCircle className="size-4 text-gray-500 icon icon-tabler icon-tabler-circle-check" />
                  <span>{key}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
