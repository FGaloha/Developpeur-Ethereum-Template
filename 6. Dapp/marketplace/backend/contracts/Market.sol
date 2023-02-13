// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./Collection.sol";

error Market_MissingMarketApproval();
error Market_AlreadyOnSale(address nftAddress, uint256 tokenId);
error Market_NotOnSale(address nftAddress, uint256 tokenId);
error Market_PriceTooLow();
error Market_MissingFounds(address nftAddress, uint256 tokenId, uint256 price);
error Market_NotOwner();
error Market_NoEarnings();

contract Market is ReentrancyGuard, Ownable {
    // Set to 2000000000000000 on production
    uint256 internal minimalPrice;

    // Set to 1000000000000000 on production
    uint256 internal fixFee;

    // Set to 250 on production
    uint256 internal percentFee;

    constructor(
        uint256 _minimalPrice,
        uint256 _fixFee,
        uint256 _percentFee
    ) {
        minimalPrice = _minimalPrice;
        fixFee = _fixFee;
        percentFee = _percentFee;
    }

    struct Sale {
        address seller;
        uint256 price;
    }

    struct Royalty {
        address receiver;
        uint256 royaltyAmount;
    }

    mapping(address => mapping(uint256 => Sale)) private sales;
    mapping(address => uint256) private earnings;

    event NFTOnSale(
        address indexed seller,
        address indexed nftAddress,
        uint256 indexed tokenId,
        uint256 price
    );

    event SaleDeleted(
        address indexed seller,
        address indexed nftAddress,
        uint256 indexed tokenId
    );

    event NFTSold(
        address indexed seller,
        address indexed buyer,
        address indexed nftAddress,
        uint256 tokenId,
        uint256 price,
        uint256 royalties
    );

    event EarningsWithdraw(address indexed seller, uint256 amount);

    modifier notOnSale(address nftAddress, uint256 tokenId) {
        Sale memory sale = sales[nftAddress][tokenId];
        if (sale.price > 0) {
            revert Market_AlreadyOnSale(nftAddress, tokenId);
        }
        _;
    }

    modifier isOnSale(address nftAddress, uint256 tokenId) {
        Sale memory sale = sales[nftAddress][tokenId];
        if (sale.price <= 0) {
            revert Market_NotOnSale(nftAddress, tokenId);
        }
        _;
    }

    modifier isOwner(
        address nftAddress,
        uint256 tokenId,
        address seller
    ) {
        IERC721 nft = IERC721(nftAddress);
        address owner = nft.ownerOf(tokenId);
        if (seller != owner) {
            revert Market_NotOwner();
        }
        _;
    }

    function setMinimalPrice(uint256 _minimalPrice) external onlyOwner {
        minimalPrice = _minimalPrice;
    }

    function getMinimalPrice() public view returns (uint256) {
        return minimalPrice;
    }

    function setFixFee(uint256 _fixFee) external onlyOwner {
        fixFee = _fixFee;
    }

    function getFixFee() public view returns (uint256) {
        return fixFee;
    }

    function setPercentFee(uint256 _percentFee) external onlyOwner {
        percentFee = _percentFee;
    }

    function getPercentFee() public view returns (uint256) {
        return percentFee;
    }

    function getSale(address nftAddress, uint256 tokenId)
        external
        view
        returns (Sale memory)
    {
        return sales[nftAddress][tokenId];
    }

    function getEarnings(address seller) external view returns (uint256) {
        return earnings[seller];
    }

    // It implies approve mgmt in front application
    function addToSale(
        address nftAddress,
        uint256 tokenId,
        uint256 price
    )
        external
        notOnSale(nftAddress, tokenId)
        isOwner(nftAddress, tokenId, msg.sender)
    {
        if (price < minimalPrice) {
            revert Market_PriceTooLow();
        }
        IERC721 nft = IERC721(nftAddress);
        if (nft.getApproved(tokenId) != address(this)) {
            revert Market_MissingMarketApproval();
        }
        sales[nftAddress][tokenId] = Sale(msg.sender, price);
        emit NFTOnSale(msg.sender, nftAddress, tokenId, price);
    }

    function updateSalePrice(
        uint256 newPrice,
        address nftAddress,
        uint256 tokenId
    )
        external
        isOnSale(nftAddress, tokenId)
        isOwner(nftAddress, tokenId, msg.sender)
        nonReentrant
    {
        if (newPrice < minimalPrice) {
            revert Market_PriceTooLow();
        }
        sales[nftAddress][tokenId].price = newPrice;
        emit NFTOnSale(msg.sender, nftAddress, tokenId, newPrice);
    }

    // The token apporval remains availble. The user can use the functionnality of the Collection to remove it
    // In the front add _setApprovalForAll(address owner/msg.sender, address operator/market address, bool approved/false)
    function deleteFromSale(address nftAddress, uint256 tokenId)
        external
        isOwner(nftAddress, tokenId, msg.sender)
        isOnSale(nftAddress, tokenId)
    {
        delete (sales[nftAddress][tokenId]);
        emit SaleDeleted(msg.sender, nftAddress, tokenId);
    }

    function buyItem(address nftAddress, uint256 tokenId)
        external
        payable
        isOnSale(nftAddress, tokenId)
        nonReentrant
    {
        Sale memory nftOnSale = sales[nftAddress][tokenId];
        if (msg.value < nftOnSale.price) {
            revert Market_MissingFounds(nftAddress, tokenId, nftOnSale.price);
        }
        // earning minus variable/fix Market commissions & royalties
        uint256 totalMarketFee = ((msg.value * percentFee) / 10000) + fixFee;
        (address royaltyReceiver, uint256 royaltyAmount) = Collection(
            payable(nftAddress)
        ).royaltyInfo(tokenId, nftOnSale.price - totalMarketFee);
        uint256 earning = msg.value - totalMarketFee - royaltyAmount;
        earnings[nftOnSale.seller] += earning;
        // royalties payment
        (bool success, ) = payable(royaltyReceiver).call{value: royaltyAmount}(
            ""
        );
        require(success, "Royalty payment failed");
        delete (sales[nftAddress][tokenId]);
        emit NFTSold(
            nftOnSale.seller,
            msg.sender,
            nftAddress,
            tokenId,
            nftOnSale.price,
            royaltyAmount
        );
        IERC721(nftAddress).safeTransferFrom(
            nftOnSale.seller,
            msg.sender,
            tokenId
        );
    }

    function withdraw() external {
        if (earnings[msg.sender] <= 0) {
            revert Market_NoEarnings();
        }
        uint256 payment = earnings[msg.sender];
        earnings[msg.sender] = 0;
        emit EarningsWithdraw(msg.sender, payment);
        (bool success, ) = payable(msg.sender).call{value: payment}("");
        require(success, "Withdraw failed");
    }
}
