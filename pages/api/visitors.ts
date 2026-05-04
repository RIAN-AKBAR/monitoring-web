import type { NextApiRequest, NextApiResponse } from 'next';

// Store visitor data in memory (will reset on server restart)
// Untuk production, gunakan database seperti Redis, PostgreSQL, etc.
let visitors: {
  id: string;
  timestamp: number;
  page: string;
  country: string;
  browser: string;
  os: string;
}[] = [];

let activeVisitors = new Map<string, number>(); // Track active visitors

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    // Record new visitor
    const { page, country, browser, os } = req.body;
    const visitorId = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const id = `${visitorId}-${Date.now()}`;
    
    const newVisitor = {
      id,
      timestamp: Date.now(),
      page: page || 'Home',
      country: country || 'Unknown',
      browser: browser || 'Unknown',
      os: os || 'Unknown',
    };
    
    visitors.unshift(newVisitor);
    
    // Keep only last 100 visitors
    if (visitors.length > 100) visitors.pop();
    
    // Update active visitors (consider visitors from last 5 minutes as active)
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    activeVisitors.set(String(visitorId), Date.now());
    
    // Clean up inactive visitors
    for (const [key, time] of activeVisitors.entries()) {
      if (time < fiveMinutesAgo) {
        activeVisitors.delete(key);
      }
    }
    
    res.status(200).json({ success: true, activeCount: activeVisitors.size });
  } 
  else if (req.method === 'GET') {
    // Get visitor stats
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    const recentVisitors = visitors.filter(v => v.timestamp > fiveMinutesAgo);
    
    res.status(200).json({
      totalVisitors: visitors.length,
      activeVisitors: activeVisitors.size,
      recentVisitors: recentVisitors.slice(0, 20),
      allVisitors: visitors.slice(0, 50),
    });
  }
  else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
