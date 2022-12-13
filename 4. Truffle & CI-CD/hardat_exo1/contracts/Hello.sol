// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Hello is Ownable {
    string forename;

    constructor(string memory _forename) {
        forename = _forename;
    }

    function setForename(string memory _forename) external onlyOwner {
        forename = _forename;
    }

    function getForename() public view returns (string memory) {
        return forename;
    }

    function sayHello() external view returns (string memory) {
        return string.concat("Hello ", forename);
    }
}
