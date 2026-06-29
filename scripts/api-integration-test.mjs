/**
 * POS Cashier API integration smoke test.
 * Usage: node scripts/api-integration-test.mjs [baseUrl]
 * Default base: http://localhost:8082/api/v1
 */

const BASE = (process.argv[2] || 'http://localhost:8082/api/v1').replace(/\/$/, '');
const LOGIN_CANDIDATES = [
  { username: 'admin', password: 'admin123' },
  { username: 'admin', password: 'Dev@Local2026!' },
];

const results = [];
let token = '';
let refreshToken = '';
let branchId = 1;
let orderId = null;

function pass(name, detail = '') {
  results.push({ name, ok: true, detail });
  console.log(`  ✓ ${name}${detail ? ` — ${detail}` : ''}`);
}

function fail(name, detail = '') {
  results.push({ name, ok: false, detail });
  console.log(`  ✗ ${name}${detail ? ` — ${detail}` : ''}`);
}

async function request(method, path, { body, auth = true, expect = [200] } = {}) {
  const headers = { Accept: 'application/json' };
  if (auth && token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  const response = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text };
  }

  return {
    ok: expect.includes(response.status),
    status: response.status,
    json,
  };
}

async function check(name, method, path, opts = {}) {
  try {
    const r = await request(method, path, opts);
    if (r.ok) {
      pass(name, String(r.status));
      return r.json;
    }
    fail(name, `HTTP ${r.status} ${r.json?.message || ''}`.trim());
    return null;
  } catch (error) {
    fail(name, error instanceof Error ? error.message : String(error));
    return null;
  }
}

async function tryLogin() {
  for (const cred of LOGIN_CANDIDATES) {
    let login;
    try {
      login = await request('POST', '/auth/login', {
        auth: false,
        expect: [200, 401, 400],
        body: cred,
      });
    } catch (error) {
      fail('POST /auth/login', error instanceof Error ? error.message : String(error));
      return false;
    }
    if (login.status === 200) {
      token = login.json?.data?.accessToken || '';
      refreshToken = login.json?.data?.refreshToken || '';
      if (!token) continue;
      pass('POST /auth/login', `${cred.username} (${cred.password === 'admin123' ? 'admin123' : 'Dev@Local2026!'})`);
      const userBranch = login.json?.data?.user?.branchId;
      if (typeof userBranch === 'number' && userBranch > 0) {
        branchId = userBranch;
      }
      return true;
    }
  }
  fail('POST /auth/login', 'No configured admin credentials worked');
  return false;
}

async function main() {
  console.log(`\nPOS API Integration Test\nBase: ${BASE}\n`);

  const loggedIn = await tryLogin();
  if (!loggedIn) {
    process.exit(1);
  }

  if (refreshToken) {
    const refresh = await check('POST /auth/refresh', 'POST', '/auth/refresh', {
      body: { refreshToken },
    });
    if (refresh?.data?.accessToken) {
      token = refresh.data.accessToken;
    }
  } else {
    fail('POST /auth/refresh', 'Missing refresh token from login response');
  }

  await check('GET /users/me', 'GET', '/users/me');
  await check('GET /permissions', 'GET', '/permissions');
  await check('GET /permissions/mine', 'GET', '/permissions/mine');
  await check('GET /settings', 'GET', '/settings');
  await check('GET /settings/pos', 'GET', '/settings/pos');

  const branchPage = await check('GET /branches', 'GET', '/branches?page=0&size=5');
  const firstBranch = branchPage?.data?.content?.[0]?.id;
  if (typeof firstBranch === 'number' && firstBranch > 0) {
    branchId = firstBranch;
  }

  await check('GET /dashboard/summary', 'GET', `/dashboard/summary?branchId=${branchId}`);
  await check('GET /users', 'GET', '/users?page=0&size=5');
  await check('GET /products', 'GET', '/products?page=0&size=5');
  await check('GET /categories', 'GET', '/categories?page=0&size=5');
  await check('GET /units', 'GET', '/units?page=0&size=5');
  await check('GET /taxes', 'GET', '/taxes?page=0&size=5');
  await check('GET /discounts', 'GET', '/discounts?page=0&size=5');
  await check('GET /modifiers', 'GET', '/modifiers?page=0&size=5');
  await check('GET /customers', 'GET', '/customers?page=0&size=5');
  await check('GET /suppliers', 'GET', '/suppliers?page=0&size=5');
  await check('GET /purchase-orders', 'GET', `/purchase-orders?page=0&size=5&branchId=${branchId}`);

  const orders = await check('GET /pos/orders', 'GET', `/pos/orders?page=0&size=5&branchId=${branchId}`);
  orderId = orders?.data?.content?.[0]?.id ?? null;

  if (orderId) {
    await check('GET /pos/orders/{id}', 'GET', `/pos/orders/${orderId}`);
    await check('GET /receipts/{orderId}', 'GET', `/receipts/${orderId}`);
    await check('GET /payments/order/{orderId}', 'GET', `/payments/order/${orderId}`);
  } else {
    pass('Order detail endpoints', 'Skipped (no orders available)');
  }

  await check('GET /inventory/balances', 'GET', `/inventory/balances?page=0&size=5&branchId=${branchId}`);
  await check('GET /inventory/movements', 'GET', `/inventory/movements?page=0&size=5&branchId=${branchId}`);
  await check('GET /inventory/low-stock', 'GET', `/inventory/low-stock?branchId=${branchId}`);
  await check('GET /shifts', 'GET', `/shifts?page=0&size=5&branchId=${branchId}`);
  await check('GET /shifts/current', 'GET', '/shifts/current');
  await check('GET /kitchen/queue', 'GET', `/kitchen/queue?branchId=${branchId}`);
  await check('GET /tables', 'GET', `/tables?page=0&size=5&branchId=${branchId}`);
  await check('GET /audit-logs', 'GET', `/audit-logs?page=0&size=5&branchId=${branchId}`);
  await check('GET /lookups/by-type', 'GET', '/lookups/by-type?type=ORDER_CHANNEL');
  await check('GET /lookups/admin/by-type', 'GET', '/lookups/admin/by-type?type=ORDER_CHANNEL');

  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const from = new Date(now.getTime() - 30 * 86400000).toISOString().slice(0, 10);
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth() + 1;

  await check('GET /reports/daily-sales', 'GET', `/reports/daily-sales?date=${today}&branchId=${branchId}`);
  await check('GET /reports/monthly-sales', 'GET', `/reports/monthly-sales?year=${year}&month=${month}&branchId=${branchId}`);
  await check('GET /reports/top-products', 'GET', `/reports/top-products?from=${from}&to=${today}&branchId=${branchId}&limit=5`);
  await check('GET /reports/payment-methods', 'GET', `/reports/payment-methods?from=${from}&to=${today}&branchId=${branchId}`);
  await check('GET /reports/cashier-sales', 'GET', `/reports/cashier-sales?from=${from}&to=${today}&branchId=${branchId}`);
  await check('GET /reports/branch-sales', 'GET', `/reports/branch-sales?from=${from}&to=${today}`);
  await check('GET /reports/low-stock', 'GET', `/reports/low-stock?branchId=${branchId}`);

  await check('POST /auth/logout', 'POST', '/auth/logout', { body: {} });

  const passed = results.filter((item) => item.ok).length;
  const failed = results.filter((item) => !item.ok).length;
  console.log(`\n${'-'.repeat(56)}`);
  console.log(`Passed: ${passed}  Failed: ${failed}  Total: ${results.length}`);

  if (failed > 0) {
    console.log('\nFailed checks:');
    for (const row of results.filter((item) => !item.ok)) {
      console.log(`  - ${row.name}: ${row.detail}`);
    }
    process.exit(1);
  }

  console.log('\nAll API checks passed.\n');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
