// test_api.js - Automated API Endpoint Test Suite
const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('🧪 Starting API Verification Tests...\n');
  let passed = 0;
  let total = 0;

  async function test(name, fn) {
    total++;
    try {
      await fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ FAIL: ${name} ->`, err.message);
    }
  }

  // 1. Health check
  await test('GET /api/health returns ok', async () => {
    const res = await fetch(`${BASE_URL}/health`);
    const data = await res.json();
    if (data.status !== 'ok') throw new Error(`Status was ${data.status}`);
  });

  // 2. Fetch all items
  let firstItem = null;
  await test('GET /api/items returns items list', async () => {
    const res = await fetch(`${BASE_URL}/items`);
    const data = await res.json();
    if (!data.success || !Array.isArray(data.data) || data.data.length === 0) {
      throw new Error('Did not return array of items');
    }
    firstItem = data.data[0];
  });

  // 3. Filter items by type
  await test('GET /api/items?type=Lost filters correctly', async () => {
    const res = await fetch(`${BASE_URL}/items?type=Lost`);
    const data = await res.json();
    if (!data.success) throw new Error('Filter failed');
    const allLost = data.data.every(i => i.type.toLowerCase() === 'lost');
    if (!allLost) throw new Error('Returned non-Lost items');
  });

  // 4. Search items by keyword
  await test('GET /api/items?search=Casio searches text fields', async () => {
    const res = await fetch(`${BASE_URL}/items?search=Casio`);
    const data = await res.json();
    if (!data.success || data.data.length === 0) throw new Error('Search found nothing');
  });

  // 5. Fetch single item
  await test('GET /api/items/:id returns specific item', async () => {
    if (!firstItem) throw new Error('No item available');
    const res = await fetch(`${BASE_URL}/items/${firstItem._id}`);
    const data = await res.json();
    if (!data.success || data.data._id !== firstItem._id) throw new Error('ID mismatch');
  });

  // 6. Create item
  let createdItemId = null;
  await test('POST /api/items creates new item report', async () => {
    const payload = {
      title: 'Automated Test Scientific Calculator',
      type: 'Found',
      category: 'Electronics',
      location: 'Science Complex Room 10',
      contactName: 'Test Suite Runner',
      contactEmail: 'tester@sdu.edu.ng',
      contactPhone: '+234 800 000 0000',
      description: 'Calculators left on desk'
    };
    const res = await fetch(`${BASE_URL}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!data.success || !data.data._id) throw new Error(data.message || 'Create failed');
    createdItemId = data.data._id;
  });

  // 7. Update status
  await test('PUT /api/items/:id/status updates status to Recovered', async () => {
    if (!createdItemId) throw new Error('No created item to update');
    const res = await fetch(`${BASE_URL}/items/${createdItemId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Recovered' })
    });
    const data = await res.json();
    if (!data.success || data.data.status !== 'Recovered') throw new Error('Status not updated');
  });

  // 8. Delete item
  await test('DELETE /api/items/:id deletes report', async () => {
    if (!createdItemId) throw new Error('No created item to delete');
    const res = await fetch(`${BASE_URL}/items/${createdItemId}`, {
      method: 'DELETE'
    });
    const data = await res.json();
    if (!data.success) throw new Error('Delete failed');
  });

  // 9. Stats endpoint
  await test('GET /api/stats returns analytics counters', async () => {
    const res = await fetch(`${BASE_URL.replace('/items', '')}/stats`);
    const data = await res.json();
    if (!data.success || typeof data.data.totalItems !== 'number') {
      throw new Error('Stats object missing counts');
    }
  });

  console.log(`\n🏁 Test Results: ${passed}/${total} tests passed!\n`);
  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runTests();
