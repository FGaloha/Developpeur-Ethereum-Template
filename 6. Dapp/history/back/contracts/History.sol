// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "erc721a/contracts/ERC721A.sol";
import "@openzeppelin/contracts/finance/PaymentSplitter.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract History is ERC721A, Ownable, PaymentSplitter {
    using Strings for uint256;

    uint256 private constant PRICE = 0.05 ether;
    uint256 private constant MAX_NFTS_PER_ADDRESS = 1;

    mapping(address => uint256) nftsPerAddress;

    uint8 private immutable i_teamLength;
    uint8 private constant MAX_SUPPLY = 20;

    string baseURI; //bafybeidyu7i6vii4lf6vdvaqpe3y5ezbo6w3ikmuxqeeoj74kutb4ox2xm

    address[] private _team = [
        0xA770487d72Baad096729965011b90FFEDfecB1b4,
        0xFC7CEEB77a94EAbB99d0DD55f99784F29aBfb401
    ];

    uint256[] private _teamShares = [20, 80];

    constructor(string memory _baseURI)
        ERC721A("History", "HTY")
        PaymentSplitter(_team, _teamShares)
    {
        i_teamLength = uint8(_team.length);
        baseURI = _baseURI;
    }

    function mint(uint256 _quantity) external payable {
        // On doit être sur que msg.sender n'ait jamais plus de 3 NFTs
        require(
            nftsPerAddress[msg.sender] + _quantity <= MAX_NFTS_PER_ADDRESS,
            "You can only mint 1 NFT"
        );
        require(totalSupply() + _quantity <= MAX_SUPPLY, "Max supply exceeded");
        require(msg.value >= _quantity * PRICE, "Not enough funds provided");
        nftsPerAddress[msg.sender] += _quantity;
        _mint(msg.sender, _quantity);
    }

    function tokenURI(uint256 _tokenId)
        public
        view
        virtual
        override(ERC721A)
        returns (string memory)
    {
        require(_exists(_tokenId), "URI query for nonexistent token");
        return string(abi.encodePacked(baseURI, _tokenId.toString(), ".json"));
    }

    function releaseAll() external {
        for (uint256 i = 0; i < i_teamLength; i++) {
            //Pour chaque adresse, je fais un release les gains
            release(payable(payee(i)));
        }
    }

    function setBaseURI(string memory _baseURI) external onlyOwner {
        baseURI = _baseURI;
    }

    receive() external payable override {
        revert("Only if you mint");
    }
}
