let visitors = [];
let activeVisitors = {};

export default function handler(req, res) {
  if (req.method === 'POST') {
    const { page, browser, os } = req.body;
    const visitorId = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown').toString();
    const id = `${visitorId}-${Date.now()}`;
    
    const newVisitor = {
      id,
      timestamp: Date.now(),
      page: page || 'Dashboard',
      browser: browser || 'Unknown',
      os: os || 'Unknown',
    };
    
    visitors.unshift(newVisitor);
    if (visitors.length > 100) visitors.pop();
    
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    activeVisitors[visitorId] = Date.now();
    
    const newActiveVisitors = {};
    for (const key in activeVisitors) {
      if (activeVisitors[key] > fiveMinutesAgo) {
        newActiveVisitors[key] = activeVisitors[key];
      }
    }
    activeVisitors = newActiveVisitors;
    
    res.status(200).json({ 
      success: true, 
      activeCount: Object.keys(activeVisitors).length 
    });
  } 
  else if (req.method === 'GET') {
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    const recentVisitors = visitors.filter(v => v.timestamp > fiveMinutesAgo);
    
    res.status(200).json({
      totalVisitors: visitors.length,
      activeVisitors: Object.keys(activeVisitors).length,
      recentVisitors: recentVisitors.slice(0, 20),
    });
  }
  else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
