// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract StrategyStorage is Ownable {
    // Mapping from wallet address to array of strategy URLs
    mapping(address => string[]) private walletStrategies;
    
    // Events
    event StrategyAdded(address in`dexed wallet, string strategyUrl);
    event StrategyRemoved(address indexed wallet, string strategyUrl);
    
    constructor() Ownable(msg.sender) {}
    
    /**
     * @dev Add a new strategy URL for a wallet
     * @param strategyUrl The Greenfield URL of the strategy
     */
    function addStrategy(string memory strategyUrl) external {
        require(bytes(strategyUrl).length > 0, "Strategy URL cannot be empty");
        walletStrategies[msg.sender].push(strategyUrl);
        emit StrategyAdded(msg.sender, strategyUrl);
    }
    
    /**
     * @dev Remove a strategy URL for a wallet
     * @param index The index of the strategy to remove
     */
    function removeStrategy(uint256 index) external {
        require(index < walletStrategies[msg.sender].length, "Invalid index");
        
        // Store the URL being removed for the event
        string memory removedUrl = walletStrategies[msg.sender][index];
        
        // Remove the strategy by shifting elements
        for (uint i = index; i < walletStrategies[msg.sender].length - 1; i++) {
            walletStrategies[msg.sender][i] = walletStrategies[msg.sender][i + 1];
        }
        walletStrategies[msg.sender].pop();
        
        emit StrategyRemoved(msg.sender, removedUrl);
    }
    
    /**
     * @dev Get all strategies for a wallet
     * @param wallet The address of the wallet
     * @return Array of strategy URLs
     */
    function getStrategies(address wallet) external view returns (string[] memory) {
        return walletStrategies[wallet];
    }
    
    /**
     * @dev Get the number of strategies for a wallet
     * @param wallet The address of the wallet
     * @return Number of strategies
     */
    function getStrategyCount(address wallet) external view returns (uint256) {
        return walletStrategies[wallet].length;
    }
}