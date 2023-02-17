const { assert, expect } = require("chai")
const { network, deployments, ethers } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Factory Smart Contract Unit Testing", function () {
    let accounts;
    let collection;
    let factory;

    // DEFINITIONS
    // Owner is the address who deployed the contract
    // A seller is an address who has been registered by the owner & is able to create NFTs contract through the Factory contract
    // A simple user is a non registered address & has no rights except to view the list of subsidiaries which are by fact public on etherscan

    before(async () => {
      accounts = await ethers.getSigners()
      owner = accounts[0]
      seller1 = accounts[1]
      seller2 = accounts[2]
      simple_user = accounts[3]
    })

    describe("setSubsidiary", function () {

      beforeEach(async () => {
        await deployments.fixture(["collection"]);
        collection = await ethers.getContract("Collection");
        await deployments.fixture(["factory"]);
        factory = await ethers.getContract("Factory");
      })

      it("should be possible for the owner of the Factory to create a subsidiary", async function () {
        await expect(factory.setSubsidiary(seller1.address, 'Paris', 'PAR'))
          .to.emit(factory, 'SubsidiaryAdded')
          .withArgs(seller1.address, 'Paris', 'PAR');
      })

      it("should not be possible for a seller of the Factory to create a subsidiary", async function () {
        await factory.setSubsidiary(seller1.address, 'Paris', 'PAR')
        await expect(factory.connect(seller1).setSubsidiary(seller2.address, 'Cannes', 'CAN'))
          .to.be.revertedWith("Ownable: caller is not the owner");
      })

      it("should not be possible for a simple user to create a subsidiary", async function () {
        await expect(factory.connect(simple_user).setSubsidiary(seller1.address, 'Paris', 'PAR'))
          .to.be.revertedWith("Ownable: caller is not the owner");
      })

      it("should be possible for the owner of the Factory to update a subsidiary", async function () {
        await expect(factory.setSubsidiary(seller1.address, 'Paris 1', 'PAR1'))
          .to.emit(factory, 'SubsidiaryAdded')
          .withArgs(seller1.address, 'Paris 1', 'PAR1');
      })

    })

    describe("getSubsidiary", function () {

      beforeEach(async () => {
        await deployments.fixture(["collection"]);
        collection = await ethers.getContract("Collection");
        await deployments.fixture(["factory"]);
        factory = await ethers.getContract("Factory");
        await factory.setSubsidiary(seller1.address, 'Paris', 'PAR');
      })

      it("should be possible for the owner of the Factory contract to get the Subsidiary's information", async function () {
        const getSubsidiary = await factory.getSubsidiary(seller1.address);
        assert.equal(getSubsidiary.name, 'Paris');
        assert.equal(getSubsidiary.symbol, 'PAR');
        assert.equal(getSubsidiary.team[0], seller1.address);
        assert.equal(getSubsidiary.team[1], owner.address);
        assert.equal(getSubsidiary.isActive, true);
        assert.equal(getSubsidiary.counter, 1);
      })

      it("should be possible for a seller of the Factory contract to get the Subsidiary's information", async function () {
        const getSubsidiary = await factory.connect(seller1).getSubsidiary(seller1.address);
        assert.equal(getSubsidiary.name, 'Paris');
        assert.equal(getSubsidiary.symbol, 'PAR');
        assert.equal(getSubsidiary.team[0], seller1.address);
        assert.equal(getSubsidiary.team[1], owner.address);
        assert.equal(getSubsidiary.isActive, true);
        assert.equal(getSubsidiary.counter, 1);
      })

      it("should be possible for a simple user to get the Subsidiary's information", async function () {
        const getSubsidiary = await factory.connect(simple_user).getSubsidiary(seller1.address);
        assert.equal(getSubsidiary.name, 'Paris');
        assert.equal(getSubsidiary.symbol, 'PAR');
        assert.equal(getSubsidiary.team[0], seller1.address);
        assert.equal(getSubsidiary.team[1], owner.address);
        assert.equal(getSubsidiary.isActive, true);
        assert.equal(getSubsidiary.counter, 1);
      })

    })

    describe("deactivateSubsidiary", function () {

      beforeEach(async () => {
        await deployments.fixture(["collection"]);
        collection = await ethers.getContract("Collection");
        await deployments.fixture(["factory"]);
        factory = await ethers.getContract("Factory");
        await factory.setSubsidiary(seller1.address, 'Paris', 'PAR');
      })

      it("should be possible for the owner of the Factory to deactivate a subsidiary", async function () {
        await expect(factory.deactivateSubsidiary(seller1.address))
          .to.emit(factory, 'SubsidiaryDeactivated')
          .withArgs(seller1.address, 'Paris', 'PAR');
        const getSubsidiary = await factory.getSubsidiary(seller1.address);
        assert.equal(getSubsidiary.isActive, false);
      })

      it("should not be possible for a subsidiary to deactivate a subsidiary", async function () {
        await expect(factory.connect(seller1).deactivateSubsidiary(seller1.address))
          .to.be.revertedWith("Ownable: caller is not the owner");
      })

      it("should not be possible for a simple user to deactivate a subsidiary", async function () {
        await expect(factory.connect(simple_user).deactivateSubsidiary(seller1.address))
          .to.be.revertedWith("Ownable: caller is not the owner");
      })

      it("should be possible for the owner of the Factory to reactivate a subsidiary", async function () {
        await factory.deactivateSubsidiary(seller1.address);
        const getSubsidiaryBefore = await factory.getSubsidiary(seller1.address);
        assert.equal(getSubsidiaryBefore.isActive, false);
        await expect(factory.setSubsidiary(seller1.address, 'Paris 1', 'PAR1'))
          .to.emit(factory, 'SubsidiaryAdded')
          .withArgs(seller1.address, 'Paris 1', 'PAR1');
        const getSubsidiaryAfter = await factory.getSubsidiary(seller1.address);
        assert.equal(getSubsidiaryAfter.isActive, true);
      })

    })

    describe("createNFTCollection", function () {

      beforeEach(async () => {
        await deployments.fixture(["collection"]);
        collection = await ethers.getContract("Collection");
        await deployments.fixture(["factory"]);
        factory = await ethers.getContract("Factory");
        await factory.setSubsidiary(seller1.address, 'Paris', 'PAR');
      })

      it("should be possible for a subsidiary of the Factory to create a new collection", async function () {

        //Event collection created should be empty
        const collectionCreationEventBegin = await factory.queryFilter('CollectionCreated');
        assert.equal(collectionCreationEventBegin.length, 0);

        const collection = await factory.connect(seller1)
          .createNFTCollection(10, ethers.utils.parseEther('0.001'),
            'ipfs://bafybeifgrexwzvjkgql75wruqorhhm5l2estqug3ayfpi3kqwtgbxtisdi/');

        // Event collection created should have now 1 item with correct data
        const collectionCreationEventEnd = await factory.queryFilter('CollectionCreated');
        assert.equal(collectionCreationEventEnd.length, 1);
        assert.equal(collectionCreationEventEnd[0]['args'][0], 'Paris - 1');
        assert.equal(collectionCreationEventEnd[0]['args'][3], seller1.address);
        const blockNumber = collection['blockNumber']
        const timestamp = (await ethers.provider.getBlock(blockNumber)).timestamp;
        assert.equal(collectionCreationEventEnd[0]['args'][2].toString(), timestamp);

        //The contract created should have been initialized correctly
        const contract = await ethers.getContractAt('Collection', collectionCreationEventEnd[0]['args'][1])

        const maxSupply = await contract.getMaxSupply();
        const price = await contract.getPrice();
        const maxQuantity = await contract.getMaxQuantity();
        const baseURI = await contract.getBaseURI();
        const contractOwner = await contract.owner();

        assert.equal(maxSupply.toString(), '10');
        assert.equal(ethers.utils.formatEther(price).toString(), '0.001');
        assert.equal(maxQuantity.toString(), '50');
        assert.equal(baseURI.toString(), 'ipfs://bafybeifgrexwzvjkgql75wruqorhhm5l2estqug3ayfpi3kqwtgbxtisdi/');

        // The subsidiary should be the owner after the creation
        assert.equal(contractOwner, seller1.address);
      })

      it("should not be possible for the owner of the Factory to create a collection without being a subsidiary", async function () {
        await expect(factory.createNFTCollection(10, ethers.utils.parseEther('0.001'),
          'ipfs://bafybeifgrexwzvjkgql75wruqorhhm5l2estqug3ayfpi3kqwtgbxtisdi/'))
          .to.be.revertedWith("Not a seller");
      })

      it("should not be possible for a simple user to create a collection", async function () {
        await expect(factory.connect(simple_user).createNFTCollection(10, ethers.utils.parseEther('0.001'),
          'ipfs://bafybeifgrexwzvjkgql75wruqorhhm5l2estqug3ayfpi3kqwtgbxtisdi/'))
          .to.be.revertedWith("Not a seller");
      })

    })

  })
