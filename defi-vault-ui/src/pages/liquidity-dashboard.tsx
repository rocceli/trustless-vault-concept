import { DashboardLayout } from "@/components/DashboardFrame";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { fCurrency, fNumber, fPercent, fProcessInput } from "@/lib/utils";
import { bitCoinHelper } from "@/utils/btcContract";
import { liquidPoolHelper } from "@/utils/liquidPoolContract";
import { stableCoinHelper } from "@/utils/stableCoinContract";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAccount } from "wagmi";

const mintEnabled = import.meta.env.VITE_MINT_FLAG === "true";

export default function LiquidityDashboardPage() {
  const { address, isConnected } = useAccount();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [lpBalance, setLpBalance] = useState<number | null>(null);
  const [lpValue, setLpValue] = useState<number | null>(null);
  const [totalDeposits, setTotalDeposits] = useState<number | null>(null);
  const [totalSupply, setTotalSupply] = useState<number | null>(null);
  const [stableBalance, setStableBalance] = useState<number | null>(null);
  const [btcBalance, setBtcBalance] = useState<number | null>(null);

  const [depositAmount, setDepositAmount] = useState< number | null>(0);
  const [withdrawShares, setWithdrawShares] = useState< number | null>(0);

  const [isDepositing, setIsDepositing] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [isMintingStable, setIsMintingStable] = useState(false);
  const [isMintingBtc, setIsMintingBtc] = useState(false);

const isLoading = loading || refreshing || !isConnected;

  const userSharePercentage = useMemo(() => {
    if (!lpBalance || !totalSupply || totalSupply === 0) return 0;
    return (Number(lpBalance) / Number(totalSupply)) * 100;
  }, [lpBalance, totalSupply]);

  const getErrorMessage = (error: unknown, fallback = "Please try again.") => {
    if (error instanceof Error && error.message) {
      return error.message;
    }
    if (typeof error === "string") {
      return error;
    }
    return fallback;
  };

  const loadPoolData = useCallback(async (withLoader = true) => {
    if (!address) return;

    if (withLoader) setLoading(true);
    else setRefreshing(true);

    try {
      const [balance, deposits, supply, stable, btc] = (await Promise.all([
        liquidPoolHelper.getBalance(address),
        liquidPoolHelper.getTotalDeposits(),
        liquidPoolHelper.getTotalSupply(),
        stableCoinHelper.getBalance(address),
        bitCoinHelper.getBalance(address),
      ])) as [string, string, string, number, number];

      setLpBalance(Number(balance));
      setTotalDeposits(Number(deposits));
      setTotalSupply(Number(supply));
      setStableBalance(stable);
      setBtcBalance(btc);

      if (Number(balance) > 0) {
        const shareValue = await liquidPoolHelper.getShareValue(Number(balance));
        setLpValue(Number(shareValue));
      } else {
        setLpValue(0);
      }
    } catch (error: unknown) {
      toast({
        title: "Unable to load pool data",
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
      loadPoolData();
    } else {
      setLpBalance(null);
      setLpValue(null);
      setTotalDeposits(null);
      setTotalSupply(null);
      setStableBalance(null);
      setBtcBalance(null);
    }
  }, [isConnected, address, loadPoolData]);

  const requireConnection = () => {
    if (!isConnected || !address) {
      toast({ title: "Connect wallet", description: "Please connect your wallet first." });
      return false;
    }
    return true;
  };

  const handleDeposit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!requireConnection()) return;

    const amount = fNumber(depositAmount);
    if (Number(amount)  <= 0) {
      toast({ title: "Enter amount", description: "Amount must be greater than zero." });
      return;
    }

    setIsDepositing(true);
    try {
      const allowance = await liquidPoolHelper.getStableCoinAllowance(address as `0x${string}`);

      if (allowance < BigInt(amount)) {
        // Step 1: Approve first
        await liquidPoolHelper.approveStableCoin(Number(amount));
        console.log("Approval successful!");
      }

      await liquidPoolHelper.deposit(Number(amount) );
      toast({
        title: "Deposit submitted",
        description: "Liquidity provision transaction submitted.",
      });
      await loadPoolData(false);
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

    const shares = fNumber(withdrawShares);
    if (Number(shares)  <= 0) {
      toast({ title: "Enter shares", description: "Shares must be greater than zero." });
      return;
    }

    setIsWithdrawing(true);
    try {
      await liquidPoolHelper.withdraw(Number(shares) );
      toast({ title: "Withdraw submitted", description: "LP token redemption submitted." });
      await loadPoolData(false);
      setWithdrawShares(0);
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

  const handleMintStable = async () => {
    if (!requireConnection()) return;
    if (!address) return;
    setIsMintingStable(true);
    try {
      await stableCoinHelper.mint(address, 1000);
      toast({ title: "Stablecoin minted", description: "Test stablecoins minted successfully." });
      await loadPoolData(false);
    } catch (error: unknown) {
      toast({
        title: "Mint failed",
        description: getErrorMessage(error, "Transaction rejected."),
        variant: "destructive",
      });
    } finally {
      setIsMintingStable(false);
    }
  };

  const handleMintBtc = async () => {
    if (!requireConnection()) return;
    if (!address) return;
    setIsMintingBtc(true);
    try {
      await bitCoinHelper.mint(address, 1);
      toast({ title: "BTC minted", description: "Test BTC minted successfully." });
      await loadPoolData(false);
    } catch (error: unknown) {
      toast({
        title: "Mint failed",
        description: getErrorMessage(error, "Transaction rejected."),
        variant: "destructive",
      });
    } finally {
      setIsMintingBtc(false);
    }
  };

  const stats = [
    {
      label: "Your LP Tokens",
      value: isLoading ? <Skeleton className="h-8 w-24" /> : `${fNumber(lpBalance)} vLP`,
      helper: "LP tokens currently owned by your wallet.",
    },
    {
      label: "LP Position Value",
      value: isLoading ? <Skeleton className="h-8 w-28" /> : `${fNumber(lpValue)} USD`,
      helper: "Estimated dollar value of your liquidity position.",
    },
    {
      label: "Pool TVL",
      value: isLoading ? <Skeleton className="h-8 w-20" /> : `${fCurrency(totalDeposits)}`,
      helper: "Total value currently provided to the pool.",
    },
    {
      label: "Your Share",
      value: isLoading ? <Skeleton className="h-8 w-24" /> : `${fPercent(userSharePercentage)}`,
      helper: "Percentage of the pool owned by you.",
    },
  ];

  return (
    <DashboardLayout
      title="Liquidity Dashboard"
      description="Provide stablecoin liquidity, monitor LP metrics, and manage pool exits."
      actions={
        mintEnabled && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleMintStable} disabled={isMintingStable || isLoading}>
              {isMintingStable ? "Minting..." : "Mint Stable"}
            </Button>
            <Button variant="outline" onClick={handleMintBtc} disabled={isMintingBtc || isLoading}>
              {isMintingBtc ? "Minting..." : "Mint BTC"}
            </Button>
          </div>
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
            <CardTitle className="text-xl">Provide Stablecoin Liquidity</CardTitle>
            <CardDescription>
              Deposit stable assets to earn protocol fees and BTC yield. Deposits issue LP tokens representing your share.
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
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Amount (USD stable)</label>
                  <Input
                    value={depositAmount?.toString()}
                    onChange={(event) => setDepositAmount(fProcessInput(event.target.value))}
                    placeholder="0.0"
                    inputMode="decimal"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Stable balance: {fCurrency(stableBalance)}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <Button type="submit" className="flex-1" disabled={isDepositing ||(depositAmount ?? 0) > ( stableBalance ?? 0)}>
                    {isDepositing ? "Submitting..." : "Deposit Liquidity"}
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => loadPoolData(false)} disabled={refreshing}>
                    {refreshing ? "Refreshing" : "Refresh"}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        <Card className="border-none bg-white shadow-sm dark:bg-gray-900">
          <CardHeader>
            <CardTitle className="text-xl">Redeem LP Shares</CardTitle>
            <CardDescription>
              Withdraw liquidity by burning LP tokens. You will receive both BTC and stablecoin outputs proportional to your share.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-32" />
              </div>
            ) : (
              <form onSubmit={handleWithdraw} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Shares (vLP)</label>
                  <Input
                    value={withdrawShares?.toString()}
                    onChange={(event) => setWithdrawShares(fProcessInput(event.target.value))}
                    placeholder="0.0"
                    inputMode="decimal"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Owned shares: {fNumber(lpBalance)} vLP
                  </p>
                </div>
                <Button type="submit" className="w-full" disabled={isWithdrawing || (withdrawShares ?? 0) > ( lpBalance ?? 0 )}>
                  {isWithdrawing ? "Processing..." : "Withdraw Liquidity"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </section>

      <section>
        <Card className="border-none bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-sky-500/10 shadow-inner dark:from-emerald-500/20 dark:via-teal-500/20 dark:to-sky-500/20">
          <CardHeader>
            <CardTitle className="text-lg">Pool Composition</CardTitle>
            <CardDescription>
              Understand asset mix and balances backing the liquidity pool.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg bg-white/80 p-4 dark:bg-gray-900/70">
              <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Stablecoin Balance</p>
              <div className="mt-1 text-lg font-semibold">
                {isLoading ? <Skeleton className="h-6 w-32" /> : `${fCurrency(stableBalance)}`}
              </div>
            </div>
            <div className="rounded-lg bg-white/80 p-4 dark:bg-gray-900/70">
              <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">BTC Balance</p>
              <div className="mt-1 text-lg font-semibold">
                {isLoading ? <Skeleton className="h-6 w-28" /> : `${fNumber(btcBalance)} BTC`}
              </div>
            </div>
            <div className="rounded-lg bg-white/80 p-4 dark:bg-gray-900/70">
              <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Pool Share</p>
              <div className="mt-1 text-lg font-semibold">
                {isLoading ? <Skeleton className="h-6 w-24" /> : `${fPercent(userSharePercentage)}`}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </DashboardLayout>
  );
}

