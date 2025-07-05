import { getURL } from '../helpers';

interface MetadataPromptData {
  id: string;
  name: string;
  description: string;
  tags: string;
  is_free: boolean;
  price_usd: number;
  image_url?: string;
  user_id: string;
  created_at: string;
}

interface MetadataAgentData {
  id: string;
  name: string;
  description: string;
  tags: string;
  is_free: boolean;
  price_usd: number;
  image_url?: string;
  user_id: string;
  created_at: string;
}

interface MetadataToolData {
  id: string;
  name: string;
  description: string;
  tags: string;
  is_free: boolean;
  image_url?: string;
  user_id: string;
  created_at: string;
}

export async function getPromptMetadata(id: string): Promise<MetadataPromptData | null> {
  const url = getURL();
  try {
    const res = await fetch(`${url}api/get-prompts/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', 
    });

    if (!res.ok) {
      if (res.status === 404) {
        return null; 
      }
      throw new Error(`Failed to fetch prompt: ${res.statusText}`);
    }

    const data = await res.json();
    
    
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      tags: data.tags,
      is_free: data.is_free,
      price_usd: data.price_usd,
      image_url: data.image_url,
      user_id: data.user_id,
      created_at: data.created_at,
    };
  } catch (error) {
    console.error('Error fetching prompt metadata:', error);
    return null;
  }
}

export async function getAgentMetadata(id: string): Promise<MetadataAgentData | null> {
  const url = getURL();
  try {
    const res = await fetch(`${url}api/get-agents/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', 
    });

    if (!res.ok) {
      if (res.status === 404) {
        return null; 
      }
      throw new Error(`Failed to fetch agent: ${res.statusText}`);
    }

    const data = await res.json();
    
    
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      tags: data.tags,
      is_free: data.is_free,
      price_usd: data.price_usd,
      image_url: data.image_url,
      user_id: data.user_id,
      created_at: data.created_at,
    };
  } catch (error) {
    console.error('Error fetching agent metadata:', error);
    return null;
  }
}

export async function getToolMetadata(id: string): Promise<MetadataToolData | null> {
  const url = getURL();
  try {
    const res = await fetch(`${url}api/get-tools/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', 
    });

    if (!res.ok) {
      if (res.status === 404) {
        return null; 
      }
      throw new Error(`Failed to fetch tool: ${res.statusText}`);
    }

    const data = await res.json();
    
    
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      tags: data.tags,
      is_free: data.is_free,
      image_url: data.image_url,
      user_id: data.user_id,
      created_at: data.created_at,
    };
  } catch (error) {
    console.error('Error fetching tool metadata:', error);
    return null;
  }
}
