/**
 * JanSetu End-to-End API Test Suite
 * Run with: node test-api.js
 */
const http = require('http');

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const reqHeaders = { 'Content-Type': 'application/json', ...headers };
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path,
      method,
      headers: reqHeaders
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch(e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runSuite() {
  console.log('============================================');
  console.log('🇮🇳  JANSETU END-TO-END AUTOMATED TEST SUITE');
  console.log('============================================');
  
  let passed = 0;
  let total = 0;

  function assert(title, condition, details = '') {
    total++;
    if (condition) {
      passed++;
      console.log(`✅ [${total}] PASS: ${title}`);
    } else {
      console.error(`❌ [${total}] FAIL: ${title} -> ${details}`);
    }
  }

  try {
    // 1. Health
    const r1 = await request('GET', '/api/health');
    assert('Health Check', r1.status === 200 && r1.body.status === 'ok');

    // 2. Email format validation
    const r2 = await request('POST', '/api/auth/register', { name: 'Test', email: 'invalid-email', password: 'password123' });
    assert('Registration Email Format Validation', r2.status === 400);

    // 3. Password length validation
    const r3 = await request('POST', '/api/auth/register', { name: 'Test', email: 'valid@example.com', password: '123' });
    assert('Registration Password Minimum Length Validation', r3.status === 400);

    // 4. Valid Registration
    const testEmail = `tester_${Date.now()}@jansetu.in`;
    const r4 = await request('POST', '/api/auth/register', {
      name: 'Rohan Verma',
      email: testEmail,
      password: 'mypassword123',
      city: 'Pune'
    });
    assert('Citizen Registration Flow', r4.status === 201 && r4.body.requiresVerification === true);
    const verificationToken = r4.body.verificationToken;

    // 5. Verify Email
    const r5 = await request('GET', `/api/auth/verify-email?token=${verificationToken}`);
    assert('Email Verification Endpoint', r5.status === 200 && r5.body.token);
    const authToken = r5.body.token;

    // 6. Login
    const r6 = await request('POST', '/api/auth/login', { email: testEmail, password: 'mypassword123' });
    assert('Citizen Login with Verified Account', r6.status === 200 && r6.body.token);

    // 7. Bearer Token Auth /api/auth/me
    const r7 = await request('GET', '/api/auth/me', null, { 'Authorization': `Bearer ${authToken}` });
    assert('Protected /api/auth/me with Bearer Token', r7.status === 200 && r7.body.user.name === 'Rohan Verma');

    // 8. Complaint Input Validation
    const r8 = await request('POST', '/api/complaints', { title: 'Bad', description: 'Small', category: 'pothole' });
    assert('Complaint Creation Validation (Title/Desc length)', r8.status === 400);

    // 9. Complaint Creation
    const r9 = await request('POST', '/api/complaints', {
      title: 'Broken stormwater drain causing road overflow',
      description: 'The drain lid collapsed during heavy rains, submerging the pedestrian crossing.',
      category: 'drainage',
      city: 'Bengaluru',
      area: 'Koramangala'
    }, { 'Authorization': `Bearer ${authToken}` });
    assert('Valid Complaint Submission', r9.status === 201 && r9.body.complaint.id);
    const complaintId = r9.body.complaint.id;

    // 10. Status Update
    const r10 = await request('PUT', `/api/complaints/${complaintId}/status`, {
      status: 'in_progress',
      note: 'Drain cleaning squad deployed with heavy machinery.'
    });
    assert('Municipal Status Progression', r10.status === 200 && r10.body.complaint.status === 'in_progress');

    // 11. Invalid status rejection
    const r11 = await request('PUT', `/api/complaints/${complaintId}/status`, { status: 'invalid_status_code' });
    assert('Invalid Status Code Rejection', r11.status === 400);

    // 12. Flashcards
    const r12 = await request('GET', '/api/flashcards');
    assert('Civic Learning Flashcards API', r12.status === 200 && r12.body.flashcards.length >= 8);

    console.log('============================================');
    console.log(`🎉 TEST SUMMARY: ${passed} / ${total} TESTS PASSED`);
    console.log('============================================');
  } catch (err) {
    console.error('Fatal error during test run:', err.message);
  }
}

runSuite();
