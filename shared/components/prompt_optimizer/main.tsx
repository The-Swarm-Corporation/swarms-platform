"use client";

import React, { useState, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../spread_sheet_swarm/ui/card';
import { Button } from '../spread_sheet_swarm/ui/button';
import { Slider } from '../ui/slider';
import { Switch } from '../spread_sheet_swarm/ui/switch';
import { useToast } from '../ui/Toasts/use-toast';
import { Textarea } from '../spread_sheet_swarm/ui/textarea';
import { Label } from '../spread_sheet_swarm/ui/label';


const PromptOptimizer = () => {
  const [systemPrompt, setSystemPrompt] = useState('');
  const [optimizedPrompt, setOptimizedPrompt] = useState('');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [maxLength, setMaxLength] = useState(2000);
  const [settings, setSettings] = useState({
    useChainOfThought: true,
    useFewShotLearning: true,
    includeConstraints: true,
    optimizeForReliability: true
  });
  
  const saveInProgressRef = useRef(false);
  const { toast } = useToast();

  const optimizePrompt = async (currentPrompt: any) => {
    if (!currentPrompt?.trim()) {
      throw new Error('System prompt is required for optimization');
    }

    const optimizationRequest = `
      Your task is to optimize the following system prompt for an AI agent. 
      The optimized prompt should be highly reliable, production-grade, and 
      tailored to the specific needs of the agent.

      Guidelines:
      ${settings.useChainOfThought ? '- Employ chain of thought reasoning\n' : ''}
      ${settings.useFewShotLearning ? '- Include few-shot learning examples\n' : ''}
      ${settings.includeConstraints ? '- Add necessary operational constraints\n' : ''}
      ${settings.optimizeForReliability ? '- Maximize reliability and safety\n' : ''}
      - Keep response under ${maxLength} characters
      
      Original prompt to optimize:
      ${currentPrompt}

      Return only the optimized prompt without additional commentary.
    `;

    try {
      // Simulated API call - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
      return `[Optimized] ${currentPrompt}\n\nEnhanced with:${
        settings.useChainOfThought ? '\n- Chain of thought reasoning' : ''
      }${settings.useFewShotLearning ? '\n- Few-shot learning examples' : ''}`;
    } catch (error) {
      console.error('Optimization failed:', error);
      throw new Error('Failed to optimize system prompt');
    }
  };

  const handleOptimizePrompt = async () => {
    if (!systemPrompt) {
      toast({
        title: "Error",
        description: "System prompt is required for optimization",
        variant: "destructive"
      });
      return;
    }

    setIsOptimizing(true);
    try {
      const result = await optimizePrompt(systemPrompt);
      setOptimizedPrompt(result);
      toast({
        description: "System prompt optimized successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to optimize system prompt",
        variant: "destructive"
      });
    }
    setIsOptimizing(false);
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6 md:p-8">
      <Card className="max-w-6xl mx-auto shadow-lg border-gray-200 dark:border-gray-700">
        <CardHeader className="space-y-1 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-6 py-4">
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            AI Prompt Optimizer
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-8 p-6">
          {/* Input/Output Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Section */}
            <div className="space-y-2">
              <Label htmlFor="systemPrompt" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Original Prompt
              </Label>
              <div className="relative">
                <Textarea
                  id="systemPrompt"
                  placeholder="Enter your prompt here..."
                  className="min-h-[300px] resize-none border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                />
                <span className="absolute bottom-2 right-2 text-xs text-gray-500 dark:text-gray-400">
                  {systemPrompt.length} / {maxLength}
                </span>
              </div>
            </div>

            {/* Output Section */}
            <div className="space-y-2">
              <Label htmlFor="optimizedPrompt" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Optimized Prompt
              </Label>
              <div className="relative">
                <Textarea
                  id="optimizedPrompt"
                  className="min-h-[300px] resize-none border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-gray-100"
                  value={optimizedPrompt}
                  readOnly
                  placeholder="Optimized prompt will appear here..."
                />
                <span className="absolute bottom-2 right-2 text-xs text-gray-500 dark:text-gray-400">
                  {optimizedPrompt.length} / {maxLength}
                </span>
              </div>
            </div>
          </div>

          {/* Settings Panel */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
              Optimization Settings
            </h3>
            
            <div className="space-y-6">
              {/* Toggles Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Chain of Thought Toggle */}
                <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                  <Label htmlFor="chainOfThought" className="font-medium text-gray-700 dark:text-gray-300">
                    Chain of Thought
                  </Label>
                  <Switch
                    id="chainOfThought"
                    checked={settings.useChainOfThought}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({...prev, useChainOfThought: checked}))
                    }
                  />
                </div>

                {/* Few-Shot Learning Toggle */}
                <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                  <Label htmlFor="fewShot" className="font-medium text-gray-700 dark:text-gray-300">
                    Few-Shot Learning
                  </Label>
                  <Switch
                    id="fewShot"
                    checked={settings.useFewShotLearning}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({...prev, useFewShotLearning: checked}))
                    }
                  />
                </div>

                {/* Constraints Toggle */}
                <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                  <Label htmlFor="constraints" className="font-medium text-gray-700 dark:text-gray-300">
                    Include Constraints
                  </Label>
                  <Switch
                    id="constraints"
                    checked={settings.includeConstraints}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({...prev, includeConstraints: checked}))
                    }
                  />
                </div>

                {/* Reliability Toggle */}
                <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                  <Label htmlFor="reliability" className="font-medium text-gray-700 dark:text-gray-300">
                    Optimize for Reliability
                  </Label>
                  <Switch
                    id="reliability"
                    checked={settings.optimizeForReliability}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({...prev, optimizeForReliability: checked}))
                    }
                  />
                </div>
              </div>

              {/* Max Length Slider */}
              <div className="space-y-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                <div className="flex justify-between items-center">
                  <Label htmlFor="maxLength" className="font-medium text-gray-700 dark:text-gray-300">
                    Maximum Length
                  </Label>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {maxLength} characters
                  </span>
                </div>
                <Slider
                  id="maxLength"
                  min={500}
                  max={4000}
                  step={100}
                  value={[maxLength]}
                  onValueChange={([value]) => setMaxLength(value)}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Action Button */}
          <Button 
            onClick={handleOptimizePrompt} 
            disabled={isOptimizing || !systemPrompt}
            className="w-full h-12 text-lg font-medium bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg"
          >
            {isOptimizing ? (
              <div className="flex items-center justify-center">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                <span>Optimizing...</span>
              </div>
            ) : (
              'Optimize Prompt'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PromptOptimizer;