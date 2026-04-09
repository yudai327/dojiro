// @vitest-environment node
import { describe, it, expect, beforeAll } from 'vitest';

const API_BASE = 'http://localhost:3000/api';

let authToken: string | null = null;

function authHeaders(): Record<string, string> {
  return authToken
    ? { Authorization: `Bearer ${authToken}`, 'Content-Type': 'application/json' }
    : { 'Content-Type': 'application/json' };
}

beforeAll(async () => {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@example.com', password: 'changeme' }),
  });
  if (res.ok) {
    const data = await res.json();
    authToken = data.token;
  }
});

describe('API Integration Tests', () => {
  describe('Health Check', () => {
    it('should return ok status', async () => {
      const res = await fetch(`${API_BASE}/health`);
      expect(res.status).toBe(200);
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
      expect(res.status).toBe(200);
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
      expect(res.status).toBe(401);
    });

    it('should fail with non-existent user', async () => {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'nonexistent@example.com', password: 'anypassword' }),
      });
      expect(res.status).toBe(401);
    });
  });

  describe('Events CRUD', () => {
    it('should get events list', async () => {
      const res = await fetch(`${API_BASE}/events`, {
        headers: authHeaders(),
      });
      expect(res.status).toBe(200);
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
      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data).toHaveProperty('id');
      expect(data.name).toBe('Test Tournament');
    });
  });

  describe('Teams CRUD', () => {
    it('should get teams list', async () => {
      const res = await fetch(`${API_BASE}/teams`, {
        headers: authHeaders(),
      });
      expect(res.status).toBe(200);
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
      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data).toHaveProperty('id');
      expect(data.name).toBe('Test Team');
    });
  });

  describe('Matches CRUD', () => {
    it('should get matches list', async () => {
      const res = await fetch(`${API_BASE}/matches`, {
        headers: authHeaders(),
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(Array.isArray(data)).toBe(true);
    });

    it('should get match by id', async () => {
      const listRes = await fetch(`${API_BASE}/matches`, {
        headers: authHeaders(),
      });
      const matches = await listRes.json();

      if (matches.length > 0) {
        const matchId = matches[0].id;
        const res = await fetch(`${API_BASE}/matches/${matchId}`, {
          headers: authHeaders(),
        });
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data).toHaveProperty('id');
        expect(data.id).toBe(matchId);
      }
    });
  });
});
