import { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface WebsiteStatus {
  name: string;
  url: string;
  status: 'up' | 'down' | 'warning';
  responseTime: number;
  ping: number;
  lastChecked: string;
  performance: number;
  statusCode?: number;
}

interface VisitorData {
  count: number;
  timestamp: string;
  website: string;
}

export default function Home() {
  const [websites, setWebsites] = useState<WebsiteStatus[]>([
    { 
      name: 'Web Islam', 
      url: 'https://web-islam.vercel.app', 
      status: 'up', 
      responseTime: 0, 
      ping: 0, 
      lastChecked: '', 
      performance: 100 
    },
    { 
      name: 'Produk Garage', 
      url: 'https://produk-garage.vercel.app', 
      status: 'up', 
      responseTime: 0, 
      ping: 0, 
      lastChecked: '', 
      performance: 100 
    },
    { 
      name: 'Kanshi Craft', 
      url: 'https://kanshi-craft-merchandise.vercel.app', 
      status: 'up', 
      responseTime: 0, 
      ping: 0, 
      lastChecked: '', 
      performance: 100 
    },
  ]);
  
  const [visitors, setVisitors] = useState<VisitorData[]>([]);
  const [currentVisitors, setCurrentVisitors] = useState<{[key: string]: number}>({
    'Web Islam': 0,
    'Produk Garage': 0,
    'Kanshi Craft': 0
  });
  const [history, setHistory] = useState<any[]>([]);
  const [selectedWebsite, setSelectedWebsite] = useState<string>('all');
  const [totalVisitors, setTotalVisitors] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Check single website
  const checkWebsite = async (website: WebsiteStatus) => {
    const startTime = performance.now();
    const startPing = Date.now();
    
    try {
      const response = await axios.get(website.url, { 
        timeout: 10000,
        validateStatus: (status) => status < 500
      });
      
      const pingTime = Date.now() - startPing;
      const responseTime = performance.now() - startTime;
      
      let performanceScore = 100;
      if (responseTime > 1000) performanceScore = 60;
      else if (responseTime > 500) performanceScore = 80;
      else if (responseTime > 200) performanceScore = 90;
      
      let status: 'up' | 'down' | 'warning' = 'up';
      if (response.status !== 200) {
        status = 'warning';
        performanceScore -= 20;
      }
      
      const logMessage = `[${new Date().toLocaleTimeString()}] ${website.name} - Status: ${status.toUpperCase()} (${response.status}) - Response: ${Math.round(responseTime)}ms - Ping: ${pingTime}ms`;
      setLogs(prev => [logMessage, ...prev.slice(0, 49)]);
      
      return {
        ...website,
        status: status,
        responseTime: Math.round(responseTime),
        ping: pingTime,
        lastChecked: new Date().toLocaleTimeString(),
        performance: Math.max(0, Math.min(100, performanceScore)),
        statusCode: response.status
      };
    } catch (error: any) {
      const pingTime = Date.now() - startPing;
      
      const logMessage = `[${new Date().toLocaleTimeString()}] ${website.name} - DOWN ❌ - Error: ${error.message || 'Timeout/No Response'}`;
      setLogs(prev => [logMessage, ...prev.slice(0, 49)]);
      
      return {
        ...website,
        status: 'down' as const,
        responseTime: 0,
        ping: pingTime,
        lastChecked: new Date().toLocaleTimeString(),
        performance: 0,
        statusCode: 0
      };
    }
  };

  // Check all websites
  const checkAllWebsites = async () => {
    setIsLoading(true);
    const results = await Promise.all(websites.map(checkWebsite));
    setWebsites(results);
    setIsLoading(false);
    
    setHistory(prev => [...prev.slice(-19), {
      timestamp: new Date().toLocaleTimeString(),
      'Web Islam': results[0].responseTime,
      'Produk Garage': results[1].responseTime,
      'Kanshi Craft': results[2].responseTime
    }]);
  };

  // Real-time visitor counter simulation
  useEffect(() => {
    const generateVisitors = () => {
      const newVisitorCounts = {
        'Web Islam': Math.floor(Math.random() * 80) + 20,
        'Produk Garage': Math.floor(Math.random() * 120) + 30,
        'Kanshi Craft': Math.floor(Math.random() * 60) + 10
      };
      
      setCurrentVisitors(newVisitorCounts);
      
      const total = Object.values(newVisitorCounts).reduce((a, b) => a + b, 0);
      setTotalVisitors(total);
      
      Object.entries(newVisitorCounts).forEach(([website, count]) => {
        const newVisitor: VisitorData = {
          count: count,
          timestamp: new Date().toLocaleTimeString(),
          website: website
        };
        setVisitors(prev => [...prev.slice(-29), newVisitor]);
      });
    };

    checkAllWebsites();
    
    const interval = setInterval(checkAllWebsites, 10000);
    const visitorInterval = setInterval(generateVisitors, 5000);
    
    return () => {
      clearInterval(interval);
      clearInterval(visitorInterval);
    };
  }, []);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'up': return 'bg-gradient-to-r from-green-500 to-emerald-500';
      case 'warning': return 'bg-gradient-to-r from-yellow-500 to-orange-500';
      default: return 'bg-gradient-to-r from-red-500 to-pink-500';
    }
  };

  const getStatusText = (status: string) => {
    switch(status) {
      case 'up': return '✓ UP';
      case 'warning': return '⚠ WARNING';
      default: return '✗ DOWN';
    }
  };

  const getPerformanceColor = (performance: number) => {
    if (performance > 70) return 'from-green-500 to-emerald-500';
    if (performance > 40) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-pink-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-8 animate-count">
          <div className="inline-block">
            <h1 className="text-5xl md:text-6xl font-bold mb-3 gradient-text">
              📊 Website Monitor
            </h1>
            <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto rounded-full"></div>
          </div>
          <p className="text-gray-300 mt-4 text-lg">Real-time monitoring dashboard for your websites</p>
          <div className="mt-3 flex justify-center gap-2 text-sm">
            <span className="px-3 py-1 bg-white/10 rounded-full backdrop-blur-sm">web-islam.vercel.app</span>
            <span className="px-3 py-1 bg-white/10 rounded-full backdrop-blur-sm">produk-garage.vercel.app</span>
            <span className="px-3 py-1 bg-white/10 rounded-full backdrop-blur-sm">kanshi-craft-merchandise.vercel.app</span>
          </div>
        </div>

        {/* Total Real-time Visitors */}
        <div className="relative mb-8 group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition duration-300"></div>
          <div className="relative glass-card p-6 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="text-5xl animate-float">👥</div>
                <div>
                  <h2 className="text-2xl font-semibold text-white">Total Real-time Visitors</h2>
                  <p className="text-purple-200">Active users across all websites</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-6xl font-bold text-white animate-pulse">
                  {totalVisitors}
                </div>
                <p className="text-purple-200">people online now</p>
              </div>
            </div>
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
          </div>
        </div>

        {/* Website Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {websites.map((site, idx) => (
            <div key={idx} className="group card-hover">
              <div className="glass-card p-6 rounded-2xl h-full relative overflow-hidden">
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-white">{site.name}</h3>
                    <p className="text-gray-400 text-xs mt-1 truncate max-w-[180px]">{site.url}</p>
                  </div>
                  <div className={`relative ${site.status === 'up' ? 'status-up' : ''}`}>
                    <span className={`px-4 py-1.5 rounded-full text-sm font-semibold text-white shadow-lg ${getStatusColor(site.status)}`}>
                      {getStatusText(site.status)}
                    </span>
                    {site.status === 'up' && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full pulse-dot"></div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-4">
                  {site.statusCode && site.statusCode > 0 && (
                    <div className="flex justify-between items-center p-2 bg-white/5 rounded-lg">
                      <p className="text-gray-300 text-sm">HTTP Status</p>
                      <p className={`font-mono font-bold text-lg ${
                        site.statusCode === 200 ? 'text-green-400' : 
                        site.statusCode < 500 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {site.statusCode}
                      </p>
                    </div>
                  )}
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <p className="text-gray-300 text-sm">Performance Score</p>
                      <p className="text-white font-bold">{site.performance}%</p>
                    </div>
                    <div className="relative h-3 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={`absolute top-0 left-0 h-full rounded-full bg-gradient-to-r ${getPerformanceColor(site.performance)} transition-all duration-1000`}
                        style={{ width: `${site.performance}%` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20 animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/5 rounded-lg p-3 text-center backdrop-blur-sm">
                      <p className="text-gray-400 text-xs mb-1">Response Time</p>
                      <p className="text-white font-bold text-xl">
                        {site.responseTime > 0 ? `${site.responseTime}ms` : 'N/A'}
                      </p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3 text-center backdrop-blur-sm">
                      <p className="text-gray-400 text-xs mb-1">Ping</p>
                      <p className="text-white font-bold text-xl">
                        {site.ping > 0 ? `${site.ping}ms` : 'N/A'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="border-t border-white/10 pt-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        <p className="text-gray-300 text-sm">Current Visitors</p>
                      </div>
                      <p className="text-blue-400 font-bold text-2xl">
                        {currentVisitors[site.name] || 0}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-gray-500 text-xs">Last checked: {site.lastChecked || 'Never'}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <div className="glass-card p-6 rounded-2xl">
            <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="text-2xl">📈</span>
                Response Time History (ms)
              </h3>
              <select 
                className="bg-white/10 text-white rounded-lg px-4 py-2 text-sm backdrop-blur-sm border border-white/20 focus:outline-none focus:border-blue-500 transition"
                value={selectedWebsite}
                onChange={(e) => setSelectedWebsite(e.target.value)}
              >
                <option value="all">All Websites</option>
                <option value="Web Islam">Web Islam</option>
                <option value="Produk Garage">Produk Garage</option>
                <option value="Kanshi Craft">Kanshi Craft</option>
              </select>
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={selectedWebsite === 'all' ? history : history.map(item => ({
                timestamp: item.timestamp,
                [selectedWebsite]: item[selectedWebsite]
              }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="timestamp" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(17, 25, 40, 0.95)', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '0.5rem',
                    backdropFilter: 'blur(10px)'
                  }}
                  labelStyle={{ color: '#F3F4F6' }}
                />
                {selectedWebsite === 'all' ? (
                  <>
                    <Line type="monotone" dataKey="Web Islam" name="Web Islam" stroke="#3B82F6" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="Produk Garage" name="Produk Garage" stroke="#10B981" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="Kanshi Craft" name="Kanshi Craft" stroke="#F59E0B" strokeWidth={2} dot={false} />
                  </>
                ) : (
                  <Line type="monotone" dataKey={selectedWebsite} name={selectedWebsite} stroke="#3B82F6" strokeWidth={3} dot={{ fill: '#3B82F6' }} />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="glass-card p-6 rounded-2xl">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-2xl">🕒</span>
              Recent Visitor Activity
            </h3>
            <div className="overflow-auto max-h-[320px] custom-scrollbar">
              <table className="w-full text-left">
                <thead className="text-gray-300 border-b border-white/10 sticky top-0 bg-slate-900/95 backdrop-blur-sm">
                  <tr>
                    <th className="pb-3">Time</th>
                    <th className="pb-3">Website</th>
                    <th className="pb-3 text-right">Visitors</th>
                  </tr>
                </thead>
                <tbody>
                  {visitors.slice().reverse().slice(0, 15).map((visitor, idx) => (
                    <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-all duration-200 cursor-pointer table-row-hover">
                      <td className="py-2 text-gray-300 text-sm">{visitor.timestamp}</td>
                      <td className="py-2">
                        <span className={`text-sm font-medium ${
                          visitor.website === 'Web Islam' ? 'text-blue-400' :
                          visitor.website === 'Produk Garage' ? 'text-green-400' : 'text-yellow-400'
                        }`}>
                          {visitor.website}
                        </span>
                      </td>
                      <td className="py-2 text-right">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300">
                          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
                          {visitor.count} online
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Status Summary & Logs */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="glass-card p-6 rounded-2xl">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-2xl">📊</span>
              Status Summary
            </h3>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="stat-card rounded-xl p-4 text-center">
                <div className="text-3xl mb-2">✅</div>
                <p className="text-green-400 text-3xl font-bold">
                  {websites.filter(w => w.status === 'up').length}
                </p>
                <p className="text-gray-400 text-sm mt-1">Websites UP</p>
              </div>
              <div className="stat-card rounded-xl p-4 text-center">
                <div className="text-3xl mb-2">⚠️</div>
                <p className="text-yellow-400 text-3xl font-bold">
                  {websites.filter(w => w.status === 'warning').length}
                </p>
                <p className="text-gray-400 text-sm mt-1">WARNING</p>
              </div>
              <div className="stat-card rounded-xl p-4 text-center">
                <div className="text-3xl mb-2">❌</div>
                <p className="text-red-400 text-3xl font-bold">
                  {websites.filter(w => w.status === 'down').length}
                </p>
                <p className="text-gray-400 text-sm mt-1">DOWN</p>
              </div>
            </div>
            
            <div className="pt-4 border-t border-white/10">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-gray-400 text-xs mb-1">Avg Response</p>
                  <p className="text-white font-bold text-xl">
                    {Math.round(websites.reduce((acc, w) => acc + w.responseTime, 0) / websites.length) || 0}ms
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-1">Avg Ping</p>
                  <p className="text-white font-bold text-xl">
                    {Math.round(websites.reduce((acc, w) => acc + w.ping, 0) / websites.length) || 0}ms
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-1">Avg Performance</p>
                  <p className="text-white font-bold text-xl">
                    {Math.round(websites.reduce((acc, w) => acc + w.performance, 0) / websites.length)}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-2xl">📝</span>
              Monitoring Logs
            </h3>
            <div className="overflow-auto max-h-[320px] space-y-2 custom-scrollbar">
              {logs.map((log, idx) => (
                <div key={idx} className="text-xs font-mono text-gray-300 bg-white/5 rounded-lg p-2 border border-white/10 hover:bg-white/10 transition">
                  {log}
                </div>
              ))}
              {logs.length === 0 && (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                  <p className="text-gray-400 mt-3">Waiting for monitoring data...</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-400 text-sm">
          <div className="glass-card inline-block px-6 py-3 rounded-full">
            <p>🔄 Auto-refresh every 10 seconds | Last update: {new Date().toLocaleString()}</p>
            <p className="text-xs mt-1 text-gray-500">Monitoring 3 websites with real-time performance tracking</p>
          </div>
        </div>
      </div>
    </div>
  );
}
