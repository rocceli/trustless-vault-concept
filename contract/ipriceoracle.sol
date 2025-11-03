// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

interface IPriceOracle {
    function getPrice() external view returns (uint256);
    function decimals() external view returns (uint8);
}

contract MockPriceOracle is IPriceOracle, Ownable {
    uint256 private price;
    uint8 private _decimals;
    uint256 public lastUpdate;
    
    event PriceUpdated(uint256 newPrice, uint256 timestamp);
    
    constructor(uint256 initialPrice) Ownable(msg.sender) {
        price = initialPrice;
        _decimals = 8;
        lastUpdate = block.timestamp;
    }
    
    function getPrice() external view override returns (uint256) {
        require(block.timestamp - lastUpdate < 1 hours, "Price stale");
        return price;
    }
    
    function decimals() external view override returns (uint8) {
        return _decimals;
    }
    
    function updatePrice(uint256 newPrice) external onlyOwner {
        require(newPrice > 0, "Invalid price");
        price = newPrice;
        lastUpdate = block.timestamp;
        emit PriceUpdated(newPrice, block.timestamp);
    }
}
