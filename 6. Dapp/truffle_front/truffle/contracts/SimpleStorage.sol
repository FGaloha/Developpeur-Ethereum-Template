// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract SimpleStorage {
    uint256 value;
    string internal name;
    event valueChanged(uint256 _value);
    event nameChanged(string _name);

    function read() public view returns (uint256) {
        return value;
    }

    function write(uint256 newValue) public {
        value = newValue;
        emit valueChanged(newValue);
    }

    function setGreeter(string calldata _name) public {
        name = _name;
        emit nameChanged(_name);
    }

    function getGreeter() public view returns (string memory) {
        return string.concat("Hello Mister ", name);
    }
}
