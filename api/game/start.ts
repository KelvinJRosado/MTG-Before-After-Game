import { sql, createCorsResponse, handleOptions } from '../utils/api-helpers';

export async function GET(request: Request) {
  console.log('GET request received at /api/game/start');
  return createCorsResponse({ message: 'Hello from Vercel!' });
}

export async function POST(request: Request) {
  console.log('POST request received at /api/game/start');

  const data = await sql`SELECT * FROM public.games;`;
  console.log('Data fetched from public.games:', data);

  return createCorsResponse({ message: 'Hello from Vercel!', data });
}

export async function OPTIONS() {
  return handleOptions();
}
