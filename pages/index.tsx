import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Area, ComposedChart, Bar 
} from 'recharts';
import CountUp from 'react-countup';

interface WebsiteStatus {
  name: string;
  url: string;
  status: 'up' | 'down' | 'warning';
  responseTime: number;
  ping: number;
  lastChecked: string;
  performance: number;
  statusCode?: number;
  color: string;
  icon: string;
}

interface Visitor {
  id: string;
  timestamp: number;
  page: string;
  country: string;
  browser: string;
  os: string;
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
      performance: 100,
      color: 'from-emerald-500 to-teal-500',
      icon: '🕌'
    },
    { 
      name: 'Produk Garage', 
      url: 'https://produk-garage.vercel.app', 
      status: 'up', 
      responseTime: 0, 
      ping: 0, 
      lastChecked: '', 
      performance: 100,
      color: 'from-blue-500 to-cyan-500',
      icon: '🏭'
    },
    { 
      name: 'Kanshi Craft', 
      url: 'https://kanshi-craft-merchandise.vercel.app', 
      status: 'up', 
      responseTime: 0, 
      ping: 0, 
      lastChecked: '', 
      performance: 100,
      color: 'from-purple-500 to-pink-500',
      icon: '🎨'
    },
  ]);
  
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [activeVisitors, setActiveVisitors] = useState(0);
  const [totalVisitors, setTotalVisitors] = useState(0);
  const [history, setHistory] = useState<any[]>([]);
  const [selectedWebsite, setSelectedWebsite] = useState<string>('all');
  const [logs, setLogs] = useState<string[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [visitorTrend, setVisitorTrend] = useState<'up' | 'down' | 'stable'>('stable');

  // Get visitor's browser and OS info
  useEffect(() => {
    const getVisitorInfo = async () => {
      const browser = navigator.userAgent;
      let browserName = 'Unknown';
      let osName = 'Unknown';
      
      if (browser.includes('Chrome')) browserName = 'Chrome';
      else if (browser.includes('Firefox')) browserName = 'Firefox';
      else if (browser.includes('Safari')) browserName = 'Safari';
      else if (browser.includes('Edge')) browserName = 'Edge';
      
      if (browser.includes('Windows')) osName = 'Windows';
      else if (browser.includes('Mac')) osName = 'macOS';
      else if (browser.includes('Linux')) osName = 'Linux';
      else if (browser.includes('Android')) osName = 'Android';
      else if (browser.includes('iOS')) osName = 'iOS';
      
      // Record visitor
      try {
        await axios.post('/api/visitors', {
          page: 'Dashboard',
          country: 'Indonesia', // You can use IP API for real country
          browser: browserName,
          os: osName,
        });
      } catch (error) {
        console.error('Failed to record visitor:', error);
      }
    };
    
    getVisitorInfo();
  }, []);

  // Fetch visitor stats periodically
  useEffect(() => {
    const fetchVisitorStats = async () => {
      try {
        const response = await axios.get('/api/visitors');
        setActiveVisitors(response.data.activeVisitors);
        setTotalVisitors(response.data.totalVisitors);
        setVisitors(response.data.recentVisitors || []);
        
        // Calculate trend
        if (response.data.recentVisitors?.length > 5) {
          const recent = response.data.recentVisitors.slice(0, 5);
          const older = response.data.recentVisitors.slice(5, 10);
          if (recent.length > older.length) setVisitorTrend('up');
          else if (recent.length < older.length) setVisitorTrend('down');
          else setVisitorTrend('stable');
        }
      } catch (error) {
        console.error('Failed to fetch visitors:', error);
      }
    };
    
    fetchVisitorStats();
    const interval = setInterval(fetchVisitorStats, 5000);
    return () => clearInterval(interval);
  }, []);

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
      return {
        ...website,
        status: 'down' as const,
        responseTime: 0,
        ping: Date.now() - startPing,
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
    
    setHistory(prev => [...prev.slice(-19), {
      timestamp: new Date().toLocaleTimeString(),
      'Web Islam': results[0].responseTime,
      'Produk Garage': results[1].responseTime,
      'Kanshi Craft': results[2].responseTime,
      avgPerformance: Math.round(results.reduce((acc, w) => acc + w.performance, 0) / 3),
    }]);
    
    // Add log
    const logMsg = `[${new Date().toLocaleTimeString()}] Check completed - ${results.filter(w => w.status === 'up').length}/3 UP`;
    setLogs(prev => [logMsg, ...prev.slice(0, 19)]);
  };

  // Update current time
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    checkAllWebsites();
    const interval = setInterval(checkAllWebsites, 10000);
    return () => {
      clearInterval(timer);
      clearInterval(interval);
    };
  }, []);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'up': return 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30';
      case 'warning': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      default: return 'text-red-400 bg-red-500/20 border-red-500/30';
    }
  };

  const getStatusText = (status: string) => {
    switch(status) {
      case 'up': return '✓ Online';
      case 'warning': return '⚠ Warning';
      default: return '✗ Offline';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-900">
      {/* Animated Background Particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse delay-2000"></div>
      </div>

      <div className="container mx-auto px-4 py-6 relative z-10">
        {/* Header with Live Time */}
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              🌐 Monitor Dashboard
            </h1>
            <p className="text-gray-400 mt-2">Real-time website performance monitoring</p>
          </div>
          <div className="glass-card px-6 py-3 rounded-2xl text-right">
            <p className="text-2xl font-bold text-white">{currentTime.toLocaleTimeString()}</p>
            <p className="text-xs text-gray-400">{currentTime.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>

        {/* Real Visitors Counter - REAL DATA */}
        <div className="relative mb-8 group">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 rounded-3xl blur-2xl opacity-75 group-hover:opacity-100 transition duration-500"></div>
          <div className="relative glass-card p-8 rounded-3xl overflow-hidden">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="text-7xl animate-bounce">👥</div>
                <div>
                  <p className="text-cyan-200 text-sm uppercase tracking-wider">REAL-TIME VISITORS</p>
                  <p className="text-gray-300 text-sm">People viewing this dashboard NOW</p>
                </div>
              </div>
              <div className="text-center">
                <div className="text-7xl md:text-8xl font-black text-white">
                  <CountUp end={activeVisitors} duration={1} />
                </div>
                <div className="flex items-center gap-2 justify-center mt-2">
                  <div className={`w-3 h-3 rounded-full animate-pulse ${activeVisitors > 0 ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                  <p className="text-gray-300">Active Now</p>
                  {visitorTrend === 'up' && <span className="text-green-400 text-sm">↑ Trending</span>}
                  {visitorTrend === 'down' && <span className="text-red-400 text-sm">↓ Decreasing</span>}
                </div>
              </div>
              <div className="text-center border-l border-white/10 pl-6">
                <p className="text-gray-400 text-sm">Total Today</p>
                <p className="text-4xl font-bold text-purple-400">
                  <CountUp end={totalVisitors} duration={1.5} />
                </p>
              </div>
            </div>
            
            {/* Decorative */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full blur-3xl opacity-30"></div>
          </div>
        </div>

        {/* Website Cards - Colorful Blocks */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {websites.map((site, idx) => (
            <div key={idx} className="group cursor-pointer">
              <div className={`relative rounded-2xl overflow-hidden transition-all duration-500 hover:scale-105 hover:shadow-2xl`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${site.color} opacity-20 group-hover:opacity-30 transition`}></div>
                <div className="relative glass-card p-6 rounded-2xl border border-white/20">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl">{site.icon}</span>
                      <div>
                        <h3 className="text-xl font-bold text-white">{site.name}</h3>
                        <p className="text-gray-400 text-xs">{site.url.split('//')[1]}</p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(site.status)}`}>
                      {getStatusText(site.status)}
                    </div>
                  </div>

                  {/* Performance Circle */}
                  <div className="flex justify-center my-6">
                    <div className="relative">
                      <svg className="w-32 h-32 transform -rotate-90">
                        <circle cx="64" cy="64" r="58" stroke="rgba(255,255,255,0.1)" strokeWidth="8" fill="none"/>
                        <circle 
                          cx="64" cy="64" r="58" 
                          stroke={site.performance > 70 ? '#10b981' : site.performance > 40 ? '#f59e0b' : '#ef4444'}
                          strokeWidth="8" 
                          fill="none"
                          strokeDasharray={`${(site.performance / 100) * 364} 364`}
                          className="transition-all duration-1000"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold text-white">{site.performance}%</span>
                        <span className="text-xs text-gray-400">Performance</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="bg-white/5 rounded-xl p-3 text-center">
                      <p className="text-gray-400 text-xs">Response</p>
                      <p className="text-white font-bold text-lg">{site.responseTime || 'N/A'}ms</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3 text-center">
                      <p className="text-gray-400 text-xs">Ping</p>
                      <p className="text-white font-bold text-lg">{site.ping || 'N/A'}ms</p>
                    </div>
                  </div>
                  
                  {site.statusCode && site.statusCode > 0 && (
                    <div className="mt-3 text-center">
                      <span className={`text-xs px-2 py-1 rounded ${site.statusCode === 200 ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                        HTTP {site.statusCode}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts & Analytics */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Performance Chart */}
          <div className="glass-card p-6 rounded-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="text-2xl">📈</span>
                Response Time Trend (ms)
              </h3>
              <select 
                className="bg-white/10 text-white rounded-lg px-3 py-1.5 text-sm border border-white/20 focus:border-cyan-500"
                value={selectedWebsite}
                onChange={(e) => setSelectedWebsite(e.target.value)}
              >
                <option value="all">All Websites</option>
                <option value="Web Islam">🕌 Web Islam</option>
                <option value="Produk Garage">🏭 Produk Garage</option>
                <option value="Kanshi Craft">🎨 Kanshi Craft</option>
              </select>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={history}>
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="timestamp" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0,0,0,0.9)', 
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '12px'
                  }}
                />
                {selectedWebsite === 'all' ? (
                  <>
                    <Area type="monotone" dataKey="avgPerformance" name="Avg Performance" stroke="#8b5cf6" fill="url(#colorGradient)" />
                    <Line type="monotone" dataKey="Web Islam" name="Web Islam" stroke="#10b981" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="Produk Garage" name="Produk Garage" stroke="#3b82f6" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="Kanshi Craft" name="Kanshi Craft" stroke="#f59e0b" strokeWidth={2} dot={false} />
                  </>
                ) : (
                  <Area type="monotone" dataKey={selectedWebsite} name={selectedWebsite} stroke="#8b5cf6" fill="url(#colorGradient)" />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Real Visitors List */}
          <div className="glass-card p-6 rounded-2xl">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-2xl">🟢</span>
              Live Visitor Activity
            </h3>
            <div className="overflow-auto max-h-[300px] space-y-2">
              {visitors.slice(0, 10).map((visitor, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-xl hover:bg-white/10 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <div>
                      <p className="text-white text-sm font-medium">Visitor #{visitors.length - idx}</p>
                      <p className="text-gray-400 text-xs">{new Date(visitor.timestamp).toLocaleTimeString()}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-xs px-2 py-1 bg-cyan-500/20 rounded text-cyan-300">{visitor.browser}</span>
                    <span className="text-xs px-2 py-1 bg-purple-500/20 rounded text-purple-300">{visitor.os}</span>
                  </div>
                </div>
              ))}
              {visitors.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <p>Waiting for visitors...</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status Overview & Logs */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="glass-card p-6 rounded-2xl">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-2xl">📊</span>
              System Status
            </h3>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 rounded-xl p-4 text-center border border-emerald-500/20">
                <div className="text-3xl mb-2">✅</div>
                <p className="text-emerald-400 text-3xl font-bold">{websites.filter(w => w.status === 'up').length}</p>
                <p className="text-gray-400 text-xs">Online</p>
              </div>
              <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 rounded-xl p-4 text-center border border-yellow-500/20">
                <div className="text-3xl mb-2">⚠️</div>
                <p className="text-yellow-400 text-3xl font-bold">{websites.filter(w => w.status === 'warning').length}</p>
                <p className="text-gray-400 text-xs">Warning</p>
              </div>
              <div className="bg-gradient-to-br from-red-500/20 to-red-600/10 rounded-xl p-4 text-center border border-red-500/20">
                <div className="text-3xl mb-2">❌</div>
                <p className="text-red-400 text-3xl font-bold">{websites.filter(w => w.status === 'down').length}</p>
                <p className="text-gray-400 text-xs">Offline</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center pt-4 border-t border-white/10">
              <div>
                <p className="text-gray-400 text-xs">Avg Response</p>
                <p className="text-cyan-400 font-bold">{Math.round(websites.reduce((a, w) => a + w.responseTime, 0) / websites.length)}ms</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Avg Ping</p>
                <p className="text-purple-400 font-bold">{Math.round(websites.reduce((a, w) => a + w.ping, 0) / websites.length)}ms</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Uptime Rate</p>
                <p className="text-pink-400 font-bold">{Math.round(websites.filter(w => w.status === 'up').length / 3 * 100)}%</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-2xl">📝</span>
              Monitor Logs
            </h3>
            <div className="space-y-1 max-h-[280px] overflow-auto">
              {logs.map((log, idx) => (
                <div key={idx} className="text-xs font-mono text-gray-300 p-2 bg-white/5 rounded border border-white/10 hover:bg-white/10 transition">
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Stats */}
        <div className="mt-8 flex justify-between items-center text-gray-400 text-xs flex-wrap gap-2">
          <div className="glass-card px-4 py-2 rounded-full">
            <span>🔄 Auto-refresh: 10s</span>
          </div>
          <div className="glass-card px-4 py-2 rounded-full">
            <span>📡 Monitoring 3 websites</span>
          </div>
          <div className="glass-card px-4 py-2 rounded-full">
            <span>👥 Real visitors counter enabled</span>
          </div>
        </div>
      </div>
    </div>
  );
}
