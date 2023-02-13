// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Defi {
    IERC20 money;

    constructor(address _moneyAddress) {
        money = IERC20(_moneyAddress);
    }

    function transfer(address _recipient, uint256 _amount) external {
        money.transfer(_recipient, _amount);
    }
}
