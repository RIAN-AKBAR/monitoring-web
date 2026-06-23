import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Home() {
  const [websites, setWebsites] = useState([
    { 
      name: 'Produk Garage', 
      url: 'https://produk-garage.vercel.app', 
      domain: 'produk-garage.vercel.app',
      status: 'checking', 
      responseTime: 0, 
      ping: 0, 
      performance: 0,
      visitors: 0,
      totalToday: 0,
      icon: '🏭',
      color: '#3b82f6'
    },
    { 
      name: 'Produk HRS', 
      url: 'https://produk-hrs.vercel.app', 
      domain: 'produk-hrs.vercel.app',
      status: 'checking', 
      responseTime: 0, 
      ping: 0, 
      performance: 0,
      visitors: 0,
      totalToday: 0,
      icon: '⚡',
      color: '#8b5cf6'
    },
    { 
      name: 'CDP Team', 
      url: 'https://cdp-team.vercel.app', 
      domain: 'cdp-team.vercel.app',
      status: 'checking', 
      responseTime: 0, 
      ping: 0, 
      performance: 0,
      visitors: 0,
      totalToday: 0,
      icon: '👥',
      color: '#f59e0b'
    },
    { 
      name: 'ASC Garage', 
      url: 'https://asc-garage.vercel.app', 
      domain: 'asc-garage.vercel.app',
      status: 'checking', 
      responseTime: 0, 
      ping: 0, 
      performance: 0,
      visitors: 0,
      totalToday: 0,
      icon: '🚗',
      color: '#10b981'
    },
  ]);
  
  const [logs, setLogs] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [totalActiveVisitors, setTotalActiveVisitors] = useState(0);
  const [isClient, setIsClient] = useState(false);

  // Fix hydration: hanya render di client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Check website performance
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

  // Get visitor stats untuk setiap website
  const getVisitorStats = async (domain) => {
    try {
      const response = await axios.get(`/api/track-visitor?website=${domain}`);
      return {
        visitors: response.data.activeVisitors || 0,
        totalToday: response.data.totalVisitorsToday || 0
      };
    } catch (error) {
      return { visitors: 0, totalToday: 0 };
    }
  };

  // Update semua data
  const updateAllData = async () => {
    const performanceResults = await Promise.all(websites.map(checkWebsite));
    const visitorStats = await Promise.all(
      websites.map(w => getVisitorStats(w.domain))
    );
    
    const finalResults = performanceResults.map((site, idx) => ({
      ...site,
      visitors: visitorStats[idx].visitors,
      totalToday: visitorStats[idx].totalToday
    }));
    
    setWebsites(finalResults);
    setLastUpdate(new Date());
    
    const total = finalResults.reduce((sum, site) => sum + site.visitors, 0);
    setTotalActiveVisitors(total);
    
    setLogs(prev => [
      `[${new Date().toLocaleTimeString()}] Total: ${total} visitors | ` + 
      finalResults.map(s => `${s.name}: ${s.visitors}`).join(' | '),
      ...prev.slice(0, 19)
    ]);
  };

  useEffect(() => {
    if (isClient) {
      updateAllData();
      const interval = setInterval(updateAllData, 5000);
      return () => clearInterval(interval);
    }
  }, [isClient]);

  const getStatusColor = (status) => {
    if (status === 'up') return '#4ade80';
    if (status === 'warning') return '#fbbf24';
    return '#f87171';
  };

  const getStatusText = (status) => {
    if (status === 'up') return 'ONLINE';
    if (status === 'warning') return 'WARNING';
    return 'OFFLINE';
  };

  const getStatusBg = (status) => {
    if (status === 'up') return 'rgba(74,222,128,0.15)';
    if (status === 'warning') return 'rgba(251,191,36,0.15)';
    return 'rgba(248,113,113,0.15)';
  };

  // Render loading di server
  if (!isClient) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>📊</div>
          <p>Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)', 
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ 
            fontSize: '42px', 
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 50%, #f472b6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '8px' 
          }}>
            📊 Website Monitor
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>
            Real-time monitoring for 4 websites with live visitor counts
          </p>
        </div>

        {/* Total Active Visitors */}
        <div style={{ 
          background: 'linear-gradient(135deg, rgba(96,165,250,0.12) 0%, rgba(167,139,250,0.12) 100%)',
          backdropFilter: 'blur(10px)',
          borderRadius: '16px', 
          padding: '24px',
          marginBottom: '24px',
          border: '1px solid rgba(255,255,255,0.06)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
            <div>
              <h2 style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                🌐 TOTAL ACTIVE VISITORS
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '12px' }}>Across all 4 websites</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '56px', fontWeight: 'bold', color: 'white' }}>
                {totalActiveVisitors}
              </div>
              <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', marginTop: '4px' }}>
                <span style={{ 
                  display: 'inline-block', 
                  width: '8px', 
                  height: '8px', 
                  background: '#4ade80', 
                  borderRadius: '50%',
                  animation: 'pulse 1.5s ease-in-out infinite'
                }}></span>
                <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>Live Now</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Website Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '16px', 
          marginBottom: '24px' 
        }}>
          {websites.map((site, index) => (
            <div key={index} style={{ 
              background: 'rgba(255,255,255,0.03)',
              backdropFilter: 'blur(10px)',
              borderRadius: '16px', 
              padding: '20px',
              border: '1px solid rgba(255,255,255,0.06)',
              transition: 'transform 0.2s'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '28px' }}>{site.icon}</span>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'white' }}>{site.name}</h3>
                </div>
                <span style={{ 
                  padding: '4px 10px', 
                  borderRadius: '12px', 
                  fontSize: '10px',
                  fontWeight: '600',
                  background: getStatusBg(site.status),
                  color: getStatusColor(site.status),
                  border: `1px solid ${getStatusColor(site.status)}33`
                }}>
                  {getStatusText(site.status)}
                </span>
              </div>
              
              <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '11px', marginBottom: '14px', wordBreak: 'break-all' }}>
                {site.url.replace('https://', '')}
              </p>
              
              {/* LIVE VISITOR COUNT */}
              <div style={{ 
                background: `linear-gradient(135deg, ${site.color}15 0%, ${site.color}05 100%)`, 
                borderRadius: '12px', 
                padding: '14px',
                marginBottom: '14px',
                border: `1px solid ${site.color}20`
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontSize: '10px', color: site.color, fontWeight: '600', letterSpacing: '0.5px' }}>
                      LIVE VISITORS
                    </p>
                    <p style={{ fontSize: '36px', fontWeight: 'bold', color: site.color }}>
                      {site.visitors}
                    </p>
                    <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>
                      active right now
                    </p>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '40px' }}>👥</div>
                    {site.visitors > 0 && (
                      <div style={{ 
                        fontSize: '10px', 
                        color: '#4ade80',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        justifyContent: 'center'
                      }}>
                        <span style={{ 
                          display: 'inline-block', 
                          width: '6px', 
                          height: '6px', 
                          background: '#4ade80', 
                          borderRadius: '50%',
                          animation: 'pulse 1s ease-in-out infinite'
                        }}></span>
                        Live
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '8px', marginTop: '8px' }}>
                  <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>
                    📊 Today: <strong style={{ color: 'white' }}>{site.totalToday}</strong> visitors
                  </p>
                </div>
              </div>
              
              {/* Performance bar */}
              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>Performance</span>
                  <span style={{ fontSize: '10px', fontWeight: '600', color: 'white' }}>{site.performance}%</span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '8px', height: '4px', overflow: 'hidden' }}>
                  <div style={{ 
                    width: `${site.performance}%`, 
                    height: '100%', 
                    background: `linear-gradient(90deg, ${site.performance >= 80 ? '#10b981' : site.performance >= 60 ? '#f59e0b' : '#ef4444'}, ${site.performance >= 80 ? '#34d399' : site.performance >= 60 ? '#fbbf24' : '#f87171'})`,
                    transition: 'width 0.5s'
                  }}></div>
                </div>
              </div>
              
              {/* Response & Ping */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div style={{ textAlign: 'center', padding: '6px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                  <p style={{ fontSize: '8px', color: 'rgba(255,255,255,0.3)' }}>Response</p>
                  <p style={{ fontSize: '12px', fontWeight: '600', color: 'white' }}>{site.responseTime || 'N/A'}ms</p>
                </div>
                <div style={{ textAlign: 'center', padding: '6px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                  <p style={{ fontSize: '8px', color: 'rgba(255,255,255,0.3)' }}>Ping</p>
                  <p style={{ fontSize: '12px', fontWeight: '600', color: 'white' }}>{site.ping || 'N/A'}ms</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Status Summary */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
          gap: '12px',
          marginBottom: '20px'
        }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#4ade80' }}>
              {websites.filter(w => w.status === 'up').length}
            </p>
            <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>🟢 Online</p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#fbbf24' }}>
              {websites.filter(w => w.status === 'warning').length}
            </p>
            <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>🟡 Warning</p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#f87171' }}>
              {websites.filter(w => w.status === 'down').length}
            </p>
            <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>🔴 Offline</p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#a78bfa' }}>
              {totalActiveVisitors}
            </p>
            <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>👥 Active</p>
          </div>
        </div>

        {/* Logs */}
        <div style={{ 
          background: 'rgba(255,255,255,0.03)', 
          borderRadius: '12px', 
          padding: '16px',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.04)'
        }}>
          <h3 style={{ fontSize: '13px', fontWeight: '600', color: 'rgba(255,255,255,0.6)', marginBottom: '10px' }}>
            📝 Activity Logs
          </h3>
          <div style={{ maxHeight: '120px', overflow: 'auto' }}>
            {logs.map((log, index) => (
              <div key={index} style={{ 
                padding: '4px 0', 
                borderBottom: '1px solid rgba(255,255,255,0.03)',
                fontSize: '10px',
                color: 'rgba(255,255,255,0.3)',
                fontFamily: 'monospace'
              }}>
                {log}
              </div>
            ))}
          </div>
        </div>

        {/* Footer - with suppressHydrationWarning */}
        <div style={{ marginTop: '16px', textAlign: 'center', color: 'rgba(255,255,255,0.15)', fontSize: '10px' }}>
          <p suppressHydrationWarning>
            🔄 Auto-refresh every 5s | Last update: {lastUpdate.toLocaleTimeString()}
          </p>
          <p style={{ marginTop: '4px' }}>4 websites: produk-garage | produk-hrs | cdp-team | asc-garage</p>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
