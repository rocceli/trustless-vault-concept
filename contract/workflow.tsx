import React, { useState } from 'react';
import { ArrowRight, Database, Lock, DollarSign, Activity, AlertTriangle, TrendingUp, Users } from 'lucide-react';

const SystemArchitecture = () => {
  const [activeFlow, setActiveFlow] = useState('borrow');

  const flows = {
    borrow: {
      title: 'Borrowing Flow',
      color: 'blue',
      steps: [
        { actor: 'User', action: 'Approve vaultBTC', target: 'VaultBTC Contract' },
        { actor: 'User', action: 'Call borrow()', target: 'VaultSwap Core' },
        { actor: 'VaultSwap Core', action: 'Check price', target: 'Price Oracle' },
        { actor: 'VaultSwap Core', action: 'Transfer collateral', target: 'VaultBTC Contract' },
        { actor: 'VaultSwap Core', action: 'Create loan record', target: 'Internal Storage' },
        { actor: 'VaultSwap Core', action: 'Transfer stablecoins', target: 'User' },
      ]
    },
    repay: {
      title: 'Repayment Flow',
      color: 'green',
      steps: [
        { actor: 'User', action: 'Approve stablecoin', target: 'Stablecoin Contract' },
        { actor: 'User', action: 'Call repay()', target: 'VaultSwap Core' },
        { actor: 'VaultSwap Core', action: 'Calculate interest', target: 'Internal Logic' },
        { actor: 'VaultSwap Core', action: 'Transfer repayment', target: 'Stablecoin Contract' },
        { actor: 'VaultSwap Core', action: 'Return collateral', target: 'User' },
        { actor: 'VaultSwap Core', action: 'Close loan', target: 'Internal Storage' },
      ]
    },
    liquidation: {
      title: 'Liquidation Flow',
      color: 'red',
      steps: [
        { actor: 'Liquidator', action: 'Monitor health factors', target: 'VaultSwap Core' },
        { actor: 'Liquidator', action: 'Identify underwater loan', target: 'Price Oracle' },
        { actor: 'Liquidator', action: 'Call liquidate()', target: 'VaultSwap Core' },
        { actor: 'VaultSwap Core', action: 'Verify health < 120%', target: 'Price Oracle' },
        { actor: 'VaultSwap Core', action: 'Transfer debt payment', target: 'Stablecoin Contract' },
        { actor: 'VaultSwap Core', action: 'Transfer collateral (90%)', target: 'Liquidator' },
        { actor: 'VaultSwap Core', action: 'Penalty to protocol', target: 'Internal Storage' },
      ]
    },
    liquidity: {
      title: 'Liquidity Provider Flow',
      color: 'purple',
      steps: [
        { actor: 'LP', action: 'Approve stablecoin', target: 'Stablecoin Contract' },
        { actor: 'LP', action: 'Call deposit()', target: 'Liquidity Pool' },
        { actor: 'Liquidity Pool', action: 'Calculate shares', target: 'Internal Logic' },
        { actor: 'Liquidity Pool', action: 'Mint LP tokens', target: 'LP' },
        { actor: 'Liquidity Pool', action: 'Transfer funds', target: 'VaultSwap Core' },
        { actor: 'LP', action: 'Earn interest over time', target: 'Protocol Revenue' },
      ]
    }
  };

  const contracts = [
    {
      name: 'VaultBTC',
      icon: Lock,
      color: 'orange',
      description: 'ERC20 token representing Babylon vault positions',
      responsibilities: [
        'Track vault positions with metadata',
        'Store staked amounts and lock times',
        'Accrue staking yields',
        'Transfer collateral to protocol'
      ]
    },
    {
      name: 'Price Oracle',
      icon: TrendingUp,
      color: 'yellow',
      description: 'Provides BTC/USD price feed',
      responsibilities: [
        'Return current BTC price',
        'Timestamp last update',
        'Staleness check (< 1 hour)',
        'Admin price updates for testing'
      ]
    },
    {
      name: 'VaultSwap Core',
      icon: Activity,
      color: 'blue',
      description: 'Main protocol logic and loan management',
      responsibilities: [
        'Create and manage loans',
        'Calculate health factors',
        'Process borrowing requests',
        'Handle repayments',
        'Execute liquidations',
        'Calculate interest accrual',
        'Enforce collateral ratios'
      ]
    },
    {
      name: 'Liquidity Pool',
      icon: Users,
      color: 'purple',
      description: 'Manages liquidity provider deposits',
      responsibilities: [
        'Accept stablecoin deposits',
        'Mint/burn LP tokens',
        'Calculate share values',
        'Supply funds to core protocol',
        'Distribute interest to LPs'
      ]
    },
    {
      name: 'Stablecoin',
      icon: DollarSign,
      color: 'green',
      description: 'ERC20 stablecoin for lending (e.g., USDC)',
      responsibilities: [
        'Store borrowed funds',
        'Transfer to borrowers',
        'Accept repayments',
        'Track balances'
      ]
    }
  ];

  const getColorClass = (color) => {
    const colors = {
      orange: 'bg-orange-100 text-orange-800 border-orange-300',
      yellow: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      blue: 'bg-blue-100 text-blue-800 border-blue-300',
      purple: 'bg-purple-100 text-purple-800 border-purple-300',
      green: 'bg-green-100 text-green-800 border-green-300',
      red: 'bg-red-100 text-red-800 border-red-300',
    };
    return colors[color] || colors.blue;
  };

  const getFlowColor = (color) => {
    const colors = {
      blue: 'from-blue-500 to-blue-600',
      green: 'from-green-500 to-green-600',
      red: 'from-red-500 to-red-600',
      purple: 'from-purple-500 to-purple-600',
    };
    return colors[color];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">VaultSwap System Architecture</h1>
          <p className="text-gray-600">Complete workflow and contract interaction diagram</p>
        </div>

        {/* System Overview Diagram */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Database className="text-blue-600" />
            Contract Architecture
          </h2>
          
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            {contracts.map((contract, idx) => {
              const Icon = contract.icon;
              return (
                <div key={idx} className={`p-4 rounded-lg border-2 ${getColorClass(contract.color)}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon size={20} />
                    <h3 className="font-bold text-sm">{contract.name}</h3>
                  </div>
                  <p className="text-xs mb-3 opacity-80">{contract.description}</p>
                  <div className="text-xs space-y-1">
                    {contract.responsibilities.slice(0, 3).map((resp, i) => (
                      <div key={i} className="flex items-start gap-1">
                        <span className="mt-1">•</span>
                        <span>{resp}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Connection Diagram */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="font-semibold mb-4 text-center">Contract Interactions</h3>
            <div className="flex flex-wrap justify-center items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-24 h-12 bg-orange-200 rounded flex items-center justify-center text-xs font-semibold">
                  VaultBTC
                </div>
                <ArrowRight size={20} className="text-gray-400" />
                <div className="w-24 h-12 bg-blue-200 rounded flex items-center justify-center text-xs font-semibold">
                  Core
                </div>
                <ArrowRight size={20} className="text-gray-400" />
                <div className="w-24 h-12 bg-green-200 rounded flex items-center justify-center text-xs font-semibold">
                  Stablecoin
                </div>
              </div>
            </div>
            <div className="flex flex-wrap justify-center items-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-24 h-12 bg-yellow-200 rounded flex items-center justify-center text-xs font-semibold">
                  Oracle
                </div>
                <ArrowRight size={20} className="text-gray-400" />
                <div className="w-24 h-12 bg-blue-200 rounded flex items-center justify-center text-xs font-semibold">
                  Core
                </div>
                <ArrowRight size={20} className="text-gray-400" />
                <div className="w-24 h-12 bg-purple-200 rounded flex items-center justify-center text-xs font-semibold">
                  LP Pool
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Flow Selector */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Interaction Flows</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {Object.entries(flows).map(([key, flow]) => (
              <button
                key={key}
                onClick={() => setActiveFlow(key)}
                className={`p-4 rounded-lg font-semibold transition-all ${
                  activeFlow === key
                    ? `bg-gradient-to-r ${getFlowColor(flow.color)} text-white shadow-lg scale-105`
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {flow.title}
              </button>
            ))}
          </div>

          {/* Active Flow Details */}
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-6 border-2 border-gray-200">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Activity className={`text-${flows[activeFlow].color}-600`} />
              {flows[activeFlow].title}
            </h3>
            
            <div className="space-y-3">
              {flows[activeFlow].steps.map((step, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-gray-400 to-gray-500 text-white flex items-center justify-center font-bold text-sm">
                    {idx + 1}
                  </div>
                  <div className="flex-1 bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-gray-900">{step.actor}</span>
                        <span className="text-gray-500 mx-2">→</span>
                        <span className="text-gray-700">{step.action}</span>
                      </div>
                      <div className="text-sm font-medium text-blue-600">
                        {step.target}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Key Mechanisms */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Collateral Management */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Lock className="text-orange-600" />
              Collateral Management
            </h3>
            <div className="space-y-3 text-sm">
              <div className="bg-orange-50 p-3 rounded">
                <div className="font-semibold mb-1">Locking Phase</div>
                <div className="text-gray-700">User approves vaultBTC → Core locks tokens → Records position</div>
              </div>
              <div className="bg-blue-50 p-3 rounded">
                <div className="font-semibold mb-1">Active Phase</div>
                <div className="text-gray-700">Collateral stays locked → Vault continues earning yields → Health monitored</div>
              </div>
              <div className="bg-green-50 p-3 rounded">
                <div className="font-semibold mb-1">Unlocking Phase</div>
                <div className="text-gray-700">Loan repaid → Collateral returned to user → Position closed</div>
              </div>
            </div>
          </div>

          {/* Health Factor System */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <AlertTriangle className="text-yellow-600" />
              Health Factor System
            </h3>
            <div className="space-y-3">
              <div className="bg-green-50 p-3 rounded border-l-4 border-green-500">
                <div className="font-semibold text-green-900">Healthy: ≥ 180%</div>
                <div className="text-sm text-green-700">Safe zone - collateral well above minimum</div>
              </div>
              <div className="bg-yellow-50 p-3 rounded border-l-4 border-yellow-500">
                <div className="font-semibold text-yellow-900">Warning: 120-180%</div>
                <div className="text-sm text-yellow-700">Approaching liquidation - add collateral recommended</div>
              </div>
              <div className="bg-red-50 p-3 rounded border-l-4 border-red-500">
                <div className="font-semibold text-red-900">Liquidatable: &lt; 120%</div>
                <div className="text-sm text-red-700">Can be liquidated - 10% penalty applies</div>
              </div>
              <div className="bg-gray-50 p-3 rounded mt-3 text-xs">
                <strong>Formula:</strong> Health = (Collateral Value × 100) / Debt
                <br />
                <strong>Example:</strong> 1 BTC at $65k, $30k debt = 216% health
              </div>
            </div>
          </div>
        </div>

        {/* Data Flow Summary */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Database className="text-purple-600" />
            Data Flow & Storage
          </h3>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">On-Chain State</h4>
              <ul className="text-sm space-y-1 text-gray-700">
                <li>• Loan records (struct)</li>
                <li>• Collateral amounts</li>
                <li>• Borrowed amounts</li>
                <li>• Interest rates</li>
                <li>• Timestamps</li>
                <li>• Health factors (calculated)</li>
              </ul>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">External Reads</h4>
              <ul className="text-sm space-y-1 text-gray-700">
                <li>• BTC price (Oracle)</li>
                <li>• Token balances (ERC20)</li>
                <li>• User approvals</li>
                <li>• Vault positions</li>
                <li>• LP pool state</li>
              </ul>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Events Emitted</h4>
              <ul className="text-sm space-y-1 text-gray-700">
                <li>• LoanCreated</li>
                <li>• LoanRepaid</li>
                <li>• LoanLiquidated</li>
                <li>• CollateralAdded</li>
                <li>• PriceUpdated</li>
                <li>• InterestRateUpdated</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>VaultSwap Protocol - Bitcoin Vault Liquidity Solution</p>
        </div>
      </div>
    </div>
  );
};

export default SystemArchitecture;