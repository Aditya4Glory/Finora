const os = require('os');
const path = require('path');
process.env.MONGOMS_DOWNLOAD_DIR = path.join(os.tmpdir(), 'mongodb-binaries');

const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

// Set env before loading app
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret_for_finora_32_character_key_min';

async function runTests() {
  console.log('--- Starting Finora Backend Integration Test Suite ---');
  let mongod;

  try {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);
    console.log('✓ In-memory MongoDB started for testing');

    // Require app after DB connection
    const app = require('../server');
    const http = require('http');
    const server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;
    const baseUrl = `http://localhost:${port}`;
    console.log(`✓ Test server running on port ${port}`);

    // Helper request function using native Node fetch
    async function request(path, options = {}) {
      const url = `${baseUrl}${path}`;
      const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
      const res = await fetch(url, {
        method: options.method || 'GET',
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
      });
      const data = await res.json();
      return { status: res.status, data };
    }

    // 1. Health check
    const health = await request('/api/health');
    if (health.status !== 200 || health.data.status !== 'ok') throw new Error('Health check failed');
    console.log('✓ Health check passed');

    // 2. Register user 1
    const regRes = await request('/api/auth/register', {
      method: 'POST',
      body: {
        name: 'Aditya Mishra',
        email: 'aditya@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      },
    });
    if (regRes.status !== 201 || !regRes.data.data.token) throw new Error(`Registration failed: ${JSON.stringify(regRes.data)}`);
    const user1Token = regRes.data.data.token;
    const user1Id = regRes.data.data._id;
    console.log('✓ User 1 registered successfully');

    // 3. Prevent duplicate email registration
    const dupRes = await request('/api/auth/register', {
      method: 'POST',
      body: {
        name: 'Aditya Copy',
        email: 'aditya@example.com',
        password: 'password123',
      },
    });
    if (dupRes.status !== 400) throw new Error('Duplicate email should return 400');
    console.log('✓ Duplicate registration correctly rejected');

    // 4. Invalid Login test
    const badLogin = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'aditya@example.com', password: 'wrongpassword' },
    });
    if (badLogin.status !== 401) throw new Error('Wrong password should return 401');
    console.log('✓ Invalid login credentials correctly rejected');

    // 5. Valid Login
    const loginRes = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'aditya@example.com', password: 'password123' },
    });
    if (loginRes.status !== 200 || !loginRes.data.data.token) throw new Error('Login failed');
    console.log('✓ Login verified and returned valid JWT token');

    // 6. Test GET /api/auth/me
    const meRes = await request('/api/auth/me', {
      headers: { Authorization: `Bearer ${user1Token}` },
    });
    if (meRes.status !== 200 || meRes.data.data.email !== 'aditya@example.com') throw new Error('/api/auth/me failed');
    console.log('✓ /api/auth/me returned correct profile');

    // 7. Update profile
    const updateRes = await request('/api/auth/profile', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${user1Token}` },
      body: { name: 'Aditya M.' },
    });
    if (updateRes.status !== 200 || updateRes.data.data.name !== 'Aditya M.') throw new Error('Profile update failed');
    console.log('✓ User profile name update succeeded');

    // 8. Add Income
    const incomeRes = await request('/api/transactions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${user1Token}` },
      body: {
        title: 'Monthly Salary',
        amount: 60000,
        type: 'income',
        category: 'Salary',
        date: '2026-03-01',
        description: 'Tech consulting salary',
      },
    });
    if (incomeRes.status !== 201 || incomeRes.data.data.amount !== 60000) throw new Error('Add income failed');
    console.log('✓ Income transaction created (₹60,000)');

    // 9. Invalid Transaction validations
    const invalidAmountRes = await request('/api/transactions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${user1Token}` },
      body: {
        title: 'Zero Amount',
        amount: -100,
        type: 'expense',
        category: 'Food',
      },
    });
    if (invalidAmountRes.status !== 400) throw new Error('Negative amount should return 400');

    const invalidTypeRes = await request('/api/transactions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${user1Token}` },
      body: {
        title: 'Invalid type',
        amount: 100,
        type: 'crypto',
        category: 'Food',
      },
    });
    if (invalidTypeRes.status !== 400) throw new Error('Invalid type should return 400');
    console.log('✓ Invalid transaction inputs correctly rejected');

    // 10. Add multiple expenses
    const exp1 = await request('/api/transactions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${user1Token}` },
      body: {
        title: 'Grocery Supermarket',
        amount: 4500,
        type: 'expense',
        category: 'Food',
        date: '2026-03-05',
        description: 'Weekly organic groceries',
      },
    });
    const exp1Id = exp1.data.data._id;

    const exp2 = await request('/api/transactions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${user1Token}` },
      body: {
        title: 'Electricity & Wifi Bill',
        amount: 3250,
        type: 'expense',
        category: 'Bills',
        date: '2026-03-10',
      },
    });

    const exp3 = await request('/api/transactions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${user1Token}` },
      body: {
        title: 'Movie night & snacks',
        amount: 1500,
        type: 'expense',
        category: 'Entertainment',
        date: '2026-03-12',
      },
    });
    console.log('✓ Added multiple expenses (Food: 4500, Bills: 3250, Entertainment: 1500)');

    // 11. Edit an expense
    const editRes = await request(`/api/transactions/${exp1Id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${user1Token}` },
      body: {
        amount: 5000,
        title: 'Grocery Supermarket (Updated)',
      },
    });
    if (editRes.status !== 200 || editRes.data.data.amount !== 5000) throw new Error('Edit transaction failed');
    console.log('✓ Transaction updated successfully');

    // 12. Delete an expense (exp3)
    const delRes = await request(`/api/transactions/${exp3.data.data._id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${user1Token}` },
    });
    if (delRes.status !== 200) throw new Error('Delete transaction failed');
    console.log('✓ Transaction deleted successfully');

    // 13. Search transactions
    const searchRes = await request('/api/transactions?search=Grocery', {
      headers: { Authorization: `Bearer ${user1Token}` },
    });
    if (searchRes.status !== 200 || searchRes.data.data.length !== 1) throw new Error('Search failed');
    console.log('✓ Search query verified');

    // 14. Filter by category & type
    const filterRes = await request('/api/transactions?category=Bills&type=expense', {
      headers: { Authorization: `Bearer ${user1Token}` },
    });
    if (filterRes.status !== 200 || filterRes.data.data.length !== 1 || filterRes.data.data[0].category !== 'Bills') {
      throw new Error('Category filter failed');
    }
    console.log('✓ Filtering by category & type verified');

    // 15. Verify dashboard summary calculations
    // Total income: 60000
    // Total expenses: 5000 (updated grocery) + 3250 (bills) = 8250
    // Net balance: 60000 - 8250 = 51750
    // Count: 3 (Salary, Grocery, Bills)
    const summaryRes = await request('/api/transactions/summary', {
      headers: { Authorization: `Bearer ${user1Token}` },
    });
    if (summaryRes.status !== 200) throw new Error('Summary fetch failed');
    const { totalIncome, totalExpenses, totalBalance, totalTransactions, categoryBreakdown } = summaryRes.data.data;
    if (totalIncome !== 60000 || totalExpenses !== 8250 || totalBalance !== 51750 || totalTransactions !== 3) {
      throw new Error(`Summary calculation mismatch: ${JSON.stringify(summaryRes.data.data)}`);
    }
    console.log(`✓ Dashboard statistics calculation verified: Income: ₹${totalIncome}, Expense: ₹${totalExpenses}, Balance: ₹${totalBalance}, Transactions: ${totalTransactions}`);

    // 16. Verify User Isolation: User 2 cannot access or view User 1's transactions
    const regUser2 = await request('/api/auth/register', {
      method: 'POST',
      body: {
        name: 'Second User',
        email: 'user2@example.com',
        password: 'password123',
      },
    });
    const user2Token = regUser2.data.data.token;

    // User 2 lists transactions -> should be 0
    const user2Tx = await request('/api/transactions', {
      headers: { Authorization: `Bearer ${user2Token}` },
    });
    if (user2Tx.status !== 200 || user2Tx.data.data.length !== 0) throw new Error('User 2 should have 0 transactions');

    // User 2 tries to access User 1's transaction
    const user2AccessUser1 = await request(`/api/transactions/${exp1Id}`, {
      headers: { Authorization: `Bearer ${user2Token}` },
    });
    if (user2AccessUser1.status !== 404) throw new Error('User 2 should not be able to access User 1 transaction');

    // User 2 tries to update User 1's transaction
    const user2UpdateUser1 = await request(`/api/transactions/${exp1Id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${user2Token}` },
      body: { title: 'Hacked title' },
    });
    if (user2UpdateUser1.status !== 404) throw new Error('User 2 should not be able to update User 1 transaction');

    // User 2 tries to delete User 1's transaction
    const user2DeleteUser1 = await request(`/api/transactions/${exp1Id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${user2Token}` },
    });
    if (user2DeleteUser1.status !== 404) throw new Error('User 2 should not be able to delete User 1 transaction');

    console.log('✓ Multi-tenant security verified: User 2 cannot see, edit, or delete User 1 transactions');

    console.log('\n=============================================');
    console.log('🎉 ALL BACKEND INTEGRATION TESTS PASSED 100%!');
    console.log('=============================================\n');

    server.close();
    await mongoose.disconnect();
    await mongod.stop();
    process.exit(0);
  } catch (err) {
    console.error('❌ Test failed with error:', err);
    if (mongod) await mongod.stop();
    process.exit(1);
  }
}

runTests();
