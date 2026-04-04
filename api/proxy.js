export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Get config from environment
    const config = {
      APP_ID: process.env.VITE_APP_ID,
      APP_SECRET: process.env.VITE_APP_SECRET,
      APP_TOKEN: process.env.VITE_APP_TOKEN,
      MASTER_TABLE: process.env.VITE_MASTER_TABLE,
      ROLLCALL_TABLE: process.env.VITE_ROLLCALL_TABLE
    };

    // Extract path and method from request
    const { path, method = 'GET', body: requestBody } = req.body || {};
    
    if (!path) {
      return res.status(400).json({ error: 'Missing path parameter' });
    }

    // Build target URL
    const baseUrl = 'https://open.larksuite.com/open-apis';
    const targetUrl = `${baseUrl}/${path}`;

    // Prepare request options
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    // Handle authentication
    if (path.includes('auth/v3/tenant_access_token')) {
      // Token request
      options.body = JSON.stringify({
        app_id: config.APP_ID,
        app_secret: config.APP_SECRET
      });
    } else {
      // Need to get token first
      const tokenResponse = await fetch(`${baseUrl}/auth/v3/tenant_access_token/internal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          app_id: config.APP_ID,
          app_secret: config.APP_SECRET
        })
      });

      const tokenData = await tokenResponse.json();
      if (tokenData.code !== 0) {
        return res.status(401).json({ error: 'Authentication failed', details: tokenData.msg });
      }

      options.headers['Authorization'] = `Bearer ${tokenData.tenant_access_token}`;
    }

    // Add request body if provided
    if (requestBody && method !== 'GET') {
      options.body = JSON.stringify(requestBody);
    }

    // Make the actual API call
    const response = await fetch(targetUrl, options);
    const data = await response.json();

    // Return the response
    return res.status(response.status).json(data);

  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).json({ 
      error: 'Proxy request failed', 
      details: error.message 
    });
  }
}