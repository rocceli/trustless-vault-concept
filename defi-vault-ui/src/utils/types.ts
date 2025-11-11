import { toast } from "@/hooks/use-toast";
import { mainnet, sepolia } from "@wagmi/core/chains";
import { type TransactionReceipt } from "viem";

export type VaultPosition = {
  vaultId: bigint;
  stakedAmount: number;
  yieldAccrued: number;
  lastYieldUpdate: bigint;
  lockTime: bigint;
  isActive: boolean;
};

export type Loan = {
    loanId: bigint;
    borrower: string;
    collateralAmount: string;
    borrowedAmount: string;
    interestRate: string;
    healthFactor?: string;
    accruedInterest?: string;
    isActive: boolean;
};

export type LoanDetailsTuple = [
  string,   // borrower
  bigint,   // collateralAmount
  bigint,   // borrowedAmount
  bigint,   // interestRate
  bigint,   // healthFactor
  bigint,   // accruedInterest
  boolean   // isActive
];


export const getChain = () => import.meta.env.VITE_MINT_FLAG === "true" ? sepolia : mainnet;

export const safeWrite = async (fn: () => Promise<TransactionReceipt>) => {
  try {
    const receipt = await fn();
    return receipt;
  } catch (err: any) {
    toast({
      title: "Error Writing Transaction",
      description: err.shortMessage,
    });
    throw err;
  }
};

export const safeRead = async (fn: () => Promise<any>) => {
  try {
    const success = await fn();
    return success;
  } catch (err: any) {
    toast({
      title: "Error Reading State",
      description: err.shortMessage,
    });
    throw err;
  }
};
