import {
  sql,
  createCorsResponse,
  handleOptions,
} from '../utils/api-helpers.js';

export async function GET(request: Request) {
  console.log('GET request received at /api/game/start');

  const data = await sql`SELECT * FROM public.games;`;
  console.log('Data fetched from public.games:', data);

  return createCorsResponse({ message: 'Hello from Vercel!', data });
}

export async function POST(request: Request) {
  console.log('POST request received at /api/game/start');

  const data = await sql`SELECT * FROM public.games;`;
  console.log('Data fetched from public.games:', data);
  // TODO: Implement game session creation logic here

  return createCorsResponse({ message: 'Hello from Vercel!' });
}

export async function OPTIONS() {
  return handleOptions();
}
