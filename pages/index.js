import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Home() {
  const [websites, setWebsites] = useState([
    { name: 'Web Islam', url: 'https://web-islam.vercel.app', status: 'checking', responseTime: 0, ping: 0, performance: 0 },
    { name: 'Produk Garage', url: 'https://produk-garage.vercel.app', status: 'checking', responseTime: 0, ping: 0, performance: 0 },
    { name: 'Kanshi Craft', url: 'https://kanshi-craft-merchandise.vercel.app', status: 'checking', responseTime: 0, ping: 0, performance: 0 },
  ]);
  
  const [activeVisitors, setActiveVisitors] = useState(0);
  const [totalVisitors, setTotalVisitors] = useState(0);
  const [recentVisitors, setRecentVisitors] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Check website function
  const checkWebsite = async (website) => {
    const startTime = Date.now();
    try {
      const response = await axios.get(website.url, { timeout: 8000 });
      const responseTime = Date.now() - startTime;
      let performance = 100;
      if (responseTime > 1000) performance = 60;
      else if (responseTime > 500) performance = 80;
      else if (responseTime > 200) performance = 90;
      
      return {
        ...website,
        status: response.status === 200 ? 'up' : 'warning',
        responseTime: responseTime,
        ping: responseTime,
        performance: performance,
        statusCode: response.status
      };
    } catch (error) {
      return {
        ...website,
        status: 'down',
        responseTime: 0,
        ping: Date.now() - startTime,
        performance: 0,
        statusCode: 0
      };
    }
  };

  // Check all websites
  const checkAllWebsites = async () => {
    const results = await Promise.all(websites.map(checkWebsite));
    setWebsites(results);
    setLastUpdate(new Date());
  };

  // Get visitor stats
  const fetchVisitors = async () => {
    try {
      const response = await axios.get('/api/visitors');
      setActiveVisitors(response.data.activeVisitors || 0);
      setTotalVisitors(response.data.totalVisitors || 0);
      setRecentVisitors(response.data.recentVisitors || []);
    } catch (error) {
      console.log('Visitor stats not available yet');
    }
  };

  // Record current visitor
  const recordVisitor = async () => {
    try {
      const userAgent = navigator.userAgent;
      let browser = 'Unknown';
      if (userAgent.includes('Chrome')) browser = 'Chrome';
      else if (userAgent.includes('Firefox')) browser = 'Firefox';
      else if (userAgent.includes('Safari')) browser = 'Safari';
      else if (userAgent.includes('Edge')) browser = 'Edge';
      
      await axios.post('/api/visitors', {
        page: 'Dashboard',
        browser: browser,
        os: 'Web'
      });
    } catch (error) {
      console.log('Failed to record visitor');
    }
  };

  useEffect(() => {
    checkAllWebsites();
    fetchVisitors();
    recordVisitor();
    
    const interval = setInterval(() => {
      checkAllWebsites();
      fetchVisitors();
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    if (status === 'up') return 'bg-green-500';
    if (status === 'warning') return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatusText = (status) => {
    if (status === 'up') return '✓ ONLINE';
    if (status === 'warning') return '⚠ WARNING';
    return '✗ OFFLINE';
  };

  const getPerformanceColor = (performance) => {
    if (performance >= 80) return 'bg-green-500';
    if (performance >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '48px', color: 'white', marginBottom: '10px' }}>🌐 Website Monitor</h1>
          <p style={{ color: 'rgba(255,255,255,0.9)' }}>Real-time monitoring for your websites</p>
        </div>

        {/* Visitor Counter */}
        <div style={{ 
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', 
          borderRadius: '20px', 
          padding: '25px',
          marginBottom: '30px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
            <div>
              <h2 style={{ color: 'white', marginBottom: '5px' }}>👥 Real-time Visitors</h2>
              <p style={{ color: 'rgba(255,255,255,0.8)' }}>People viewing this dashboard NOW</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '64px', fontWeight: 'bold', color: 'white' }}>
                {activeVisitors}
              </div>
              <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
                <div style={{ width: '10px', height: '10px', background: '#4ade80', borderRadius: '50%', animation: 'pulse 1s infinite' }}></div>
                <span style={{ color: 'white' }}>Active Now</span>
              </div>
            </div>
            <div style={{ textAlign: 'center', borderLeft: '1px solid rgba(255,255,255,0.3)', paddingLeft: '20px' }}>
              <p style={{ color: 'rgba(255,255,255,0.8)' }}>Total Today</p>
              <p style={{ fontSize: '32px', fontWeight: 'bold', color: 'white' }}>{totalVisitors}</p>
            </div>
          </div>
        </div>

        {/* Website Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          {websites.map((site, index) => (
            <div key={index} style={{ 
              background: 'white', 
              borderRadius: '15px', 
              padding: '20px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              transition: 'transform 0.3s'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#333' }}>{site.name}</h3>
                <span style={{ 
                  padding: '5px 10px', 
                  borderRadius: '20px', 
                  fontSize: '12px',
                  fontWeight: 'bold',
                  background: getStatusColor(site.status),
                  color: 'white'
                }}>
                  {getStatusText(site.status)}
                </span>
              </div>
              
              <p style={{ color: '#666', fontSize: '12px', marginBottom: '15px', wordBreak: 'break-all' }}>
                {site.url}
              </p>
              
              {/* Performance bar */}
              <div style={{ marginBottom: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span style={{ fontSize: '12px', color: '#666' }}>Performance</span>
                  <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{site.performance}%</span>
                </div>
                <div style={{ background: '#e5e7eb', borderRadius: '10px', height: '8px', overflow: 'hidden' }}>
                  <div style={{ 
                    width: `${site.performance}%`, 
                    height: '100%', 
                    background: `linear-gradient(90deg, ${site.performance >= 80 ? '#10b981' : site.performance >= 60 ? '#f59e0b' : '#ef4444'}, ${site.performance >= 80 ? '#34d399' : site.performance >= 60 ? '#fbbf24' : '#f87171'})`,
                    transition: 'width 0.5s'
                  }}></div>
                </div>
              </div>
              
              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                <div style={{ textAlign: 'center', padding: '10px', background: '#f3f4f6', borderRadius: '10px' }}>
                  <p style={{ fontSize: '11px', color: '#666' }}>Response Time</p>
                  <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>{site.responseTime || 'N/A'}ms</p>
                </div>
                <div style={{ textAlign: 'center', padding: '10px', background: '#f3f4f6', borderRadius: '10px' }}>
                  <p style={{ fontSize: '11px', color: '#666' }}>Ping</p>
                  <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>{site.ping || 'N/A'}ms</p>
                </div>
              </div>
              
              {site.statusCode && site.statusCode > 0 && (
                <div style={{ textAlign: 'center', padding: '5px', background: '#fef3c7', borderRadius: '5px' }}>
                  <span style={{ fontSize: '11px', color: '#d97706' }}>HTTP {site.statusCode}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Recent Visitors */}
        <div style={{ background: 'white', borderRadius: '15px', padding: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '15px' }}>🕒 Recent Visitors</h3>
          <div style={{ overflow: 'auto', maxHeight: '300px' }}>
            {recentVisitors.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>No visitors yet. Be the first!</p>
            ) : (
              recentVisitors.map((visitor, index) => (
                <div key={index} style={{ 
                  padding: '10px', 
                  borderBottom: '1px solid #e5e7eb',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <p style={{ fontWeight: '500' }}>Visitor #{recentVisitors.length - index}</p>
                    <p style={{ fontSize: '12px', color: '#666' }}>{new Date(visitor.timestamp).toLocaleTimeString()}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span style={{ fontSize: '11px', padding: '2px 8px', background: '#e0e7ff', color: '#4338ca', borderRadius: '10px' }}>
                      {visitor.browser}
                    </span>
                    <span style={{ fontSize: '11px', padding: '2px 8px', background: '#fce7f3', color: '#be185d', borderRadius: '10px' }}>
                      {visitor.os}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: '20px', textAlign: 'center', color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>
          <p>🔄 Auto-refresh every 10 seconds | Last update: {lastUpdate.toLocaleTimeString()}</p>
          <p style={{ marginTop: '5px' }}>Monitoring: web-islam.vercel.app | produk-garage.vercel.app | kanshi-craft-merchandise.vercel.app</p>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
