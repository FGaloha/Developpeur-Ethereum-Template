const { assert, expect } = require("chai")
const { network, deployments, ethers } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Collection Smart Contract Unit Testing", function () {
    let accounts;
    let collection;

    // DEFINITIONS
    // Owner is the address who deployed the contract
    // A simple user is the other type of contract user with limited rights to mint or view contract information

    before(async () => {
      accounts = await ethers.getSigners()
      owner = accounts[0]
      simple_user = accounts[1]
    })

    describe("constructor", function () {

      beforeEach(async () => {
        await deployments.fixture("collection");
        collection = await ethers.getContract("Collection");
      })

      it("should be possible to deploy the contract", async function () {
        const ownerContract = await collection.owner();
        assert.equal(ownerContract, owner.address);

        const name = await collection.name();
        assert.equal(name, '');

        const maxQuantity = await collection.getMaxQuantity();
        assert.equal(maxQuantity, 50);

        const totalShares = await collection.totalShares();
        assert.equal(totalShares, 100);

      })

    })

    describe("init", function () {

      beforeEach(async () => {
        await deployments.fixture(["collection"]);
        collection = await ethers.getContract("Collection");
      })

      it("should be possible for the owner to initialized the contract", async function () {
        await collection.init(10, ethers.utils.parseEther('0.001'),
          'ipfs://bafybeifgrexwzvjkgql75wruqorhhm5l2estqug3ayfpi3kqwtgbxtisdi/');

        const maxSupply = await collection.getMaxSupply();
        const price = await collection.getPrice();
        const baseURI = await collection.getBaseURI();
        assert.equal(maxSupply, 10);
        assert.equal(ethers.utils.formatEther(price), 0.001);
        assert.equal(baseURI, 'ipfs://bafybeifgrexwzvjkgql75wruqorhhm5l2estqug3ayfpi3kqwtgbxtisdi/');
      })

      it("should not be possible for a simple user to initialize the contract", async function () {
        await expect(collection.connect(simple_user).init(10, ethers.utils.parseEther('0.001'),
          'ipfs://bafybeifgrexwzvjkgql75wruqorhhm5l2estqug3ayfpi3kqwtgbxtisdi/'))
          .to.be.revertedWith("Ownable: caller is not the owner");
      })

    })

    describe("getMaxSupply", function () {

      beforeEach(async () => {
        await deployments.fixture(["collection"]);
        collection = await ethers.getContract("Collection");
        await collection.init(10, ethers.utils.parseEther('0.001'),
          'ipfs://bafybeifgrexwzvjkgql75wruqorhhm5l2estqug3ayfpi3kqwtgbxtisdi/');
      })

      it("should be possible for the owner to get the max supply value", async function () {
        const maxSupply = await collection.getMaxSupply();
        assert.equal(maxSupply, 10);
      })

      it("should be possible for a simple_user to get the max supply value", async function () {
        const maxSupply = await collection.connect(simple_user).getMaxSupply();
        assert.equal(maxSupply, 10);
      })

    })

    describe("getPrice", function () {

      beforeEach(async () => {
        await deployments.fixture(["collection"]);
        collection = await ethers.getContract("Collection");
        await collection.init(10, ethers.utils.parseEther('0.001'),
          'ipfs://bafybeifgrexwzvjkgql75wruqorhhm5l2estqug3ayfpi3kqwtgbxtisdi/');
      })

      it("should be possible for the owner to get the price value", async function () {
        const price = await collection.getPrice();
        assert.equal(ethers.utils.formatEther(price), 0.001);
      })

      it("should be possible for a simple user to get the price value", async function () {
        const price = await collection.connect(simple_user).getPrice();
        assert.equal(ethers.utils.formatEther(price), 0.001);
      })

    })

    describe("getBaseURI", function () {

      beforeEach(async () => {
        await deployments.fixture(["collection"]);
        collection = await ethers.getContract("Collection");
        await collection.init(10, ethers.utils.parseEther('0.001'),
          'ipfs://bafybeifgrexwzvjkgql75wruqorhhm5l2estqug3ayfpi3kqwtgbxtisdi/');
      })

      it("should be possible for the owner to get the base URI value", async function () {
        const baseURI = await collection.getBaseURI();
        assert.equal(baseURI, 'ipfs://bafybeifgrexwzvjkgql75wruqorhhm5l2estqug3ayfpi3kqwtgbxtisdi/');
      })

      it("should be possible for a simple user to get the base URI value", async function () {
        const baseURI = await collection.connect(simple_user).getBaseURI();
        assert.equal(baseURI, 'ipfs://bafybeifgrexwzvjkgql75wruqorhhm5l2estqug3ayfpi3kqwtgbxtisdi/');
      })

    })

    describe("getMaxQuantity", function () {

      beforeEach(async () => {
        await deployments.fixture(["collection"]);
        collection = await ethers.getContract("Collection");
      })

      it("should be possible for the owner to get the max quantity value", async function () {
        const maxQuantity = await collection.getMaxQuantity();
        assert.equal(maxQuantity, 50);
      })

      it("should be possible for a simple user to get the max quantity value", async function () {
        const maxQuantity = await collection.connect(simple_user).getMaxQuantity();
        assert.equal(maxQuantity, 50);
      })

    })

    describe("mint", function () {

      beforeEach(async () => {
        await deployments.fixture(["collection"]);
        collection = await ethers.getContract("Collection");
        await collection.init(60, ethers.utils.parseEther('0.001'),
          'ipfs://bafybeifgrexwzvjkgql75wruqorhhm5l2estqug3ayfpi3kqwtgbxtisdi/');
      })

      it("should be possible for the owner to mint a NFT", async function () {
        await expect(collection.mint(1, { value: ethers.utils.parseEther('0.001') }))
          .to.emit(collection, 'Mint')
          .withArgs(owner.address, 0);
      })

      it("should be possible for a simple user to mint a NFT", async function () {
        await expect(collection.connect(simple_user).mint(1, { value: ethers.utils.parseEther('0.001') }))
          .to.emit(collection, 'Mint')
          .withArgs(simple_user.address, 0);
      })

      it("should be possible to mint several NFTs", async function () {
        await expect(collection.connect(simple_user).mint(2, { value: ethers.utils.parseEther('0.002') }))
          .to.emit(collection, 'Mint')
          .withArgs(simple_user.address, 1);
      })

      it("should not be possible to mint more than the max supply", async function () {
        await collection.connect(simple_user).mint(50, { value: ethers.utils.parseEther('0.050') });
        await expect(collection.connect(simple_user).mint(11, { value: ethers.utils.parseEther('0.001') }))
          .to.be.revertedWith("Sold out");
      })

      it("should not be possible to mint more than 50 NFTs at once", async function () {
        await expect(collection.connect(simple_user).mint(51, { value: ethers.utils.parseEther('0.051') }))
          .to.be.revertedWith("Max 50 per transaction");
      })

      it("should not be possible to mint without enough funds", async function () {
        await expect(collection.connect(simple_user).mint(2, { value: ethers.utils.parseEther('0.001') }))
          .to.be.revertedWith("Not enough funds");
      })

    })

    describe("tokenURI", function () {

      beforeEach(async () => {
        await deployments.fixture(["collection"]);
        collection = await ethers.getContract("Collection");
        await collection.init(60, ethers.utils.parseEther('0.001'),
          'ipfs://bafybeifgrexwzvjkgql75wruqorhhm5l2estqug3ayfpi3kqwtgbxtisdi/');
        collection.mint(1, { value: ethers.utils.parseEther('0.001') })
      })

      it("should be possible for the owner to get the URI of a specific token", async function () {
        const tokenURI = await collection.tokenURI(0);
        assert.equal(tokenURI, 'ipfs://bafybeifgrexwzvjkgql75wruqorhhm5l2estqug3ayfpi3kqwtgbxtisdi/0.json')
      })

      it("should be possible for a simple_user to get the URI of a specific token", async function () {
        const tokenURI = await collection.connect(simple_user).tokenURI(0);
        assert.equal(tokenURI, 'ipfs://bafybeifgrexwzvjkgql75wruqorhhm5l2estqug3ayfpi3kqwtgbxtisdi/0.json')
      })

      it("should not be possible for a user to request for the URI of a non existing token", async function () {
        await expect(collection.connect(simple_user).tokenURI(1))
          .to.be.revertedWith("Non existing token");
      })

    })

    describe("setBaseURI", function () {

      beforeEach(async () => {
        await deployments.fixture(["collection"]);
        collection = await ethers.getContract("Collection");
        await collection.init(60, ethers.utils.parseEther('0.001'),
          'ipfs://bafybeiez6ssotxfjpeiasxtxa2rk2y53tpqhhkmeuxs335wpj7ptztkud4/');
      })

      it("should be possible for the owner to change the base URI of the contract", async function () {
        await expect(collection.setBaseURI('ipfs://bafybeifgrexwzvjkgql75wruqorhhm5l2estqug3ayfpi3kqwtgbxtisdi/'))
          .to.emit(collection, 'BaseURIChanged')
          .withArgs('ipfs://bafybeifgrexwzvjkgql75wruqorhhm5l2estqug3ayfpi3kqwtgbxtisdi/',
            'ipfs://bafybeiez6ssotxfjpeiasxtxa2rk2y53tpqhhkmeuxs335wpj7ptztkud4/');
      })

      it("should not be possible for a user to change the base URI of the contract", async function () {
        await expect(collection.connect(simple_user).setBaseURI('ipfs://bafybeifgrexwzvjkgql75wruqorhhm5l2estqug3ayfpi3kqwtgbxtisdi/'))
          .to.be.revertedWith("Ownable: caller is not the owner");
      })

    })

    describe("releaseAll", function () {

      beforeEach(async () => {
        await deployments.fixture(["collection"]);
        collection = await ethers.getContract("Collection");
        await collection.init(60, ethers.utils.parseEther('100'),
          'ipfs://bafybeiez6ssotxfjpeiasxtxa2rk2y53tpqhhkmeuxs335wpj7ptztkud4/');
        await collection.connect(simple_user).mint(10, { value: ethers.utils.parseEther('1000') })
      })

      it("should be possible for the owner to request the transfer of funds to the team's members", async function () {
        // Balance before the release
        const ownerBalanceBefore = await owner.getBalance();

        // Release of revenues
        await collection.releaseAll();

        // Balance after the release
        const ownerBalanceAfter = await owner.getBalance();

        // Contract owner should have a higher balance
        const balanceIncrease = ownerBalanceAfter.sub(ownerBalanceBefore);
        let should = require('chai').should();
        should.not.equal(ethers.utils.formatEther(balanceIncrease), 0);
      })

      it("should be possible for a nice simple user to request the transfer of funds to the team's members to pay the gas fees", async function () {
        // Balance before the release
        const ownerBalanceBefore = await owner.getBalance();

        // Release of revenues
        await collection.connect(simple_user).releaseAll();

        // Balance after the release
        const ownerBalanceAfter = await owner.getBalance();

        // Contract owner should have a higher balance
        const balanceIncrease = ownerBalanceAfter.sub(ownerBalanceBefore);
        let should = require('chai').should();
        should.not.equal(ethers.utils.formatEther(balanceIncrease), 0);
      })

    })

    describe("supportsInterface", function () {

      beforeEach(async () => {
        await deployments.fixture(["collection"]);
        collection = await ethers.getContract("Collection");
        await collection.init(60, ethers.utils.parseEther('10'),
          'ipfs://bafybeiez6ssotxfjpeiasxtxa2rk2y53tpqhhkmeuxs335wpj7ptztkud4/');
        await collection.connect(simple_user).mint(10, { value: ethers.utils.parseEther('100') })
      })

      it("should be possible for the owner to check if the contract support the ERC721 interface", async function () {
        const testInterface = await collection.supportsInterface("0x80ac58cd");
        // ERC721
        assert.equal(true, testInterface);
      })

      it("should be possible for a simple user to check if the contract support the ERC721 interface", async function () {
        const testInterface = await collection.connect(simple_user).supportsInterface("0x80ac58cd");
        // ERC721
        assert.equal(true, testInterface);
      })

    })

  })
