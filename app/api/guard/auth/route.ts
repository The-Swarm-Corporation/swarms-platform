import { SwarmsApiGuard } from '@/shared/utils/api/swarms-guard';

async function POST(req: Request) {
  /* 
    headers:
      Authorization: Bearer <token> : Required
      Organization ID : Optional
  */

  const headers = req.headers;

  const secretkey = headers.get('SecretKey');
  if (!secretkey) {
    return new Response('Secret Key is missing', { status: 401 });
  }
  if (secretkey !== process.env.GUARD_SECRET_KEY) {
    return new Response('Invalid Secret Key', { status: 401 });
  }
  const organizationPublicId = headers.get('Swarms-Organization');
  const apiKey = headers.get('Authorization');

  const data = await req.json();
  const modelId = data?.model;

  const guard = new SwarmsApiGuard({ apiKey, organizationPublicId, modelId });
  const isAuthenticated = await guard.isAuthenticated();
  try {
    return new Response(isAuthenticated.message, {
      status: isAuthenticated.status,
    });
  } catch (error) {
    return new Response('Internal Server Error', {
      status: 500,
    });
  }
}

export { POST };
