const { assert, expect } = require("chai")
const { network, deployments, ethers } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Complete workflow testing Factory, Collection & Market Smart Contracts working together", function () {
    let accounts;
    let factory;
    let market;

    // console.log(ethers.version);

    // DEFINITIONS
    // Owner is the address who deployed the Factory & Market contract
    // A seller is an address who has been registered by the owner & is able to create NFTs contracts through the Factory contract & manage them
    // A simple user is the other type of contract user with limited rights to sale/buy NFTs or view contract information

    before(async () => {
      accounts = await ethers.getSigners()
      owner = accounts[0]
      seller1 = accounts[1]
      seller2 = accounts[2]
      seller3 = accounts[3]
      simple_user = accounts[3]
      simple_user2 = accounts[4]
    })

    describe("complete workflow", function () {

      before(async () => {
        await deployments.fixture(["factory"]);
        factory = await ethers.getContract("Factory");
        // await collection.init(50, ethers.utils.parseEther('0.05'),
        //   'ipfs://bafybeifgrexwzvjkgql75wruqorhhm5l2estqug3ayfpi3kqwtgbxtisdi/');
        await deployments.fixture("market", [2000000000000000, 1000000000000000, 250]);
        market = await ethers.getContract("Market");

        await factory.setSubsidiary(seller1.address, 'Paris', 'PAR');
        await factory.setSubsidiary(seller2.address, 'Cannes', 'CAN');
        await factory.setSubsidiary(seller3.address, 'Saint-Tropez', 'STP');

        const collection1 = await factory.connect(seller1)
          .createNFTCollection(50, ethers.utils.parseEther('0.005'),
            'ipfs://bafybeifgrexwzvjkgql75wruqorhhm5l2estqug3ayfpi3kqwtgbxtisdi/');
        const collection2 = await factory.connect(seller1)
          .createNFTCollection(50, ethers.utils.parseEther('0.005'),
            'ipfs://bafybeifqkx4kfnov6khb76xwrchwi6zwspujgwph2diwh3ks5j2e226g5i/');
        const collection3 = await factory.connect(seller2)
          .createNFTCollection(50, ethers.utils.parseEther('0.005'),
            'ipfs://bafybeihlm6bfwnexcxexsj7twyvel7ndkiweuohgvutupjrwgzwoidt6aa/');
      })

      it("should be possible for the owner of the Factory contract to get the Subsidiary's information", async function () {
        await factory.getSubsidiary(seller1.address);
      })

      it("should be possible for a seller of the Factory contract to get the Subsidiary's information", async function () {
        await factory.connect(seller1).getSubsidiary(seller2.address);
      })

      it("should be possible for a simple user to get the Subsidiary's information", async function () {
        await factory.connect(simple_user).getSubsidiary(seller1.address);
      })

      it("should be possible for the owner of the Factory to deactivate a subsidiary", async function () {
        await factory.deactivateSubsidiary(seller3.address)
      })

      it("should be possible for the owner of the Factory to update the name & symbol of the subsidiary", async function () {
        await factory.updateSubsidiary(seller1.address, 'Paris 1', 'PAR1')
      })

      it("should be possible for the seller to get the max supply value of a collection", async function () {
        const collectionCreationEventEnd = await factory.queryFilter('CollectionCreated');
        const contract = await ethers.getContractAt('Collection', collectionCreationEventEnd[0]['args'][1])
        await contract.connect(seller1).getMaxSupply();
      })

      it("should be possible for a simple_user to get the max supply value of a collection", async function () {
        const collectionCreationEventEnd = await factory.queryFilter('CollectionCreated');
        const contract = await ethers.getContractAt('Collection', collectionCreationEventEnd[1]['args'][1])
        await contract.connect(simple_user).getMaxSupply();
      })

      it("should be possible for the seller to get the price value", async function () {
        const collectionCreationEventEnd = await factory.queryFilter('CollectionCreated');
        const contract = await ethers.getContractAt('Collection', collectionCreationEventEnd[2]['args'][1])
        await contract.connect(seller2).getPrice();
      })

      it("should be possible for a simple user to get the price value", async function () {
        const collectionCreationEventEnd = await factory.queryFilter('CollectionCreated');
        const contract = await ethers.getContractAt('Collection', collectionCreationEventEnd[2]['args'][1])
        await contract.connect(simple_user).getPrice();
      })

      it("should be possible for the seller to get the base URI value", async function () {
        const collectionCreationEventEnd = await factory.queryFilter('CollectionCreated');
        const contract = await ethers.getContractAt('Collection', collectionCreationEventEnd[2]['args'][1])
        await contract.connect(seller2).getBaseURI();
      })

      it("should be possible for a simple user to get the base URI value", async function () {
        const collectionCreationEventEnd = await factory.queryFilter('CollectionCreated');
        const contract = await ethers.getContractAt('Collection', collectionCreationEventEnd[0]['args'][1])
        await contract.connect(simple_user).getBaseURI();
      })

      it("should be possible for the seller to get the max quantity value", async function () {
        const collectionCreationEventEnd = await factory.queryFilter('CollectionCreated');
        const contract = await ethers.getContractAt('Collection', collectionCreationEventEnd[1]['args'][1])
        await contract.connect(seller1).getMaxQuantity();

      })

      it("should be possible for a simple user to get the max quantity value", async function () {
        const collectionCreationEventEnd = await factory.queryFilter('CollectionCreated');
        const contract = await ethers.getContractAt('Collection', collectionCreationEventEnd[0]['args'][1])
        await contract.connect(simple_user).getMaxQuantity();
      })

      it("should be possible for the factory owner to mint a NFT", async function () {
        const collectionCreationEventEnd = await factory.queryFilter('CollectionCreated');
        const contract = await ethers.getContractAt('Collection', collectionCreationEventEnd[0]['args'][1])
        await contract.mint(1, { value: ethers.utils.parseEther('0.005') })
      })

      it("should be possible for a simple user to mint a NFT", async function () {
        const collectionCreationEventEnd = await factory.queryFilter('CollectionCreated');
        const contract = await ethers.getContractAt('Collection', collectionCreationEventEnd[1]['args'][1])
        await contract.connect(simple_user).mint(1, { value: ethers.utils.parseEther('0.005') })
      })

      it("should be possible to mint several NFTs", async function () {
        const collectionCreationEventEnd = await factory.queryFilter('CollectionCreated');
        const contract = await ethers.getContractAt('Collection', collectionCreationEventEnd[0]['args'][1])
        await contract.connect(simple_user).mint(3, { value: ethers.utils.parseEther('0.015') })
      })

      it("should be possible for the seller to get the URI of a specific token", async function () {
        const collectionCreationEventEnd = await factory.queryFilter('CollectionCreated');
        const contract = await ethers.getContractAt('Collection', collectionCreationEventEnd[1]['args'][1])
        contract.connect(simple_user).mint(1, { value: ethers.utils.parseEther('0.005') })
        await contract.connect(seller1).tokenURI(0);
      })

      it("should be possible for a simple_user to get the URI of a specific token", async function () {
        const collectionCreationEventEnd = await factory.queryFilter('CollectionCreated');
        const contract = await ethers.getContractAt('Collection', collectionCreationEventEnd[1]['args'][1])
        contract.connect(simple_user).mint(3, { value: ethers.utils.parseEther('0.015') })
        await contract.connect(simple_user).tokenURI(2);
      })

      it("should be possible for the seller to change the base URI of the contract", async function () {
        const collectionCreationEventEnd = await factory.queryFilter('CollectionCreated');
        const contract = await ethers.getContractAt('Collection', collectionCreationEventEnd[1]['args'][1])
        await contract.connect(seller1).setBaseURI('ipfs://bafybeifgrexwzvjkgql75wruqorhhm5l2estqug3ayfpi3kqwtgbxtisdi/')
      })

      it("should be possible for the factory owner to request the transfer of funds to the team's members", async function () {
        const collectionCreationEventEnd = await factory.queryFilter('CollectionCreated');
        const contract = await ethers.getContractAt('Collection', collectionCreationEventEnd[1]['args'][1])
        contract.connect(simple_user).mint(3, { value: ethers.utils.parseEther('0.015') })

        // Balance seller before the release
        const sellerBalanceBefore = await seller1.getBalance();

        // Release of revenues
        await contract.releaseAll();

        // Balance after the release
        const sellerBalanceAfter = await seller1.getBalance();

        // Contract seller should have a higher balance  (no impact gas fee as it is on owner account)
        const balanceIncreaseSeller = sellerBalanceAfter.sub(sellerBalanceBefore);
        let should = require('chai').should();
        should.not.equal(ethers.utils.formatEther(balanceIncreaseSeller), 0);
      })

      it("should be possible for a nice simple user to request the transfer of funds to the team's members to pay the gas fees", async function () {
        const collectionCreationEventEnd = await factory.queryFilter('CollectionCreated');
        const contract = await ethers.getContractAt('Collection', collectionCreationEventEnd[1]['args'][1])
        contract.connect(simple_user).mint(3, { value: ethers.utils.parseEther('0.015') })

        // Balance before the release
        const ownerBalanceBefore = await owner.getBalance();

        // Release of revenues
        await contract.connect(simple_user).releaseAll();

        // Balance after the release
        const ownerBalanceAfter = await owner.getBalance();

        // Contract owner should have a higher balance (no impact gas fee as it is on simple user account)
        const balanceIncrease = ownerBalanceAfter.sub(ownerBalanceBefore);
        let should = require('chai').should();
        should.not.equal(ethers.utils.formatEther(balanceIncrease), 0);
      })

      it("should be possible for the owner to change the minimal price of the contract", async function () {
        await market.setMinimalPrice(3000000000000000);
      })

      it("should be possible for the owner to change the fix fee of the contract", async function () {
        await market.setFixFee(1500000000000000)
      })

      it("should be possible for the owner to change the percent fee of the contract", async function () {
        await market.setPercentFee(255)
      })

      it("should be possible for the owner to get the minimal price value", async function () {
        await market.getMinimalPrice();
      })

      it("should be possible for a simple user to get the minimal price value", async function () {
        await market.connect(simple_user).getMinimalPrice();
      })

      it("should be possible for the owner to get the fix fee value", async function () {
        await market.getFixFee();
      })

      it("should be possible for a simple user to get the fix fee value", async function () {
        await market.connect(simple_user).getFixFee();
      })

      it("should be possible for the owner to get the percent fee value", async function () {
        await market.getPercentFee();
      })

      it("should be possible for a simple user to get the percent fee value", async function () {
        await market.connect(simple_user).getPercentFee();
      })

      it("should be possible for the owner to get the selling information of an NFT", async function () {
        const collectionCreationEventEnd = await factory.queryFilter('CollectionCreated');
        const contract = await ethers.getContractAt('Collection', collectionCreationEventEnd[1]['args'][1])
        contract.connect(simple_user).mint(3, { value: ethers.utils.parseEther('0.015') })
        await market.getSale(contract.address, 0);
      })

      it("should be possible for a simple_user to get the selling information of an NFT", async function () {
        const collectionCreationEventEnd = await factory.queryFilter('CollectionCreated');
        const contract = await ethers.getContractAt('Collection', collectionCreationEventEnd[1]['args'][1])
        contract.connect(simple_user).mint(3, { value: ethers.utils.parseEther('0.015') })
        await market.connect(simple_user).getSale(contract.address, 2);
      })

      it("should be possible for a user to add a NFT to the list of NFT to sell", async function () {
        const collectionCreationEventEnd = await factory.queryFilter('CollectionCreated');
        const contract = await ethers.getContractAt('Collection', collectionCreationEventEnd[1]['args'][1])
        contract.connect(simple_user).mint(3, { value: ethers.utils.parseEther('0.015') })
        await contract.connect(simple_user).approve(market.address, 0);
        await market.connect(simple_user).addToSale(contract.address, 0, ethers.utils.parseEther('0.02'));
      })

      it("should be possible for the owner to get the earnings of an address", async function () {
        await market.getEarnings(simple_user.address);
      })

      it("should be possible for a simple_user to get the earnings of an address", async function () {
        await market.connect(simple_user).getEarnings(simple_user.address);
      })

      it("should be possible for a user to update the price of a NFT listed on the marketplace", async function () {
        const collectionCreationEventEnd = await factory.queryFilter('CollectionCreated');
        const contract = await ethers.getContractAt('Collection', collectionCreationEventEnd[1]['args'][1])
        await market.connect(simple_user).updateSalePrice(3100000000000000, contract.address, 0)
      })

      it("should be possible for a user to unlist a NFT on the marketplace", async function () {
        const collectionCreationEventEnd = await factory.queryFilter('CollectionCreated');
        const contract = await ethers.getContractAt('Collection', collectionCreationEventEnd[1]['args'][1])
        await market.connect(simple_user).deleteFromSale(contract.address, 0)
      })

      it("should be possible for a user to buy a NFT listed on the marketplace", async function () {
        const collectionCreationEventEnd = await factory.queryFilter('CollectionCreated');
        const contract = await ethers.getContractAt('Collection', collectionCreationEventEnd[1]['args'][1])
        await market.connect(simple_user).addToSale(contract.address, 0, ethers.utils.parseEther('0.03'));
        await market.connect(simple_user2).buyItem(contract.address, 0, { value: ethers.utils.parseEther('0.03') })
      })

      it("should be possible for a user to withdraw the earnings", async function () {
        market.connect(simple_user).withdraw();
      })

      it("should be possible for the market contract owner to withdraw funds", async function () {
        await market.releaseAll();
      })

    })



  })
