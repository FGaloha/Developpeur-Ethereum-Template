// SPDX-License-Identifier: MIT

pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract FlavERC20 is ERC20, Ownable {
    constructor(uint256 initialSupply) ERC20("FlavCoin", "FLAV") {
        _mint(msg.sender, initialSupply);
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
    // AlyraIsERC20.connect(account[1]).mint(deployer,10000)
    // await expect
}
