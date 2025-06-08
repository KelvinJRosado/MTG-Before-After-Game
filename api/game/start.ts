import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL as string);

export async function GET(request: Request) {
  console.log('GET request received at /api/game/start');

  // Create new response object with CORS headers setup
  const res = new Response('Hello from Vercel!', {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json',
    },
  });

  return res;
}

export async function POST(request: Request) {
  console.log('POST request received at /api/game/start');

  // Create new response object with CORS headers setup
  const res = new Response('Hello from Vercel!', {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json',
    },
  });

  const data = await sql`SELECT * FROM public.games;`;

  console.log('Data fetched from public.games:', data);

  return res;
}
