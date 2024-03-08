import { cn } from '@/shared/utils/cn';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React from 'react';

const panelMenu: {
  icon?: React.ReactNode;
  title: string;
  link: string;
}[] = [
  {
    title: 'Playground',
    link: '/playground'
  },
  {
    title: 'API keys',
    link: '/api-keys'
  },
  {
    title: 'Account',
    link: '/account'
  }
];

const PanelLayoutSidebar = () => {
  const path=usePathname();
  return (
    <>
      {/* logo */}
      <div className="flex flex-col p-4 w-full">
        <div>
          <Image
            src="/swarms.svg"
            alt="Logo"
            width={44}
            height={40}
            objectFit="contain"
          />
        </div>

        {/* menu */}
        <div className="mt-8">
          {panelMenu.map((item, index) => (
            <Link
              key={index}
              href={item.link}
              className={cn(
                'flex items-center justify-start p-2 py-3 my-1 hover:bg-primary text-white rounded-md outline-none',
                item.link === path && 'bg-primary'
              )}
            >
              {item.icon && (
                <span className="mr-2 text-gray-400">{item.icon}</span>
              )}
              <span>{item.title}</span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};

export default PanelLayoutSidebar;
