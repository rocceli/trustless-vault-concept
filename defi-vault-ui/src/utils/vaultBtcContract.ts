import abi from '@/abi.json';
import { getPublicClient, getWalletClient, switchChain } from "@wagmi/core";
import { formatUnits, parseUnits, type Address, type TransactionReceipt } from "viem";
import { config } from "@/lib/wagmi";
import { getChain, type VaultPosition } from './types';

const token = {
    address: import.meta.env.VITE_VAULT_BTC_CONTRACT,
    decimals: 18,
}

// -----------------------------------------------------------------------------
// 📘 READ FUNCTIONS
// -----------------------------------------------------------------------------

const getVaultPosition = async (address: string): Promise<VaultPosition> => {
    const publicClient = getPublicClient(config, { chainId: getChain().id });

    const result = await publicClient.readContract({
        address: token.address as Address,
        abi: abi.vaultBtc,
        functionName: "getVaultPosition",
        args: [address],
    }) as VaultPosition;


    return {
        vaultId: result.vaultId,
        stakedAmount: result.stakedAmount,
        yieldAccrued: result.yieldAccrued,
        lastYieldUpdate: result.lastYieldUpdate,
        lockTime: result.lockTime,
        isActive: result.isActive,
    }
};

const getPendingYield = async (address: string): Promise<number> => {
    const publicClient = getPublicClient(config, { chainId: getChain().id });

    const pendingYield = await publicClient.readContract({
        address: token.address as Address,
        abi: abi.vaultBtc,
        functionName: "getPendingYield",
        args: [address],
    }) as bigint;

    return Number(formatUnits(pendingYield, token.decimals));
};

const getSecondsPerYear = async (): Promise<number> => {
    const chain = getChain();
    const publicClient = getPublicClient(config, { chainId: chain.id });

    const result = await publicClient.readContract({
        address: token.address as Address,
        abi: abi.vaultBtc,
        functionName: "SECONDS_PER_YEAR",
    }) as bigint;

    return Number(result);
};

const getYieldRate = async (): Promise<number> => {
    const chain = getChain();
    const publicClient = getPublicClient(config, { chainId: chain.id });

    const result = await publicClient.readContract({
        address: token.address as Address,
        abi: abi.vaultBtc,
        functionName: "YIELD_RATE",
    }) as bigint;

    return Number(formatUnits(result, token.decimals));
};

// -----------------------------------------------------------------------------
// ⚙️ WRITE FUNCTIONS (require wallet)
// -----------------------------------------------------------------------------

const claimYield = async (): Promise<TransactionReceipt> => {
    const walletClient = await getWalletClient(config);
    if (!walletClient) throw new Error("Wallet not connected");

    if (walletClient.chain.id !== getChain().id) {
        await switchChain(config, { chainId: getChain().id });
    }

    const hash = await walletClient.writeContract({
        address: token.address as Address,
        abi: abi.vaultBtc,
        functionName: "claimYield",
        args: [],
    });

    const publicClient = getPublicClient(config, { chainId: getChain().id });
    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    return receipt;
};

const depositBTC = async (amount: number): Promise<TransactionReceipt> => {
    const walletClient = await getWalletClient(config);
    if (!walletClient) throw new Error("Wallet not connected");

    if (walletClient.chain.id !== getChain().id) {
        await switchChain(config, { chainId: getChain().id });
    }

    const amountInWei = parseUnits(amount.toString(), token.decimals);

    const hash = await walletClient.writeContract({
        address: token.address as Address,
        abi: abi.vaultBtc,
        functionName: "depositBTC",
        args: [amountInWei],
    });

    const publicClient = getPublicClient(config, { chainId: getChain().id });
    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    return receipt;
};

const withdrawBTC = async (amount: number): Promise<TransactionReceipt> => {
    const walletClient = await getWalletClient(config);
    if (!walletClient) throw new Error("Wallet not connected");

    if (walletClient.chain.id !== getChain().id) {
        await switchChain(config, { chainId: getChain().id });
    }

    const amountInWei = parseUnits(amount.toString(), token.decimals);

    const hash = await walletClient.writeContract({
        address: token.address,
        abi: abi.vaultBtc,
        functionName: "withdrawBTC",
        args: [amountInWei],
    });

    const publicClient = getPublicClient(config, { chainId: getChain().id });
    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    return receipt;
}

export const vaultBitCoinHelper = {
    getVaultPosition,
    getPendingYield,
    claimYield,
    depositBTC,
    withdrawBTC,
    getSecondsPerYear,
    getYieldRate
}