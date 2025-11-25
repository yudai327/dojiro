import { describe, it, expect } from 'vitest';

// API Base URL for tests
const API_BASE = 'http://localhost:3000/api';

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

  describe('Events CRUD', () => {
    it('should get events list', async () => {
      const res = await fetch(`${API_BASE}/events`);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(Array.isArray(data)).toBe(true);
    });

    it('should create an event', async () => {
      const res = await fetch(`${API_BASE}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      const res = await fetch(`${API_BASE}/teams`);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(Array.isArray(data)).toBe(true);
    });

    it('should create a team', async () => {
      const res = await fetch(`${API_BASE}/teams`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      const res = await fetch(`${API_BASE}/matches`);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(Array.isArray(data)).toBe(true);
    });

    it('should get match by id', async () => {
      // First get a list of matches
      const listRes = await fetch(`${API_BASE}/matches`);
      const matches = await listRes.json();

      if (matches.length > 0) {
        const matchId = matches[0].id;
        const res = await fetch(`${API_BASE}/matches/${matchId}`);
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data).toHaveProperty('id');
        expect(data.id).toBe(matchId);
      }
    });
  });

  describe('Authentication', () => {
    it('should login with valid credentials', async () => {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@example.com',
          password: 'changeme',
        }),
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toHaveProperty('token');
      expect(data).toHaveProperty('user');
      expect(data.user).toHaveProperty('email');
      expect(data.user.email).toBe('admin@example.com');
    });

    it('should fail with invalid credentials', async () => {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@example.com',
          password: 'wrongpassword',
        }),
      });
      expect(res.status).toBe(401);
    });

    it('should fail with non-existent user', async () => {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'nonexistent@example.com',
          password: 'anypassword',
        }),
      });
      expect(res.status).toBe(401);
    });
  });
});
