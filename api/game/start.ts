export function GET(request: Request) {
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

export function POST(request: Request) {
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

  return res;
}
