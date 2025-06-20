/**
 * Demo component showing the new button price format with box brackets
 */

'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { PriceDisplay } from './price-display';
import { DollarSign, ExternalLink, ShoppingCart } from 'lucide-react';

export function ButtonPriceDemo() {
  const samplePrices = [
    { label: 'Small Item', price: 0.001 },
    { label: 'Medium Item', price: 0.1 },
    { label: 'Large Item', price: 0.5 },
    { label: 'Premium Item', price: 1.0 },
  ];

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-blue-500" />
          Button Price Format - Box Brackets
        </CardTitle>
        <CardDescription>
          New price display format for info-card and card-details buttons: [price] with clean formatting
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Before vs After */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium text-red-600">❌ Before (with slashes and trailing zeros)</h4>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-between">
                <span>Buy for</span>
                <span className="text-red-500">~/$0.100</span>
              </Button>
              <Button variant="outline" className="w-full justify-between">
                <span>Purchase</span>
                <span className="text-red-500">~/$1.000</span>
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-green-600">✅ After (box brackets, clean format)</h4>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-between">
                <span>Buy for</span>
                <PriceDisplay 
                  solAmount={0.1} 
                  showSOL={false}
                  showUSD={true}
                  variant="button"
                  className="text-green-500" 
                />
              </Button>
              <Button variant="outline" className="w-full justify-between">
                <span>Purchase</span>
                <PriceDisplay 
                  solAmount={1.0} 
                  showSOL={false}
                  showUSD={true}
                  variant="button"
                  className="text-green-500" 
                />
              </Button>
            </div>
          </div>
        </div>

        {/* Sample Buttons */}
        <div className="space-y-4">
          <h4 className="font-medium">Sample Marketplace Buttons:</h4>
          
          <div className="grid md:grid-cols-2 gap-4">
            {samplePrices.map((item, index) => (
              <div key={index} className="space-y-2">
                <p className="text-sm text-muted-foreground">{item.label}</p>
                <Button 
                  variant="outline" 
                  className="w-full justify-between bg-[#4ECD78]/10 border-[#4ECD78]/20 hover:bg-[#4ECD78]/20 text-[#4ECD78]"
                >
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    <span>Buy</span>
                  </div>
                  <PriceDisplay 
                    solAmount={item.price} 
                    showSOL={false}
                    showUSD={true}
                    variant="button"
                    className="text-[#4ECD78]" 
                  />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Card Details Modal Style */}
        <div className="space-y-4">
          <h4 className="font-medium">Card Details Modal Style:</h4>
          
          <div className="grid md:grid-cols-2 gap-4">
            <Button className="bg-red-600 hover:bg-red-500 text-white">
              <DollarSign className="w-4 h-4 mr-2" />
              Buy for&nbsp;
              <PriceDisplay 
                solAmount={0.5} 
                showSOL={false}
                showUSD={true}
                variant="button"
                className="text-white" 
              />
            </Button>
            
            <Button className="bg-teal-600 hover:bg-teal-500 text-white">
              <DollarSign className="w-4 h-4 mr-2" />
              Purchase&nbsp;
              <PriceDisplay 
                solAmount={0.25} 
                showSOL={false}
                showUSD={true}
                variant="button"
                className="text-white" 
              />
            </Button>
          </div>
        </div>

        {/* Format Examples */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-3">
            🎯 Format Examples:
          </h4>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium mb-2">Input → Output:</p>
              <ul className="space-y-1 text-blue-800 dark:text-blue-200">
                <li>• 0.001 SOL → <code>[0.1]</code> (assuming $100 SOL)</li>
                <li>• 0.1 SOL → <code>[10]</code></li>
                <li>• 0.5 SOL → <code>[50]</code></li>
                <li>• 1.0 SOL → <code>[100]</code></li>
              </ul>
            </div>
            <div>
              <p className="font-medium mb-2">Key Features:</p>
              <ul className="space-y-1 text-blue-800 dark:text-blue-200">
                <li>• ✅ Box brackets format: <code>[price]</code></li>
                <li>• ✅ No trailing zeros: <code>0.1</code> not <code>0.100</code></li>
                <li>• ✅ No slashes: removed <code>/</code> characters</li>
                <li>• ✅ Maintains spacing between text and price</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Implementation Details */}
        <div className="p-4 bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 rounded-lg">
          <h4 className="font-medium mb-2">Implementation:</h4>
          <div className="text-sm space-y-2">
            <p><strong>Component:</strong> <code>PriceDisplay</code> with <code>variant="button"</code></p>
            <p><strong>Usage:</strong></p>
            <pre className="bg-gray-100 dark:bg-gray-800 p-2 rounded text-xs overflow-x-auto">
{`<PriceDisplay 
  solAmount={0.1} 
  showSOL={false}
  showUSD={true}
  variant="button"
  className="text-[#4ECD78]" 
/>`}
            </pre>
            <p><strong>Output:</strong> <code>[10]</code> (assuming $100 SOL price)</p>
          </div>
        </div>

        {/* Where It's Used */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 border rounded-lg">
            <h5 className="font-medium mb-2">📱 Info Card Buttons</h5>
            <p className="text-sm text-muted-foreground">
              Purchase buttons in marketplace cards now show prices in clean box bracket format.
            </p>
          </div>
          
          <div className="p-4 border rounded-lg">
            <h5 className="font-medium mb-2">🔍 Card Details Modal</h5>
            <p className="text-sm text-muted-foreground">
              Buy buttons in detail modals display prices with consistent box bracket styling.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
