// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "contract/vaultswapcore.sol";


contract VaultSwapLiquidityPool is ERC20, ReentrancyGuard, Ownable {
    
    IERC20 public stablecoin;
    VaultSwapCore public vaultSwap;
    
    uint256 public totalDeposits;
    uint256 public totalInterestEarned;
    
    event Deposited(address indexed provider, uint256 amount, uint256 shares);
    event Withdrawn(address indexed provider, uint256 amount, uint256 shares);
    event InterestDistributed(uint256 amount);
    
    constructor(
        address _stablecoin,
        address _vaultSwap
    ) ERC20("VaultSwap LP Token", "vsLP") Ownable(msg.sender) {
        stablecoin = IERC20(_stablecoin);
        vaultSwap = VaultSwapCore(_vaultSwap);
    }
    
    function deposit(uint256 amount) external nonReentrant returns (uint256) {
        require(amount > 0, "Amount must be > 0");
        
        uint256 shares;
        uint256 supply = totalSupply();
        
        if (supply == 0) {
            shares = amount;
        } else {
            shares = (amount * supply) / totalDeposits;
        }
        
        require(
            stablecoin.transferFrom(msg.sender, address(this), amount),
            "Transfer failed"
        );
        
        // Transfer to VaultSwap core for lending
        stablecoin.approve(address(vaultSwap), amount);
        stablecoin.transfer(address(vaultSwap), amount);
        
        totalDeposits += amount;
        _mint(msg.sender, shares);
        
        emit Deposited(msg.sender, amount, shares);
        return shares;
    }
    
    function withdraw(uint256 shares) external nonReentrant returns (uint256) {
        require(shares > 0, "Shares must be > 0");
        require(balanceOf(msg.sender) >= shares, "Insufficient shares");
        
        uint256 supply = totalSupply();
        uint256 amount = (shares * totalDeposits) / supply;
        
        _burn(msg.sender, shares);
        totalDeposits -= amount;


        require(
            vaultSwap.releaseToPool(amount),
            "Withdraw from core failed"
        );
        
        uint256 poolBalance = stablecoin.balanceOf(address(this));
        require(poolBalance >= amount, "Liquidity not received");

            
        require(
            stablecoin.transfer(msg.sender, amount),
            "Transfer failed"
        );
        
        emit Withdrawn(msg.sender, amount, shares);
        return amount;
    }
    
    function getShareValue(uint256 shares) external view returns (uint256) {
        uint256 supply = totalSupply();
        if (supply == 0) return 0;
        return (shares * totalDeposits) / supply;
    }
}