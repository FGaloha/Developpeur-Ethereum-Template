// SPDX-License-Identifier: MIT

pragma solidity 0.8.17;

contract Bank {
    mapping(address => uint256) balances;

    function withdraw() external {
        (bool success, ) = msg.sender.call{value: balances[msg.sender]}("");
        require(success, "Failed to withdraw account");
        if (success) {
            balances[msg.sender] = 0;
        }
    }

    function deposit() external payable {
        balances[msg.sender] += msg.value;
    }
}
