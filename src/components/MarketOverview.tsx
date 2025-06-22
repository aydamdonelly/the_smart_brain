import React from 'react';
import { TrendingUp, Zap, DollarSign, Activity, Cpu, Users } from 'lucide-react';

interface MarketData {
  timestamp: string;
  btc_price: number;
  energy_prices: { [key: string]: number };
  ai_rental_rate: number;
  ai_demand_level: number;
}

interface MarketOverviewProps {
  marketData: MarketData;
}

const MarketOverview: React.FC<MarketOverviewProps> = ({ marketData }) => {
  const avgEnergyPrice = Object.values(marketData.energy_prices).reduce((a, b) => a + b, 0) / Object.values(marketData.energy_prices).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Live Market Conditions</h2>
        <div className="text-sm text-gray-400">
          Real-time data • Updated {new Date(marketData.timestamp).toLocaleTimeString()}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Bitcoin Price */}
        <div className="group relative bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50 hover:border-orange-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/10">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-500/20 rounded-xl group-hover:bg-orange-500/30 transition-colors">
                <DollarSign className="h-6 w-6 text-orange-400" />
              </div>
              <span className="text-xs text-gray-400 font-mono">BTC/USD</span>
            </div>
            <div>
              <p className="text-3xl font-bold text-orange-400 tabular-nums mb-1">
                ${marketData.btc_price.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </p>
              <p className="text-sm text-gray-400">Bitcoin Price</p>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-700/50">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Revenue Stream:</span>
                <span className="text-orange-400 font-medium">Always Available</span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Demand */}
        <div className="group relative bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50 hover:border-blue-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500/20 rounded-xl group-hover:bg-blue-500/30 transition-colors">
                <Users className="h-6 w-6 text-blue-400" />
              </div>
              <span className="text-xs text-gray-400 font-mono">Customer Demand</span>
            </div>
            <div>
              <p className="text-3xl font-bold text-blue-400 tabular-nums mb-1">
                {(marketData.ai_demand_level * 100).toFixed(0)}%
              </p>
              <p className="text-sm text-gray-400">AI Inference Demand</p>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-700/50">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Status:</span>
                <span className={`font-medium ${
                  marketData.ai_demand_level > 0.8 ? 'text-green-400' : 
                  marketData.ai_demand_level > 0.6 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {marketData.ai_demand_level > 0.8 ? 'High' : 
                   marketData.ai_demand_level > 0.6 ? 'Medium' : 'Low'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Rental Rate */}
        <div className="group relative bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50 hover:border-blue-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500/20 rounded-xl group-hover:bg-blue-500/30 transition-colors">
                <Cpu className="h-6 w-6 text-blue-400" />
              </div>
              <span className="text-xs text-gray-400 font-mono">$/GPU/hr</span>
            </div>
            <div>
              <p className="text-3xl font-bold text-blue-400 tabular-nums mb-1">
                ${marketData.ai_rental_rate.toFixed(2)}
              </p>
              <p className="text-sm text-gray-400">AI Compute Rate</p>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-700/50">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">vs Bitcoin:</span>
                <span className="text-blue-400 font-medium">Higher Revenue</span>
              </div>
            </div>
          </div>
        </div>

        {/* Average Energy Price */}
        <div className="group relative bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50 hover:border-yellow-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-yellow-500/10">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-500/20 rounded-xl group-hover:bg-yellow-500/30 transition-colors">
                <Zap className="h-6 w-6 text-yellow-400" />
              </div>
              <span className="text-xs text-gray-400 font-mono">¢/kWh</span>
            </div>
            <div>
              <p className="text-3xl font-bold text-yellow-400 tabular-nums mb-1">
                {(avgEnergyPrice * 100).toFixed(1)}¢
              </p>
              <p className="text-sm text-gray-400">Average Energy Cost</p>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-700/50">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Impact:</span>
                <span className="text-yellow-400 font-medium">Profit Margin</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Energy Prices by Location */}
      <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
          <Zap className="h-5 w-5 mr-2 text-yellow-400" />
          Energy Costs by Data Center
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(marketData.energy_prices).map(([siteId, price]) => {
            const siteName = siteId.includes('finland') ? 'Nordic Data Center' : 'Texas Energy Hub';
            const location = siteId.includes('finland') ? 'Finland' : 'Texas, USA';
            const flag = siteId.includes('finland') ? '🇫🇮' : '🇺🇸';
            
            return (
              <div key={siteId} className="group bg-gray-700/30 rounded-xl p-6 hover:bg-gray-700/50 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{flag}</span>
                    <div>
                      <h4 className="text-lg font-semibold text-white">{siteName}</h4>
                      <p className="text-sm text-gray-400">{location}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-yellow-400 tabular-nums">
                      {(price * 100).toFixed(1)}¢
                    </span>
                    <p className="text-xs text-gray-500">per kWh</p>
                  </div>
                </div>
                
                {/* Price indicator bar */}
                <div className="w-full bg-gray-600 rounded-full h-3 mt-4">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-yellow-500 h-3 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${Math.min(100, (price / 0.08) * 100)}%` // Scale to 8¢ max
                    }}
                  ></div>
                </div>
                
                <div className="mt-3 flex justify-between text-sm">
                  <span className="text-gray-400">Cost Impact:</span>
                  <span className={`font-medium ${
                    price < 0.05 ? 'text-green-400' : price < 0.06 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {price < 0.05 ? 'Low' : price < 0.06 ? 'Medium' : 'High'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Market Optimization Insight */}
      <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
          <TrendingUp className="h-5 w-5 mr-2 text-green-400" />
          Current Market Strategy
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-orange-500/10 rounded-xl border border-orange-500/20">
            <DollarSign className="h-8 w-8 text-orange-400 mx-auto mb-2" />
            <p className="text-lg font-bold text-orange-300">Bitcoin Mining</p>
            <p className="text-sm text-gray-400">Safe baseline revenue</p>
            <p className="text-xs text-orange-400 mt-2">Always profitable at ${marketData.btc_price.toLocaleString()}</p>
          </div>
          
          <div className="text-center p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
            <Cpu className="h-8 w-8 text-blue-400 mx-auto mb-2" />
            <p className="text-lg font-bold text-blue-300">AI Inference</p>
            <p className="text-sm text-gray-400">
              {marketData.ai_demand_level > 0.8 ? 'High demand - prioritize' : 
               marketData.ai_demand_level > 0.6 ? 'Medium demand - balance' : 'Low demand - reduce'}
            </p>
            <p className="text-xs text-blue-400 mt-2">{(marketData.ai_demand_level * 100).toFixed(0)}% customer demand</p>
          </div>
          
          <div className="text-center p-4 bg-green-500/10 rounded-xl border border-green-500/20">
            <Activity className="h-8 w-8 text-green-400 mx-auto mb-2" />
            <p className="text-lg font-bold text-green-300">Optimization</p>
            <p className="text-sm text-gray-400">Real-time power allocation</p>
            <p className="text-xs text-green-400 mt-2">Maximizing revenue every second</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketOverview;