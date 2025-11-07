// walletconnectbtn.tsx
import {  Power, WalletMinimalIcon, Wallet2Icon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAccount, useDisconnect } from 'wagmi';
import { useEffect, useState } from 'react';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { useToast } from '@/components/ui/use-toast';

export const WalletButton = () => {
  const { isConnected, address } = useAccount();
  const { open } = useWeb3Modal();
  const { disconnect } = useDisconnect();
  const { toast } = useToast();

  const [isConnecting, setIsConnecting] = useState(false);
  const [_isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const truncateAddress = (addr?: string) =>
    addr ? `${addr.slice(0, 4)}...${addr.slice(-4)}` : "";

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      await open();
    } catch (err: any) {
      toast({
        title: 'Connection Failed',
        description: err?.message || 'Could not open wallet modal.',
        variant: 'destructive',
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    toast({ title: 'Disconnected', description: 'Wallet disconnected.' });
  };

  return (
    <>
      {!isConnected ? (
        <Button
          onClick={handleConnect}
          disabled={isConnecting}
          aria-label="Connect Wallet"
          className="relative bg-gradient-to-r from-indigo-600 to-purple-600 
                     hover:from-indigo-700 hover:to-purple-700 
                     dark:from-indigo-500 dark:to-purple-500 
                     dark:hover:from-indigo-600 dark:hover:to-purple-600
                     text-white shadow-md hover:shadow-lg 
                     transition-all duration-300 px-4 md:px-6 py-2 md:py-2.5 
                     text-sm md:text-base font-semibold rounded-lg group border-0
                     whitespace-nowrap"
        >
          <div className="flex items-center gap-2">
            <Wallet2Icon className="w-4 h-4 md:w-5 md:h-5 group-hover:scale-110 transition-transform duration-300" />
            <span className="hidden sm:inline">{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
            <span className="sm:hidden">{isConnecting ? 'Connect...' : 'Connect'}</span>
          </div>
        </Button>
      ) : (
        <Button
          onClick={handleDisconnect}
          aria-label="Disconnect Wallet"
          className="relative bg-gradient-to-r from-indigo-600 to-purple-600 
                     hover:from-indigo-700 hover:to-purple-700 
                     dark:from-indigo-500 dark:to-purple-500 
                     dark:hover:from-indigo-600 dark:hover:to-purple-600
                     text-white shadow-md hover:shadow-lg 
                     transition-all duration-300 px-2 sm:px-3 md:px-5 py-2 md:py-2.5 
                     rounded-lg group border-0"
        >
          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
            <WalletMinimalIcon className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
            <span className="font-mono text-xs sm:text-sm font-semibold text-white whitespace-nowrap">
              {truncateAddress(address)}
            </span>
            <Power className="w-3.5 h-3.5 md:w-4 md:h-4 text-white/80 group-hover:text-red-300 transition-colors flex-shrink-0" />
          </div>
        </Button>
      )}
    </>
  );
};