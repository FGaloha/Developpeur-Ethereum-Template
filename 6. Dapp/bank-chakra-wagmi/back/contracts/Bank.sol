// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

error Bank__NotEnoughFundsProvided();
error Bank__NotEnoughEthersOnTheSC();
error Bank__WithdrawFailed();

/// @title A simple wallet contract
/// @author Ben BK
/// @notice Allows to send and withdraw Ethers from a smart contract

contract Bank {
    mapping(address => uint256) balances;

    event Deposit(address wallet, uint256 depositAmount, uint256 timeStamp);
    event Withdraw(address wallet, uint256 withdrawAmount, uint256 timeStamp);

    /// @notice Allows to send Ethers to the smart contract
    function sendEthers() external payable {
        if (msg.value < 1 wei) {
            revert Bank__NotEnoughFundsProvided();
        }
        emit Deposit(msg.sender, msg.value, block.timestamp);
        balances[msg.sender] += msg.value;
    }

    /// @notice Allows to withdraw Ethers from the smart contract
    /// @param _amount The amount to withdraw
    function withdraw(uint256 _amount) external {
        if (_amount > balances[msg.sender]) {
            revert Bank__NotEnoughEthersOnTheSC();
        }
        emit Withdraw(msg.sender, _amount, block.timestamp);
        balances[msg.sender] -= _amount;
        (bool received, ) = msg.sender.call{value: _amount}("");
        if (!received) {
            revert Bank__WithdrawFailed();
        }
    }

    function getBalance(address _address) public view returns (uint256) {
        return balances[_address];
    }
}
