// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract Bank {
    struct Account {
        uint256 balance;
        uint256 lastDeposit;
    }

    mapping(address => Account) private accounts;

    event etherDeposited(address indexed account, uint256 amount);
    event etherWithdrawed(address indexed account, uint256 amount);

    function getBalanceAndLastDeposit() external view returns (Account memory) {
        return accounts[msg.sender];
    }

    function deposit() external payable {
        require(msg.value > 0, "Transfer needs to be 1 wei minimum !");
        accounts[msg.sender].balance += msg.value;
        accounts[msg.sender].lastDeposit = block.timestamp;
        emit etherDeposited(msg.sender, msg.value);
    }

    function withdraw(uint256 _amount) public {
        require(
            accounts[msg.sender].balance >= _amount,
            "You do not have enough deposit"
        );
        (bool success, ) = msg.sender.call{value: _amount}("");
        require(success, "Failed to withdraw");
        accounts[msg.sender].balance -= _amount;
        emit etherWithdrawed(msg.sender, _amount);
    }
}
