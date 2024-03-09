import { cn } from '@/shared/utils/cn';
import { LockKeyhole, SquareChevronRight, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname,useRouter } from 'next/navigation';
import React from 'react';
import { SignOut } from '@/shared/utils/auth-helpers/server';
import { handleRequest } from '@/shared/utils/auth-helpers/client';

const panelMenu: {
  icon?: React.ReactNode;
  title: string;
  link: string;
}[] = [
  {
    icon: <SquareChevronRight size={24} />,
    title: 'Playground',
    link: '/playground'
  },
  {
    icon: <LockKeyhole size={24} />,
    title: 'API keys',
    link: '/api-keys'
  },
  {
    icon: <User size={24} />,
    title: 'Account',
    link: '/account'
  }
];

const PanelLayoutSidebar = () => {
  const path = usePathname();
  const router = useRouter();
  return (
    <>
      <div className="flex flex-col justify-between p-4 w-full h-screen">
        <div className="h-full">
          <div>
            {/* logo */}
            <Link href={'/'}>
              <Image
                src="/swarms.svg"
                alt="Logo"
                width={44}
                height={40}
                objectFit="contain"
              />
            </Link>
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
                  <span className="mr-2 text-gray-200">{item.icon}</span>
                )}
                <span>{item.title}</span>
              </Link>
            ))}
          </div>
        </div>
        <div className="p-2">
        
        <form onSubmit={(e) => handleRequest(e, SignOut, router)}>
            <input type="hidden" name="pathName" value={usePathname()} />
            <button type="submit">
              Sign out
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default PanelLayoutSidebar;
