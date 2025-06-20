'use client';

import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import Modal from '@/shared/components/modal';
import { DollarSign, Loader2, Save } from 'lucide-react';
import { useToast } from '@/shared/components/ui/Toasts/use-toast';
import { trpc } from '@/shared/utils/trpc/trpc';
import PriceDisplay from './price-display';

interface EditPriceModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: {
    id: string;
    name: string;
    type: 'prompt' | 'agent' | 'tool';
    currentPrice: number;
  };
  onPriceUpdated: () => void;
}

const EditPriceModal = ({
  isOpen,
  onClose,
  item,
  onPriceUpdated,
}: EditPriceModalProps) => {
  const { toast } = useToast();
  const [newPrice, setNewPrice] = useState(item.currentPrice.toString());
  const [isUpdating, setIsUpdating] = useState(false);

  const updatePriceMutation = trpc.marketplace.updateItemPrice.useMutation({
    onSuccess: () => {
      toast({
        description: 'Price updated successfully!',
        style: { backgroundColor: '#10B981', color: 'white' },
      });
      onPriceUpdated();
      onClose();
    },
    onError: (error) => {
      toast({
        description: error.message,
        variant: 'destructive',
      });
      setIsUpdating(false);
    },
  });

  const handleUpdatePrice = async () => {
    const price = parseFloat(newPrice);
    
    if (isNaN(price) || price < 0) {
      toast({
        description: 'Please enter a valid price',
        variant: 'destructive',
      });
      return;
    }

    if (price > 999) {
      toast({
        description: 'Maximum price is 999 SOL',
        variant: 'destructive',
      });
      return;
    }

    setIsUpdating(true);

    try {
      await updatePriceMutation.mutateAsync({
        itemId: item.id,
        itemType: item.type,
        price: price,
      });
    } catch (error) {
      console.error('Price update error:', error);
    }
  };

  const handleClose = () => {
    if (!isUpdating) {
      setNewPrice(item.currentPrice.toString());
      onClose();
    }
  };

  const priceNumber = parseFloat(newPrice) || 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title=""
      showHeader={false}
      className="w-full max-w-md"
    >
      <div className="p-6">
        <div className="text-center mb-6">
          <DollarSign className="h-12 w-12 mx-auto mb-4 text-primary" />
          <h2 className="text-2xl font-bold mb-2">Edit Price</h2>
          <p className="text-muted-foreground">
            Update the price for your {item.type}: {item.name}
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="price">Price (SOL)</Label>
            <Input
              id="price"
              type="number"
              min="0"
              max="999"
              step="0.0001"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              placeholder="Enter price in SOL"
              disabled={isUpdating}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Maximum price: 999 SOL
            </p>
          </div>

          {priceNumber > 0 && (
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="text-sm font-medium mb-2">Price Preview:</div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Your price:</span>
                  <span className="font-medium">
                    <PriceDisplay solAmount={priceNumber} size="sm" />
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Platform fee (10%):</span>
                  <span>
                    <PriceDisplay solAmount={priceNumber * 0.1} size="sm" />
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>You receive (90%):</span>
                  <span>
                    <PriceDisplay solAmount={priceNumber * 0.9} size="sm" />
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isUpdating}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdatePrice}
            disabled={isUpdating || !newPrice || parseFloat(newPrice) < 0}
            className="flex-1"
          >
            {isUpdating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Update Price
              </>
            )}
          </Button>
        </div>

        <div className="mt-4 text-center text-xs text-muted-foreground">
          <p>Changes will be reflected immediately in the marketplace</p>
        </div>
      </div>
    </Modal>
  );
};

export default EditPriceModal;
