import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import Dashboard from './components/Dashboard';
import SiteGrid from './components/SiteGrid';
import OptimizationChart from './components/OptimizationChart';
import DemandResponseControl from './components/DemandResponseControl';
import { Zap, TrendingUp, Activity, Wifi, WifiOff, AlertCircle } from 'lucide-react';

// Dynamic backend URL construction for webcontainer environment
const getBackendUrl = () => {
  const hostname = window.location.hostname;
  
  // Check if we're in a webcontainer environment
  if (hostname.includes('webcontainer')) {
    // Replace the frontend port (5173) with backend port (5000) in the hostname
    // Use https:// to match the frontend protocol and avoid mixed content errors
    const backendHostname = hostname.replace(/--5173--/, '--5000--');
    return `https://${backendHostname}`;
  }
  
  // Fallback to localhost for local development
  return 'http://localhost:5000';
};

const backendUrl = getBackendUrl();

// Improved socket configuration with dynamic URL
const socket = io(backendUrl, {
  transports: ['websocket', 'polling'],
  timeout: 20000,
  forceNew: false,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 10,
  maxReconnectionAttempts: 10
});

interface SiteData {
  name: string;
  location: string;
  capacity_mw: number;
  current_operation: string;
  current_profit: number;
  profits: {
    bitcoin: { profit: number; revenue: number; cost: number; description: string; flexibility: string; risk: string };
    ai: { profit: number; revenue: number; cost: number; description: string; flexibility: string; risk: string };
    demand_response: { profit: number; revenue: number; cost: number; description: string; flexibility: string; risk: string };
  };
  power_allocation: {
    ai: number;
    bitcoin: number;
    idle: number;
  };
  efficiency: number;
  last_updated: string;
  dr_commitment_percent: number;
  dr_annual_payment: number;
  dr_status: string;
  dr_events_this_year: number;
  ai_demand_level: number;
}

interface MarketData {
  timestamp: string;
  btc_price: number;
  energy_prices: { [key: string]: number };
  ai_rental_rate: number;
  ai_demand_level: number;
}

function App() {
  const [sites, setSites] = useState<{ [key: string]: SiteData }>({});
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [optimizationData, setOptimizationData] = useState<any>(null);
  const [totalProfit, setTotalProfit] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [connectionError, setConnectionError] = useState<string>('');
  const [backendStatus, setBackendStatus] = useState<'checking' | 'running' | 'error'>('checking');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [activeDREvent, setActiveDREvent] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'control'>('dashboard');

  // Check if backend is running via HTTP
  const checkBackendStatus = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/dashboard`);
      if (response.ok) {
        setBackendStatus('running');
        const data = await response.json();
        // Use HTTP data as fallback
        setTotalProfit(data.total_profit_per_hour || 0);
        if (data.market_data) setMarketData(data.market_data);
        if (data.sites_summary) setSites(data.sites_summary);
        if (data.demand_response?.active_event) setActiveDREvent(data.demand_response.active_event);
        setLastUpdate(new Date());
        return true;
      }
    } catch (error) {
      console.log('Backend not responding via HTTP:', error);
      setBackendStatus('error');
      return false;
    }
    return false;
  };

  // Manual DR event triggers
  const handleTriggerDR = (eventData: any) => {
    // Send to backend
    fetch(`${backendUrl}/api/trigger-dr`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData)
    }).then(() => {
      setActiveDREvent(eventData);
      // Force refresh data
      checkBackendStatus();
    }).catch(console.error);
  };

  const handleEndDR = () => {
    fetch(`${backendUrl}/api/end-dr`, {
      method: 'POST'
    }).then(() => {
      setActiveDREvent(null);
      // Force refresh data
      checkBackendStatus();
    }).catch(console.error);
  };

  useEffect(() => {
    // Check backend status first
    checkBackendStatus();

    socket.on('connect', () => {
      console.log('✅ Connected to backend via WebSocket');
      setIsConnected(true);
      setConnectionAttempts(0);
      setConnectionError('');
      setBackendStatus('running');
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ Disconnected from backend:', reason);
      setIsConnected(false);
      if (reason !== 'io client disconnect') {
        setConnectionAttempts(prev => prev + 1);
        setConnectionError(`Disconnected: ${reason}`);
      }
    });

    socket.on('connect_error', (error) => {
      console.log('🔥 Connection error:', error.message);
      setConnectionAttempts(prev => prev + 1);
      setConnectionError(`Connection failed: ${error.message}`);
      setBackendStatus('error');
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log('🔄 Reconnected after', attemptNumber, 'attempts');
      setConnectionAttempts(0);
      setConnectionError('');
    });

    socket.on('sites_update', (data) => {
      console.log('📊 Sites data received:', Object.keys(data).length, 'sites');
      setSites(data);
      const profit = Object.values(data).reduce((sum: number, site: any) => sum + site.current_profit, 0);
      setTotalProfit(profit);
      setLastUpdate(new Date());
    });

    socket.on('market_update', (data) => {
      console.log('💰 Market data received - BTC:', data.btc_price?.toFixed(0), 'AI Demand:', (data.ai_demand_level * 100).toFixed(0) + '%');
      setMarketData(data);
      setLastUpdate(new Date());
    });

    socket.on('optimization_update', (data) => {
      console.log('📈 Optimization data received');
      setOptimizationData(data);
      if (data.active_dr_event) {
        setActiveDREvent(data.active_dr_event);
      } else if (activeDREvent && !data.active_dr_event) {
        setActiveDREvent(null);
      }
      setLastUpdate(new Date());
    });

    // Send periodic ping to keep connection alive
    const pingInterval = setInterval(() => {
      if (socket.connected) {
        socket.emit('ping');
      }
    }, 30000);

    // Retry connection and check backend status every 10 seconds
    const retryInterval = setInterval(async () => {
      if (!isConnected) {
        console.log('🔄 Checking backend status...');
        const backendRunning = await checkBackendStatus();
        if (backendRunning && !socket.connected) {
          console.log('🔄 Attempting to reconnect WebSocket...');
          socket.connect();
        }
      }
    }, 10000);

    // Initial connection attempt
    if (!socket.connected) {
      socket.connect();
    }

    return () => {
      clearInterval(pingInterval);
      clearInterval(retryInterval);
      socket.disconnect();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header */}
      <header className="relative bg-gray-800/80 backdrop-blur-xl border-b border-gray-700/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <Zap className="h-8 w-8 text-orange-500" />
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Smart Energy Arbitrage
                </h1>
                <p className="text-xs text-gray-400">AI-Powered Power Allocation</p>
              </div>
            </div>
            
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              isConnected 
                ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                : backendStatus === 'running'
                ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                : 'bg-red-500/20 text-red-300 border border-red-500/30 animate-pulse'
            }`}>
              {isConnected ? (
                <>
                  <Wifi className="w-4 h-4" />
                  <span>Live</span>
                </>
              ) : backendStatus === 'running' ? (
                <>
                  <AlertCircle className="w-4 h-4" />
                  <span>HTTP</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4" />
                  <span>Connecting...</span>
                </>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-8">
            <div className="text-right">
              <div className="text-sm text-gray-400">Total Revenue</div>
              <div className="text-2xl font-bold text-green-400 tabular-nums">
                ${totalProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/h
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center space-x-1 mt-4">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
              activeTab === 'dashboard'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/30'
            }`}
          >
            Live Demo
          </button>
          <button
            onClick={() => setActiveTab('control')}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
              activeTab === 'control'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/30'
            }`}
          >
            Demand Response Test
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative p-6 space-y-8">
        {/* Connection Status */}
        {!isConnected && (
          <div className={`border rounded-lg p-4 text-center ${
            backendStatus === 'running' 
              ? 'bg-yellow-500/10 border-yellow-500/30' 
              : 'bg-red-500/10 border-red-500/30'
          }`}>
            {backendStatus === 'running' ? (
              <p className="text-yellow-300">
                Backend running - WebSocket reconnecting...
              </p>
            ) : (
              <div>
                <p className="text-red-300">
                  Starting optimization engine...
                </p>
                <p className="text-xs text-red-400 mt-1">
                  Run: <code>npm run server</code>
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'dashboard' ? (
          <>
            <Dashboard 
              totalProfit={totalProfit}
              sitesCount={Object.keys(sites).length}
              marketData={marketData}
            />
            <SiteGrid sites={sites} />
            {optimizationData && (
              <OptimizationChart 
                data={optimizationData.history || []}
                currentProfit={optimizationData.current_total_profit || 0}
              />
            )}
          </>
        ) : (
          <DemandResponseControl
            sites={sites}
            onTriggerDR={handleTriggerDR}
            onEndDR={handleEndDR}
            activeDREvent={activeDREvent}
          />
        )}
      </main>
    </div>
  );
}

export default App;