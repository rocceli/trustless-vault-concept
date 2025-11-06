import { mainnet, sepolia } from "@wagmi/core/chains";

export type VaultPosition = {
  vaultId: bigint;
  stakedAmount: bigint;
  yieldAccrued: bigint;
  lastYieldUpdate: bigint;
  lockTime: bigint;
  isActive: boolean;
};

export type Loan = {
    loanId: bigint;
    borrower: string;
    collateralAmount: string;
    borrowedAmount: bigint;
    interestRate: bigint;
    healthFactor?: bigint;
    accruedInterest?: bigint;
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