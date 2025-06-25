'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import Modal from '@/shared/components/modal';
import { DollarSign, Loader2, Save } from 'lucide-react';
import { useToast } from '@/shared/components/ui/Toasts/use-toast';
import { trpc } from '@/shared/utils/trpc/trpc';
import { getSolPrice } from '@/shared/services/sol-price';

interface EditPriceModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: {
    id: string;
    name: string;
    type: 'prompt' | 'agent' | 'tool';
    currentPrice: number; // USD price
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
  const [solEquivalent, setSolEquivalent] = useState<number | null>(null);
  const [isLoadingSolPrice, setIsLoadingSolPrice] = useState(false);

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

    if (isNaN(price) || price < 0.01) {
      toast({
        description: 'Please enter a valid price (minimum $0.01)',
        variant: 'destructive',
      });
      return;
    }

    if (price > 999999) {
      toast({
        description: 'Maximum price is $999,999 USD',
        variant: 'destructive',
      });
      return;
    }

    setIsUpdating(true);

    try {
      await updatePriceMutation.mutateAsync({
        itemId: item.id,
        itemType: item.type as any,
        price_usd: price,
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

  // Convert USD to SOL when price changes
  useEffect(() => {
    const convertUsdToSol = async () => {
      if (priceNumber <= 0) {
        setSolEquivalent(null);
        return;
      }

      setIsLoadingSolPrice(true);
      try {
        const currentSolPrice = await getSolPrice();
        const solAmount = priceNumber / currentSolPrice;
        setSolEquivalent(solAmount);
      } catch (error) {
        console.error('Failed to convert USD to SOL:', error);
        setSolEquivalent(null);
      } finally {
        setIsLoadingSolPrice(false);
      }
    };

    convertUsdToSol();
  }, [priceNumber]);

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
            <Label htmlFor="price">Price (USD)</Label>
            <Input
              id="price"
              type="number"
              min="0.01"
              max="999999"
              step="0.01"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              placeholder="Enter price in USD"
              disabled={isUpdating}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Minimum: $0.01 USD • Maximum: $999,999 USD
            </p>
          </div>

          {priceNumber > 0 && (
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="text-sm font-medium mb-2">Price Preview:</div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Your price:</span>
                  <span className="font-medium">
                    ${priceNumber.toFixed(2)} USD
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Platform fee (10%):</span>
                  <span>
                    ${(priceNumber * 0.1).toFixed(2)} USD
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>You receive (90%):</span>
                  <span>
                    ${(priceNumber * 0.9).toFixed(2)} USD
                  </span>
                </div>
                <div className="border-t border-muted-foreground/20 pt-2 mt-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>SOL equivalent:</span>
                    <span>
                      {isLoadingSolPrice ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : solEquivalent !== null ? (
                        `${solEquivalent.toFixed(4)} SOL`
                      ) : (
                        'Loading...'
                      )}
                    </span>
                  </div>
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
