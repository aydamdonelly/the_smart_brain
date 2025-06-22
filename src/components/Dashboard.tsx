import React from 'react';
import { Zap, DollarSign, Cpu, Shield, TrendingUp, Activity, Battery } from 'lucide-react';

interface DashboardProps {
  totalProfit: number;
  sitesCount: number;
  marketData: any;
}

const Dashboard: React.FC<DashboardProps> = ({ totalProfit, sitesCount, marketData }) => {
  const dailyProfit = totalProfit * 24;
  const monthlyProfit = dailyProfit * 30;

  return (
    <div className="space-y-8">
      {/* Hero Section - What We're Doing */}
      <div className="text-center py-12">
        <h1 className="text-4xl font-bold text-white mb-4">
          We're Building an AI-Powered Energy Arbitrage Layer
        </h1>
        <p className="text-xl text-gray-300 mb-8 max-w-4xl mx-auto">
          A brain that thinks in kilowatts and dollars. Watch our system automatically allocate 
          limited electricity across AI inference, Bitcoin mining, and demand response programs in real-time.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
            <Cpu className="h-12 w-12 text-blue-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-blue-300 mb-2">AI Inference</h3>
            <p className="text-sm text-gray-400">Highest profit per kW, but customer dependent</p>
          </div>
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-6">
            <DollarSign className="h-12 w-12 text-orange-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-orange-300 mb-2">Bitcoin Mining</h3>
            <p className="text-sm text-gray-400">Always available, stable baseline revenue</p>
          </div>
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-6">
            <Shield className="h-12 w-12 text-purple-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-purple-300 mb-2">Demand Response</h3>
            <p className="text-sm text-gray-400">Fixed annual payout for grid flexibility</p>
          </div>
        </div>
      </div>

      {/* Live Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Current Revenue */}
        <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-500/20 rounded-xl">
              <TrendingUp className="h-6 w-6 text-green-400" />
            </div>
            <span className="text-xs text-green-400 font-medium">OPTIMIZED</span>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-2">Revenue Rate</p>
            <p className="text-3xl font-bold text-green-400 tabular-nums mb-1">
              ${totalProfit.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </p>
            <p className="text-xs text-gray-500">per hour</p>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-700/50">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Daily:</span>
              <span className="text-green-400 font-medium">${dailyProfit.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
            </div>
          </div>
        </div>

        {/* Bitcoin Price */}
        <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-500/20 rounded-xl">
              <DollarSign className="h-6 w-6 text-orange-400" />
            </div>
            <span className="text-xs text-orange-400 font-medium">BASELINE</span>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-2">Bitcoin Price</p>
            <p className="text-3xl font-bold text-orange-400 tabular-nums mb-1">
              ${marketData?.btc_price?.toLocaleString('en-US', { maximumFractionDigits: 0 }) || '110,000'}
            </p>
            <p className="text-xs text-gray-500">BTC/USD</p>
          </div>
        </div>

        {/* AI Demand */}
        <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-500/20 rounded-xl">
              <Cpu className="h-6 w-6 text-blue-400" />
            </div>
            <span className="text-xs text-blue-400 font-medium">VARIABLE</span>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-2">AI Customer Demand</p>
            <p className="text-3xl font-bold text-blue-400 tabular-nums mb-1">
              {marketData?.ai_demand_level ? (marketData.ai_demand_level * 100).toFixed(0) : '85'}%
            </p>
            <p className="text-xs text-gray-500">Current load</p>
          </div>
        </div>

        {/* Power Capacity */}
        <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-500/20 rounded-xl">
              <Zap className="h-6 w-6 text-yellow-400" />
            </div>
            <span className="text-xs text-yellow-400 font-medium">LIMITED</span>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-2">Total Power</p>
            <p className="text-3xl font-bold text-yellow-400 tabular-nums mb-1">
              350
            </p>
            <p className="text-xs text-gray-500">MW capacity</p>
          </div>
        </div>
      </div>

      {/* The Challenge */}
      <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-2xl p-8 border border-red-500/20">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-4">The Challenge</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            We have a fixed amount of electricity. How do we allocate it intelligently between 
            AI inference, Bitcoin mining, and demand response programs?
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gray-800/50 rounded-xl p-6">
            <h3 className="text-xl font-bold text-red-300 mb-4">❌ We're NOT Limited By:</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Cpu className="h-5 w-5 text-gray-400" />
                <span className="text-gray-300">Mining Hardware</span>
              </div>
              <div className="flex items-center space-x-3">
                <Cpu className="h-5 w-5 text-gray-400" />
                <span className="text-gray-300">AI Compute Power</span>
              </div>
              <div className="flex items-center space-x-3">
                <Activity className="h-5 w-5 text-gray-400" />
                <span className="text-gray-300">Processing Capacity</span>
              </div>
            </div>
          </div>
          
          <div className="bg-orange-500/10 rounded-xl p-6 border border-orange-500/20">
            <h3 className="text-xl font-bold text-orange-300 mb-4">⚡ We ARE Limited By:</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Zap className="h-5 w-5 text-orange-400" />
                <span className="text-orange-300 font-medium">Electricity Supply</span>
              </div>
              <div className="flex items-center space-x-3">
                <Battery className="h-5 w-5 text-orange-400" />
                <span className="text-orange-300 font-medium">Grid Connection Limits</span>
              </div>
              <div className="flex items-center space-x-3">
                <TrendingUp className="h-5 w-5 text-orange-400" />
                <span className="text-orange-300 font-medium">Power Generation Capacity</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Our Solution */}
      <div className="bg-gradient-to-br from-green-500/10 to-blue-500/10 rounded-2xl p-8 border border-green-500/20">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-4">Our Solution</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            A smart system that automatically allocates electricity across three revenue streams, 
            based on real-time data and predictive modeling.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-blue-500/10 rounded-xl border border-blue-500/20">
            <div className="text-4xl mb-4">🧠</div>
            <h3 className="text-lg font-bold text-blue-300 mb-2">AI Demand Modeling</h3>
            <p className="text-sm text-gray-400">Predict customer behavior to optimize capacity allocation</p>
          </div>
          
          <div className="text-center p-6 bg-green-500/10 rounded-xl border border-green-500/20">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-lg font-bold text-green-300 mb-2">Real-Time Optimization</h3>
            <p className="text-sm text-gray-400">Instantly switch between revenue streams as conditions change</p>
          </div>
          
          <div className="text-center p-6 bg-purple-500/10 rounded-xl border border-purple-500/20">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-lg font-bold text-purple-300 mb-2">Smart DR Response</h3>
            <p className="text-sm text-gray-400">Minimize revenue loss during grid demand events</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;