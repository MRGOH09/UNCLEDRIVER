export default function handler(req, res) {
  // 只允许GET请求
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 返回配置信息
  res.status(200).json({
    APP_ID: process.env.VITE_APP_ID,
    APP_SECRET: process.env.VITE_APP_SECRET,
    APP_TOKEN: process.env.VITE_APP_TOKEN,
    MASTER_TABLE: process.env.VITE_MASTER_TABLE,
    ROLLCALL_TABLE: process.env.VITE_ROLLCALL_TABLE,
    BASE: 'https://open.larksuite.com/open-apis'
  });
}