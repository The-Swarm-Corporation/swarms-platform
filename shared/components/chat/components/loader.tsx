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
      animate={{ opacity: 0 }}
      transition={{ duration: 0.5, delay: 4 }}
      onAnimationComplete={onComplete}
      className="fixed inset-0 bg-black z-50 flex items-center justify-center"
    >
      <div className="w-full space-y-4">
        <LoadingSpinner />
      </div>
    </motion.div>
  );
}
