import { handler } from '@/lib/auth';

// Disable caching for auth endpoint to prevent 304 responses
const authHandler = handler;

const wrappedHandler = async (request: any) => {
  const response = await authHandler(request);
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  return response;
};

export const GET = wrappedHandler;
export const POST = wrappedHandler;
