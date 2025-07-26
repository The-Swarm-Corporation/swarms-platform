interface GitHubRepoInfo {
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

export async function fetchGitHubRepoInfo(owner: string, repo: string): Promise<GitHubRepoInfo | null> {
  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Swarms-Platform'
      },
      next: { revalidate: 3600 } // Cache for 1 hour
    });

    if (!response.ok) {
      console.error(`Failed to fetch GitHub repo info: ${response.status}`);
      return null;
    }

    const data = await response.json();
    
    return {
      name: data.name,
      description: data.description || '',
      stars: data.stargazers_count,
      forks: data.forks_count,
      language: data.language || 'Unknown',
      url: data.html_url,
      lastUpdated: data.updated_at,
      openIssues: data.open_issues_count,
      imageUrl: data.owner?.avatar_url || '',
      owner: data.owner?.login || owner
    };
  } catch (error) {
    console.error('Error fetching GitHub repo info:', error);
    return null;
  }
}

export async function fetchMultipleGitHubRepos(repos: Array<{ owner: string; repo: string; customName?: string; customDescription?: string }>) {
  const results = await Promise.allSettled(
    repos.map(async ({ owner, repo, customName, customDescription }) => {
      const info = await fetchGitHubRepoInfo(owner, repo);
      if (info) {
        return {
          ...info,
          name: customName || info.name,
          description: customDescription || info.description
        };
      }
      return null;
    })
  );

  return results
    .map((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        return result.value;
      }
      // Return fallback data if fetch failed
      const { owner, repo, customName, customDescription } = repos[index];
      return {
        name: customName || repo,
        description: customDescription || 'Repository information unavailable',
        stars: 0,
        forks: 0,
        language: 'Unknown',
        url: `https://github.com/${owner}/${repo}`,
        lastUpdated: new Date().toISOString(),
        openIssues: 0,
        imageUrl: '',
        owner: owner
      };
    })
    .filter(Boolean);
} 