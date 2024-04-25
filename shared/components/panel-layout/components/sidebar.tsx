'use client';
import { cn } from '@/shared/utils/cn';
import {
  Menu,
  X,
  ChevronsLeft,
  AlignLeft,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { SignOut } from '@/shared/utils/auth-helpers/server';
import { handleRequest } from '@/shared/utils/auth-helpers/client';
import useToggle from '@/shared/hooks/toggle';
import Logo from '../../icons/Logo';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTrigger
} from '../../ui/drawer';
import { Button } from '../../ui/Button';
import {
  MenuProps,
  NavMenuProps,
  NavMenuPropsKeys,
  SIDE_BAR_MENU
} from './const';
import { Collapsible, CollapsibleTrigger } from '../../ui/collapsible';
import { CollapsibleContent } from '@radix-ui/react-collapsible';

const collapsedMenu = 'collapsedMenu';
const PanelLayoutSidebar = () => {
  const path = usePathname();
  const router = useRouter();
  const { isOn, toggle } = useToggle('off', collapsedMenu);
  const [openMenu, setOpenMenu] = useState(Object.keys(SIDE_BAR_MENU)[1]);

  const handleMenuClick = (menu: NavMenuPropsKeys | string) => {
    setOpenMenu((prevMenu) => (prevMenu === menu ? '' : menu));
  };

  return (
    <>
      {/* desktop */}
      <div
        className={cn(
          'max-w-[250px] w-full transition-all ease-out duration-300 translate-x-0 max-lg:hidden',
          isOn && 'max-w-0 -translate-x-full'
        )}
      />
      <div
        className={cn(
          'flex flex-col fixed flex-shrink-0 max-w-[250px] w-full transition-all ease-out duration-300 translate-x-0 min-h-screen border-r border-gray-900 max-lg:hidden',
          isOn && 'max-w-0 -translate-x-full'
        )}
      >
        <Button
          onClick={toggle}
          className={cn(
            'rounded-full absolute -right-4 top-9 max-w-8 h-8 w-full cursor-pointer flex p-0 transition-all duration-300 shadow-md',
            isOn &&
              'rounded-l-[12px] rounded-r-sm top-28 -right-10 max-w-[none] w-12 h-[30px]'
          )}
        >
          {isOn ? <Menu /> : <ChevronsLeft />}
        </Button>
        <div
          className={cn(
            'flex flex-col justify-between p-4 w-full h-screen visible',
            isOn && 'invisible'
          )}
        >
          <div className="h-3/4">
            {/* menu */}
            <div className="mt-12">
              {SIDE_BAR_MENU.platform?.map((item, index) => {
                const isSubMenuActive = item.items?.some(
                  (subItem) => subItem.link === path
                );
                return (
                  <div className="flex flex-col gap-2" key={index}>
                    <Link
                      href={item.link}
                      className={cn(
                        'group flex items-center justify-start p-2 py-3 my-1 hover:bg-destructive hover:text-white rounded-md outline-none',
                        (isSubMenuActive || item.link === path) &&
                          'bg-primary text-white'
                      )}
                    >
                      {item.icon && (
                        <span
                          className={cn(
                            'mr-2 text-black dark:text-white group-hover:text-white',
                            item.link === path && 'text-white'
                          )}
                        >
                          {item.icon}
                        </span>
                      )}
                      <span>{item.title}</span>
                    </Link>
                    {/* sub items */}
                    {isSubMenuActive && item.items?.length && (
                      <div className="flex flex-col gap-2">
                        {item.items?.map((subItem) => (
                          <Link
                            href={subItem.link}
                            className={cn(
                              'pl-10  py-1 group flex items-center justify-start hover:bg-primary hover:text-white rounded-md outline-none',
                              subItem.link === path &&
                                'border border-gray-400 dark:text-white'
                            )}
                          >
                            <span>{subItem.title}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="p-2">
              <form onSubmit={(e) => handleRequest(e, SignOut, router)}>
                <input type="hidden" name="pathName" value={usePathname()} />
                <button type="submit">Sign out</button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* mobile */}
      <div className="lg:hidden">
        <Drawer direction="left">
          <DrawerTrigger asChild>
            <div className="flex items-center w-fit h-20 bg-transparent top-0 absolute z-50 ">
              <Button className="text-foreground gap-5" variant="link">
                <AlignLeft className="mb-1.5" />
              </Button>
            </div>
          </DrawerTrigger>
          <DrawerContent className="flex flex-col h-full w-[300px] mt-24 fixed bottom-0 rounded-none">
            <div className="p-4 bg-background flex-1 h-full flex flex-col gap-4">
              <div className="flex gap-2 items-center">
                <div className="flex items-center w-[40px] h-[40px] min-w-[40px]">
                  <Logo />
                </div>
                <h2 className="font-bold text-primary">SWARMS</h2>
              </div>
              <DrawerClose className="absolute top-4 right-4">
                <X />
              </DrawerClose>
              {Object.keys(SIDE_BAR_MENU).map(
                (menu: NavMenuPropsKeys | string) => {
                  return (
                    <Collapsible
                      key={menu}
                      className="flex-col"
                      open={openMenu === menu}
                      onOpenChange={() => handleMenuClick(menu)}
                    >
                      <CollapsibleTrigger className="justify-between p-2 py-3 my-1 hover:bg-destructive rounded-md hover:text-white outline-none">
                        <span className="capitalize text-base font-semibold">
                          {menu}
                        </span>
                        {openMenu === menu ? <ChevronDown /> : <ChevronRight />}
                      </CollapsibleTrigger>
                      <CollapsibleContent className="flex flex-col gap-1">
                        {(SIDE_BAR_MENU as any)?.[menu]?.map(
                          (item: MenuProps, index: number) => (
                            <div className="flex flex-col gap-2" key={index}>
                              <Link
                                href={item.link}
                                className={cn(
                                  'group flex items-center justify-start p-2 py-3 my-1 hover:bg-primary hover:text-white rounded-md outline-none',
                                  item.link === path && 'bg-primary text-white'
                                )}
                              >
                                {item.icon && (
                                  <span
                                    className={cn(
                                      'mr-2 text-black dark:text-white group-hover:text-white',
                                      item.link === path && 'text-white'
                                    )}
                                  >
                                    {item.icon}
                                  </span>
                                )}
                                <span>{item.title}</span>
                              </Link>
                              {item.link === path && item.items?.length && (
                                <div className="flex flex-col gap-2">
                                  {item.items?.map((subItem) => (
                                    <Link
                                      href={subItem.link}
                                      className={cn(
                                        'pl-10  py-1 group flex items-center justify-start hover:bg-primary hover:text-white rounded-md outline-none',
                                        subItem.link === path &&
                                          'bg-primary dark:text-white'
                                      )}
                                    >
                                      <span>{subItem.title}</span>
                                    </Link>
                                  ))}
                                </div>
                              )}
                            </div>
                          )
                        )}
                      </CollapsibleContent>
                    </Collapsible>
                  );
                }
              )}
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </>
  );
};

export default PanelLayoutSidebar;
