"use client";
 
import Image from "next/image";
import React from "react";
import Link from "next/link";
import Card3D, { CardBody, CardItem } from "@/shared/components/3d-card";
import ImageScreen from '@/public/images/panel-screen.png';

const items = [
    {
        image: ImageScreen,
        title: 'title title title',
        description: 'description description description description'
    },
    {
        image: ImageScreen,
        title: 'title title title',
        description: 'description description description description'
    },
    {
        image: ImageScreen,
        title: 'title title title',
        description: 'description description description description'
    }
]

const FeaturesSection = () => {
  return (
    <div className="flex max-md:flex-col container mx-auto gap-4 py-8">
        {items.map(item => (
            <Card3D className="inter-var">
            <CardBody className="bg-gray-50 relative group/card  dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-auto sm:w-[30rem] h-auto rounded-xl p-6 border">
              <CardItem
                translateZ="50"
                className="text-xl font-bold text-neutral-600 dark:text-white"
              >
                Make things float in air
              </CardItem>
              <CardItem
                as="p"
                translateZ="60"
                className="text-neutral-500 text-sm max-w-sm mt-2 dark:text-neutral-300"
              >
                Hover over this card to unleash the power of CSS perspective
              </CardItem>
              <CardItem translateZ="100" className="w-full mt-4">
                <Image
                  src={ImageScreen}
                  height="1000"
                  width="1000"
                  className="h-60 w-full object-cover rounded-xl group-hover/card:shadow-xl"
                  alt="thumbnail"
                />
              </CardItem>
              <div className="flex justify-between items-center mt-20">
                <CardItem
                  translateZ={20}
                  as={Link}
                  href="https://twitter.com/mannupaaji"
                  target="__blank"
                  className="px-4 py-2 rounded-xl text-xs font-normal dark:text-white"
                >
                  Try now →
                </CardItem>
                <CardItem
                  translateZ={20}
                  as="button"
                  className="px-4 py-2 rounded-xl bg-black dark:bg-white dark:text-black text-white text-xs font-bold"
                >
                  Sign up
                </CardItem>
              </div>
            </CardBody>
          </Card3D>
        ))}
    </div>
  );
}

export default FeaturesSection;