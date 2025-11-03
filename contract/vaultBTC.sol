// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

// ============================================
// 1. VaultBTC Token (Mock for Ethereum Demo)
// ============================================

contract VaultBTC is ERC20, Ownable {
    struct VaultPosition {
        uint256 vaultId;
        uint256 stakedAmount;
        uint256 yieldAccrued;
        uint256 lockTime;
        uint256 unlockTime;
        bool isActive;
    }
    
    mapping(address => VaultPosition) public vaultPositions;
    
    event VaultCreated(address indexed user, uint256 vaultId, uint256 amount);
    event YieldAccrued(address indexed user, uint256 amount);
    
    constructor() ERC20("Vault Bitcoin", "vaultBTC") Ownable(msg.sender) {
        // Mint initial supply for testing
        _mint(msg.sender, 1000 * 10**decimals());
    }
    
    function createVaultPosition(
        address user,
        uint256 amount,
        uint256 lockDuration
    ) external onlyOwner {
        require(amount > 0, "Amount must be > 0");
        
        vaultPositions[user] = VaultPosition({
            vaultId: uint256(keccak256(abi.encodePacked(user, block.timestamp))),
            stakedAmount: amount,
            yieldAccrued: 0,
            lockTime: block.timestamp,
            unlockTime: block.timestamp + lockDuration,
            isActive: true
        });
        
        _mint(user, amount);
        emit VaultCreated(user, vaultPositions[user].vaultId, amount);
    }
    
    function accrueYield(address user, uint256 amount) external onlyOwner {
        require(vaultPositions[user].isActive, "No active vault");
        vaultPositions[user].yieldAccrued += amount;
        emit YieldAccrued(user, amount);
    }
    
    function getVaultPosition(address user) external view returns (VaultPosition memory) {
        return vaultPositions[user];
    }
}