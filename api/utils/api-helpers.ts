import { neon } from '@neondatabase/serverless';

// Initialize Neon SQL client with the database URL
export const sql = neon(process.env.DATABASE_URL as string);

// Reusable function to create response with CORS headers
export function createCorsResponse(data: any, status: number = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json',
    },
  });
}

// Helper for handling OPTIONS requests (CORS preflight)
export function handleOptions(): Response {
  return new Response(null, {
    status: 204, // No content
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

// Helper to safely parse JSON from request body
export async function parseRequestBody<T>(request: Request): Promise<T> {
  try {
    return await request.json();
  } catch (error) {
    console.error('Error parsing request body:', error);
    throw new Error('Invalid JSON in request body');
  }
}

// Error response helper
export function createErrorResponse(
  message: string,
  status: number = 400,
): Response {
  return createCorsResponse({ error: message }, status);
}
