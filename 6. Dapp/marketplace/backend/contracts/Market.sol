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

/// @title Marketplace contract to buy and sale ERC721 NFTs
/// @author Flavia Gallois
/// @notice Built for Morpheus Group & subsidiaries to create a dedicated space to buy or sale NFTs from Morpheus collections
/// @dev Morpheus Group discuss with subsidiaries, for potential update, the minimal listing price, fix fee & percet fee during annual Group meeting every year
contract Market is ReentrancyGuard, Ownable {
    // Set to 2000000000000000 during initial deployment
    uint256 internal minimalPrice;

    // Set to 1000000000000000 during initial deployment
    uint256 internal fixFee;

    // Set to 250  during initial deployment
    uint256 internal percentFee;

    /// @notice Constructor
    /// @param _minimalPrice The minimal price to set to sell a NFT
    /// @param _fixFee The fix fee for the marketplace on each sale
    /// @param _percentFee The percent fee for the marketplace on each sale
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

    event MinimalPriceSet(uint256 newMinimalPrice, uint256 oldMinimalPrice);
    event FixFeeSet(uint256 newFixFeeSet, uint256 oldFixFeeSet);
    event PercentFeeSet(uint256 newPercentFee, uint256 oldPercentFee);

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

    event FundsReleased(address indexed owner, uint256 amountWithdrawed);

    event EarningsWithdraw(address indexed seller, uint256 amount);

    modifier notOnSale(address _nftAddress, uint256 _tokenId) {
        Sale memory sale = sales[_nftAddress][_tokenId];
        if (sale.price > 0) {
            revert Market_AlreadyOnSale(_nftAddress, _tokenId);
        }
        _;
    }

    modifier isOnSale(address _nftAddress, uint256 _tokenId) {
        Sale memory sale = sales[_nftAddress][_tokenId];
        if (sale.price <= 0) {
            revert Market_NotOnSale(_nftAddress, _tokenId);
        }
        _;
    }

    modifier isOwner(
        address _nftAddress,
        uint256 _tokenId,
        address _seller
    ) {
        IERC721 nft = IERC721(_nftAddress);
        address owner = nft.ownerOf(_tokenId);
        if (_seller != owner) {
            revert Market_NotOwner();
        }
        _;
    }

    /// @notice Update the minimal price
    /// @param _minimalPrice The minimal price to set to sell a NFT
    function setMinimalPrice(uint256 _minimalPrice) external onlyOwner {
        emit MinimalPriceSet(_minimalPrice, minimalPrice);
        minimalPrice = _minimalPrice;
    }

    /// @notice Update the fix fee
    /// @param _fixFee The fix fee for the marketplace on each sale
    function setFixFee(uint256 _fixFee) external onlyOwner {
        emit FixFeeSet(_fixFee, fixFee);
        fixFee = _fixFee;
    }

    /// @notice Update the percent fee
    /// @param _percentFee The percent fee for the marketplace on each sale
    function setPercentFee(uint256 _percentFee) external onlyOwner {
        emit PercentFeeSet(_percentFee, percentFee);
        percentFee = _percentFee;
    }

    /// @notice Get the minimal price to set to sell a NFT
    /// @return the minimal price to set to sell a NFT
    function getMinimalPrice() public view returns (uint256) {
        return minimalPrice;
    }

    /// @notice Get the fix fee get by the marketplace when selling a NFT
    /// @return the fix fee get by the marketplace when selling a NFT
    function getFixFee() public view returns (uint256) {
        return fixFee;
    }

    /// @notice Get the percent fee get by the marketplace when selling a NFT
    /// @return the percent fee get by the marketplace when selling a NFT
    function getPercentFee() public view returns (uint256) {
        return percentFee;
    }

    /// @notice Get the selling information of a NFT
    /// @param _nftAddress The address of the NFT collection
    /// @param _tokenId The tokenId of the NFT we look the information for
    /// @return the seller address & the ETH price of the NFT
    function getSale(address _nftAddress, uint256 _tokenId)
        external
        view
        returns (Sale memory)
    {
        return sales[_nftAddress][_tokenId];
    }

    /// @notice Get the earnings of a seller
    /// @param _seller The address of the seller we look the earnings for
    /// @return the ETH earnings of the address sent
    function getEarnings(address _seller) external view returns (uint256) {
        return earnings[_seller];
    }

    /// @notice Add the NFT to the list of NFTs to buy
    /// @dev Action possible if the Marketplace address is approved by the user within the collection address in a previous step
    /// @param _nftAddress The address of the NFT collection
    /// @param _tokenId The tokenId of the NFT to sell
    /// @param _price The selling price added by the user
    function addToSale(
        address _nftAddress,
        uint256 _tokenId,
        uint256 _price
    )
        external
        notOnSale(_nftAddress, _tokenId)
        isOwner(_nftAddress, _tokenId, msg.sender)
    {
        if (_price < minimalPrice) {
            revert Market_PriceTooLow();
        }
        IERC721 nft = IERC721(_nftAddress);
        if (nft.getApproved(_tokenId) != address(this)) {
            revert Market_MissingMarketApproval();
        }
        sales[_nftAddress][_tokenId] = Sale(msg.sender, _price);
        emit NFTOnSale(msg.sender, _nftAddress, _tokenId, _price);
    }

    /// @notice Update the selling price of a listed NFTs
    /// @param _newPrice New selling price
    /// @param _nftAddress The address of the NFT collection
    /// @param _tokenId The tokenId of the NFT to update
    function updateSalePrice(
        uint256 _newPrice,
        address _nftAddress,
        uint256 _tokenId
    )
        external
        isOnSale(_nftAddress, _tokenId)
        isOwner(_nftAddress, _tokenId, msg.sender)
        nonReentrant
    {
        if (_newPrice < minimalPrice) {
            revert Market_PriceTooLow();
        }
        sales[_nftAddress][_tokenId].price = _newPrice;
        emit NFTOnSale(msg.sender, _nftAddress, _tokenId, _newPrice);
    }

    /// @notice Remove the a NFT from the list of NFT to sell
    /// @param _nftAddress The address of the NFT collection
    /// @param _tokenId The tokenId of the NFT to unlist
    function deleteFromSale(address _nftAddress, uint256 _tokenId)
        external
        isOwner(_nftAddress, _tokenId, msg.sender)
        isOnSale(_nftAddress, _tokenId)
    {
        delete (sales[_nftAddress][_tokenId]);
        emit SaleDeleted(msg.sender, _nftAddress, _tokenId);
    }

    /// @notice Buy a listed NFTs
    /// @param _nftAddress The address of the NFT collection
    /// @param _tokenId The tokenId of the NFT to buy
    function buyItem(address _nftAddress, uint256 _tokenId)
        external
        payable
        isOnSale(_nftAddress, _tokenId)
        nonReentrant
    {
        Sale memory nftOnSale = sales[_nftAddress][_tokenId];
        if (msg.value < nftOnSale.price) {
            revert Market_MissingFounds(_nftAddress, _tokenId, nftOnSale.price);
        }
        // earning minus variable/fix Market commissions & royalties
        uint256 totalMarketFee = ((msg.value * percentFee) / 10000) + fixFee;
        (address royaltyReceiver, uint256 royaltyAmount) = Collection(
            payable(_nftAddress)
        ).royaltyInfo(_tokenId, nftOnSale.price - totalMarketFee);
        uint256 earning = msg.value - totalMarketFee - royaltyAmount;
        earnings[nftOnSale.seller] += earning;
        // royalties payment
        (bool success, ) = payable(royaltyReceiver).call{value: royaltyAmount}(
            ""
        );
        require(success, "Royalty payment failed");
        delete (sales[_nftAddress][_tokenId]);
        emit NFTSold(
            nftOnSale.seller,
            msg.sender,
            _nftAddress,
            _tokenId,
            nftOnSale.price,
            royaltyAmount
        );
        IERC721(_nftAddress).safeTransferFrom(
            nftOnSale.seller,
            msg.sender,
            _tokenId
        );
    }

    /// @notice Withdraw the earnings made on the marketplace selling NFTs of the Morpheus collections
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

    /// @notice Release the funds generated by the mints & sells on the Marketplace once a year for annual Group meeting
    function releaseAll() external onlyOwner {
        emit FundsReleased(msg.sender, address(this).balance);
        (bool success, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(success, "Withdraw failed");
    }
}
