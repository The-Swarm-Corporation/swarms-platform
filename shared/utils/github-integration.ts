import { Octokit } from '@octokit/rest';

interface RepoInfo {
  name: string;
  description: string;
  mainCode: string;
  language: string;
  imageUrl?: string;
  categories: string[];
  tags: string[];
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
      description: repoData.data.description || '',
      mainCode,
      language: languageMap[repoData.data.language || ''] || 'python',
      imageUrl: repoData.data.owner?.avatar_url,
      categories: topics.data.names.slice(0, 3), // Limit to 3 categories
      tags: topics.data.names
    };

    console.log('Successfully fetched repo info:', {
      name: repoInfo.name,
      description: repoInfo.description,
      hasCode: !!repoInfo.mainCode,
      foundFile,
      language: repoInfo.language,
      categories: repoInfo.categories,
      tags: repoInfo.tags
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