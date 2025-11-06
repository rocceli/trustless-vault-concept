import { config } from "@/lib/wagmi";
import { getPublicClient } from "@wagmi/core";
import { formatUnits } from "viem";
import abi from "@/abi.json";
import { getChain } from "./types";

const token = {
    address: import.meta.env.VITE_LIQUID_POOL_CONTRACT,
    decimals: 18
}


// -----------------------------------------------------------------------------
// 📘 READ FUNCTIONS
// -----------------------------------------------------------------------------

const getBalance = async(userAddress: string) => {
    const publicClient = getPublicClient(config, { chainId: getChain().id });

    const balance = await publicClient.readContract({
        address: token.address,
        abi: abi.vaultSwapCore,
        functionName: 'balanceOf',
        args: [userAddress]
    });

    const decimals = await publicClient.readContract({
        address: token.address,
        abi: abi.vaultSwapCore,
        functionName: 'decimals'
    });

    return formatUnits(balance as bigint, decimals as number);
}

// -----------------------------------------------------------------------------
// ⚙️ WRITE FUNCTIONS (require wallet)
// -----------------------------------------------------------------------------


export const liquidPoolHelper = {
    getBalance
}