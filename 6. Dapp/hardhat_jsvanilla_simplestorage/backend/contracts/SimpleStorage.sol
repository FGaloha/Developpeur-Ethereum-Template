//SPDX-License-Identifier: MIT

pragma solidity 0.8.17;

contract SimpleStorage {
    uint256 number;

    function store(uint256 _number) external {
        number = _number;
    }

    function getNumber() public view returns (uint256) {
        return number;
    }
}
