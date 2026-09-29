'use strict';

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { URL } = require('node:url');
const { RoomService } = require('./room-service.js');

const DEFAULT_PUBLIC_DIR = path.resolve(__dirname, '..', 'public');
const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml; charset=utf-8',
};

function sendJson(response, statusCode, body) {
  const payload = JSON.stringify(body);
  response.writeHead(statusCode, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(payload),
    'cache-control': 'no-store',
  });
  response.end(payload);
}

async function readJson(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > 64 * 1024) throw new Error('Request body is too large.');
    chunks.push(chunk);
  }
  if (chunks.length === 0) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw new Error('Request body must be valid JSON.');
  }
}

function bearerToken(request) {
  const authorization = request.headers.authorization || '';
  return authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
}

function errorStatus(error) {
  if (/not found/i.test(error.message)) return 404;
  if (/authorized|only the host|not your turn/i.test(error.message)) return 403;
  if (/full|already started|already joined|already signed/i.test(error.message)) return 409;
  return 400;
}

function serveStatic(publicDir, pathname, response) {
  const requestedPath = pathname === '/' ? '/index.html' : pathname;
  let decodedPath;
  try {
    decodedPath = decodeURIComponent(requestedPath);
  } catch {
    sendJson(response, 400, { error: 'Invalid path.' });
    return;
  }
  const filePath = path.resolve(publicDir, `.${decodedPath}`);
  if (filePath !== publicDir && !filePath.startsWith(`${publicDir}${path.sep}`)) {
    sendJson(response, 403, { error: 'Path is outside the public directory.' });
    return;
  }
  fs.stat(filePath, (statError, stat) => {
    if (statError || !stat.isFile()) {
      sendJson(response, 404, { error: 'Not found.' });
      return;
    }
    response.writeHead(200, {
      'content-type': MIME_TYPES[path.extname(filePath)] || 'application/octet-stream',
      'cache-control': path.extname(filePath) === '.html' ? 'no-cache' : 'public, max-age=3600',
    });
    fs.createReadStream(filePath).pipe(response);
  });
}

function createServer({ roomService = new RoomService(), publicDir = DEFAULT_PUBLIC_DIR } = {}) {
  return http.createServer(async (request, response) => {
    const url = new URL(request.url, 'http://localhost');
    const route = `${request.method} ${url.pathname}`;
    try {
      if (route === 'GET /api/health') {
        sendJson(response, 200, { ok: true, game: 'Basketball Empire' });
        return;
      }
      if (route === 'POST /api/rooms') {
        const body = await readJson(request);
        sendJson(response, 201, roomService.createRoom({ name: body.name, avatarDataUrl: body.avatarDataUrl }));
        return;
      }

      const roomMatch = url.pathname.match(/^\/api\/rooms\/([A-Za-z0-9]+)(?:\/(join|ready|start|actions|events))?$/);
      if (roomMatch) {
        const [, roomCode, operation] = roomMatch;
        if (request.method === 'GET' && !operation) {
          sendJson(response, 200, { room: roomService.getRoom(roomCode) });
          return;
        }
        if (request.method === 'POST' && operation === 'join') {
          const body = await readJson(request);
          sendJson(response, 201, roomService.joinRoom(roomCode, { name: body.name, avatarDataUrl: body.avatarDataUrl }));
          return;
        }
        if (request.method === 'POST' && operation === 'ready') {
          const body = await readJson(request);
          sendJson(response, 200, { room: roomService.setReady(roomCode, bearerToken(request), body.ready) });
          return;
        }
        if (request.method === 'POST' && operation === 'start') {
          const body = await readJson(request);
          sendJson(response, 200, { room: roomService.startRoom(roomCode, bearerToken(request), { durationMinutes: body.durationMinutes }) });
          return;
        }
        if (request.method === 'POST' && operation === 'actions') {
          const body = await readJson(request);
          sendJson(response, 200, { room: roomService.performAction(roomCode, bearerToken(request), body) });
          return;
        }
        if (request.method === 'GET' && operation === 'events') {
          response.writeHead(200, {
            'content-type': 'text/event-stream; charset=utf-8',
            'cache-control': 'no-cache, no-transform',
            connection: 'keep-alive',
            'x-accel-buffering': 'no',
          });
          const sendState = (room) => response.write(`event: state\ndata: ${JSON.stringify(room)}\n\n`);
          sendState(roomService.getRoom(roomCode));
          const unsubscribe = roomService.subscribe(roomCode, sendState);
          const heartbeat = setInterval(() => response.write(': courtside heartbeat\n\n'), 20_000);
          request.on('close', () => {
            clearInterval(heartbeat);
            unsubscribe();
          });
          return;
        }
      }

      if (request.method === 'GET' || request.method === 'HEAD') {
        serveStatic(publicDir, url.pathname, response);
        return;
      }
      sendJson(response, 404, { error: 'Not found.' });
    } catch (error) {
      if (!response.headersSent) sendJson(response, errorStatus(error), { error: error.message });
      else response.end();
    }
  });
}

if (require.main === module) {
  const port = Number(process.env.PORT || 4173);
  const host = process.env.HOST || '0.0.0.0';
  createServer().listen(port, host, () => {
    console.log(`Basketball Empire is ready at http://${host}:${port}`);
  });
}

module.exports = { createServer };
