// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

// import "@openzeppelin/contracts/access/Ownable.sol";
import "./Collection.sol";

/// @title Contract to set Morpheus Inc subsidiaries and to let them create and manage autonomously NFT collections
/// @author Flavia Gallois
/// @notice Give the possibility to Morpheus subsidiaries to generate ERC-721 NFT contract collections
/// @dev The name of collections is automatically generated based on subsidiary name and collection number
contract Factory is Ownable {
    using Strings for uint256;

    struct Subsidiary {
        string name;
        string symbol;
        // uint256[] shares;
        address[] team;
        bool isActive;
        uint256 counter;
    }

    mapping(address => Subsidiary) internal subsidiaries;

    modifier onlySeller() {
        require(subsidiaries[msg.sender].isActive, "Not a seller");
        _;
    }

    event SubsidiaryAdded(
        address indexed _address,
        string _name,
        string _symbol
    );
    event SubsidiaryDeactivated(
        address indexed _address,
        string _name,
        string _symbol
    );

    event CollectionCreated(
        string _name,
        address _address,
        uint256 _timestamp,
        address indexed _subsidiary
    );

    /// @notice Add an address to the list of Morpheus subsidiaries
    /// @param _seller The address to add to the list of authorized subsidiaries
    /// @param _name The name that will be used for the collections
    /// @param _symbol The symbol that will be used for the collections
    function setSubsidiary(
        address _seller,
        string calldata _name,
        string calldata _symbol
    ) external onlyOwner {
        subsidiaries[_seller].name = _name;
        subsidiaries[_seller].symbol = _symbol;
        subsidiaries[_seller].isActive = true;
        subsidiaries[_seller].counter = 1;
        subsidiaries[_seller].team = [_seller, msg.sender]; // Address of the 2 payees subsidiary 97%-factory owner 3%
        emit SubsidiaryAdded(_seller, _name, _symbol);
    }

    /// @notice Indicate by putting the mapping value isActive to false a subsidiary is not anymore authorized to create new collections
    /// @dev The address stays in charge of the collections created
    /// @param _seller The address to use to update the list of subsidiaries
    function deactivateSubsidiary(address _seller) external onlyOwner {
        subsidiaries[_seller].isActive = false;
        emit SubsidiaryDeactivated(
            _seller,
            subsidiaries[_seller].name,
            subsidiaries[_seller].symbol
        );
    }

    /// @notice Get the information of a Morpheus subsidiary
    /// @param _seller The address managing subsidiarie's collections
    /// @return Subsidiary the table with name, symbol, if it is active and the number of the next collection
    function getSubsidiary(address _seller)
        external
        view
        returns (Subsidiary memory)
    {
        return subsidiaries[_seller];
    }

    /// @notice Update the name and symbol of the subsidiary which is used to create collections name
    /// @param _seller The address to use to update the name of the right subsidiary
    /// @param _name The name to use to update the current subsidiary name
    /// @param _symbol The symbol to use to update the current subsidiary name
    //function updateSubsidiary(
    //  address _seller,
    //   string calldata _name,
    //  string calldata _symbol
    //) external onlyOwner {
    //  subsidiaries[_seller].name = _name;
    // subsidiaries[_seller].symbol = _symbol;
    //}

    /// @notice Deploy an ERC721 collection contract of the subsidiary calling and mint the NFT based on the params
    /// @return collectionAddress the address of the created collection contract
    function createNFTCollection(
        uint256 _maxSupply,
        uint256 _price,
        string calldata _baseURI
    ) external onlySeller returns (address collectionAddress) {
        // Create the collection name based on subsidiary calling
        string memory collectionName = string.concat(
            subsidiaries[msg.sender].name,
            " - ",
            subsidiaries[msg.sender].counter.toString()
        );

        // Make a random salt based on the subsidiary name
        bytes32 salt = keccak256(abi.encodePacked(collectionName));

        //bytes memory collectionBytecode = type(Collection).creationCode;

        //assembly {
        //    collectionAddress := create2(
        //        0,
        //        add(collectionBytecode, 0x20),
        //        mload(collectionBytecode),
        //        salt
        //    )
        //    if iszero(extcodesize(collectionAddress)) {
        // revert if something gone wrong (collectionAddress doesn't contain an address)
        //        revert(0, 0)
        //    }
        //}

        // Creating contract
        collectionAddress = address(
            new Collection{salt: salt}(
                collectionName,
                subsidiaries[msg.sender].symbol,
                subsidiaries[msg.sender].team
            )
        );

        // Initialize the collection contract with the artist settings
        Collection(payable(collectionAddress)).init(
            _maxSupply,
            _price,
            _baseURI
        );

        ++subsidiaries[msg.sender].counter;

        emit CollectionCreated(
            collectionName,
            collectionAddress,
            block.timestamp,
            msg.sender
        );

        Collection(payable(collectionAddress)).transferOwnership(msg.sender);
    }
}
