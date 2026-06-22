import { expect, test } from '@playwright/test';

const E2E = !!process.env['E2E_ENABLED'];
const API = process.env['E2E_API_URL'] ?? 'http://localhost:8082/api/v1';

test.describe('POS API smoke', () => {
  test('login returns access token', async ({ request }) => {
    test.skip(!E2E, 'Set E2E_ENABLED=true with backend running');
    const res = await request.post(`${API}/auth/login`, {
      data: { username: 'admin', password: 'admin123' },
    });
    expect(res.ok(), `${res.status()} ${await res.text()}`).toBeTruthy();
    const json = await res.json();
    expect(json.success).toBeTruthy();
    expect(json.data?.accessToken).toBeTruthy();
  });

  test('taxes list is reachable when authenticated', async ({ request }) => {
    test.skip(!E2E, 'Set E2E_ENABLED=true with backend running');
    const login = await request.post(`${API}/auth/login`, {
      data: { username: 'admin', password: 'admin123' },
    });
    const token = (await login.json()).data.accessToken as string;
    const res = await request.get(`${API}/taxes`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.ok()).toBeTruthy();
    const json = await res.json();
    expect(Array.isArray(json.data)).toBeTruthy();
  });

  test('kitchen queue endpoint exists', async ({ request }) => {
    test.skip(!E2E, 'Set E2E_ENABLED=true with backend running');
    const login = await request.post(`${API}/auth/login`, {
      data: { username: 'admin', password: 'admin123' },
    });
    const token = (await login.json()).data.accessToken as string;
    const res = await request.get(`${API}/kitchen/queue?branchId=1`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.ok()).toBeTruthy();
    const json = await res.json();
    expect(Array.isArray(json.data)).toBeTruthy();
  });
});
