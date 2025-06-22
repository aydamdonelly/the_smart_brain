import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ['websocket', 'polling']
});

app.use(cors());
app.use(express.json());

// Global state
let sitesData = {};
let marketData = {};
let optimizationHistory = [];
let connectedClients = new Set();
let demandResponseEvents = [];

// Manual DR control
let activeDREvent = null;
let drEventsThisYear = 0;
const maxDREventsPerYear = 25;

// Site configurations - Only 2 sites: Finland and Texas
const SITES = {
  'finland-1': {
    name: 'Nordic Data Center',
    location: 'Finland',
    capacity_mw: 200,
    dr_commitment_percent: 70, // Can shut down 70% when called
    dr_annual_payment: 2100000, // $15/MW/year * 200MW * 70% commitment
    ramp_times: { ai: 5, bitcoin: 1, demand_response: 0 }
  },
  'texas-1': {
    name: 'Texas Energy Hub',
    location: 'Texas, USA',
    capacity_mw: 150,
    dr_commitment_percent: 60, // Can shut down 60% when called
    dr_annual_payment: 1350000, // $15/MW/year * 150MW * 60% commitment
    ramp_times: { ai: 5, bitcoin: 1, demand_response: 0 }
  }
};

function generateMarketData() {
  // Realistic Bitcoin price around $110,000 with volatility
  const btcBase = 110000 + (Math.random() - 0.5) * 8000; // ±$4k volatility
  
  // Realistic energy prices (4-8 cents/kWh)
  const energyPrices = {
    'finland-1': 0.04 + (Math.random() - 0.5) * 0.015, // 3.25-4.75 cents (cheap Nordic hydro)
    'texas-1': 0.06 + (Math.random() - 0.5) * 0.02,   // 5-7 cents (Texas grid)
  };
  
  // AI inference demand (fluctuates based on customer demand)
  const aiDemandMultiplier = 0.7 + Math.random() * 0.6; // 70-130% demand
  const baseAiRate = 2.2; // Base rate per GPU/hour
  const aiRentalRate = baseAiRate * aiDemandMultiplier;
  
  marketData = {
    timestamp: new Date().toISOString(),
    btc_price: btcBase,
    energy_prices: energyPrices,
    ai_rental_rate: aiRentalRate,
    ai_demand_level: aiDemandMultiplier,
    network_difficulty: 72000000000000 + (Math.random() - 0.5) * 2000000000000
  };
}

function calculateProfits(siteId, siteConfig) {
  const energyPrice = marketData.energy_prices[siteId];
  const capacity = siteConfig.capacity_mw;
  const pue = 1.15; // Power Usage Effectiveness
  
  // Bitcoin Mining Profitability (baseline - always available)
  // Assume ~3.5 BTC per day per 100MW at current difficulty
  const btcPerMwPerDay = 0.035;
  const btcRevenuePerMwHour = (btcPerMwPerDay * marketData.btc_price) / 24;
  const btcEnergyCost = energyPrice * pue; // $/MWh
  const btcProfit = (btcRevenuePerMwHour - btcEnergyCost) * capacity;
  
  // AI Inference Profitability (higher revenue but customer dependent)
  // Assume 800 GPUs per 100MW capacity
  const gpusPerMW = 8;
  const totalGPUs = capacity * gpusPerMW;
  const aiRevenue = totalGPUs * marketData.ai_rental_rate * marketData.ai_demand_level;
  const aiEnergyCost = capacity * 0.85 * energyPrice * pue; // AI uses ~85% of capacity
  const aiProfit = aiRevenue - aiEnergyCost;
  
  // Demand Response - Annual payment divided by hours in year
  const drAnnualHourlyRate = siteConfig.dr_annual_payment / (365 * 24);
  const drProfit = drAnnualHourlyRate; // Always earning this base rate
  
  return {
    bitcoin: { 
      profit: btcProfit, 
      revenue: btcRevenuePerMwHour * capacity, 
      cost: btcEnergyCost * capacity,
      description: 'Always Available • Safe Baseline',
      flexibility: 'Instant',
      risk: 'Low'
    },
    ai: { 
      profit: aiProfit, 
      revenue: aiRevenue, 
      cost: aiEnergyCost,
      description: 'Customer Dependent • Higher Revenue',
      flexibility: '5 minutes',
      risk: 'Medium'
    },
    demand_response: { 
      profit: drProfit, 
      revenue: drAnnualHourlyRate, 
      cost: 0,
      description: `Grid Stability • ${siteConfig.dr_commitment_percent}% Committed`,
      flexibility: 'Instant',
      risk: 'None'
    }
  };
}

function optimizeSites() {
  generateMarketData();
  
  let totalProfit = 0;
  
  for (const [siteId, siteConfig] of Object.entries(SITES)) {
    const profits = calculateProfits(siteId, siteConfig);
    
    // During DR event, must shut down committed capacity BUT keep AI running if possible
    let bestOperation;
    let actualProfit;
    let powerAllocation = {
      ai: 0,
      bitcoin: 0,
      idle: 0
    };
    
    if (activeDREvent && activeDREvent.affected_sites.includes(siteId)) {
      // During DR event - CRITICAL: Keep AI running (customer obligations)
      bestOperation = 'demand_response';
      const reducedCapacity = siteConfig.capacity_mw * (siteConfig.dr_commitment_percent / 100);
      const availableCapacity = siteConfig.capacity_mw - reducedCapacity;
      
      // PRIORITY 1: Keep AI running (we're obligated to customers)
      if (marketData.ai_demand_level > 0.3) {
        powerAllocation.ai = Math.min(availableCapacity, siteConfig.capacity_mw * 0.6); // Try to keep AI
        powerAllocation.bitcoin = Math.max(0, availableCapacity - powerAllocation.ai);
      } else {
        // If AI demand is very low, we can safely reduce it
        powerAllocation.bitcoin = availableCapacity;
        powerAllocation.ai = 0;
      }
      
      // Calculate profit during DR event
      actualProfit = profits.demand_response.profit + 
                    (profits.ai.profit / siteConfig.capacity_mw) * powerAllocation.ai +
                    (profits.bitcoin.profit / siteConfig.capacity_mw) * powerAllocation.bitcoin;
      
    } else {
      // Normal operation - optimize power allocation
      if (profits.ai.profit > profits.bitcoin.profit && marketData.ai_demand_level > 0.6) {
        // High AI demand - allocate more to AI
        const aiAllocation = Math.min(0.8, marketData.ai_demand_level);
        powerAllocation.ai = siteConfig.capacity_mw * aiAllocation;
        powerAllocation.bitcoin = siteConfig.capacity_mw * (1 - aiAllocation);
        bestOperation = 'ai';
      } else {
        // Low AI demand - focus on Bitcoin
        powerAllocation.bitcoin = siteConfig.capacity_mw * 0.9;
        powerAllocation.ai = siteConfig.capacity_mw * 0.1;
        bestOperation = 'bitcoin';
      }
      
      actualProfit = (profits.ai.profit / siteConfig.capacity_mw) * powerAllocation.ai +
                    (profits.bitcoin.profit / siteConfig.capacity_mw) * powerAllocation.bitcoin +
                    profits.demand_response.profit;
    }
    
    sitesData[siteId] = {
      ...siteConfig,
      current_operation: bestOperation,
      current_profit: actualProfit,
      profits: profits,
      power_allocation: powerAllocation,
      last_updated: new Date().toISOString(),
      efficiency: Math.min(100, Math.max(85, 92 + (Math.random() - 0.5) * 10)),
      dr_status: activeDREvent ? 'ACTIVE_EVENT' : 'STANDBY',
      dr_events_this_year: drEventsThisYear,
      ai_demand_level: marketData.ai_demand_level
    };
    
    totalProfit += actualProfit;
  }
  
  // Store optimization history
  optimizationHistory.push({
    timestamp: new Date().toISOString(),
    total_profit: totalProfit,
    sites: { ...sitesData },
    active_dr_event: activeDREvent,
    dr_events_this_year: drEventsThisYear,
    market_conditions: {
      btc_price: marketData.btc_price,
      ai_demand: marketData.ai_demand_level,
      avg_energy_price: Object.values(marketData.energy_prices).reduce((a,b) => a+b, 0) / 2
    }
  });
  
  // Keep only last 100 entries
  if (optimizationHistory.length > 100) {
    optimizationHistory.shift();
  }
  
  // Only log every 5th optimization to reduce noise
  if (optimizationHistory.length % 5 === 0) {
    const drStatus = activeDREvent ? ` [DR EVENT: ${activeDREvent.reason}]` : '';
    console.log(`📊 Optimization #${optimizationHistory.length} - Revenue: $${totalProfit.toFixed(2)}/h${drStatus}`);
  }
}

// Root route - Backend status page
app.get('/', (req, res) => {
  const totalProfit = Object.values(sitesData).reduce((sum, site) => sum + site.current_profit, 0);
  
  res.json({
    status: 'Smart Energy Arbitrage Backend Running',
    timestamp: new Date().toISOString(),
    version: '3.1.0',
    endpoints: {
      dashboard: '/api/dashboard',
      sites: '/api/sites',
      market: '/api/market',
      history: '/api/history',
      demand_response: '/api/demand-response',
      trigger_dr: '/api/trigger-dr',
      end_dr: '/api/end-dr'
    },
    current_stats: {
      total_profit_per_hour: totalProfit,
      active_sites: Object.keys(sitesData).length,
      connected_clients: connectedClients.size,
      btc_price: marketData.btc_price,
      ai_demand_level: marketData.ai_demand_level,
      active_dr_event: activeDREvent ? true : false,
      dr_events_this_year: drEventsThisYear
    },
    last_optimization: optimizationHistory.length > 0 ? optimizationHistory[optimizationHistory.length - 1].timestamp : null
  });
});

// API Routes
app.get('/api/sites', (req, res) => {
  res.json(sitesData);
});

app.get('/api/market', (req, res) => {
  res.json(marketData);
});

app.get('/api/history', (req, res) => {
  res.json(optimizationHistory.slice(-50));
});

app.get('/api/demand-response', (req, res) => {
  res.json({
    active_event: activeDREvent,
    events_this_year: drEventsThisYear,
    max_events_per_year: maxDREventsPerYear,
    recent_events: demandResponseEvents.slice(-10),
    site_commitments: Object.fromEntries(
      Object.entries(SITES).map(([id, site]) => [
        id, 
        {
          name: site.name,
          commitment_percent: site.dr_commitment_percent,
          annual_payment: site.dr_annual_payment,
          committed_capacity_mw: site.capacity_mw * (site.dr_commitment_percent / 100)
        }
      ])
    )
  });
});

app.get('/api/dashboard', (req, res) => {
  const totalProfit = Object.values(sitesData).reduce((sum, site) => sum + site.current_profit, 0);
  
  res.json({
    total_profit_per_hour: totalProfit,
    active_sites: Object.keys(sitesData).length,
    market_data: marketData,
    sites_summary: sitesData,
    demand_response: {
      active_event: activeDREvent,
      events_this_year: drEventsThisYear
    }
  });
});

// Manual DR Control Endpoints
app.post('/api/trigger-dr', (req, res) => {
  const eventData = req.body;
  
  // Validate event data
  if (!eventData.affected_sites || !Array.isArray(eventData.affected_sites)) {
    return res.status(400).json({ error: 'Invalid affected_sites' });
  }
  
  // Set active DR event
  activeDREvent = {
    ...eventData,
    start_time: new Date().toISOString()
  };
  
  drEventsThisYear++;
  demandResponseEvents.push(activeDREvent);
  
  console.log(`🚨 MANUAL DR EVENT TRIGGERED: ${activeDREvent.reason} - Duration: ${activeDREvent.duration_hours}h - Sites: ${activeDREvent.affected_sites.join(', ')}`);
  
  // Force immediate optimization
  optimizeSites();
  
  // Emit update to all clients
  io.emit('optimization_update', {
    history: optimizationHistory.slice(-20),
    current_total_profit: Object.values(sitesData).reduce((sum, site) => sum + site.current_profit, 0),
    active_dr_event: activeDREvent,
    dr_events_this_year: drEventsThisYear
  });
  
  // Auto-end event after duration
  setTimeout(() => {
    if (activeDREvent && activeDREvent.id === eventData.id) {
      console.log(`✅ DR Event ${activeDREvent.id} auto-ended after ${activeDREvent.duration_hours}h`);
      activeDREvent = null;
      optimizeSites();
      io.emit('optimization_update', {
        history: optimizationHistory.slice(-20),
        current_total_profit: Object.values(sitesData).reduce((sum, site) => sum + site.current_profit, 0),
        active_dr_event: null,
        dr_events_this_year: drEventsThisYear
      });
    }
  }, eventData.duration_hours * 60 * 60 * 1000);
  
  res.json({ success: true, event: activeDREvent });
});

app.post('/api/end-dr', (req, res) => {
  if (activeDREvent) {
    console.log(`✅ DR Event ${activeDREvent.id} manually ended`);
    activeDREvent = null;
    
    // Force immediate optimization
    optimizeSites();
    
    // Emit update to all clients
    io.emit('optimization_update', {
      history: optimizationHistory.slice(-20),
      current_total_profit: Object.values(sitesData).reduce((sum, site) => sum + site.current_profit, 0),
      active_dr_event: null,
      dr_events_this_year: drEventsThisYear
    });
    
    res.json({ success: true });
  } else {
    res.status(400).json({ error: 'No active DR event' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    connected_clients: connectedClients.size
  });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  connectedClients.add(socket.id);
  console.log(`🔌 Client connected: ${socket.id} (Total: ${connectedClients.size})`);
  
  // Send initial data immediately
  socket.emit('market_update', marketData);
  socket.emit('sites_update', sitesData);
  socket.emit('optimization_update', {
    history: optimizationHistory.slice(-20),
    current_total_profit: Object.values(sitesData).reduce((sum, site) => sum + site.current_profit, 0),
    active_dr_event: activeDREvent,
    dr_events_this_year: drEventsThisYear
  });
  
  // Handle ping/pong for connection health
  socket.on('ping', () => {
    socket.emit('pong');
  });
  
  socket.on('disconnect', (reason) => {
    connectedClients.delete(socket.id);
    console.log(`🔌 Client disconnected: ${socket.id} (${reason}) (Remaining: ${connectedClients.size})`);
  });
  
  socket.on('error', (error) => {
    console.log(`❌ Socket error for ${socket.id}:`, error.message);
  });
});

// Optimization loop
function startOptimizationLoop() {
  setInterval(() => {
    try {
      optimizeSites();
      
      // Only emit if we have connected clients
      if (connectedClients.size > 0) {
        const optimizationUpdate = {
          history: optimizationHistory.slice(-20),
          current_total_profit: Object.values(sitesData).reduce((sum, site) => sum + site.current_profit, 0),
          active_dr_event: activeDREvent,
          dr_events_this_year: drEventsThisYear
        };
        
        io.emit('market_update', marketData);
        io.emit('sites_update', sitesData);
        io.emit('optimization_update', optimizationUpdate);
      }
      
    } catch (error) {
      console.error('❌ Optimization error:', error);
    }
  }, 15000); // Update every 15 seconds
}

// Initialize and start server
console.log('🚀 Starting Smart Energy Arbitrage Backend v3.1...');
console.log('⚡ Core Challenge: Limited by POWER, not Hardware');
console.log('💡 Solution: AI-Powered Power Allocation Between Revenue Streams');

generateMarketData();
optimizeSites();

console.log(`✅ Initial optimization complete:`);
console.log(`   💰 Total Revenue: $${Object.values(sitesData).reduce((sum, site) => sum + site.current_profit, 0).toFixed(2)}/hour`);
console.log(`   🏭 Active Sites: ${Object.keys(sitesData).length} (Finland + Texas)`);
console.log(`   ₿ Bitcoin Price: $${marketData.btc_price.toFixed(0)}`);
console.log(`   🤖 AI Demand: ${(marketData.ai_demand_level * 100).toFixed(0)}%`);
console.log(`   ⚡ Avg Energy: ${((Object.values(marketData.energy_prices).reduce((a,b) => a+b, 0) / 2) * 100).toFixed(1)} ¢/kWh`);

startOptimizationLoop();

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`\n🎯 Server running on http://localhost:${PORT}`);
  console.log(`📊 Dashboard API: http://localhost:${PORT}/api/dashboard`);
  console.log(`🚨 Demand Response API: http://localhost:${PORT}/api/demand-response`);
  console.log(`🎮 Manual DR Control: http://localhost:${PORT}/api/trigger-dr`);
  console.log(`🔌 WebSocket ready for connections`);
  console.log(`💡 Backend status: http://localhost:${PORT}/`);
  console.log(`\n🔄 Optimization loop started (updates every 15 seconds)`);
  console.log(`📈 Ready for frontend connections!\n`);
});