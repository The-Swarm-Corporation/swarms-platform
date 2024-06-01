'use client';
import React, { ReactNode, memo, useState } from 'react';
import {
  motion,
  useTransform,
  AnimatePresence,
  useMotionValue,
  useSpring,
} from 'framer-motion';

const AnimatedTooltip = ({
  children,
  tooltip,
}: {
  children: ReactNode;
  tooltip: ReactNode;
}) => {
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const springConfig = { stiffness: 100, damping: 5 };
  const x = useMotionValue(0); // going to set this value on mouse move
  // rotate the tooltip
  const rotate = useSpring(
    useTransform(x, [-100, 100], [-45, 45]),
    springConfig,
  );
  // translate the tooltip
  const translateX = useSpring(
    useTransform(x, [-100, 100], [-50, 50]),
    springConfig,
  );
  const handleMouseMove = (event: any) => {
    const halfWidth = event.target.offsetWidth / 2;
    x.set(event.nativeEvent.offsetX - halfWidth); // set the x value, which is then used in transform and rotate
  };

  return (
    <div
      className="-mr-4  relative"
      onPointerLeave={() => setIsHovered(false)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchEnd={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
    >
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              transition: {
                type: 'spring',
                stiffness: 260,
                damping: 10,
              },
            }}
            exit={{ opacity: 0, y: 20 }}
            style={{
              translateX: translateX,
              rotate: rotate,
              whiteSpace: 'nowrap',
            }}
            className="absolute -top-16 -left-1/2 translate-x-1/2 flex  flex-col items-center justify-center rounded-md bg-black z-50 shadow-xl px-4 py-2 dark:bg-white bg:text-black"
          >
            {tooltip}
          </motion.div>
        )}
      </AnimatePresence>
      <div onMouseMove={handleMouseMove}>{children}</div>
    </div>
  );
};

export default memo(AnimatedTooltip);
