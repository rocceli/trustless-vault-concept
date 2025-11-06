// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";


contract VaultBTC is ReentrancyGuard {
    IERC20 public immutable btcToken;
    
    struct VaultPosition {
        uint256 vaultId;
        uint256 stakedAmount;
        uint256 yieldAccrued;
        uint256 lastYieldUpdate;
        uint256 lockTime;
        bool isActive;
    }
    
    mapping(address => VaultPosition) public vaultPositions;
    uint256 public constant YIELD_RATE = 500; // 5% APY (500 basis points)
    uint256 public constant SECONDS_PER_YEAR = 365 days;
    
    event VaultCreated(address indexed user, uint256 vaultId, uint256 amount);
    event YieldAccrued(address indexed user, uint256 amount);
    event BTCWithdrawn(address indexed user, uint256 amount);
    
    constructor(address _btcToken) {
        btcToken = IERC20(_btcToken);
    }
    
    function depositBTC(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be > 0");
        require(btcToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        
        _updateYield(msg.sender);
        
        if (vaultPositions[msg.sender].isActive) {
            vaultPositions[msg.sender].stakedAmount += amount;
        } else {
            vaultPositions[msg.sender] = VaultPosition({
                vaultId: uint256(keccak256(abi.encodePacked(msg.sender, block.timestamp))),
                stakedAmount: amount,
                yieldAccrued: 0,
                lastYieldUpdate: block.timestamp,
                lockTime: block.timestamp,
                isActive: true
            });
        }
        
        emit VaultCreated(msg.sender, vaultPositions[msg.sender].vaultId, amount);
    }
    
    function withdrawBTC(uint256 amount) external nonReentrant {
        VaultPosition storage position = vaultPositions[msg.sender];
        require(position.isActive, "No active vault");
        require(amount <= position.stakedAmount, "Insufficient balance");
        
        _updateYield(msg.sender);
        
        position.stakedAmount -= amount;
        if (position.stakedAmount == 0) {
            position.isActive = false;
        }
        
        require(btcToken.transfer(msg.sender, amount), "Transfer failed");
        emit BTCWithdrawn(msg.sender, amount);
    }
    
    function claimYield() external nonReentrant {
        _updateYield(msg.sender);
        
        VaultPosition storage position = vaultPositions[msg.sender];
        uint256 yield = position.yieldAccrued;
        require(yield > 0, "No yield to claim");
        
        position.yieldAccrued = 0;
        require(btcToken.transfer(msg.sender, yield), "Transfer failed");
    }
    
    function _updateYield(address user) internal {
        VaultPosition storage position = vaultPositions[user];
        if (!position.isActive || position.stakedAmount == 0) return;
        
        uint256 timeElapsed = block.timestamp - position.lastYieldUpdate;
        uint256 yield = (position.stakedAmount * YIELD_RATE * timeElapsed) / (10000 * SECONDS_PER_YEAR);
        
        position.yieldAccrued += yield;
        position.lastYieldUpdate = block.timestamp;
        
        if (yield > 0) {
            emit YieldAccrued(user, yield);
        }
    }
    
    function getVaultPosition(address user) external view returns (VaultPosition memory) {
        return vaultPositions[user];
    }
    
    function getPendingYield(address user) external view returns (uint256) {
        VaultPosition memory position = vaultPositions[user];
        if (!position.isActive || position.stakedAmount == 0) return position.yieldAccrued;
        
        uint256 timeElapsed = block.timestamp - position.lastYieldUpdate;
        uint256 pendingYield = (position.stakedAmount * YIELD_RATE * timeElapsed) / (10000 * SECONDS_PER_YEAR);
        
        return position.yieldAccrued + pendingYield;
    }
}