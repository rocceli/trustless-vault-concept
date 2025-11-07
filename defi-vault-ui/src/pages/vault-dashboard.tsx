import { DashboardLayout } from "@/components/DashboardFrame";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { bitCoinHelper } from "@/utils/btcContract";
import { vaultBitCoinHelper } from "@/utils/vaultBtcContract";
import { safeRead, type VaultPosition } from "@/utils/types";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { fNumber, fProcessInput } from "@/lib/utils";

const mintEnabled = import.meta.env.VITE_MINT_FLAG === "true";


export default function VaultDashboardPage() {
  const { address, isConnected } = useAccount();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [btcBalance, setBtcBalance] = useState<number | null>(null);
  const [pendingYield, setPendingYield] = useState<number | null>(null);
  const [position, setPosition] = useState<VaultPosition | null>(null);

  const [depositAmount, setDepositAmount] = useState<number | null>(0);
  const [withdrawAmount, setWithdrawAmount] = useState<number | null>(0);

  const [isDepositing, setIsDepositing] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [isMinting, setIsMinting] = useState(false);

  const isLoading = loading || refreshing || !isConnected;

  const stakedAmount = useMemo(() => position?.stakedAmount ?? 0, [position]);

  const lifetimeYield = useMemo(() => position?.yieldAccrued ?? 0, [position]);

  const vaultIdDisplay = position?.vaultId !== undefined && position?.vaultId !== null
    ? position.vaultId.toString().length > 10
      ? `${position.vaultId.toString().slice(0, 4)}...e${position.vaultId.toString().length - 1}`
      : position.vaultId.toString()
    : "-";

  const lockStatus =
    position?.isActive === undefined ? "-" : position.isActive ? "Active" : "Inactive";
  const lastYieldUpdateDisplay = position?.lastYieldUpdate
    ? new Date(Number(position.lastYieldUpdate) * 1000).toLocaleString()
    : "-";

  const getErrorMessage = (error: unknown, fallback = "Please try again.") => {
    if (error instanceof Error && error.message) {
      return error.message;
    }
    if (typeof error === "string") {
      return error;
    }
    return fallback;
  };

  const loadVaultData = useCallback(async (withLoader = true) => {
    if (!address) return;

    if (withLoader) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    try {
      const [walletBalance, 
        vaultPosition, 
        pending
      ] = (await Promise.all([
        safeRead(()=> bitCoinHelper.getBalance(address)),
        safeRead(()=>vaultBitCoinHelper.getVaultPosition(address)),
        safeRead(()=>vaultBitCoinHelper.getPendingYield(address)),
      ])) as [number
        , VaultPosition
        ,number
        ];

      setPosition(vaultPosition);
      setBtcBalance(walletBalance);
      setPendingYield(pending);
      
    } catch (error: unknown) {
      toast({
        title: "Unable to load vault data",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [address, toast]);

  useEffect(() => {
    if (isConnected && address) {
      loadVaultData();
    } else {
      setBtcBalance(null);
      setPendingYield(null);
      setPosition(null);
    }
  }, [isConnected, address, loadVaultData]);

  const requireConnection = () => {
    if (!isConnected || !address) {
      toast({
        title: "Connect wallet",
        description: "Please connect your wallet to continue.",
      });
      return false;
    }
    return true;
  };

  const handleDeposit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!requireConnection()) return;

    const amount = fNumber(depositAmount);
    if (Number(amount) <= 0) {
      toast({ title: "Enter amount", description: "Amount must be greater than zero." });
      return;
    }

    setIsDepositing(true);
    try {
      const allowance = await vaultBitCoinHelper.getBtcAllowance(address as `0x${string}`);
      
      if (allowance < BigInt(amount)) {
        console.log("Depositing to vault");
        await vaultBitCoinHelper.approveBitCoin(Number(amount));
      }
      
      await vaultBitCoinHelper.depositBTC(Number(amount) );
      toast({ title: "Deposit submitted", description: "Your BTC is being committed to the vault." });
      await loadVaultData(false);
      setDepositAmount(0);
    } catch (error: unknown) {
      toast({
        title: "Deposit failed",
        description: getErrorMessage(error, "Transaction rejected."),
        variant: "destructive",
      });
    } finally {
      setIsDepositing(false);
    }
  };

  const handleWithdraw = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!requireConnection()) return;

    const amount = fNumber(withdrawAmount);
    if (Number(amount)  <= 0) {
      toast({ title: "Enter amount", description: "Amount must be greater than zero." });
      return;
    }

    setIsWithdrawing(true);
    try {
      await vaultBitCoinHelper.withdrawBTC(Number(amount) );
      toast({ title: "Withdraw submitted", description: "Vault withdrawal initiated." });
      await loadVaultData(false);
      setWithdrawAmount(0);
    } catch (error: unknown) {
      toast({
        title: "Withdraw failed",
        description: getErrorMessage(error, "Transaction rejected."),
        variant: "destructive",
      });
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleClaimYield = async () => {
    if (!requireConnection()) return;

    setIsClaiming(true);
    try {
      await vaultBitCoinHelper.claimYield();
      toast({ title: "Yield claimed", description: "Rewards claimed successfully." });
      await loadVaultData(false);
    } catch (error: unknown) {
      toast({
        title: "Claim failed",
        description: getErrorMessage(error, "Transaction rejected."),
        variant: "destructive",
      });
    } finally {
      setIsClaiming(false);
    }
  };

  const handleMint = async () => {
    if (!requireConnection()) return;
    if (!address) return;

    setIsMinting(true);
    try {
      await bitCoinHelper.mint(address, 100);
      toast({ title: "Mint request sent", description: "Test BTC mint transaction submitted." });
      await loadVaultData(false);
    } catch (error: unknown) {
      toast({
        title: "Mint failed",
        description: getErrorMessage(error, "Transaction rejected."),
        variant: "destructive",
      });
    } finally {
      setIsMinting(false);
    }
  };

  const stats = [
    {
      label: "Vault BTC Balance",
      value: isLoading ? <Skeleton className="h-8 w-32" /> : `${fNumber(stakedAmount)} BTC`,
      helper: "Total BTC currently committed to the vault.",
    },
    {
      label: "Wallet BTC",
      value: isLoading ? <Skeleton className="h-8 w-28" /> : `${fNumber(btcBalance)} BTC`,
      helper: "Wallet balance available to commit.",
    },
    {
      label: "Staked Principal",
      value: isLoading ? <Skeleton className="h-8 w-24" /> : `${fNumber(stakedAmount)} BTC`,
      helper: "Underlying BTC currently locked in the vault.",
    },
    {
      label: "Pending Yield",
      value: isLoading ? <Skeleton className="h-8 w-24" /> : `${fNumber(pendingYield)} BTC`,
      helper: "Unclaimed rewards ready to harvest.",
    },
    {
      label: "Lifetime Yield",
      value: isLoading ? <Skeleton className="h-8 w-24" /> : `${fNumber(lifetimeYield)} BTC`,
      helper: "Aggregate rewards that have accrued over time.",
    },
  ];

  return (
    <DashboardLayout
      title="Vault Dashboard"
      description="Commit wrapped BTC, manage your vault position, and harvest automated yield."
      actions={
        mintEnabled && (
          <Button disabled={isMinting || isLoading} variant="outline" onClick={handleMint}>
            {isMinting ? "Minting..." : "Mint Test BTC"}
          </Button>
        )
      }
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-none bg-white/70 shadow-sm backdrop-blur dark:bg-gray-900/60">
            <CardHeader className="pb-2">
              <CardDescription>{stat.label}</CardDescription>
              <CardTitle className="text-3xl font-semibold">{stat.value}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 text-sm text-gray-500 dark:text-gray-400">
              {stat.helper}
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="border-none bg-white shadow-sm dark:bg-gray-900">
          <CardHeader>
            <CardTitle className="text-xl">Commit BTC to Vault</CardTitle>
            <CardDescription>
              Lock BTC into the program to start earning automated yield. Funds convert into vault tokens representing your position.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-28" />
              </div>
            ) : (
              <form onSubmit={handleDeposit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Amount (BTC)</label>
                  <Input
                    value={depositAmount?.toString()}
                    onChange={(event) => setDepositAmount(fProcessInput(event.target.value))}
                    placeholder="0.0"
                    inputMode="decimal"
                    max={fNumber(btcBalance)}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Available: {fNumber(btcBalance)} BTC
                  </p>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <Button type="submit" className="flex-1" disabled={isDepositing}>
                    {isDepositing ? "Submitting..." : "Commit to Vault"}
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => loadVaultData(false)} disabled={refreshing}>
                    {refreshing ? "Refreshing" : "Refresh"}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        <Card className="border-none bg-white shadow-sm dark:bg-gray-900">
          <CardHeader>
            <CardTitle className="text-xl">Withdraw or Claim Yield</CardTitle>
            <CardDescription>
              Redeem principal back to your wallet or claim accrued rewards without touching your stake.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-32" />
              </div>
            ) : (
              <form onSubmit={handleWithdraw} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Withdraw Amount (BTC)</label>
                  <Input
                    value={withdrawAmount?.toString()}
                    onChange={(event) => setWithdrawAmount(fProcessInput(event.target.value))}
                    placeholder="0.0"
                    inputMode="decimal"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Staked: {fNumber(stakedAmount)} BTC
                  </p>
                </div>
                <Button type="submit" disabled={isWithdrawing} className="w-full">
                  {isWithdrawing ? "Processing..." : "Withdraw from Vault"}
                </Button>
              </form>
            )}

            <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/60">
              <div className="flex flex-col gap-2">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-200">Pending Yield</div>
                <div className="text-2xl font-semibold">
                  {isLoading ? <Skeleton className="h-6 w-32" /> : `${fNumber(pendingYield)} BTC`}
                </div>
                <Button onClick={handleClaimYield} disabled={isLoading || isClaiming || !pendingYield || pendingYield === 0}>
                  {isClaiming ? "Claiming..." : "Claim Yield"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section>
        <Card className="border-none bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-sky-500/10 shadow-inner dark:from-indigo-500/20 dark:via-purple-500/20 dark:to-sky-500/20">
          <CardHeader>
            <CardTitle className="text-lg">Vault Health</CardTitle>
            <CardDescription>
              Track critical metrics around lock duration and reward cadence for your position.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg bg-white/70 p-4 dark:bg-gray-900/70">
              <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Vault ID</p>
              <div className="mt-1 text-lg font-semibold">
                {isLoading ? <Skeleton className="h-6 w-24" /> : vaultIdDisplay}
              </div>
            </div>
            <div className="rounded-lg bg-white/70 p-4 dark:bg-gray-900/70">
              <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Lock Status</p>
              <div className="mt-1 text-lg font-semibold">
                {isLoading ? <Skeleton className="h-6 w-24" /> : lockStatus}
              </div>
            </div>
            <div className="rounded-lg bg-white/70 p-4 dark:bg-gray-900/70">
              <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Last Yield Update</p>
              <div className="mt-1 text-lg font-semibold">
                {isLoading ? <Skeleton className="h-6 w-32" /> : lastYieldUpdateDisplay}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </DashboardLayout>
  );
}

