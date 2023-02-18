// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

//import "./ERC721EnumerableAdapted.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/finance/PaymentSplitter.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";

/// @title Contract template used by Morpheus Inc factory to create collections for the group's subsidiaries
/// @author Flavia Gallois
/// @notice Subsidiaries can create ERC-721 NFTs contract collections deciding the total supply, price & baseURI location on ipfs
/// @dev Morpheus uses this contract only through the Factory contract designed by Morpheus Group. Ownership is set up through the factory contract. Royalties are managed from each child contract.
contract Collection is ERC721Enumerable, ERC2981, PaymentSplitter, Ownable {
    using Strings for uint256;
    using Counters for Counters.Counter;

    uint8 private immutable maxQuantity;
    uint256 private maxSupply;
    string private baseURI;
    Counters.Counter private _tokenIds;
    uint256 private price;
    uint256[] private _teamShares = [97, 3];

    /// @notice Constructor
    /// @dev function called by the Factory contract in Morpheus set up organization
    /// @param name_ The name of the collection
    /// @param symbol_ The symbol of the collection
    /// @param _team The address of the subsidiary/contract owner & the factory owner. They will be used when the revenues will be shared.
    constructor(
        string memory name_,
        string memory symbol_,
        address[] memory _team
    ) payable ERC721("", "") PaymentSplitter(_team, _teamShares) {
        // work on remix but not on hardhat - goeli to test
        // _name = name_;
        // _symbol = symbol_;
        name_ = name_;
        symbol_ = symbol_;
        maxQuantity = 50;
    }

    event Mint(address indexed minter, uint256 tokenId);

    event BaseURIChanged(string newBaseURI, string oldBaseURI);

    /// @notice To init the contract with the information provided by the subsidiary
    /// @dev The function is called by the Factory contract during collection creation process. The royalty fee is set to 5% for all contracts
    /// @param _maxSupply The max supply of the collection
    /// @param _price The price of each NFT token
    /// @param _baseURI The ipfs link pointing the folder where json/images files are available
    function init(
        uint256 _maxSupply,
        uint256 _price,
        string memory _baseURI
    ) external onlyOwner {
        maxSupply = _maxSupply;
        price = _price;
        baseURI = _baseURI;
        _setDefaultRoyalty(address(this), 500);
    }

    /// @notice Get the max supply of the contract
    /// @return the maximum number of tokens that can be created by the contract
    function getMaxSupply() public view returns (uint256) {
        return maxSupply;
    }

    /// @notice Get the price of a token
    /// @return the amount of ETH to send to mint each token
    function getPrice() public view returns (uint256) {
        return price;
    }

    /// @notice Get the base URI of the contract
    /// @return the ipfs url set up for the contract and used to generate token URI
    function getBaseURI() public view returns (string memory) {
        return baseURI;
    }

    /// @notice Get the max quantity of the contract
    /// @dev The Group decided to fix the maximum to 50 for all contracts
    /// @return the maximum of token that could be minted in one single transaction
    function getMaxQuantity() public pure returns (uint256) {
        return 50;
    }

    /// @notice To mint a NFT token of the contract
    /// @param _quantity The number of token the user wants to mint
    function mint(uint256 _quantity) external payable {
        require(totalSupply() + _quantity <= maxSupply, "Sold out");
        require(_quantity <= maxQuantity, "Max 50 per transaction");
        require(msg.value >= _quantity * price, "Not enough funds");
        uint256 tokenId;
        for (uint256 i = 0; i < _quantity; ++i) {
            tokenId = _tokenIds.current();
            _tokenIds.increment();
            _safeMint(msg.sender, tokenId);
        }
        emit Mint(msg.sender, tokenId);
    }

    /// @notice Get if the contract support an interface
    /// @param _interfaceId Code of the interface checked
    /// @return A boolean to indicate if the interface is supported or not (false)
    function supportsInterface(bytes4 _interfaceId)
        public
        view
        virtual
        override(ERC721Enumerable, ERC2981)
        returns (bool)
    {
        return super.supportsInterface(_interfaceId);
    }

    /// @notice Get the token URI of a specific NFT token
    /// @param _tokenId Index of the token
    /// @return The link where the json file of the token is available
    function tokenURI(uint256 _tokenId)
        public
        view
        virtual
        override(ERC721)
        returns (string memory)
    {
        require(_exists(_tokenId), "Non existing token");
        return string(abi.encodePacked(baseURI, _tokenId.toString(), ".json"));
    }

    /// @notice Get the token URI of a specific NFT token
    /// @dev This function will be used in case of mistakes or if ipfs changes in strategy in the future
    /// @param _baseURI Link to use to get json and image files of the NFT tokens
    function setBaseURI(string memory _baseURI) external onlyOwner {
        string memory oldBaseURI = baseURI;
        baseURI = _baseURI;
        emit BaseURIChanged(_baseURI, oldBaseURI);
    }

    /// @notice Release the funds of both subsidiary & factory (Group Morpheus)
    /// @dev The revenues are splitted the same for all contracts: subsidiary/owner 97% - Group/factory 3 %)
    function releaseAll() external {
        for (uint256 i = 0; i < 2; i++) {
            release(payable(payee(i)));
        }
    }
}
