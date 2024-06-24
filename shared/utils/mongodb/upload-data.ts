export const uploadAgentJSONToDB = async (data: any) => {
  try {
    const response = await fetch('/api/mongodb-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const responseJson = await response.json();
    console.log(responseJson);
  } catch (error) {
    console.error('Error uploading data:', error);
  }
};
