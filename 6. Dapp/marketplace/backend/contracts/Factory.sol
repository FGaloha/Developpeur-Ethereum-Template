// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "./Collection.sol";

error Factory_NotASubsidiary();

/// @title Contract to set Morpheus Inc subsidiaries and to let them create and manage autonomously NFT collections
/// @author Flavia Gallois
/// @notice Give the possibility to Morpheus subsidiaries to generate ERC-721 NFTs contract collections
/// @dev The name of collections is automatically generated based on subsidiary name and collection number
contract Factory is Ownable {
    using Strings for uint256;

    struct Subsidiary {
        string name;
        string symbol;
        address[] team;
        bool isActive;
        uint256 counter;
    }

    mapping(address => Subsidiary) internal subsidiaries;

    modifier onlySeller() {
        require(subsidiaries[msg.sender].isActive, "Not a seller");
        _;
    }

    event SubsidiaryAdded(address indexed seller, string name, string symbol);

    event SubsidiaryDeactivated(
        address indexed seller,
        string name,
        string symbol
    );

    event SubsidiaryUpdated(
        address indexed _seller,
        string _name,
        string _symbol
    );

    event CollectionCreated(
        string name,
        address indexed addressCollection,
        uint256 timestamp,
        address indexed seller
    );

    /// @notice Add an address to the list of Morpheus subsidiaries
    /// @dev Mint & royalties are splitted between creators of collection & factory owner
    /// @param _seller The address to add to the list of authorized subsidiaries
    /// @param _name The name that will be used for the collections
    /// @param _symbol The symbol that will be used for the collections
    function setSubsidiary(
        address _seller,
        string calldata _name,
        string calldata _symbol
    ) external onlyOwner {
        require(subsidiaries[_seller].counter <= 0, "Already a subsidiary");
        subsidiaries[_seller].name = _name;
        subsidiaries[_seller].symbol = _symbol;
        subsidiaries[_seller].isActive = true;
        subsidiaries[_seller].counter = 1;
        subsidiaries[_seller].team = [_seller, msg.sender]; // Address of the 2 collection payees: Subsidiary 97% - Factory owner 3%
        emit SubsidiaryAdded(_seller, _name, _symbol);
    }

    /// @notice Get the information of a Morpheus subsidiary
    /// @param _seller The address managing subsidiarie's collections
    /// @return the table with information of the subsidiary including name, symbol, team members address if it is active and the number of the next collection
    function getSubsidiary(address _seller)
        external
        view
        returns (Subsidiary memory)
    {
        return subsidiaries[_seller];
    }

    /// @notice Remove an address from the list of subsidiaries
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

    // /// @notice Update the name and symbol of the subsidiary which is used to create collections name
    // /// @param _seller The address to use to update the name of the right subsidiary
    // /// @param _name The name to use to update the current subsidiary name
    // /// @param _symbol The symbol to use to update the current subsidiary name
    function updateSubsidiary(
        address _seller,
        string calldata _name,
        string calldata _symbol
    ) external onlyOwner {
        subsidiaries[_seller].name = _name;
        subsidiaries[_seller].symbol = _symbol;
        emit SubsidiaryUpdated(_seller, _name, _symbol);
    }

    /// @notice Deploy an ERC721 collection contract for the subsidiary calling, based on parameters
    /// @param _maxSupply The maximum of NFT that will be possibly minted
    /// @param _price The unit price of an NFT of the collection
    /// @param _baseURI The folder link where the json & images of the collection are stored
    /// @return collectionAddress the contract address of the collection created
    function createNFTCollection(
        uint256 _maxSupply,
        uint256 _price,
        string calldata _baseURI
    ) external onlySeller returns (address collectionAddress) {
        // Collection name creation based on the subsidiary name and the number of the collection
        string memory collectionName = string.concat(
            subsidiaries[msg.sender].name,
            " - ",
            subsidiaries[msg.sender].counter.toString()
        );

        // Make a random salt based on the subsidiary name
        bytes32 salt = keccak256(abi.encodePacked(collectionName));

        // Contract creation
        collectionAddress = address(
            new Collection{salt: salt}(
                collectionName,
                subsidiaries[msg.sender].symbol,
                subsidiaries[msg.sender].team
            )
        );

        // Initialization of the collection
        Collection(payable(collectionAddress)).init(
            _maxSupply,
            _price,
            _baseURI
        );

        // Counter updated to manage collection name properly
        ++subsidiaries[msg.sender].counter;

        emit CollectionCreated(
            collectionName,
            collectionAddress,
            block.timestamp,
            msg.sender
        );

        // The factory transfer the newly created collection ownership to the subsidiary
        Collection(payable(collectionAddress)).transferOwnership(msg.sender);
        return collectionAddress;
    }
}
