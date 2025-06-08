import { IncomingMessage } from 'node:http';

// Helper function to read request body data
export function parseRequestBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    const body: Uint8Array[] = [];

    req.on('data', (chunk: Uint8Array) => {
      body.push(chunk);
    });

    req.on('end', () => {
      try {
        const data = Buffer.concat(body).toString();
        if (!data) {
          resolve({});
        } else {
          resolve(JSON.parse(data));
        }
      } catch (error) {
        reject(error);
      }
    });

    req.on('error', (err) => {
      reject(err);
    });
  });
}
