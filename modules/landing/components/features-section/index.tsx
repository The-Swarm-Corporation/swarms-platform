"use client";
 
import Image from "next/image";
import React from "react";
import Link from "next/link";
import Card3D, { CardBody, CardItem } from "@/shared/components/3d-card";
import ImageScreen from '@/public/images/panel-screen.png';

import { motion } from "framer-motion";

const items = [
    {
      image: ImageScreen,
      title: 'Cheap',
      description: 'Our affordable pricing ensures accessibility for all customers without compromising on quality. We prioritize cost-effectiveness to cater to budget-conscious clients while maintaining high standards of service and performance.'
    },
    {
        image: ImageScreen,
        title: 'Fast',
        description: 'With our expedited service, you can expect rapid delivery and efficient turnaround times. We understand the importance of timely solutions and strive to meet deadlines promptly, enabling you to achieve your goals without unnecessary delays.'
    },
    {
        image: ImageScreen,
        title: 'Reliable',
        description: 'Our commitment to reliability means you can trust us to consistently deliver exceptional results. We prioritize consistency and dependability in our services, ensuring that you can rely on us to meet your needs consistently and effectively.'
    }
]

const FeaturesSection = () => {
  return (
    <div className="flex flex-col justify-center items-center container mx-auto py-16">
        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 1,
          }}
          className="div"
        >
          <h2 className="text-center text-xl md:text-4xl font-bold text-black dark:text-white">
            Our Benefits
          </h2>
          <p className="text-center text-base md:text-lg font-normal text-neutral-700 dark:text-neutral-200 max-w-md mt-2 mx-auto">
           
          </p>
        </motion.div>
        <div className="flex justify-center max-md:flex-col gap-4 py-8">
        {items.map(item => (
            <Card3D containerClassName="flex-1 max-w-sm" className="inter-var">
            <CardBody className="bg-gray-50 relative group/card  dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-auto h-auto rounded-xl p-6 border">
              <CardItem
                translateZ="50"
                className="text-xl font-bold text-neutral-600 dark:text-white"
              >
                {item.title}
              </CardItem>
              <CardItem
                as="p"
                translateZ="60"
                className="text-neutral-500 text-sm max-w-sm mt-2 dark:text-neutral-300"
              >
                {item.description}
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
  
            </CardBody>
          </Card3D>
        ))}
        </div>
    </div>
  );
}

export default FeaturesSection;