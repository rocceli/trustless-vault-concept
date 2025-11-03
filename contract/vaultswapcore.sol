// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "contract/ipriceoracle.sol";

contract VaultSwapCore is ReentrancyGuard, Ownable, Pausable {
    
    struct Loan {
        uint256 loanId;
        address borrower;
        uint256 collateralAmount;
        uint256 borrowedAmount;
        uint256 interestRate; // basis points (550 = 5.5%)
        uint256 timestamp;
        uint256 lastInterestUpdate;
        bool isActive;
    }
    
    // State variables
    IERC20 public vaultBTC;
    IERC20 public stablecoin;
    IPriceOracle public priceOracle;
    
    uint256 public constant COLLATERAL_RATIO = 150; // 150% = 1.5x
    uint256 public constant LIQUIDATION_THRESHOLD = 120; // 120% = 1.2x
    uint256 public constant LIQUIDATION_PENALTY = 10; // 10%
    uint256 public constant BASIS_POINTS = 10000;
    
    uint256 public baseInterestRate = 550; // 5.5% APR in basis points
    uint256 public totalBorrowed;
    uint256 public totalCollateral;
    uint256 public loanIdCounter;
    
    mapping(uint256 => Loan) public loans;
    mapping(address => uint256[]) public userLoans;
    
    // Events
    event LoanCreated(
        uint256 indexed loanId,
        address indexed borrower,
        uint256 collateralAmount,
        uint256 borrowedAmount
    );
    
    event LoanRepaid(
        uint256 indexed loanId,
        address indexed borrower,
        uint256 totalRepaid,
        uint256 interestPaid
    );
    
    event LoanLiquidated(
        uint256 indexed loanId,
        address indexed liquidator,
        uint256 collateralSeized,
        uint256 penalty
    );
    
    event CollateralAdded(uint256 indexed loanId, uint256 amount);
    event InterestRateUpdated(uint256 newRate);
    
    constructor(
        address _vaultBTC,
        address _stablecoin,
        address _priceOracle
    ) Ownable(msg.sender) {
        require(_vaultBTC != address(0), "Invalid vaultBTC");
        require(_stablecoin != address(0), "Invalid stablecoin");
        require(_priceOracle != address(0), "Invalid oracle");
        
        vaultBTC = IERC20(_vaultBTC);
        stablecoin = IERC20(_stablecoin);
        priceOracle = IPriceOracle(_priceOracle);
    }
    
    // ============================================
    // Core Functions
    // ============================================
    
    function borrow(
        uint256 collateralAmount,
        uint256 borrowAmount
    ) external nonReentrant whenNotPaused returns (uint256) {
        require(collateralAmount > 0, "Collateral must be > 0");
        require(borrowAmount > 0, "Borrow amount must be > 0");
        
        // Check if user has enough vaultBTC
        require(
            vaultBTC.balanceOf(msg.sender) >= collateralAmount,
            "Insufficient vaultBTC balance"
        );
        
        // Check collateral ratio
        uint256 maxBorrow = getMaxBorrowAmount(collateralAmount);
        require(borrowAmount <= maxBorrow, "Insufficient collateral");
        
        // Check pool liquidity
        require(
            stablecoin.balanceOf(address(this)) >= borrowAmount,
            "Insufficient liquidity"
        );
        
        // Transfer collateral from user
        require(
            vaultBTC.transferFrom(msg.sender, address(this), collateralAmount),
            "Collateral transfer failed"
        );
        
        // Create loan
        loanIdCounter++;
        uint256 loanId = loanIdCounter;
        
        loans[loanId] = Loan({
            loanId: loanId,
            borrower: msg.sender,
            collateralAmount: collateralAmount,
            borrowedAmount: borrowAmount,
            interestRate: baseInterestRate,
            timestamp: block.timestamp,
            lastInterestUpdate: block.timestamp,
            isActive: true
        });
        
        userLoans[msg.sender].push(loanId);
        totalBorrowed += borrowAmount;
        totalCollateral += collateralAmount;
        
        // Transfer stablecoin to borrower
        require(
            stablecoin.transfer(msg.sender, borrowAmount),
            "Borrow transfer failed"
        );
        
        emit LoanCreated(loanId, msg.sender, collateralAmount, borrowAmount);
        
        return loanId;
    }
    
    function repay(uint256 loanId) external nonReentrant {
        Loan storage loan = loans[loanId];
        require(loan.isActive, "Loan not active");
        require(loan.borrower == msg.sender, "Not loan owner");
        
        // Calculate total amount to repay (principal + interest)
        uint256 interest = calculateInterest(loanId);
        uint256 totalRepay = loan.borrowedAmount + interest;
        
        // Transfer stablecoin from borrower
        require(
            stablecoin.transferFrom(msg.sender, address(this), totalRepay),
            "Repayment transfer failed"
        );
        
        // Return collateral to borrower
        require(
            vaultBTC.transfer(msg.sender, loan.collateralAmount),
            "Collateral return failed"
        );
        
        // Update state
        totalBorrowed -= loan.borrowedAmount;
        totalCollateral -= loan.collateralAmount;
        loan.isActive = false;
        
        emit LoanRepaid(loanId, msg.sender, totalRepay, interest);
    }
    
    function liquidate(uint256 loanId) external nonReentrant {
        Loan storage loan = loans[loanId];
        require(loan.isActive, "Loan not active");
        
        // Check if loan is underwater
        uint256 healthFactor = getHealthFactor(loanId);
        require(healthFactor < LIQUIDATION_THRESHOLD, "Loan not liquidatable");
        
        // Calculate liquidation amounts
        uint256 debtWithInterest = loan.borrowedAmount + calculateInterest(loanId);
        uint256 penalty = (loan.collateralAmount * LIQUIDATION_PENALTY) / 100;
        uint256 collateralToLiquidator = loan.collateralAmount - penalty;
        
        // Transfer debt from liquidator
        require(
            stablecoin.transferFrom(msg.sender, address(this), debtWithInterest),
            "Liquidation payment failed"
        );
        
        // Transfer collateral to liquidator
        require(
            vaultBTC.transfer(msg.sender, collateralToLiquidator),
            "Collateral transfer failed"
        );
        
        // Update state
        totalBorrowed -= loan.borrowedAmount;
        totalCollateral -= loan.collateralAmount;
        loan.isActive = false;
        
        emit LoanLiquidated(loanId, msg.sender, collateralToLiquidator, penalty);
    }
    
    function addCollateral(uint256 loanId, uint256 amount) external nonReentrant {
        Loan storage loan = loans[loanId];
        require(loan.isActive, "Loan not active");
        require(loan.borrower == msg.sender, "Not loan owner");
        require(amount > 0, "Amount must be > 0");
        
        // Transfer additional collateral
        require(
            vaultBTC.transferFrom(msg.sender, address(this), amount),
            "Collateral transfer failed"
        );
        
        loan.collateralAmount += amount;
        totalCollateral += amount;
        
        emit CollateralAdded(loanId, amount);
    }
    
    // ============================================
    // View Functions
    // ============================================
    
    function getHealthFactor(uint256 loanId) public view returns (uint256) {
        Loan memory loan = loans[loanId];
        if (!loan.isActive) return 0;
        
        uint256 btcPrice = priceOracle.getPrice();
        uint256 collateralValue = (loan.collateralAmount * btcPrice) / 10**8;
        uint256 debtWithInterest = loan.borrowedAmount + calculateInterest(loanId);
        
        if (debtWithInterest == 0) return type(uint256).max;
        
        return (collateralValue * 100) / debtWithInterest;
    }
    
    function calculateInterest(uint256 loanId) public view returns (uint256) {
        Loan memory loan = loans[loanId];
        if (!loan.isActive) return 0;
        
        uint256 timeElapsed = block.timestamp - loan.lastInterestUpdate;
        uint256 yearlyInterest = (loan.borrowedAmount * loan.interestRate) / BASIS_POINTS;
        uint256 interest = (yearlyInterest * timeElapsed) / 365 days;
        
        return interest;
    }
    
    function getMaxBorrowAmount(uint256 collateralAmount) public view returns (uint256) {
        uint256 btcPrice = priceOracle.getPrice();
        uint256 collateralValue = (collateralAmount * btcPrice) / 10**8;
        return (collateralValue * 100) / COLLATERAL_RATIO;
    }
    
    function getUserLoans(address user) external view returns (uint256[] memory) {
        return userLoans[user];
    }
    
    function getLoanDetails(uint256 loanId) external view returns (
        address borrower,
        uint256 collateralAmount,
        uint256 borrowedAmount,
        uint256 interestRate,
        uint256 healthFactor,
        uint256 accruedInterest,
        bool isActive
    ) {
        Loan memory loan = loans[loanId];
        return (
            loan.borrower,
            loan.collateralAmount,
            loan.borrowedAmount,
            loan.interestRate,
            getHealthFactor(loanId),
            calculateInterest(loanId),
            loan.isActive
        );
    }
    
    // ============================================
    // Admin Functions
    // ============================================
    
    function setInterestRate(uint256 newRate) external onlyOwner {
        require(newRate <= 2000, "Rate too high"); // Max 20%
        baseInterestRate = newRate;
        emit InterestRateUpdated(newRate);
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        require(IERC20(token).transfer(owner(), amount), "Withdraw failed");
    }
}