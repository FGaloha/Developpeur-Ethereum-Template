// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

// You can store ETH in this contract and redeem them.
contract Vault {
    mapping(address => uint256) public balances;

    /// @dev Store ETH in the contract.
    function store() public payable {
        balances[msg.sender] += msg.value;
    }

    /// @dev Redeem your ETH.
    function redeem() public {
        msg.sender.call{value: balances[msg.sender]}("");
        balances[msg.sender] = 0;
    }
}
