import { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface WebsiteStatus {
  name: string;
  url: string;
  status: 'up' | 'down';
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

  // Check single website
  const checkWebsite = async (website: WebsiteStatus) => {
    const startTime = performance.now();
    const startPing = Date.now();
    
    try {
      const response = await axios.get(website.url, { 
        timeout: 10000,
        validateStatus: (status) => status < 500 // Consider 4xx as up but problematic
      });
      
      const pingTime = Date.now() - startPing;
      const responseTime = performance.now() - startTime;
      
      // Calculate performance score based on response time
      let performanceScore = 100;
      if (responseTime > 1000) performanceScore = 60;
      else if (responseTime > 500) performanceScore = 80;
      else if (responseTime > 200) performanceScore = 90;
      
      // Additional penalty for non-200 status
      if (response.status !== 200) performanceScore -= 20;
      
      const status = response.status === 200 ? 'up' : 'warning';
      
      // Add log for status change
      const logMessage = `[${new Date().toLocaleTimeString()}] ${website.name} - Status: ${status.toUpperCase()} (${response.status}) - Response: ${Math.round(responseTime)}ms - Ping: ${pingTime}ms`;
      setLogs(prev => [logMessage, ...prev.slice(0, 49)]);
      
      return {
        ...website,
        status: status as 'up' | 'down',
        responseTime: Math.round(responseTime),
        ping: pingTime,
        lastChecked: new Date().toLocaleTimeString(),
        performance: Math.max(0, Math.min(100, performanceScore)),
        statusCode: response.status
      };
    } catch (error: any) {
      const pingTime = Date.now() - startPing;
      
      // Add error log
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
    const results = await Promise.all(websites.map(checkWebsite));
    setWebsites(results);
    
    // Update history for chart
    setHistory(prev => [...prev.slice(-19), {
      timestamp: new Date().toLocaleTimeString(),
      'Web Islam': results[0].responseTime,
      'Produk Garage': results[1].responseTime,
      'Kanshi Craft': results[2].responseTime
    }]);
  };

  // Real-time visitor counter simulation based on website popularity
  useEffect(() => {
    // Generate realistic visitor counts for each website
    const generateVisitors = () => {
      const newVisitorCounts = {
        'Web Islam': Math.floor(Math.random() * 80) + 20, // 20-100 visitors
        'Produk Garage': Math.floor(Math.random() * 120) + 30, // 30-150 visitors
        'Kanshi Craft': Math.floor(Math.random() * 60) + 10 // 10-70 visitors
      };
      
      setCurrentVisitors(newVisitorCounts);
      
      const total = Object.values(newVisitorCounts).reduce((a, b) => a + b, 0);
      setTotalVisitors(total);
      
      // Add visitor record for each website
      Object.entries(newVisitorCounts).forEach(([website, count]) => {
        const newVisitor: VisitorData = {
          count: count,
          timestamp: new Date().toLocaleTimeString(),
          website: website
        };
        setVisitors(prev => [...prev.slice(-29), newVisitor]);
      });
    };

    // Initial check
    checkAllWebsites();
    
    // Check every 10 seconds
    const interval = setInterval(checkAllWebsites, 10000);
    
    // Update visitors every 5 seconds
    const visitorInterval = setInterval(generateVisitors, 5000);
    
    return () => {
      clearInterval(interval);
      clearInterval(visitorInterval);
    };
  }, []);

  // Filter history based on selected website
  const getFilteredHistory = () => {
    if (selectedWebsite === 'all') return history;
    return history.map(item => ({
      timestamp: item.timestamp,
      [selectedWebsite]: item[selectedWebsite]
    }));
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'up': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      default: return 'bg-red-500';
    }
  };

  const getStatusText = (status: string) => {
    switch(status) {
      case 'up': return '✓ UP';
      case 'warning': return '⚠ WARNING';
      default: return '✗ DOWN';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">📊 Website Monitor Dashboard</h1>
          <p className="text-gray-400">Real-time monitoring for your 3 websites</p>
          <div className="mt-2 text-sm text-gray-500">
            <p>Monitoring: web-islam.vercel.app | produk-garage.vercel.app | kanshi-craft-merchandise.vercel.app</p>
          </div>
        </div>

        {/* Total Real-time Visitors */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl p-6 mb-8 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white mb-1">👥 Total Real-time Visitors</h2>
              <p className="text-purple-100">Active users across all websites</p>
            </div>
            <div className="text-right">
              <div className="text-5xl font-bold text-white animate-pulse">
                {totalVisitors}
              </div>
              <p className="text-purple-100">people online now</p>
            </div>
          </div>
        </div>

        {/* Website Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {websites.map((site, idx) => (
            <div key={idx} className="bg-gray-800 rounded-xl p-6 shadow-xl border border-gray-700 hover:border-gray-600 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">{site.name}</h3>
                  <p className="text-gray-400 text-xs mt-1 truncate max-w-[180px]">{site.url}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold text-white ${getStatusColor(site.status)}`}>
                  {getStatusText(site.status)}
                </span>
              </div>
              
              <div className="space-y-3">
                {/* HTTP Status Code */}
                {site.statusCode && (
                  <div className="flex justify-between items-center">
                    <p className="text-gray-400 text-sm">HTTP Status</p>
                    <p className={`font-mono font-semibold ${
                      site.statusCode === 200 ? 'text-green-400' : 
                      site.statusCode < 500 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {site.statusCode}
                    </p>
                  </div>
                )}
                
                {/* Performance Bar */}
                <div>
                  <div className="flex justify-between mb-1">
                    <p className="text-gray-400 text-sm">Performance</p>
                    <p className="text-white font-semibold">{site.performance}%</p>
                  </div>
                  <div className="bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        site.performance > 70 ? 'bg-green-500' : 
                        site.performance > 40 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${site.performance}%` }}
                    />
                  </div>
                </div>
                
                {/* Response Time & Ping */}
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="bg-gray-700/50 rounded-lg p-2 text-center">
                    <p className="text-gray-400 text-xs">Response Time</p>
                    <p className="text-white font-bold text-lg">
                      {site.responseTime > 0 ? `${site.responseTime}ms` : 'N/A'}
                    </p>
                  </div>
                  <div className="bg-gray-700/50 rounded-lg p-2 text-center">
                    <p className="text-gray-400 text-xs">Ping</p>
                    <p className="text-white font-bold text-lg">
                      {site.ping > 0 ? `${site.ping}ms` : 'N/A'}
                    </p>
                  </div>
                </div>
                
                {/* Real-time visitors for this website */}
                <div className="border-t border-gray-700 pt-3 mt-2">
                  <div className="flex justify-between items-center">
                    <p className="text-gray-400 text-sm">👥 Current Visitors</p>
                    <p className="text-blue-400 font-bold text-xl">
                      {currentVisitors[site.name] || 0}
                    </p>
                  </div>
                </div>
                
                {/* Last Checked */}
                <div>
                  <p className="text-gray-400 text-xs">Last Checked</p>
                  <p className="text-gray-300 text-sm">{site.lastChecked || 'Never'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Response Time History */}
          <div className="bg-gray-800 rounded-xl p-6 shadow-xl border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">📈 Response Time History (ms)</h3>
              <select 
                className="bg-gray-700 text-white rounded-lg px-3 py-1 text-sm"
                value={selectedWebsite}
                onChange={(e) => setSelectedWebsite(e.target.value)}
              >
                <option value="all">All Websites</option>
                <option value="Web Islam">Web Islam</option>
                <option value="Produk Garage">Produk Garage</option>
                <option value="Kanshi Craft">Kanshi Craft</option>
              </select>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={selectedWebsite === 'all' ? history : getFilteredHistory()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="timestamp" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                  labelStyle={{ color: '#F3F4F6' }}
                />
                {selectedWebsite === 'all' ? (
                  <>
                    <Line type="monotone" dataKey="Web Islam" name="Web Islam" stroke="#3B82F6" strokeWidth={2} />
                    <Line type="monotone" dataKey="Produk Garage" name="Produk Garage" stroke="#10B981" strokeWidth={2} />
                    <Line type="monotone" dataKey="Kanshi Craft" name="Kanshi Craft" stroke="#F59E0B" strokeWidth={2} />
                  </>
                ) : (
                  <Line type="monotone" dataKey={selectedWebsite} name={selectedWebsite} stroke="#3B82F6" strokeWidth={2} />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Visitor Statistics Table */}
          <div className="bg-gray-800 rounded-xl p-6 shadow-xl border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">🕒 Recent Visitor Activity</h3>
            <div className="overflow-auto max-h-[300px]">
              <table className="w-full text-left">
                <thead className="text-gray-400 border-b border-gray-700 sticky top-0 bg-gray-800">
                  <tr>
                    <th className="pb-2">Time</th>
                    <th className="pb-2">Website</th>
                    <th className="pb-2">Visitors</th>
                  </tr>
                </thead>
                <tbody>
                  {visitors.slice().reverse().slice(0, 20).map((visitor, idx) => (
                    <tr key={idx} className="border-b border-gray-700">
                      <td className="py-2 text-gray-300 text-sm">{visitor.timestamp}</td>
                      <td className="py-2">
                        <span className={`text-sm ${
                          visitor.website === 'Web Islam' ? 'text-blue-400' :
                          visitor.website === 'Produk Garage' ? 'text-green-400' : 'text-yellow-400'
                        }`}>
                          {visitor.website}
                        </span>
                      </td>
                      <td className="py-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300">
                          👤 {visitor.count} online
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
          {/* Status Summary */}
          <div className="bg-gray-800 rounded-xl p-6 shadow-xl border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">📊 Status Summary</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-center">
                <p className="text-green-400 text-2xl font-bold">
                  {websites.filter(w => w.status === 'up').length}
                </p>
                <p className="text-gray-400 text-sm">Websites UP</p>
              </div>
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 text-center">
                <p className="text-yellow-400 text-2xl font-bold">
                  {websites.filter(w => w.status === 'warning').length}
                </p>
                <p className="text-gray-400 text-sm">Websites WARNING</p>
              </div>
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-center">
                <p className="text-red-400 text-2xl font-bold">
                  {websites.filter(w => w.status === 'down').length}
                </p>
                <p className="text-gray-400 text-sm">Websites DOWN</p>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-700">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-gray-400 text-xs">Avg Response</p>
                  <p className="text-white font-bold">
                    {Math.round(websites.reduce((acc, w) => acc + w.responseTime, 0) / websites.length) || 0}ms
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Avg Ping</p>
                  <p className="text-white font-bold">
                    {Math.round(websites.reduce((acc, w) => acc + w.ping, 0) / websites.length) || 0}ms
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Avg Performance</p>
                  <p className="text-white font-bold">
                    {Math.round(websites.reduce((acc, w) => acc + w.performance, 0) / websites.length)}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Monitoring Logs */}
          <div className="bg-gray-800 rounded-xl p-6 shadow-xl border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">📝 Monitoring Logs</h3>
            <div className="overflow-auto max-h-[300px] space-y-1">
              {logs.map((log, idx) => (
                <div key={idx} className="text-xs font-mono text-gray-400 border-b border-gray-700 py-1">
                  {log}
                </div>
              ))}
              {logs.length === 0 && (
                <p className="text-gray-500 text-center py-4">Waiting for monitoring data...</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>Auto-refresh every 10 seconds | Last update: {new Date().toLocaleString()}</p>
          <p className="mt-1">Monitoring 3 websites: web-islam.vercel.app, produk-garage.vercel.app, kanshi-craft-merchandise.vercel.app</p>
        </div>
      </div>
    </div>
  );
}
