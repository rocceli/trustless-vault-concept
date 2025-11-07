import abi from '@/abi.json'
import { getChain, type Loan, type LoanDetailsTuple } from './types';
import { getPublicClient, getWalletClient, switchChain } from '@wagmi/core';
import { config } from '@/lib/wagmi';
import { formatUnits, type Address, parseEther, type TransactionReceipt } from "viem";

const token = {
    address: import.meta.env.VITE_SWAPCORE_CONTRACT,
}


// -----------------------------------------------------------------------------
// 📘 READ FUNCTIONS
// -----------------------------------------------------------------------------


const getConstants =async() => {
    const publicClient = getPublicClient(config, { chainId: getChain().id });

    const [basisPoints, collateralRatio, liquidationThreshold, liquidationPenalty, baseInterestRate] = 
      await Promise.all([
        publicClient.readContract({
          address: token.address,
          abi: abi.vaultSwapCore,
          functionName: 'BASIS_POINTS'
        }),
        publicClient.readContract({
          address: token.address,
          abi: abi.vaultSwapCore,
          functionName: 'COLLATERAL_RATIO'
        }),
        publicClient.readContract({
          address: token.address,
          abi: abi.vaultSwapCore,
          functionName: 'LIQUIDATION_THRESHOLD'
        }),
        publicClient.readContract({
          address: token.address,
          abi: abi.vaultSwapCore,
          functionName: 'LIQUIDATION_PENALTY'
        }),
        publicClient.readContract({
          address: token.address,
          abi: abi.vaultSwapCore,
          functionName: 'baseInterestRate'
        })
      ]);

    return {
      basisPoints: Number(basisPoints),
      collateralRatio: Number(collateralRatio),
      liquidationThreshold: Number(liquidationThreshold),
      liquidationPenalty: Number(liquidationPenalty),
      baseInterestRate: Number(baseInterestRate)
    };
}

const getProtocolStats = async() => {

    const publicClient = getPublicClient(config, { chainId: getChain().id });
    const [totalBorrowed, totalCollateral, loanIdCounter, isPaused] = 
      await Promise.all([
        publicClient.readContract({
          address: token.address,
          abi: abi.vaultSwapCore,
          functionName: 'totalBorrowed'
        }),
        publicClient.readContract({
          address: token.address,
          abi: abi.vaultSwapCore,
          functionName: 'totalCollateral'
        }),
        publicClient.readContract({
          address: token.address,
          abi: abi.vaultSwapCore,
          functionName: 'loanIdCounter'
        }),
        publicClient.readContract({
          address: token.address,
          abi: abi.vaultSwapCore,
          functionName: 'paused'
        })
      ]);

    return {
      totalBorrowed: formatUnits(totalBorrowed as bigint, 6),
      totalCollateral: formatUnits(totalCollateral as bigint, 18),
      totalLoans: Number(loanIdCounter),
      isPaused
    };
}

const getBTCPrice = async() => {
    const publicClient = getPublicClient(config, { chainId: getChain().id });

    const price = await publicClient.readContract({
        address: token.address,
        abi: abi.vaultSwapCore,
        functionName: 'getLatestPrice'
    });

    return Number(formatUnits(price as bigint, 8));
}

const getUserLoans = async(userAddress: Address) => {

    const publicClient = getPublicClient(config, { chainId: getChain().id });
    const loanIds = await publicClient.readContract({
        address: token.address,
        abi: abi.vaultSwapCore,
        functionName: 'getUserLoans',
        args: [userAddress]
    })  as readonly bigint[];

    return loanIds.map(id => Number(id));
}

const getLoanDetails = async (loanId: number): Promise<Loan> => {
    const publicClient = getPublicClient(config, { chainId: getChain().id });

    const details = await publicClient.readContract({
        address: token.address,
        abi: abi.vaultSwapCore,
        functionName: 'getLoanDetails',
        args: [BigInt(loanId)]
    })as LoanDetailsTuple;

    return {
        loanId: BigInt(loanId),
        borrower: details[0],
        collateralAmount: formatUnits(details[1], 18),
        borrowedAmount: details[2],
        interestRate: details[3],
        isActive: details[6]
    };
};


const getHealthFactor = async(loanId: number)=> {
    const publicClient = getPublicClient(config, { chainId: getChain().id });

    const health = await publicClient.readContract({
        address: token.address,
        abi: abi.vaultSwapCore,
        functionName: 'getHealthFactor',
        args: [BigInt(loanId)]
    });

    return Number(health);
}

const calculateInterest = async(loanId: number) => {
    const publicClient = getPublicClient(config, { chainId: getChain().id });

    const interest = await publicClient.readContract({
        address: token.address,
        abi: abi.vaultSwapCore,
        functionName: 'calculateInterest',
        args: [BigInt(loanId)]
    });

    return formatUnits(interest as bigint, 6);
}

const getMaxBorrowAmount=async(collateralAmount: string) => {
    const publicClient = getPublicClient(config, { chainId: getChain().id });

    const maxBorrow = await publicClient.readContract({
        address: token.address,
        abi: abi.vaultSwapCore,
        functionName: 'getMaxBorrowAmount',
        args: [parseEther(collateralAmount)]
    });

    return formatUnits(maxBorrow as bigint, 6);
}

// -----------------------------------------------------------------------------
// ⚙️ WRITE FUNCTIONS (require wallet)
// -----------------------------------------------------------------------------

const liquidate = async (loanId: number): Promise<TransactionReceipt> => {
  const walletClient = await getWalletClient(config);
  if (!walletClient) throw new Error("Wallet not connected");

  if (walletClient.chain.id !== getChain().id) {
      await switchChain(config, { chainId: getChain().id });
  }
  
  const hash = await walletClient.writeContract({
    address: token.address as Address,
    abi: abi.vaultSwapCore,
    functionName: "liquidate",
    args: [BigInt(loanId)],
  });

  const publicClient = getPublicClient(config, { chainId: getChain().id });
  const receipt = await publicClient.waitForTransactionReceipt({ hash });

  return receipt;
};

const borrow = async (collateralAmount: number, amount: number): Promise<TransactionReceipt> => {
  const walletClient = await getWalletClient(config);
  if (!walletClient) throw new Error("Wallet not connected");

  if (walletClient.chain.id !== getChain().id) {
      await switchChain(config, { chainId: getChain().id });
  }
  
  const hash = await walletClient.writeContract({
    address: token.address as Address,
    abi: abi.vaultSwapCore,
    functionName: "borrow",
    args: [BigInt(collateralAmount), BigInt(amount)],
  });

  const publicClient = getPublicClient(config, { chainId: getChain().id });
  const receipt = await publicClient.waitForTransactionReceipt({ hash });

  return receipt;
};

const repay = async (loanId: number): Promise<TransactionReceipt> => {
  const walletClient = await getWalletClient(config);
  if (!walletClient) throw new Error("Wallet not connected");

  if (walletClient.chain.id !== getChain().id) {
      await switchChain(config, { chainId: getChain().id });
  }
  
  const hash = await walletClient.writeContract({
    address: token.address as Address,
    abi: abi.vaultSwapCore,
    functionName: "repay",
    args: [ BigInt(loanId)],
  });

  const publicClient = getPublicClient(config, { chainId: getChain().id });
  const receipt = await publicClient.waitForTransactionReceipt({ hash });

  return receipt;
};

const addCollateral = async (loanId: number, amount: number): Promise<TransactionReceipt> => {
  const walletClient = await getWalletClient(config);
  if (!walletClient) throw new Error("Wallet not connected");

  if (walletClient.chain.id !== getChain().id) {
      await switchChain(config, { chainId: getChain().id });
  }

  const hash = await walletClient.writeContract({
    address: token.address as Address,
    abi: abi.vaultSwapCore,
    functionName: "addCollateral",
    args: [BigInt(loanId), BigInt(amount)],
  });

  const publicClient = getPublicClient(config, { chainId: getChain().id });
  const receipt = await publicClient.waitForTransactionReceipt({ hash });

  return receipt;
};


export const swapCoreHelper = {

    getConstants,
    getProtocolStats,
    getBTCPrice,
    getUserLoans,
    getLoanDetails,
    getHealthFactor,
    calculateInterest,
    getMaxBorrowAmount,
    liquidate,
    borrow,
    addCollateral,
    repay
}