import React from 'react';
import { MapPin, Zap, Cpu, DollarSign, Shield, TrendingUp, Activity } from 'lucide-react';

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

interface SiteGridProps {
  sites: { [key: string]: SiteData };
}

const SiteGrid: React.FC<SiteGridProps> = ({ sites }) => {
  const getLocationFlag = (location: string) => {
    if (location.includes('Finland')) return '🇫🇮';
    if (location.includes('Texas')) return '🇺🇸';
    return '🌍';
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Live Power Allocation</h2>
        <p className="text-gray-300 max-w-2xl mx-auto">
          Watch our AI system automatically allocate power between revenue streams in real-time
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {Object.entries(sites).map(([siteId, site]) => (
          <div key={siteId} className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-700/50 overflow-hidden">
            {/* Site Header */}
            <div className="p-6 border-b border-gray-700/50">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">{site.name}</h3>
                  <div className="flex items-center text-sm text-gray-400">
                    <span className="mr-2 text-xl">{getLocationFlag(site.location)}</span>
                    <MapPin className="h-4 w-4 mr-1" />
                    {site.location}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-yellow-400">{site.capacity_mw} MW</div>
                  <div className="text-xs text-gray-500">Total Capacity</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-400 font-medium">OPTIMIZING</span>
                </div>
                <div className="text-2xl font-bold text-green-400">
                  ${site.current_profit.toLocaleString('en-US', { maximumFractionDigits: 0 })}/h
                </div>
              </div>
            </div>

            {/* Power Allocation Bars */}
            <div className="p-6">
              <h4 className="text-lg font-semibold text-white mb-4">Current Power Allocation</h4>
              
              <div className="space-y-4">
                {/* AI Inference */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Cpu className="h-4 w-4 text-blue-400" />
                      <span className="text-sm font-medium text-blue-300">AI Inference</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-blue-400">{site.power_allocation.ai.toFixed(0)} MW</span>
                      <span className="text-xs text-gray-500 ml-2">
                        ({((site.power_allocation.ai / site.capacity_mw) * 100).toFixed(0)}%)
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-blue-400 h-3 rounded-full transition-all duration-1000"
                      style={{ width: `${(site.power_allocation.ai / site.capacity_mw) * 100}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Customer demand: {(site.ai_demand_level * 100).toFixed(0)}%
                  </div>
                </div>

                {/* Bitcoin Mining */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-orange-400" />
                      <span className="text-sm font-medium text-orange-300">Bitcoin Mining</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-orange-400">{site.power_allocation.bitcoin.toFixed(0)} MW</span>
                      <span className="text-xs text-gray-500 ml-2">
                        ({((site.power_allocation.bitcoin / site.capacity_mw) * 100).toFixed(0)}%)
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-orange-500 to-orange-400 h-3 rounded-full transition-all duration-1000"
                      style={{ width: `${(site.power_allocation.bitcoin / site.capacity_mw) * 100}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Safe baseline revenue
                  </div>
                </div>

                {/* DR Reserve */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Shield className="h-4 w-4 text-purple-400" />
                      <span className="text-sm font-medium text-purple-300">DR Reserve</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-purple-400">
                        {(site.capacity_mw * (site.dr_commitment_percent / 100)).toFixed(0)} MW
                      </span>
                      <span className="text-xs text-gray-500 ml-2">
                        ({site.dr_commitment_percent}% committed)
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-purple-400 h-3 rounded-full"
                      style={{ width: `${site.dr_commitment_percent}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    ${(site.dr_annual_payment / 1000000).toFixed(1)}M annual guaranteed
                  </div>
                </div>
              </div>

              {/* Revenue Breakdown */}
              <div className="mt-6 pt-4 border-t border-gray-700/50">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-blue-500/10 rounded-lg">
                    <div className="text-lg font-bold text-blue-400">
                      ${site.profits.ai.profit.toFixed(0)}
                    </div>
                    <div className="text-xs text-gray-500">AI Revenue/h</div>
                  </div>
                  <div className="p-3 bg-orange-500/10 rounded-lg">
                    <div className="text-lg font-bold text-orange-400">
                      ${site.profits.bitcoin.profit.toFixed(0)}
                    </div>
                    <div className="text-xs text-gray-500">Bitcoin Revenue/h</div>
                  </div>
                  <div className="p-3 bg-purple-500/10 rounded-lg">
                    <div className="text-lg font-bold text-purple-400">
                      ${(site.profits.demand_response.profit * 24 * 365 / 1000000).toFixed(1)}M
                    </div>
                    <div className="text-xs text-gray-500">DR Annual</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SiteGrid;