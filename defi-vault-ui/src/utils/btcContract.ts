
import abi from '../abi.json';
import { getPublicClient , getWalletClient, switchChain } from "@wagmi/core";
import { formatUnits, parseUnits, type Address, type TransactionReceipt } from "viem";
import { config } from "@/lib/wagmi";
import { sepolia, mainnet } from "wagmi/chains";

const token = {
    address: import.meta.env.VITE_BTC_CONTRACT,
    decimals: 18,
}

const getBalance = async( address: string ): Promise<number> =>{

    const flag = import.meta.env.VITE_MINT_FLAG;

    const publicClient = getPublicClient(config, { chainId: flag === "true" ? sepolia.id : mainnet.id }) ;
    const balance = await publicClient.readContract({
      address: token.address as Address,
      abi: abi.mockBtc,
      functionName: "balanceOf",
      args: [address],
    }as const) as bigint;

    return Number(formatUnits(balance, token.decimals));
}

const mint = async (address: string, amount: number = 100): Promise<TransactionReceipt> => {
  const flag = import.meta.env.VITE_MINT_FLAG;
  const chain = flag === "true" ? sepolia : mainnet;

  const walletClient = await getWalletClient(config);

  if (!walletClient) throw new Error("Wallet not connected");

  if (walletClient.chain.id !== chain.id) {
    await switchChain(config, { chainId: chain.id });
  }

  const amountInWei = parseUnits(amount.toString(), token.decimals);

  const hash = await walletClient.writeContract({
    address: token.address as Address,
    abi: abi.mockBtc,
    functionName: "mint",
    args: [address, amountInWei],
  });
  
  console.log("Transaction hash:", hash);
  const publicClient = getPublicClient(config, { chainId: chain.id });
  const receipt = await publicClient.waitForTransactionReceipt({ hash });

  return receipt;
}

export const bitCoinHelper = {
    getBalance,
    mint
}