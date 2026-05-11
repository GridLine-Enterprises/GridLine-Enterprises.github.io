const CACHE_NAME = 'gridline-extension-bridge-v1';
const QUEUE_URL = new URL('./extension-sync-state', self.location.href).href;
const ENDPOINT_PATH = new URL('./extension-sync', self.location.href).pathname;
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Cache-Control': 'no-store'
};

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.pathname !== ENDPOINT_PATH) return;

  if (event.request.method === 'OPTIONS') {
    event.respondWith(new Response(null, { status: 204, headers: CORS_HEADERS }));
    return;
  }

  if (event.request.method === 'POST') {
    event.respondWith(handlePost(event.request));
    return;
  }

  if (event.request.method === 'GET') {
    event.respondWith(handleGet());
    return;
  }

  if (event.request.method === 'DELETE') {
    event.respondWith(handleDelete());
    return;
  }

  event.respondWith(new Response('Method not allowed', { status: 405, headers: CORS_HEADERS }));
});

async function handlePost(request) {
  try {
    const payload = await request.json();
    const envelope = normalizeEnvelope(payload);
    const state = await readState();
    state.queue.push(envelope);
    state.queue = state.queue.slice(-20);
    state.lastUpdated = new Date().toISOString();
    await writeState(state);
    await broadcast(envelope);

    return jsonResponse({
      ok: true,
      received: envelope.leads.length,
      queued: state.queue.length
    });
  } catch (error) {
    return jsonResponse({ ok: false, error: 'Invalid JSON payload' }, 400);
  }
}

async function handleGet() {
  const state = await readState();
  return jsonResponse(state);
}

async function handleDelete() {
  await writeState({ queue: [], lastUpdated: new Date().toISOString() });
  return jsonResponse({ ok: true, cleared: true });
}

function normalizeEnvelope(payload) {
  const leads = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.leads)
      ? payload.leads
      : [];

  return {
    type: 'GRIDLINE_EXTENSION_LEADS',
    source: payload?.source || 'service-worker endpoint',
    syncedAt: new Date().toISOString(),
    leads
  };
}

async function readState() {
  const cache = await caches.open(CACHE_NAME);
  const response = await cache.match(QUEUE_URL);
  if (!response) {
    return { queue: [], lastUpdated: null };
  }

  try {
    const data = await response.json();
    return {
      queue: Array.isArray(data?.queue) ? data.queue : [],
      lastUpdated: data?.lastUpdated || null
    };
  } catch (error) {
    return { queue: [], lastUpdated: null };
  }
}

async function writeState(state) {
  const cache = await caches.open(CACHE_NAME);
  await cache.put(
    QUEUE_URL,
    new Response(JSON.stringify(state), {
      headers: {
        ...CORS_HEADERS,
        'Content-Type': 'application/json'
      }
    })
  );
}

async function broadcast(payload) {
  const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
  clients.forEach((client) => client.postMessage(payload));
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...CORS_HEADERS,
      'Content-Type': 'application/json'
    }
  });
}
