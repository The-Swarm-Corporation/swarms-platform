import { cn } from '@/shared/utils/cn';
import { X, AlignLeft, ChevronRight, ChevronDown, Github } from 'lucide-react';
import { usePathname } from 'next/navigation';
import React, { useState } from 'react';
import Logo from '@/shared/components/icons/Logo';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTrigger,
} from '@/shared/components/ui/drawer';
import { Button } from '@/shared/components/ui/Button';
import { NavMenuPropsKeys, SIDE_BAR_MENU } from '../../const';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/shared/components/ui/collapsible';
import NavItem from '../../item';
import { NAVIGATION, SWARMS_GITHUB } from '@/shared/constants/links';

const SidebarMobile = () => {
  const path = usePathname();
  const [openMenu, setOpenMenu] = useState(Object.keys(SIDE_BAR_MENU)[1]);

  const handleMenuClick = (menu: NavMenuPropsKeys) => {
    setOpenMenu((prevMenu) => (prevMenu === menu ? '' : menu));
  };

  const isSwarmsPath = path === '/swarms';

  const getSideBarMenu = (menu: NavMenuPropsKeys) => {
    return menu === 'base' && isSwarmsPath
      ? SIDE_BAR_MENU?.[menu]
          ?.filter(
            (item) =>
              item.link !== NAVIGATION.PRICING &&
              item.link !== NAVIGATION.GET_DEMO,
          )
          .concat([
            {
              icon: <Github />,
              title: 'Github',
              link: SWARMS_GITHUB,
            },
          ])
      : SIDE_BAR_MENU?.[menu];
  };

  return (
    <div className="lg:hidden">
      <Drawer direction="left">
        <DrawerTrigger asChild>
          <div className="flex items-center w-fit h-20 bg-transparent top-0 fixed z-50 ">
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
            {Object.keys(SIDE_BAR_MENU).map((menuKey) => {
              const menu = menuKey as NavMenuPropsKeys;
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
                  <CollapsibleContent className="flex flex-col">
                    {getSideBarMenu(menu)?.map((item, index) => (
                      <div className="flex flex-col gap-2" key={index}>
                        <NavItem
                          {...item}
                          isIcon
                          className={cn(
                            'p-2 py-3 my-1 hover:bg-primary hover:text-white rounded-md',
                            item.link === path && 'bg-primary text-white',
                          )}
                          showTitle
                        />
                        {item.link === path && item.items?.length && (
                          <div className="flex flex-col gap-2">
                            {item.items?.map((subItem) => (
                              <NavItem
                                {...subItem}
                                key={subItem.title}
                                className={cn(
                                  'pl-10  py-1  hover:bg-primary hover:text-white rounded-md',
                                  subItem.link === path &&
                                    'border border-gray-400 dark:text-white',
                                )}
                                showTitle
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default SidebarMobile;
