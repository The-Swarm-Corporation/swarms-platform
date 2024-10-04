import React from 'react';
import { CheckCircle } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/Cards';
import { CardProps, CodePrismCardProps } from '../types';

function FeatureCard({ title, description }: CardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{description}</p>
      </CardContent>
    </Card>
  );
}

function BenefitCard({ title, description }: CardProps) {
  return (
    <div className="flex items-start space-x-4">
      <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
      <div>
        <h4 className="text-xl font-semibold mb-2">{title}</h4>
        <p className="text-forground dark:text-gray-400">{description}</p>
      </div>
    </div>
  );
}

function CodePrismCard({ title, code, children }: CodePrismCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <pre className="p-4 rounded-md overflow-x-auto">
          <code className="language-python">{code}</code>
        </pre>

        {children}
      </CardContent>
    </Card>
  );
}

export { FeatureCard, BenefitCard, CodePrismCard };
