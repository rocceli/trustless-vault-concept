import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useAccount } from "wagmi";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { Wallet, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const ProtectedRoute: React.FC = () => {
  const { isConnected } = useAccount();
  const { open } = useWeb3Modal();

  useEffect(() => {
    if (!isConnected) {
      open();
    }
  }, [isConnected, open]);

  if (!isConnected) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-blue-950 dark:to-indigo-950">

        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -left-4 top-1/4 h-72 w-72 animate-pulse rounded-full bg-blue-400/20 blur-3xl dark:bg-blue-600/20" />
          <div className="absolute -right-4 bottom-1/4 h-72 w-72 animate-pulse rounded-full bg-indigo-400/20 blur-3xl delay-1000 dark:bg-indigo-600/20" />
          <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-purple-400/10 blur-3xl delay-500 dark:bg-purple-600/10" />
        </div>

        <div className="relative z-10 w-full max-w-md px-6">
          <div className="rounded-2xl border border-white/20 bg-white/60 p-8 shadow-2xl backdrop-blur-xl dark:border-gray-800/50 dark:bg-gray-900/60">
            <div className="mb-6 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 animate-ping rounded-full bg-blue-500/40 blur-md" />
                <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                  <Wallet className="h-10 w-10 text-white" strokeWidth={2} />
                </div>
              </div>
            </div>

            <h2 className="mb-2 text-center text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Wallet Required
            </h2>

            <p className="mb-6 text-center text-sm text-gray-600 dark:text-gray-400">
              Please connect your wallet to access this page and interact with the protocol.
            </p>

            <div className="mb-6 flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Opening wallet modal...</span>
            </div>

            <Button
              onClick={() => open()}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 font-semibold shadow-lg transition-all hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl"
              size="lg"
            >
              <Wallet className="mr-2 h-5 w-5" />
              Connect Wallet
            </Button>

            <p className="mt-4 text-center text-xs text-gray-500 dark:text-gray-600">
              Secure connection powered by Web3Modal
            </p>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;