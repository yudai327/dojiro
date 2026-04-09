// @vitest-environment node
import { describe, it, expect, beforeAll } from 'vitest';

const API_BASE = 'http://localhost:3000/api';

let authToken: string | null = null;

function authHeaders(): Record<string, string> {
  return authToken
    ? { Authorization: `Bearer ${authToken}`, 'Content-Type': 'application/json' }
    : { 'Content-Type': 'application/json' };
}

/** ステータスコードが期待値と違う場合にレスポンスbodyをログ出力 */
async function checkStatus(res: Response, expected: number, label: string) {
  if (res.status !== expected) {
    let body = '(読み取り失敗)';
    try { body = await res.clone().text(); } catch (_) { /* ignore */ }
    console.error(`[FAIL] ${label}: expected=${expected} actual=${res.status} body=${body.substring(0, 300)}`);
  }
  expect(res.status).toBe(expected);
}

beforeAll(async () => {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@example.com', password: 'changeme' }),
    });
    if (res.ok) {
      const data = await res.json();
      authToken = data.token ?? null;
      console.log(`[beforeAll] login OK, token=${authToken ? 'got' : 'missing'}`);
    } else {
      const text = await res.text();
      console.error(`[beforeAll] login FAILED: status=${res.status} body=${text}`);
    }
  } catch (e) {
    console.error(`[beforeAll] login threw: ${e}`);
  }
});

describe('API Integration Tests', () => {
  describe('Health Check', () => {
    it('should return ok status', async () => {
      const res = await fetch(`${API_BASE}/health`);
      await checkStatus(res, 200, 'GET /health');
      const data = await res.json();
      expect(data).toHaveProperty('ok');
      expect(data.ok).toBe(true);
    });
  });

  describe('Authentication', () => {
    it('should login with valid credentials', async () => {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@example.com', password: 'changeme' }),
      });
      await checkStatus(res, 200, 'POST /auth/login valid');
      const data = await res.json();
      expect(data).toHaveProperty('token');
      expect(data).toHaveProperty('user');
      expect(data.user.email).toBe('admin@example.com');
    });

    it('should fail with invalid credentials', async () => {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@example.com', password: 'wrongpassword' }),
      });
      await checkStatus(res, 401, 'POST /auth/login invalid');
    });

    it('should fail with non-existent user', async () => {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'nonexistent@example.com', password: 'anypassword' }),
      });
      await checkStatus(res, 401, 'POST /auth/login nonexistent');
    });
  });

  describe('Events CRUD', () => {
    it('should get events list', async () => {
      const res = await fetch(`${API_BASE}/events`, { headers: authHeaders() });
      await checkStatus(res, 200, 'GET /events');
      const data = await res.json();
      expect(Array.isArray(data)).toBe(true);
    });

    it('should create an event', async () => {
      const res = await fetch(`${API_BASE}/events`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          name: 'Test Tournament',
          eventType: 'tournament',
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 86400000).toISOString(),
          venue: 'Test Venue',
        }),
      });
      await checkStatus(res, 201, 'POST /events');
      const data = await res.json();
      expect(data).toHaveProperty('id');
      expect(data.name).toBe('Test Tournament');
    });
  });

  describe('Teams CRUD', () => {
    it('should get teams list', async () => {
      const res = await fetch(`${API_BASE}/teams`, { headers: authHeaders() });
      await checkStatus(res, 200, 'GET /teams');
      const data = await res.json();
      expect(Array.isArray(data)).toBe(true);
    });

    it('should create a team', async () => {
      const res = await fetch(`${API_BASE}/teams`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          name: 'Test Team',
          category: 'men',
          organization: 'Test Org',
        }),
      });
      await checkStatus(res, 201, 'POST /teams');
      const data = await res.json();
      expect(data).toHaveProperty('id');
      expect(data.name).toBe('Test Team');
    });
  });

  describe('Matches CRUD', () => {
    it('should get matches list', async () => {
      const res = await fetch(`${API_BASE}/matches`, { headers: authHeaders() });
      await checkStatus(res, 200, 'GET /matches');
      const data = await res.json();
      expect(Array.isArray(data)).toBe(true);
    });

    it('should get match by id', async () => {
      const listRes = await fetch(`${API_BASE}/matches`, { headers: authHeaders() });
      const matches = await listRes.json();

      if (matches.length > 0) {
        const matchId = matches[0].id;
        const res = await fetch(`${API_BASE}/matches/${matchId}`, { headers: authHeaders() });
        await checkStatus(res, 200, `GET /matches/${matchId}`);
        const data = await res.json();
        expect(data).toHaveProperty('id');
        expect(data.id).toBe(matchId);
      }
    });
  });
});
