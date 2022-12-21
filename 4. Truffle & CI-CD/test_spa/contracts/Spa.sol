// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

error Spa__AlreadyAdopted();

contract Spa {
    struct Animal {
        string race;
        uint256 size;
        uint256 age;
        bool isAdopted;
    }

    Animal[] animals;
    mapping(address => uint256) public adoption;

    event animalAdded(uint256 indexed id);
    event animalAdopted(uint256 indexed _id, address indexed _addr);

    //CRUD
    function add(
        string memory _race,
        uint256 _size,
        uint256 _age
    ) external {
        animals.push(Animal(_race, _size, _age, false));
        emit animalAdded(animals.length - 1);
    }

    function get(uint256 _id) external view returns (Animal memory) {
        return animals[_id];
    }

    function set(
        uint256 _id,
        string memory _race,
        uint256 _size,
        uint256 _age
    ) external {
        animals[_id].race = _race;
        animals[_id].size = _size;
        animals[_id].age = _age;
    }

    function remove(uint256 _id) external {
        delete animals[_id];
    }

    function adopt(uint256 _id) external {
        if (animals[_id].isAdopted == true) {
            revert Spa__AlreadyAdopted();
        }
        animals[_id].isAdopted = true;
        adoption[msg.sender] = _id;
        emit animalAdopted(_id, msg.sender);
    }

    function getAdoption(address _addr) external view returns (Animal memory) {
        return animals[adoption[_addr]];
    }

    function adoptIfMax(
        string memory _race,
        uint256 _maxSize,
        uint256 _maxAge
    ) external returns (bool) {
        for (uint256 i = 0; i < animals.length; i++) {
            if (
                animals[i].size <= _maxSize &&
                animals[i].age <= _maxAge &&
                animals[i].isAdopted == false &&
                keccak256(abi.encode(animals[i].race)) ==
                keccak256(abi.encode(_race))
            ) {
                animals[i].isAdopted = true;
                adoption[msg.sender] = i;
                emit animalAdopted(i, msg.sender);
                return true;
            }
        }
        return false;
    }
}
