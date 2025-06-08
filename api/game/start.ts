export function GET(request: Request) {
  console.log('GET request received at /api/game/start');
  return new Response('Hello from Vercel!');
}

export function POST(request: Request) {
  console.log('POST request received at /api/game/start');
  return new Response('Hello from Vercel!');
}
