'use client';

import { motion } from 'framer-motion';
import LoadingSpinner from '../../loading-spinner';

export default function LoadSequence({
  onComplete,
}: {
  onComplete: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 4 }}
      onAnimationComplete={onComplete}
      className="container h-[70%] bg-black flex items-center justify-center"
    >
      <LoadingSpinner />
    </motion.div>
  );
}
