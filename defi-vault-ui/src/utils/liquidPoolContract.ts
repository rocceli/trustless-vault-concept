import abi from '@/abi.json';
import { getPublicClient, getWalletClient, switchChain } from "@wagmi/core";
import { formatUnits, parseUnits, type Address, type TransactionReceipt } from "viem";
import { config } from "@/lib/wagmi";
import { getChain } from './types';

const pool = {
    address: import.meta.env.VITE_LIQUID_POOL_CONTRACT,
    decimals: 6, // LP token decimals
    stableDecimals: 6, // Stablecoin decimals (USDC)
}

// -----------------------------------------------------------------------------
// 📘 READ FUNCTIONS
// -----------------------------------------------------------------------------

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

const getTotalDeposits = async (): Promise<string> => {
    const publicClient = getPublicClient(config, { chainId: getChain().id });

    const deposits = await publicClient.readContract({
        address: pool.address as Address,
        abi: abi.vaultSwapLiquidPool,
        functionName: "totalDeposits",
    }) as bigint;

    return formatUnits(deposits, pool.stableDecimals);
};

const getTotalSupply = async (): Promise<string> => {
    const publicClient = getPublicClient(config, { chainId: getChain().id });

    const supply = await publicClient.readContract({
        address: pool.address as Address,
        abi: abi.vaultSwapLiquidPool,
        functionName: "totalSupply",
    }) as bigint;

    return formatUnits(supply, pool.stableDecimals);
};

const getShareValue = async (shares: number): Promise<string> => {
    const publicClient = getPublicClient(config, { chainId: getChain().id });

    const sharesInWei = parseUnits(shares.toString(), pool.decimals);

    const value = await publicClient.readContract({
        address: pool.address as Address,
        abi: abi.vaultSwapLiquidPool,
        functionName: "getShareValue",
        args: [sharesInWei],
    }) as bigint;

    return formatUnits(value, pool.stableDecimals);
};

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
        args: [amount],
    });

    const publicClient = getPublicClient(config, { chainId: getChain().id });
    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    return receipt;
};

const approveStableCoin = async (amount: bigint): Promise<TransactionReceipt> => {
    console.log("Approving stable");
    const walletClient = await getWalletClient(config);
    if (!walletClient) throw new Error("Wallet not connected");

    if (walletClient.chain.id !== getChain().id) {
        await switchChain(config, { chainId: getChain().id });
    }




    const hash = await  walletClient.writeContract({
        address: import.meta.env.VITE_STABLE_COIN_CONTRACT as Address,
        abi: abi.mockStableCoin,
        functionName: 'approve',
        args: [pool.address, amount],
    });


    const publicClient = getPublicClient(config, { chainId: getChain().id });
    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    return receipt;
};

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
        args: [sharesInWei],
    });

    const publicClient = getPublicClient(config, { chainId: getChain().id });
    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    return receipt;
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