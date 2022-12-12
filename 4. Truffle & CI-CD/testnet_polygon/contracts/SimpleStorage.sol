// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

contract SimpleStorage {
    uint256 number;

    function setNumber(uint256 _number) external {
        number = _number;
    }

    function getNumber() external view returns (uint256) {
        return number;
    }

    constructor(uint256 _number) payable {
        number = _number;
        //(bool received, ) = _to.call{value: msg.value}("");
        //require(received, "An error occured");
    }
}
