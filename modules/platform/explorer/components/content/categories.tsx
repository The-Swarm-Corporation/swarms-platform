import React, { useState } from 'react';
import { SkeletonTags } from './skeleton-tags';
import { cn } from '@/shared/utils/cn';

type Category = {
  label: string;
  value: string;
};

interface ModelCategoriesProps {
  categories: Category[];
  onCategoryClick: (category: string) => void;
  isLoading?: boolean;
  isCategoryLoading?: boolean;
  activeCategory: string;
  categoryClass?: string;
}

const MAX_CATEGORY_LENGTH = 13;

export default function ModelCategories({
  categories = [],
  onCategoryClick,
  isLoading,
  isCategoryLoading,
  activeCategory,
  categoryClass,
}: ModelCategoriesProps) {
  const [showAllCategories, setShowAllCategories] = useState(false);

  const handleCategoryClick = (category: string) => {
    if (!isLoading) {
      onCategoryClick?.(category);
    }
  };

  const handleShowToggle = () => {
    setShowAllCategories(!showAllCategories);
  };

  // Desktop version
  const DesktopCategories = () => {
    return (
      <div className="hidden xl:block">
        <div className="py-5 xl:pb-10">
          <div className="flex items-center w-full">
            {isCategoryLoading ? (
              <SkeletonTags desktopMb={0} />
            ) : (
              <div className="flex max-w-full items-center gap-2">
                <div className="relative flex-1 w-full">
                  <div
                    className={cn(
                      'no-scrollbar w-full',
                      showAllCategories
                        ? 'overflow-x-auto'
                        : 'overflow-x-hidden',
                    )}
                  >
                    <div className="flex w-max items-center space-x-3 transition-transform duration-300 lg:space-x-2 xlg:space-x-6">
                      {categories
                        .slice(
                          0,
                          showAllCategories
                            ? categories.length
                            : MAX_CATEGORY_LENGTH,
                        )
                        .map((category, index) => {
                          const isActiveTag =
                            activeCategory?.toLowerCase() ===
                            category?.value?.toLowerCase();
                          return (
                            <div
                              key={index}
                              className={cn(
                                'shrink-0 cursor-pointer whitespace-nowrap font-semibold capitalize rounded-2xl px-4 py-2 text-xs text-red-500/70 border border-red-500/70 hover:bg-primary/50 hover:text-white maxlg:text-base',
                                isActiveTag && !isLoading
                                  ? 'bg-primary/50 text-white'
                                  : 'bg-[#22201F] text-[#DDDBDA]',
                                categoryClass,
                              )}
                              onClick={() =>
                                handleCategoryClick(category.value)
                              }
                            >
                              {category.label}
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>

                {/* See More / See Less Button - Always Visible */}
                {categories.length > MAX_CATEGORY_LENGTH && (
                  <p
                    className="shrink-0 cursor-pointer whitespace-nowrap text-sm text-primary/70"
                    onClick={handleShowToggle}
                  >
                    {showAllCategories ? 'See less' : 'See more'}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Mobile version
  const MobileCategories = () => (
    <div className="w-full xl:hidden">
      <div className="py-5 xl:py-10">
        {isCategoryLoading ? (
          <SkeletonTags mobilePb="0px" isMobileMb={false} />
        ) : (
          <div className="flex flex-col space-y-4">
            <div className="no-scrollbar overflow-x-auto">
              <div className="flex w-full space-x-3">
                {categories
                  .slice(0, showAllCategories ? categories.length : 5)
                  .map((category, index) => {
                    const isActiveTag =
                      activeCategory?.toLowerCase() ===
                      category?.value?.toLowerCase();
                    return (
                      <div
                        key={index}
                        className={cn(
                          'cursor-pointer whitespace-nowrap rounded-2xl font-semibold px-4 py-2 text-xs',
                          isActiveTag && !isLoading
                            ? 'bg-primary/50 text-white'
                            : 'text-red-500/70 border border-red-500/70',
                          categoryClass,
                        )}
                        onClick={() => handleCategoryClick(category.value)}
                      >
                        {category.label}
                      </div>
                    );
                  })}
                {categories.length > 5 && (
                  <p
                    className="flex cursor-pointer items-center whitespace-nowrap text-sm text-[#E66579]"
                    onClick={handleShowToggle}
                  >
                    {showAllCategories ? 'See less' : 'See more'}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <DesktopCategories />
      <MobileCategories />
    </>
  );
}
