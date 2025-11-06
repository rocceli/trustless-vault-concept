import React from 'react';
import { Lock, TrendingUp, Coins, Shield, Zap, Users, ArrowRight, Check } from 'lucide-react';
import { useTypewriter } from '@/hooks/use-typewritter';
import AnimatedBackground from '../components/AnimatedBackground';

export default function IndexPage() {
    const text = useTypewriter([
        "Unlock Your Bitcoin's Potential",
        "Borrow Stablecoins Instantly",
        "Earn as a Liquidity Provider",
    ], { speed: 90, delayBetween: 1500 });
    const features = [
        {
        icon: <Lock className="w-6 h-6" />,
        title: "Secure BTC Vaults",
        description: "Lock your Bitcoin in trustless smart contracts with institutional-grade security"
        },
        {
        icon: <Coins className="w-6 h-6" />,
        title: "Instant Stablecoin Loans",
        description: "Borrow stablecoins against your BTC collateral without selling your assets"
        },
        {
        icon: <TrendingUp className="w-6 h-6" />,
        title: "Earn as a Liquidity Provider",
        description: "Provide stablecoins to earn competitive yields and protocol shares"
        },
        {
        icon: <Shield className="w-6 h-6" />,
        title: "Non-Custodial",
        description: "You maintain full control of your assets at all times"
        },
        {
        icon: <Zap className="w-6 h-6" />,
        title: "Lightning Fast",
        description: "Get loans in minutes with automated collateral management"
        },
        {
        icon: <Users className="w-6 h-6" />,
        title: "Community Governed",
        description: "Protocol decisions made by token holders and liquidity providers"
        }
    ];

    const stats = [
        { value: "$0M+", label: "Total Value Locked" },
        { value: "0+", label: "Active Vaults" },
        { value: "0%", label: "Average APY" },
        { value: "0+", label: "Liquidity Providers" }
    ];

    const howItWorks = [
        {
        step: "1",
        title: "BTC Holders: Create Vault",
        points: [
            "Connect your wallet and deposit Bitcoin",
            "Your BTC is secured in a trustless vault",
            "Borrow up to 50% LTV in stablecoins",
            "No credit checks, instant approval"
        ]
        },
        {
        step: "2",
        title: "Liquidity Providers: Earn Yield",
        points: [
            "Deposit stablecoins into liquidity pools",
            "Earn interest from borrowers",
            "Receive protocol share tokens",
            "Withdraw anytime with no lock-up"
        ]
        },
        {
        step: "3",
        title: "Everyone Wins",
        points: [
            "BTC holders unlock liquidity",
            "LPs earn competitive yields",
            "Automated risk management",
            "Transparent on-chain operations"
        ]
        }
    ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 relative">
      <AnimatedBackground />
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 dark:from-indigo-500/5 dark:via-purple-500/5 dark:to-pink-500/5" />
        
        <div className="relative mx-auto max-w-7xl">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-100 dark:bg-indigo-900/30 px-4 py-2 text-sm font-medium text-indigo-700 dark:text-indigo-300 mb-8">
              <Coins className="w-4 h-4" />
              Bitcoin-Powered DeFi
            </div>
            
            <h1 className="font-display text-5xl font-bold text-center">
                {text}
                <span className="animate-pulse text-indigo-600">|</span>
            </h1>
            
            <p className="font-sans text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-12 max-w-3xl mx-auto">
                Vault your BTC, borrow stablecoins, or earn yield as a liquidity provider. 
                The decentralized Bitcoin lending protocol that never sleeps.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-4 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2">
                Start Vaulting
                <ArrowRight className="w-5 h-5" />
              </button>
              
              <button className="bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-500 text-gray-900 dark:text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300">
                Become a Provider
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-4 py-16 bg-white dark:bg-gray-900 border-y border-gray-200 dark:border-gray-800">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-sm md:text-base text-gray-600 dark:text-gray-400">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-4 py-20 md:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose SatoshiLend?
            </h2>
            <p className="font-system-ui text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              The most secure and efficient way to leverage your Bitcoin holdings
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all duration-300 hover:shadow-xl"
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-500 flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-4 py-20 md:py-32 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Three simple pathways to maximize your crypto potential
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {howItWorks.map((item, index) => (
              <div 
                key={index}
                className="relative p-8 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300"
              >
                <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                  {item.step}
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 mt-2">
                  {item.title}
                </h3>
                
                <ul className="space-y-3">
                  {item.points.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600 dark:text-gray-400">
                        {point}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20 md:py-32">
        <div className="mx-auto max-w-4xl">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 to-purple-600 p-12 md:p-16 text-center">
            <div className="absolute inset-0 bg-grid-white/10" />
            
            <div className="relative">
              <h2 className="font-display text-3xl md:text-5xl font-bold text-white mb-6">
                Ready to Get Started?
              </h2>
              <p className="text-lg md:text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
                Join thousands of users already maximizing their Bitcoin holdings
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-white text-indigo-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2">
                  Open Vault
                  <ArrowRight className="w-5 h-5" />
                </button>
                
                <button className="bg-transparent border-2 border-white text-white hover:bg-white/10 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300">
                  Read Documentation
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-12 border-t border-gray-200 dark:border-gray-800">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <Coins className="h-6 w-6 text-indigo-600" />
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                SatoshiLend
              </span>
            </div>
            
            <div className="flex gap-8 text-sm text-gray-600 dark:text-gray-400">
              <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                Documentation
              </a>
              <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                GitHub
              </a>
              <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                Discord
              </a>
              <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                Twitter
              </a>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400">
              © 2024 SatoshiLend. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}