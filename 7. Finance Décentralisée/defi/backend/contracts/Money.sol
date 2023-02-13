// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Money is ERC20 {
    event mint(address _recipient, uint256 _amount);

    constructor() ERC20("Flav Coin", "FLV") {}

    function faucet(address _recipient, uint256 _amount) external payable {
        require(
            msg.value >= _amount * 0.001 ether,
            "Not enough founds for the swap"
        );
        emit mint(_recipient, _amount);
        _mint(_recipient, _amount);
    }
}
