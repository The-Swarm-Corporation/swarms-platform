export async function logAgentHandler() {
  try {
    const response = await fetch('/api/get-agents/log-agents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer {apiKey}',
      },
      body: JSON.stringify({
        data: { name: 'test agent', case: 'Description case' },
        swarms_api_key: 'Key',
        processing_time: '50',
      }),
    });

    const result = await response.json();
    console.log(result);
  } catch (error) {
    console.error('An error has occurred', error);
  }
}
