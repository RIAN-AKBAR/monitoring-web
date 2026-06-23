// pages/api/track-visitor.js
let visitors = {
  'produk-garage.vercel.app': [],
  'produk-hrs.vercel.app': [],
  'cdp-team.vercel.app': [],
  'asc-garage.vercel.app': []
};

let activeVisitors = {
  'produk-garage.vercel.app': {},
  'produk-hrs.vercel.app': {},
  'cdp-team.vercel.app': {},
  'asc-garage.vercel.app': {}
};

export default function handler(req, res) {
  // Set CORS headers untuk semua response
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    const { website, page } = req.body;
    
    // Validasi website
    if (!website || !visitors[website]) {
      return res.status(400).json({ error: 'Website tidak valid' });
    }
    
    const visitorId = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown').toString();
    const timestamp = Date.now();
    
    // Simpan ke history
    visitors[website].unshift({
      id: `${visitorId}-${timestamp}`,
      timestamp: timestamp,
      page: page || 'Home',
      ip: visitorId
    });
    
    // Keep hanya 100 history terakhir
    if (visitors[website].length > 100) visitors[website].pop();
    
    // Update active visitors (5 menit terakhir dianggap aktif)
    const fiveMinutesAgo = timestamp - (5 * 60 * 1000);
    activeVisitors[website][visitorId] = timestamp;
    
    // Bersihkan yang tidak aktif
    const newActive = {};
    for (const key in activeVisitors[website]) {
      if (activeVisitors[website][key] > fiveMinutesAgo) {
        newActive[key] = activeVisitors[website][key];
      }
    }
    activeVisitors[website] = newActive;
    
    res.status(200).json({ 
      success: true, 
      activeCount: Object.keys(activeVisitors[website]).length 
    });
  } 
  else if (req.method === 'GET') {
    const { website } = req.query;
    
    if (!website || !visitors[website]) {
      return res.status(400).json({ error: 'Website tidak valid' });
    }
    
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
    const recentVisitors = visitors[website]?.filter(v => v.timestamp > fiveMinutesAgo) || [];
    
    res.status(200).json({
      activeVisitors: Object.keys(activeVisitors[website] || {}).length,
      totalVisitorsToday: visitors[website]?.length || 0,
      recentVisitors: recentVisitors.slice(0, 20)
    });
  }
  else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
