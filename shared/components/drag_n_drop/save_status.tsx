import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, X, Check } from 'lucide-react';
// import { Button } from '@/components/spread_sheet_swarm/ui/button';
import { Button } from '../ui/button';

interface SaveStatusIndicatorProps {
  isSaving: boolean;
  lastSaveStatus: 'success' | 'error' | null;
  forceSave: () => void;
}

export const SaveStatusIndicator: React.FC<SaveStatusIndicatorProps> = ({
  isSaving,
  lastSaveStatus,
  forceSave
}) => {
  return (
    <AnimatePresence>
      {(isSaving || lastSaveStatus) && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className={`fixed bottom-4 right-4 p-3 rounded-lg shadow-lg backdrop-blur-sm flex items-center gap-2 z-50 ${
            lastSaveStatus === 'error' 
              ? 'bg-destructive/90 text-destructive-foreground'
              : 'bg-primary/90 text-primary-foreground'
          }`}
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm font-medium">Saving changes...</span>
            </>
          ) : lastSaveStatus === 'error' ? (
            <>
              <X className="h-4 w-4" />
              <span className="text-sm font-medium">Save failed</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={forceSave}
                className="ml-2 h-8 hover:bg-destructive-foreground/10"
              >
                Retry
              </Button>
            </>
          ) : (
            <>
              <motion.div
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Check className="h-4 w-4" />
              </motion.div>
              <span className="text-sm font-medium">All changes saved</span>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SaveStatusIndicator;