import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface OptimizationChartProps {
  data: any[];
  currentProfit: number;
}

const OptimizationChart: React.FC<OptimizationChartProps> = ({ data, currentProfit }) => {
  const chartData = data.map((entry) => ({
    time: new Date(entry.timestamp).toLocaleTimeString(),
    profit: entry.total_profit,
    ai_demand: (entry.market_conditions?.ai_demand || 0.8) * 100,
    btc_price: entry.market_conditions?.btc_price || 110000,
    ai_allocation: Object.values(entry.sites).reduce((sum: number, site: any) => sum + site.power_allocation.ai, 0),
    bitcoin_allocation: Object.values(entry.sites).reduce((sum: number, site: any) => sum + site.power_allocation.bitcoin, 0),
  }));

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Real-Time Optimization</h2>
        <p className="text-gray-300 max-w-2xl mx-auto">
          Watch how our system responds to changing market conditions and customer demand
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Optimization */}
        <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50">
          <h3 className="text-lg font-semibold text-white mb-4">Revenue Optimization</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="time" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }}
                  formatter={(value: any) => [`$${value.toLocaleString()}`, 'Revenue/hour']}
                />
                <Area
                  type="monotone"
                  dataKey="profit"
                  stroke="#10B981"
                  strokeWidth={2}
                  fill="url(#profitGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-center">
            <span className="text-2xl font-bold text-green-400">${currentProfit.toFixed(2)}/h</span>
            <p className="text-sm text-gray-400">Current Rate</p>
          </div>
        </div>

        {/* Power Allocation */}
        <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50">
          <h3 className="text-lg font-semibold text-white mb-4">Power Allocation</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="aiGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="bitcoinGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="time" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }}
                  formatter={(value: any, name: string) => [
                    `${value.toFixed(0)} MW`,
                    name === 'ai_allocation' ? 'AI Inference' : 'Bitcoin Mining'
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="ai_allocation"
                  stackId="1"
                  stroke="#3B82F6"
                  fill="url(#aiGradient)"
                />
                <Area
                  type="monotone"
                  dataKey="bitcoin_allocation"
                  stackId="1"
                  stroke="#F59E0B"
                  fill="url(#bitcoinGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 text-center">
            <div>
              <span className="text-lg font-bold text-blue-400">AI</span>
              <p className="text-xs text-gray-400">Higher profit when demand is high</p>
            </div>
            <div>
              <span className="text-lg font-bold text-orange-400">Bitcoin</span>
              <p className="text-xs text-gray-400">Safe baseline revenue</p>
            </div>
          </div>
        </div>
      </div>

      {/* Market Conditions */}
      <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50">
        <h3 className="text-lg font-semibold text-white mb-4">Market Conditions Driving Decisions</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }}
                formatter={(value: any, name: string) => {
                  if (name === 'AI Demand') return [`${value.toFixed(0)}%`, 'AI Demand'];
                  return [value, name];
                }}
              />
              <Line 
                type="monotone" 
                dataKey="ai_demand" 
                stroke="#3B82F6" 
                strokeWidth={2}
                name="AI Demand"
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-400">
            When AI demand is high (&gt;80%), we allocate more power to AI inference. 
            When it's low, we shift to Bitcoin mining for stable revenue.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OptimizationChart;