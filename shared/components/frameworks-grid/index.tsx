'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { ExternalLink, Star, GitFork, Calendar, AlertCircle, Code, Github } from 'lucide-react';
import { fetchMultipleGitHubRepos } from '@/shared/utils/github-repo-info';
import LoadingSpinner from '@/shared/components/loading-spinner';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import Image from 'next/image';

dayjs.extend(relativeTime);

interface FrameworkCardProps {
  name: string;
  description: string;
  stars: number;
  forks: number;
  language: string;
  url: string;
  lastUpdated: string;
  openIssues: number;
  imageUrl: string;
  owner: string;
}

const FrameworkCard = ({ name, description, stars, forks, language, url, lastUpdated, openIssues, imageUrl, owner }: FrameworkCardProps) => {
  const [imageError, setImageError] = useState(false);

  return (
    <Card className="h-full transition-all duration-300 hover:shadow-lg hover:scale-[1.02] bg-black/95 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-shrink-0">
            {imageUrl && !imageError ? (
              <Image
                src={imageUrl}
                alt={`${owner} avatar`}
                width={48}
                height={48}
                className="rounded-lg border border-gray-700"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-12 h-12 rounded-lg border border-gray-700 bg-gray-800 flex items-center justify-center">
                <Github className="w-6 h-6 text-gray-400" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-xl font-bold text-white mb-2">{name}</CardTitle>
            <CardDescription className="text-gray-400 text-sm leading-relaxed">
              {description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="outline" className="bg-blue-500/20 border-blue-400/30 text-blue-300">
            <Code className="w-3 h-3 mr-1" />
            {language}
          </Badge>
          <Badge variant="outline" className="bg-yellow-500/20 border-yellow-400/30 text-yellow-300">
            <Star className="w-3 h-3 mr-1" />
            {stars.toLocaleString()}
          </Badge>
          <Badge variant="outline" className="bg-green-500/20 border-green-400/30 text-green-300">
            <GitFork className="w-3 h-3 mr-1" />
            {forks.toLocaleString()}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>Updated {dayjs(lastUpdated).fromNow()}</span>
          </div>
          <div className="flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            <span>{openIssues} issues</span>
          </div>
        </div>

        <Button 
          asChild 
          className="w-full hover:bg-green-700 bg-green-600"
          variant="default"
        >
          <a href={url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-4 h-4 mr-2" />
            View on GitHub
          </a>
        </Button>
      </CardContent>
    </Card>
  );
};

const FrameworksGrid = () => {
  const [frameworks, setFrameworks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFrameworks = async () => {
      setIsLoading(true);
      try {
        const repos = [
          {
            owner: 'kyegomez',
            repo: 'swarms',
            customName: 'Swarms Python',
            customDescription: 'The original Swarms framework for building autonomous AI agents and multi-agent systems in Python.'
          },
          {
            owner: 'The-Swarm-Corporation',
            repo: 'swarms-rs',
            customName: 'Swarms Rust',
            customDescription: 'High-performance Rust implementation of the Swarms framework for ultra-fast agent execution.'
          },
          {
            owner: 'The-Swarm-Corporation',
            repo: 'swarms-sdk',
            customName: 'Swarms SDK',
            customDescription: 'Ultra-optimized agent runtime SDK for building and deploying AI agents at scale.'
          }
        ];

        const results = await fetchMultipleGitHubRepos(repos);
        setFrameworks(results);
      } catch (error) {
        console.error('Error fetching frameworks:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFrameworks();
  }, []);

  if (isLoading) {
    return (
      <div className="w-full rounded-md p-8 py-10">
        <h2 className="text-2xl font-bold mb-4">Frameworks</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-gray-800/50 rounded-md animate-pulse">
              <div className="p-6">
                <div className="h-6 bg-gray-700 rounded mb-4"></div>
                <div className="h-4 bg-gray-700 rounded mb-2"></div>
                <div className="h-4 bg-gray-700 rounded mb-4"></div>
                <div className="flex gap-2 mb-4">
                  <div className="h-6 w-16 bg-gray-700 rounded"></div>
                  <div className="h-6 w-16 bg-gray-700 rounded"></div>
                </div>
                <div className="h-10 bg-gray-700 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full rounded-md p-8 py-10">
      <h2 className="text-2xl font-bold mb-2">Frameworks</h2>
      <p className="text-muted-foreground mb-6">
        Explore our open-source frameworks for building powerful AI applications
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {frameworks.map((framework, index) => (
          <FrameworkCard
            key={`${framework.name}-${index}`}
            name={framework.name}
            description={framework.description}
            stars={framework.stars}
            forks={framework.forks}
            language={framework.language}
            url={framework.url}
            lastUpdated={framework.lastUpdated}
            openIssues={framework.openIssues}
            imageUrl={framework.imageUrl}
            owner={framework.owner}
          />
        ))}
      </div>
    </div>
  );
};

export default FrameworksGrid; 