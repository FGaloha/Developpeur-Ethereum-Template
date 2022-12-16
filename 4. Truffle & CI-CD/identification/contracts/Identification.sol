// SPDX-License-Identifier: MIT

pragma solidity 0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Identification is Ownable {
    // test deploy
    struct Person {
        string lastName;
        string firstName;
        uint256 age;
    }

    mapping(address => Person) persons;

    constructor(
        string memory _lastName,
        string memory _firstName,
        uint256 _age
    ) {
        persons[msg.sender] = Person(_lastName, _firstName, _age);
    }

    function addPerson(
        address _address,
        string memory _lastName,
        string memory _firstName,
        uint256 _age
    ) external onlyOwner {
        persons[_address] = Person(_lastName, _firstName, _age);
    }

    function getPerson(address _address) external view returns (Person memory) {
        return persons[_address];
    }
}
