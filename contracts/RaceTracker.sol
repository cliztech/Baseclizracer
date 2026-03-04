// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract RaceTracker is ERC721 {
    uint256 public nextTokenId;
    mapping(address => uint256[]) public lapTimes;

    constructor() ERC721("LapNFT", "LAP") {}

    function submitLap(address racer, uint256 time) external {
        lapTimes[racer].push(time);
        if (balanceOf(racer) == 0) {
            _mint(racer, nextTokenId++);
        }
    }

    function getLapTimes(address racer) external view returns (uint256[] memory) {
        return lapTimes[racer];
    }
}
