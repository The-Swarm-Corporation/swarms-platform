import { Octokit } from '@octokit/rest';

interface RepoInfo {
  name: string;
  description: string;
  mainCode: string;
  language: string;
  imageUrl?: string;
  categories: string[];
  tags: string[];
  requirements: Array<{ package: string; installation: string }>;
}

interface Requirement {
  package: string;
  installation: string;
}

export async function parseGitHubUrl(url: string): Promise<{ owner: string; repo: string; } | null> {
  try {
    // Support both full URLs and shorthand format (owner/repo)
    // Also handle URLs with @ prefix
    const githubRegex = /(?:@)?(?:github\.com\/)?([^\/]+)\/([^\/\s]+)/;
    const match = url.match(githubRegex);
    
    if (!match) return null;
    
    const repo = match[2].replace('.git', '').split('#')[0]; // Remove hash and .git
    
    return {
      owner: match[1],
      repo: repo
    };
  } catch (error) {
    console.error('Error parsing GitHub URL:', error);
    return null;
  }
}

export async function fetchRequirementsFromRepo(owner: string, repo: string): Promise<Requirement[]> {
  const octokit = new Octokit();
  const requirements: Requirement[] = [];

  // Common requirements file names
  const requirementsFiles = [
    'requirements.txt',
    'pyproject.toml',
    'setup.py',
    'Pipfile',
    'poetry.lock'
  ];

  for (const fileName of requirementsFiles) {
    try {
      const response = await octokit.repos.getContent({
        owner,
        repo,
        path: fileName
      });

      if ('content' in response.data && !Array.isArray(response.data)) {
        const content = Buffer.from(response.data.content, 'base64').toString();
        
        if (fileName === 'requirements.txt') {
          // Parse requirements.txt format
          const lines = content.split('\n');
          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#')) {
              // Handle different formats: package==version, package>=version, etc.
              const packageMatch = trimmed.match(/^([a-zA-Z0-9_-]+)/);
              if (packageMatch) {
                const packageName = packageMatch[1];
                requirements.push({
                  package: packageName,
                  installation: `pip install ${trimmed}`
                });
              }
            }
          }
        } else if (fileName === 'pyproject.toml') {
          // Parse pyproject.toml dependencies
          const dependencyMatches = content.match(/dependencies\s*=\s*\[([\s\S]*?)\]/);
          if (dependencyMatches) {
            const depsSection = dependencyMatches[1];
            const depMatches = depsSection.match(/"([^"]+)"/g);
            if (depMatches) {
              for (const dep of depMatches) {
                const packageName = dep.replace(/"/g, '');
                requirements.push({
                  package: packageName,
                  installation: `pip install ${packageName}`
                });
              }
            }
          }
        }
        
        // If we found requirements, break (don't check other files)
        if (requirements.length > 0) {
          break;
        }
      }
    } catch (error) {
      // File not found, continue to next file
      continue;
    }
  }

  return requirements;
}

export async function fetchRepositoryInfo(githubUrl: string): Promise<RepoInfo | null> {
  try {
    const parsed = await parseGitHubUrl(githubUrl);
    if (!parsed) throw new Error('Invalid GitHub URL format. Please use owner/repo or full GitHub URL.');

    const { owner, repo } = parsed;
    console.log('Fetching repo info for:', owner, repo);
    
    // Initialize Octokit without auth for public repos
    const octokit = new Octokit();

    // Fetch repository information
    const repoData = await octokit.repos.get({
      owner,
      repo
    }).catch(error => {
      console.error('Error fetching repo data:', error);
      if (error.status === 404) {
        throw new Error('Repository not found. Please check the URL and ensure the repository is public.');
      }
      throw error;
    });

    // Fetch README content
    let readmeContent = '';
    try {
      const readme = await octokit.repos.getReadme({
        owner,
        repo,
        mediaType: {
          format: 'raw'
        }
      });
      
      if ('data' in readme) {
        readmeContent = readme.data as string;
      }
    } catch (error) {
      console.log('README not found or error:', error);
    }

    // Fetch requirements from the repository
    const requirements = await fetchRequirementsFromRepo(owner, repo);

    // Prioritized list of files to check
    const possibleFiles = [
      'example.py',           // Prioritize example.py
      'main.py',             // Then main.py
      'api.py',              // Common API file
      'app.py',              // Common app entry point
      'src/main.py',         // Common source directory
      'src/example.py',
      'src/app.py',
      // Package-specific locations
      `${repo}/main.py`,
      `${repo}/example.py`,
      `${repo}/__init__.py`,
      `${repo}/core.py`,
      // Additional common patterns
      'index.py',
      'core.py',
      '__init__.py'
    ];
    
    let mainCode = '';
    let foundFile = '';
    let foundInDirectory = false;

    // First try the prioritized list
    for (const filePath of possibleFiles) {
      try {
        console.log('Trying to fetch file:', filePath);
        const contents = await octokit.repos.getContent({
          owner,
          repo,
          path: filePath
        });

        if ('content' in contents.data && !Array.isArray(contents.data)) {
          mainCode = Buffer.from(contents.data.content, 'base64').toString();
          console.log('Found code in:', filePath);
          foundFile = filePath;
          break;
        }
      } catch (error) {
        console.log('File not found:', filePath);
        continue;
      }
    }

    // If no specific file found, scan common directories for .py files
    if (!mainCode) {
      const commonDirs = [
        repo,
        'src',
        'source',
        'lib',
        'app'
      ];

      for (const dir of commonDirs) {
        try {
          const contents = await octokit.repos.getContent({
            owner,
            repo,
            path: dir
          });

          if (Array.isArray(contents.data)) {
            for (const file of contents.data) {
              if (file.name.endsWith('.py')) {
                const fileContent = await octokit.repos.getContent({
                  owner,
                  repo,
                  path: file.path
                });
                
                if ('content' in fileContent.data && !Array.isArray(fileContent.data)) {
                  mainCode = Buffer.from(fileContent.data.content, 'base64').toString();
                  console.log('Found code in directory scan:', file.path);
                  foundFile = file.path;
                  foundInDirectory = true;
                  break;
                }
              }
            }
          }
          if (foundInDirectory) break;
        } catch (error) {
          console.log('Directory not found or error:', dir, error);
          continue;
        }
      }
    }

    if (!mainCode) {
      console.warn('No Python files found in repository');
    } else {
      console.log('Using code from:', foundFile);
    }

    // Extract topics as categories
    const topics = await octokit.repos.getAllTopics({
      owner,
      repo
    }).catch(error => {
      console.error('Error fetching topics:', error);
      return { data: { names: [] } };
    });

    // Map GitHub languages to our supported languages
    const languageMap: { [key: string]: string } = {
      'Python': 'python',
      'JavaScript': 'javascript',
      'TypeScript': 'typescript',
      // Add more mappings as needed
    };

    const repoInfo = {
      name: repoData.data.name,
      description: readmeContent ? 
        `${repoData.data.description || ''}\n\n${readmeContent}` : 
        repoData.data.description || '',
      mainCode,
      language: languageMap[repoData.data.language || ''] || 'python',
      imageUrl: repoData.data.owner?.avatar_url,
      categories: topics.data.names.slice(0, 3), // Limit to 3 categories
      tags: topics.data.names,
      requirements
    };

    console.log('Successfully fetched repo info:', {
      name: repoInfo.name,
      description: repoInfo.description,
      hasCode: !!repoInfo.mainCode,
      foundFile,
      language: repoInfo.language,
      categories: repoInfo.categories,
      tags: repoInfo.tags,
      requirementsCount: requirements.length
    });

    return repoInfo;
  } catch (error) {
    console.error('Error fetching repository info:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to fetch repository information. Please ensure the repository exists and is public.');
  }
} 