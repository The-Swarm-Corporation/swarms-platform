import { getURL } from '../helpers';

export async function getPrompt(id: string) {
  const url = getURL();
  try {
    const res = await fetch(`${url}api/get-prompts/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch prompt: ${res.statusText}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error fetching prompt:', error);
    return null;
  }
}
