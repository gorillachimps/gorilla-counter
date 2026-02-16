// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title GorillaCounter - A gorilla-themed counter on Base
/// @notice Each "chest beat" increments the counter. Track your gorilla power!
contract GorillaCounter {
    uint256 public chestBeats;
    address public alphaGorilla;
    uint256 public alphaBeats;

    mapping(address => uint256) public gorillaBeats;
    mapping(address => string) public gorillaNames;

    event ChestBeaten(address indexed gorilla, uint256 totalBeats, string name);
    event AlphaChanged(address indexed newAlpha, uint256 beats);
    event GorillaRenamed(address indexed gorilla, string newName);

    constructor() {
        chestBeats = 0;
    }

    /// @notice Beat your chest! Increments both the global and your personal counter.
    function beatChest() external {
        chestBeats++;
        gorillaBeats[msg.sender]++;

        if (gorillaBeats[msg.sender] > alphaBeats) {
            alphaGorilla = msg.sender;
            alphaBeats = gorillaBeats[msg.sender];
            emit AlphaChanged(msg.sender, alphaBeats);
        }

        emit ChestBeaten(msg.sender, chestBeats, gorillaNames[msg.sender]);
    }

    /// @notice Set your gorilla name (max 32 chars)
    function setGorillaName(string calldata name) external {
        require(bytes(name).length > 0 && bytes(name).length <= 32, "Name: 1-32 chars");
        gorillaNames[msg.sender] = name;
        emit GorillaRenamed(msg.sender, name);
    }

    /// @notice Get a gorilla's stats
    function getGorillaStats(address gorilla) external view returns (uint256 beats, string memory name, bool isAlpha) {
        return (gorillaBeats[gorilla], gorillaNames[gorilla], gorilla == alphaGorilla);
    }
}
