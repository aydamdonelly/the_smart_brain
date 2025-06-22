import React, { useState } from 'react';
import { AlertTriangle, Shield, Zap, TrendingDown, CheckCircle, XCircle, Cpu, DollarSign } from 'lucide-react';

interface DRControlProps {
  sites: { [key: string]: any };
  onTriggerDR: (eventData: any) => void;
  onEndDR: () => void;
  activeDREvent: any;
}

const DemandResponseControl: React.FC<DRControlProps> = ({ 
  sites, 
  onTriggerDR, 
  onEndDR, 
  activeDREvent 
}) => {
  const [selectedSites, setSelectedSites] = useState<string[]>([]);
  const [eventReason, setEventReason] = useState('Peak Demand');
  const [duration, setDuration] = useState(4);

  const reasons = [
    'Peak Demand',
    'Grid Overload', 
    'Emergency Reserve',
    'Renewable Intermittency'
  ];

  const handleSiteToggle = (siteId: string) => {
    setSelectedSites(prev => 
      prev.includes(siteId) 
        ? prev.filter(id => id !== siteId)
        : [...prev, siteId]
    );
  };

  const calculateDRImpact = () => {
    let totalCapacityReduced = 0;
    let totalProfitLoss = 0;

    selectedSites.forEach(siteId => {
      const site = sites[siteId];
      if (site) {
        const reducedCapacity = site.capacity_mw * (site.dr_commitment_percent / 100);
        totalCapacityReduced += reducedCapacity;
        
        // During DR, we prioritize keeping AI running (customer obligations)
        // So we mainly lose Bitcoin mining revenue
        const bitcoinProfitPerMW = site.profits.bitcoin.profit / site.capacity_mw;
        totalProfitLoss += bitcoinProfitPerMW * reducedCapacity;
      }
    });

    return {
      capacityReduced: totalCapacityReduced,
      profitLoss: totalProfitLoss
    };
  };

  const triggerDREvent = () => {
    if (selectedSites.length === 0) return;
    
    const impact = calculateDRImpact();
    const eventData = {
      id: `DR-${Date.now()}`,
      reason: eventReason,
      duration_hours: duration,
      affected_sites: selectedSites,
      capacity_reduced: impact.capacityReduced,
      profit_impact: impact.profitLoss,
      start_time: new Date().toISOString()
    };
    
    onTriggerDR(eventData);
  };

  const impact = calculateDRImpact();

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Demand Response Test</h2>
        <p className="text-gray-300 max-w-2xl mx-auto">
          Simulate a grid emergency and watch our system intelligently reduce power consumption 
          while keeping AI services running for customers
        </p>
      </div>

      {/* Active Event Status */}
      {activeDREvent && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-6 w-6 text-red-400 animate-pulse" />
              <div>
                <h3 className="text-xl font-bold text-red-300">🚨 GRID EMERGENCY ACTIVE</h3>
                <p className="text-sm text-red-400">System automatically reducing power consumption</p>
              </div>
            </div>
            <button
              onClick={onEndDR}
              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-300 font-medium transition-all duration-300"
            >
              End Emergency
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-red-500/10 rounded-lg">
              <p className="text-lg font-bold text-red-300">{activeDREvent.reason}</p>
              <p className="text-xs text-red-400">Grid Condition</p>
            </div>
            <div className="text-center p-3 bg-red-500/10 rounded-lg">
              <p className="text-lg font-bold text-red-300">{activeDREvent.duration_hours}h</p>
              <p className="text-xs text-red-400">Duration</p>
            </div>
            <div className="text-center p-3 bg-red-500/10 rounded-lg">
              <p className="text-lg font-bold text-red-300">{activeDREvent.capacity_reduced?.toFixed(0)} MW</p>
              <p className="text-xs text-red-400">Power Reduced</p>
            </div>
            <div className="text-center p-3 bg-red-500/10 rounded-lg">
              <p className="text-lg font-bold text-red-300">{activeDREvent.affected_sites?.length}</p>
              <p className="text-xs text-red-400">Sites Affected</p>
            </div>
          </div>

          {/* Smart Response Strategy Display */}
          <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/20">
            <h4 className="text-lg font-bold text-blue-300 mb-3">🧠 Smart Response Strategy</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                <Cpu className="h-5 w-5 text-green-400" />
                <div>
                  <p className="text-green-300 font-medium">AI Inference: PROTECTED</p>
                  <p className="text-xs text-green-400">Customer obligations maintained</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                <DollarSign className="h-5 w-5 text-red-400" />
                <div>
                  <p className="text-red-300 font-medium">Bitcoin Mining: REDUCED</p>
                  <p className="text-xs text-red-400">Most flexible operation</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Control Panel */}
      {!activeDREvent && (
        <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50">
          <h3 className="text-xl font-bold text-white mb-6">Simulate Grid Emergency</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Event Configuration */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">Emergency Type</label>
                <select
                  value={eventReason}
                  onChange={(e) => setEventReason(e.target.value)}
                  className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                >
                  {reasons.map(reason => (
                    <option key={reason} value={reason}>{reason}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Duration: {duration} hours
                </label>
                <input
                  type="range"
                  min="1"
                  max="8"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1h</span>
                  <span>4h</span>
                  <span>8h</span>
                </div>
              </div>

              {/* Site Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Affected Data Centers ({selectedSites.length} selected)
                </label>
                <div className="space-y-3">
                  {Object.entries(sites).map(([siteId, site]) => (
                    <div
                      key={siteId}
                      className={`p-4 rounded-lg border cursor-pointer transition-all duration-300 ${
                        selectedSites.includes(siteId)
                          ? 'bg-purple-500/20 border-purple-500/50'
                          : 'bg-gray-700/30 border-gray-600/50 hover:border-gray-500/50'
                      }`}
                      onClick={() => handleSiteToggle(siteId)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {selectedSites.includes(siteId) ? (
                            <CheckCircle className="h-5 w-5 text-purple-400" />
                          ) : (
                            <XCircle className="h-5 w-5 text-gray-500" />
                          )}
                          <div>
                            <p className="font-medium text-white">{site.name}</p>
                            <p className="text-sm text-gray-400">{site.location}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-purple-300">
                            {(site.capacity_mw * (site.dr_commitment_percent / 100)).toFixed(0)} MW available
                          </p>
                          <p className="text-xs text-gray-500">
                            {site.dr_commitment_percent}% committed
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Impact Preview */}
            <div className="space-y-6">
              <h4 className="text-lg font-semibold text-white">Impact Analysis</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-center">
                  <TrendingDown className="h-6 w-6 text-red-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-red-400">{impact.capacityReduced.toFixed(0)}</p>
                  <p className="text-xs text-red-300">MW Reduced</p>
                </div>
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-center">
                  <TrendingDown className="h-6 w-6 text-red-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-red-400">${impact.profitLoss.toFixed(0)}</p>
                  <p className="text-xs text-red-300">Revenue Loss/h</p>
                </div>
              </div>

              <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                <h5 className="font-medium text-green-300 mb-3">🧠 Smart Response Strategy</h5>
                <div className="space-y-2 text-sm text-green-200">
                  <p>✅ Keep AI inference running (customer obligations)</p>
                  <p>✅ Shut down Bitcoin mining first (most flexible)</p>
                  <p>✅ Minimize total revenue impact</p>
                  <p>✅ Meet grid commitments instantly</p>
                </div>
              </div>

              <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <h5 className="font-medium text-blue-300 mb-3">💰 Annual DR Economics</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">DR Revenue (guaranteed):</span>
                    <span className="text-green-400 font-medium">
                      ${Object.values(sites)
                        .filter((site: any) => selectedSites.includes(Object.keys(sites).find(id => sites[id] === site) || ''))
                        .reduce((sum: number, site: any) => sum + site.dr_annual_payment, 0)
                        .toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Lost revenue (20 events):</span>
                    <span className="text-red-400 font-medium">
                      -${(impact.profitLoss * duration * 20).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-gray-600 pt-2">
                    <span className="text-gray-300 font-medium">Net DR Benefit:</span>
                    <span className="text-green-400 font-bold">
                      ${(Object.values(sites)
                        .filter((site: any) => selectedSites.includes(Object.keys(sites).find(id => sites[id] === site) || ''))
                        .reduce((sum: number, site: any) => sum + site.dr_annual_payment, 0) - 
                        (impact.profitLoss * duration * 20)).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={triggerDREvent}
                disabled={selectedSites.length === 0}
                className={`w-full py-4 px-6 rounded-lg font-bold text-lg transition-all duration-300 ${
                  selectedSites.length > 0
                    ? 'bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300 hover:text-red-200'
                    : 'bg-gray-700/30 border border-gray-600/30 text-gray-500 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Trigger Grid Emergency</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* How It Works */}
      <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-2xl p-8 border border-purple-500/20">
        <h3 className="text-2xl font-bold text-purple-300 mb-6 text-center">How Demand Response Works</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-purple-500/10 rounded-xl border border-purple-500/20">
            <div className="text-4xl mb-4">💰</div>
            <h4 className="text-lg font-bold text-purple-300 mb-2">1. Annual Contract</h4>
            <p className="text-sm text-gray-400">
              We commit upfront to reduce X% of power when called. Get guaranteed annual payments.
            </p>
          </div>
          
          <div className="text-center p-6 bg-purple-500/10 rounded-xl border border-purple-500/20">
            <div className="text-4xl mb-4">🚨</div>
            <h4 className="text-lg font-bold text-purple-300 mb-2">2. Grid Emergency</h4>
            <p className="text-sm text-gray-400">
              Grid operators call 10-30 times/year when electricity demand exceeds supply.
            </p>
          </div>
          
          <div className="text-center p-6 bg-purple-500/10 rounded-xl border border-purple-500/20">
            <div className="text-4xl mb-4">🧠</div>
            <h4 className="text-lg font-bold text-purple-300 mb-2">3. Smart Response</h4>
            <p className="text-sm text-gray-400">
              Our system decides which operations to pause: Keep AI running, reduce Bitcoin mining.
            </p>
          </div>
        </div>
        
        <div className="mt-8 p-6 bg-green-500/10 rounded-xl border border-green-500/20 text-center">
          <p className="text-green-200">
            <strong>Key Insight:</strong> During emergencies, we must keep AI inference running (customer obligations) 
            but can instantly shut down Bitcoin mining. Our smart system minimizes revenue loss.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DemandResponseControl;