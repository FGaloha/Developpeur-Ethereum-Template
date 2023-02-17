// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

//import "./ERC721EnumerableAdapted.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/finance/PaymentSplitter.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";

contract Collection is ERC721Enumerable, ERC2981, PaymentSplitter, Ownable {
    using Strings for uint256;
    using Counters for Counters.Counter;

    uint8 private immutable maxQuantity;
    uint256 private maxSupply;
    string private baseURI;
    Counters.Counter private _tokenIds;
    uint256 private price;
    uint256[] private _teamShares = [97, 3];

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

    function getPrice() public view returns (uint256) {
        return price;
    }

    function getMaxSupply() public view returns (uint256) {
        return maxSupply;
    }

    function getMaxQuantity() public pure returns (uint256) {
        return 50;
    }

    function getBaseURI() public view returns (string memory) {
        return baseURI;
    }

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

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC721Enumerable, ERC2981)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function tokenURI(uint256 _tokenId)
        public
        view
        virtual
        override(ERC721)
        returns (string memory)
    {
        require(_exists(_tokenId), "URI query for nonexistent token");
        return string(abi.encodePacked(baseURI, _tokenId.toString(), ".json"));
    }

    // return string(abi.encodePacked("ipfs://bafybeidmflwrfthqw5uzs2usbbxlir6mqpxuhmvddvprms63lojaxyckzi/", _tokenId.toString(), ".json"));

    function setBaseURI(string memory _baseURI) external onlyOwner {
        baseURI = _baseURI;
    }

    function releaseAll() external {
        for (uint256 i = 0; i < 2; i++) {
            //Pour chaque adresse, je fais un release les gains
            release(payable(payee(i)));
        }
    }

    //receive() external payable override {
    //  revert("Only if you mint");
    //}
}
