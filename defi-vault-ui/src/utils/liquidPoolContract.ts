import abi from '@/abi.json';
import { getPublicClient, getWalletClient, switchChain } from "@wagmi/core";
import { formatUnits, parseUnits, type Address, type TransactionReceipt } from "viem";
import { config } from "@/lib/wagmi";
import { getChain } from './types';

const pool = {
    address: import.meta.env.VITE_LIQUID_POOL_CONTRACT,
    decimals: 18, // LP token decimals
    stableDecimals: 6, // Stablecoin decimals (USDC)
}

// -----------------------------------------------------------------------------
// 📘 READ FUNCTIONS
// -----------------------------------------------------------------------------

/**
 * Get user's LP token balance
 * @returns Balance formatted with LP token decimals (18)
 */
const getBalance = async (address: string): Promise<string> => {
    const publicClient = getPublicClient(config, { chainId: getChain().id });

    const balance = await publicClient.readContract({
        address: pool.address as Address,
        abi: abi.vaultSwapLiquidPool,
        functionName: "balanceOf",
        args: [address],
    }) as bigint;

    return formatUnits(balance, pool.decimals);
};

/**
 * Get total deposits in the pool
 * @returns Total deposits formatted with stablecoin decimals (6)
 */
const getTotalDeposits = async (): Promise<string> => {
    const publicClient = getPublicClient(config, { chainId: getChain().id });

    const deposits = await publicClient.readContract({
        address: pool.address as Address,
        abi: abi.vaultSwapLiquidPool,
        functionName: "totalDeposits",
    }) as bigint;

    return formatUnits(deposits, pool.stableDecimals); // Total deposits in stablecoin
};

/**
 * Get total LP token supply
 * @returns Total supply formatted with LP token decimals (18)
 */
const getTotalSupply = async (): Promise<string> => {
    const publicClient = getPublicClient(config, { chainId: getChain().id });

    const supply = await publicClient.readContract({
        address: pool.address as Address,
        abi: abi.vaultSwapLiquidPool,
        functionName: "totalSupply",
    }) as bigint;

    return formatUnits(supply, pool.decimals); // LP supply has 18 decimals
};

/**
 * Get the stablecoin value of LP shares
 * @param shares Number of LP tokens (in human-readable format)
 * @returns Value in stablecoins (formatted with 6 decimals)
 */
const getShareValue = async (shares: number): Promise<string> => {
    const publicClient = getPublicClient(config, { chainId: getChain().id });

    // Parse shares with LP token decimals (18)
    const sharesInWei = parseUnits(shares.toString(), pool.decimals);

    const value = await publicClient.readContract({
        address: pool.address as Address,
        abi: abi.vaultSwapLiquidPool,
        functionName: "getShareValue",
        args: [sharesInWei],
    }) as bigint;

    // Value is returned in stablecoin decimals (6)
    return formatUnits(value, pool.stableDecimals);
};

/**
 * Get stablecoin allowance for the pool contract
 */
const getStableCoinAllowance = async (address: string): Promise<bigint> => {
    const publicClient = getPublicClient(config, { chainId: getChain().id });

    const allowance = await publicClient.readContract({
        address: import.meta.env.VITE_STABLE_COIN_CONTRACT as Address,
        abi: abi.mockStableCoin,
        functionName: 'allowance',
        args: [address, pool.address],
    });

    return allowance as bigint;
};

// -----------------------------------------------------------------------------
// ⚙️ WRITE FUNCTIONS (require wallet)
// -----------------------------------------------------------------------------

/**
 * Deposit stablecoins to receive LP tokens
 * @param amount Amount in stablecoin decimals (6) as bigint
 */
const deposit = async (amount: bigint): Promise<TransactionReceipt> => {
    const walletClient = await getWalletClient(config);
    if (!walletClient) throw new Error("Wallet not connected");

    if (walletClient.chain.id !== getChain().id) {
        await switchChain(config, { chainId: getChain().id });
    }

    const hash = await walletClient.writeContract({
        address: pool.address as Address,
        abi: abi.vaultSwapLiquidPool,
        functionName: "deposit",
        args: [amount], // Amount in stablecoin decimals (6)
    });

    const publicClient = getPublicClient(config, { chainId: getChain().id });
    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    return receipt;
};

/**
 * Approve stablecoin spending for the pool contract
 */
const approveStableCoin = async (amount: bigint): Promise<TransactionReceipt> => {
    const walletClient = await getWalletClient(config);
    if (!walletClient) throw new Error("Wallet not connected");

    if (walletClient.chain.id !== getChain().id) {
        await switchChain(config, { chainId: getChain().id });
    }

    const hash = await walletClient.writeContract({
        address: import.meta.env.VITE_STABLE_COIN_CONTRACT as Address,
        abi: abi.mockStableCoin,
        functionName: 'approve',
        args: [pool.address, amount],
    });

    const publicClient = getPublicClient(config, { chainId: getChain().id });
    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    return receipt;
};

/**
 * Withdraw liquidity by burning LP tokens
 * @param shares Number of LP tokens to burn (in human-readable format)
 */
const withdraw = async (shares: number): Promise<TransactionReceipt> => {
    const walletClient = await getWalletClient(config);
    if (!walletClient) throw new Error("Wallet not connected");

    if (walletClient.chain.id !== getChain().id) {
        await switchChain(config, { chainId: getChain().id });
    }

    const sharesInWei = parseUnits(shares.toString(), pool.decimals);

    const hash = await walletClient.writeContract({
        address: pool.address as Address,
        abi: abi.vaultSwapLiquidPool,
        functionName: "withdraw",
        args: [sharesInWei], // Shares in LP token decimals (18)
    });

    const publicClient = getPublicClient(config, { chainId: getChain().id });
    return await publicClient.waitForTransactionReceipt({ hash });
};

export const liquidPoolHelper = {
    getBalance,
    getStableCoinAllowance,
    getTotalDeposits,
    getTotalSupply,
    getShareValue,
    deposit,
    withdraw,
    approveStableCoin
}