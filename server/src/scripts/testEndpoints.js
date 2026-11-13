import app from '../app.js';
import http from 'http';

async function runTests() {
  console.log('🧪 Starting AgriPulse AI End-to-End API Test Suite...');
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}/api/v1`;

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ FAIL: ${name}`);
      console.error(`     Error: ${err.message}`);
      failed++;
    }
  }

  // 1. Health check
  await test('GET /health returns operational status', async () => {
    const res = await fetch(`${baseUrl}/health`);
    const data = await res.json();
    if (!res.ok || data.data.status !== 'operational') throw new Error(`Invalid status: ${JSON.stringify(data)}`);
  });

  // 2. Profile API
  await test('GET /profile returns farmer profile', async () => {
    const res = await fetch(`${baseUrl}/profile`, {
      headers: { 'x-farmer-id': '00000000-0000-0000-0000-000000000001' },
    });
    const data = await res.json();
    if (!res.ok || !data.data.id) throw new Error('Failed to get profile');
  });

  await test('PUT /profile updates profile fields', async () => {
    const res = await fetch(`${baseUrl}/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-farmer-id': '00000000-0000-0000-0000-000000000001',
      },
      body: JSON.stringify({
        full_name: 'Ramesh Gowda',
        state: 'Karnataka',
        district: 'Mandya',
        preferred_language: 'kn',
        farming_experience: 15,
        total_agricultural_land: 4.5,
        land_measurement_unit: 'acres',
        farming_type: 'mixed',
      }),
    });
    const data = await res.json();
    if (!res.ok || data.data.full_name !== 'Ramesh Gowda') throw new Error('Failed to update profile');
  });

  // 3. Farm Plots API
  let createdPlotId = null;
  await test('POST /plots creates a new farm plot', async () => {
    const res = await fetch(`${baseUrl}/plots`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-farmer-id': '00000000-0000-0000-0000-000000000001',
      },
      body: JSON.stringify({
        plot_name: 'Cauvery River Basin Plot',
        area: 3.2,
        area_unit: 'acres',
        soil_type: 'Clay Loam',
        irrigation_source: 'Canal & Borewell',
        location: 'Near Mandya Sugar Factory',
        latitude: 12.5218,
        longitude: 76.8951,
      }),
    });
    const data = await res.json();
    if (!res.ok || !data.data.id) throw new Error(`Failed to create plot: ${JSON.stringify(data)}`);
    createdPlotId = data.data.id;
  });

  await test('GET /plots lists plots', async () => {
    const res = await fetch(`${baseUrl}/plots`, {
      headers: { 'x-farmer-id': '00000000-0000-0000-0000-000000000001' },
    });
    const data = await res.json();
    if (!res.ok || !Array.isArray(data.data) || data.data.length === 0) throw new Error('No plots returned');
  });

  // 4. Soil Analysis API
  await test('POST /soil/analyze evaluates soil parameters', async () => {
    const res = await fetch(`${baseUrl}/soil/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-farmer-id': '00000000-0000-0000-0000-000000000001',
      },
      body: JSON.stringify({
        plot_id: createdPlotId,
        nitrogen: 240,
        phosphorus: 14,
        potassium: 180,
        ph: 6.8,
        moisture: 35,
        organic_carbon: 0.65,
      }),
    });
    const data = await res.json();
    if (!res.ok || !data.data.soil_health_status) throw new Error('Soil analysis failed');
  });

  // 5. Crop Recommendation Engine
  await test('POST /crop-recommendations generates recommendations with ICAR scores', async () => {
    const res = await fetch(`${baseUrl}/crop-recommendations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-farmer-id': '00000000-0000-0000-0000-000000000001',
      },
      body: JSON.stringify({
        plot_id: createdPlotId,
        season: 'Kharif',
        water_availability: 'Moderate',
        preferred_crop_category: 'All',
        budget_preference: 'Moderate',
        farming_objective: 'Maximum Yield',
        language: 'en',
      }),
    });
    const data = await res.json();
    if (!res.ok || !data.data.recommendations || data.data.recommendations.length === 0) {
      throw new Error(`Crop recommendations failed: ${JSON.stringify(data)}`);
    }
  });

  // 6. Fertilizer Advisory
  await test('POST /fertilizer/recommend formulates 4R nutrient plan', async () => {
    const res = await fetch(`${baseUrl}/fertilizer/recommend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-farmer-id': '00000000-0000-0000-0000-000000000001',
      },
      body: JSON.stringify({
        crop_name: 'Rice (Paddy)',
        growth_stage: 'Basal / Sowing',
        farm_area: 2.5,
        area_unit: 'acres',
        nitrogen: 220,
        phosphorus: 15,
        potassium: 190,
        ph: 6.8,
      }),
    });
    const data = await res.json();
    if (!res.ok || !data.data.fertilizer_options) throw new Error('Fertilizer formulation failed');
  });

  // 7. Weather Service
  await test('GET /weather/current fetches real-time agricultural weather', async () => {
    const res = await fetch(`${baseUrl}/weather/current?latitude=12.9716&longitude=77.5946`);
    const data = await res.json();
    if (!res.ok || !data.data.current) throw new Error('Failed to get current weather');
  });

  // 8. Disease Diagnosis API (Multipart / FormData)
  await test('POST /disease/diagnose performs plant pathology analysis', async () => {
    const boundary = '----WebKitFormBoundary' + Math.random().toString(16);
    const bodyParts = [
      `--${boundary}\r\nContent-Disposition: form-data; name="crop_name"\r\n\r\nTomato\r\n`,
      `--${boundary}\r\nContent-Disposition: form-data; name="plant_part"\r\n\r\nLeaf\r\n`,
      `--${boundary}\r\nContent-Disposition: form-data; name="symptoms"\r\n\r\nYellow concentric target spots on lower leaves\r\n`,
      `--${boundary}--\r\n`,
    ];
    const rawBody = bodyParts.join('');

    const res = await fetch(`${baseUrl}/disease/diagnose`, {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'x-farmer-id': '00000000-0000-0000-0000-000000000001',
      },
      body: rawBody,
    });
    const data = await res.json();
    if (!res.ok || !data.data.possible_diagnoses) throw new Error(`Disease diagnosis failed: ${JSON.stringify(data)}`);
  });

  // 8. AI Chat Assistant
  let convId = null;
  await test('POST /chat/conversations creates a conversation session', async () => {
    const res = await fetch(`${baseUrl}/chat/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-farmer-id': '00000000-0000-0000-0000-000000000001',
      },
      body: JSON.stringify({ title: 'Test Soil Advisory', language: 'en' }),
    });
    const data = await res.json();
    if (!res.ok || !data.data.id) throw new Error('Failed to create chat conversation');
    convId = data.data.id;
  });

  await test('POST /chat/conversations/:id/messages responds with context-aware advice', async () => {
    const res = await fetch(`${baseUrl}/chat/conversations/${convId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-farmer-id': '00000000-0000-0000-0000-000000000001',
      },
      body: JSON.stringify({
        message: 'Why are my crop leaves turning yellow after heavy rain?',
        language: 'en',
      }),
    });
    const data = await res.json();
    if (!res.ok || !data.data.assistant_message) throw new Error('Failed to send chat message');
  });

  // Clean up
  await new Promise((resolve) => server.close(resolve));

  console.log('------------------------------------------------');
  console.log(`Test Results: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runTests().catch((err) => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
