import { app } from '../server/dist/src/app.js';

export default function handler(request, response) {
  const incomingUrl = new URL(request.url, 'http://localhost');
  const forwardedPath = incomingUrl.searchParams.get('__path') || '';
  incomingUrl.searchParams.delete('__path');
  const query = incomingUrl.searchParams.toString();

  request.url = `/api/${forwardedPath}${query ? `?${query}` : ''}`;
  return app(request, response);
}
