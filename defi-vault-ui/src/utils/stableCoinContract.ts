
import abi from '../abi.json';
import { getPublicClient , getWalletClient, switchChain } from "@wagmi/core";
import { formatUnits, parseUnits, type Address, type TransactionReceipt } from "viem";
import { config } from "@/lib/wagmi";
import { getChain } from './types';

const token = {
    address: import.meta.env.VITE_STABLE_COIN_CONTRACT,
    decimals: 6,
}

const getBalance = async( address: string ): Promise<number> =>{
;

    const publicClient = getPublicClient(config, { chainId: getChain().id }) ;
    const balance = await publicClient.readContract({
      address: token.address as Address,
      abi: abi.mockBtc,
      functionName: "balanceOf",
      args: [address],
    }as const) as bigint;

    return Number(formatUnits(balance, token.decimals));
}

const mint = async (address: string, amount: number = 100): Promise<TransactionReceipt> => {

  const walletClient = await getWalletClient(config);

  if (!walletClient) throw new Error("Wallet not connected");

  if (walletClient.chain.id !== getChain().id) {
    await switchChain(config, { chainId: getChain().id });
  }

  const amountInWei = parseUnits(amount.toString(), token.decimals);

  const hash = await walletClient.writeContract({
    address: token.address as Address,
    abi: abi.mockBtc,
    functionName: "mint",
    args: [address, amountInWei],
  });
  
  console.log("Transaction hash:", hash);
  const publicClient = getPublicClient(config, { chainId: getChain().id });
  const receipt = await publicClient.waitForTransactionReceipt({ hash });

  return receipt;
}


export const stableCoinHelper = {
    getBalance,
    mint
}