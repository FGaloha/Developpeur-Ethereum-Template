const { assert, expect } = require("chai")
const { network, deployments, ethers } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Market Smart Contract Unit Testing", function () {
    let accounts;
    let collection;
    let market;

    // console.log(ethers.version);

    // DEFINITIONS
    // Owner is the address who deployed the contract
    // A simple user is the other type of contract user with limited rights to sale/buy NFTs or view contract information

    before(async () => {
      accounts = await ethers.getSigners()
      owner = accounts[0]
      simple_user = accounts[1]
      simple_user2 = accounts[2]
    })

    describe("constructor", function () {

      beforeEach(async () => {
        await deployments.fixture(["collection"]);
        collection = await ethers.getContract("Collection");
        await collection.init(10, ethers.utils.parseEther('0.001'),
          'ipfs://bafybeifgrexwzvjkgql75wruqorhhm5l2estqug3ayfpi3kqwtgbxtisdi/');
        await deployments.fixture("market", [2000000000000000, 1000000000000000, 250]);
        market = await ethers.getContract("Market");
      })

      it("should be possible to deploy the contract", async function () {

        const ownerContract = await market.owner();
        assert.equal(ownerContract, owner.address);

        const minimalPrice = await market.getMinimalPrice();
        assert.equal(minimalPrice.toNumber(), 2000000000000000);

        const fixFee = await market.getFixFee();
        assert.equal(fixFee.toNumber(), 1000000000000000);

        const percentFee = await market.getPercentFee();
        assert.equal(percentFee.toNumber(), 250);
      })

    })

    describe("setMinimalPrice", function () {
      beforeEach(async () => {
        await deployments.fixture(["collection"]);
        collection = await ethers.getContract("Collection");
        await collection.init(10, ethers.utils.parseEther('0.001'),
          'ipfs://bafybeifgrexwzvjkgql75wruqorhhm5l2estqug3ayfpi3kqwtgbxtisdi/');
        await deployments.fixture("market", [2000000000000000, 1000000000000000, 250]);
        market = await ethers.getContract("Market");
      })

      it("should be possible for the owner to change the minimal price of the contract", async function () {
        await expect(market.setMinimalPrice(3000000000000000))
          .to.emit(market, 'MinimalPriceSet')
          .withArgs(3000000000000000, 2000000000000000);
        const newMinimalPrice = await market.getMinimalPrice();
        assert.equal(newMinimalPrice.toNumber(), 3000000000000000);
      })

      it("should not be possible for a user to change the minimal price of the contract", async function () {
        await expect(market.connect(simple_user).setMinimalPrice(3000000000000000))
          .to.be.revertedWith("Ownable: caller is not the owner");
      })
    })

    describe("setFixFee", function () {
      beforeEach(async () => {
        await deployments.fixture(["collection"]);
        collection = await ethers.getContract("Collection");
        await collection.init(10, ethers.utils.parseEther('0.001'),
          'ipfs://bafybeifgrexwzvjkgql75wruqorhhm5l2estqug3ayfpi3kqwtgbxtisdi/');
        await deployments.fixture("market", [2000000000000000, 1000000000000000, 250]);
        market = await ethers.getContract("Market");
      })

      it("should be possible for the owner to change the fix fee of the contract", async function () {
        await expect(market.setFixFee(1500000000000000))
          .to.emit(market, 'FixFeeSet')
          .withArgs(1500000000000000, 1000000000000000);
        const newFixFee = await market.getFixFee();
        assert.equal(newFixFee.toNumber(), 1500000000000000);
      })

      it("should not be possible for a user to change the fix fee of the contract", async function () {
        await expect(market.connect(simple_user).setFixFee(1500000000000000))
          .to.be.revertedWith("Ownable: caller is not the owner");
      })
    })

    describe("setPercentFee", function () {
      beforeEach(async () => {
        await deployments.fixture(["collection"]);
        collection = await ethers.getContract("Collection");
        await collection.init(10, ethers.utils.parseEther('0.001'),
          'ipfs://bafybeifgrexwzvjkgql75wruqorhhm5l2estqug3ayfpi3kqwtgbxtisdi/');
        await deployments.fixture("market", [2000000000000000, 1000000000000000, 250]);
        market = await ethers.getContract("Market");
      })

      it("should be possible for the owner to change the percent fee of the contract", async function () {
        await expect(market.setPercentFee(255))
          .to.emit(market, 'PercentFeeSet')
          .withArgs(255, 250);
        const newPercentFee = await market.getPercentFee();
        assert.equal(newPercentFee.toNumber(), 255);
      })

      it("should not be possible for a user to change the percent fee of the contract", async function () {
        await expect(market.connect(simple_user).setPercentFee(255))
          .to.be.revertedWith("Ownable: caller is not the owner");
      })
    })

    describe("getMinimalPrice", function () {

      beforeEach(async () => {
        await deployments.fixture(["collection"]);
        collection = await ethers.getContract("Collection");
        await collection.init(10, ethers.utils.parseEther('0.001'),
          'ipfs://bafybeifgrexwzvjkgql75wruqorhhm5l2estqug3ayfpi3kqwtgbxtisdi/');
        await deployments.fixture("market", [2000000000000000, 1000000000000000, 250]);
        market = await ethers.getContract("Market");
      })

      it("should be possible for the owner to get the minimal price value", async function () {
        const minimalPrice = await market.getMinimalPrice();
        assert.equal(minimalPrice.toNumber(), 2000000000000000);
      })

      it("should be possible for a simple user to get the minimal price value", async function () {
        const minimalPrice = await market.connect(simple_user).getMinimalPrice();
        assert.equal(minimalPrice.toNumber(), 2000000000000000);
      })

    })

    describe("getFixFee", function () {

      beforeEach(async () => {
        await deployments.fixture(["collection"]);
        collection = await ethers.getContract("Collection");
        await collection.init(10, ethers.utils.parseEther('0.001'),
          'ipfs://bafybeifgrexwzvjkgql75wruqorhhm5l2estqug3ayfpi3kqwtgbxtisdi/');
        await deployments.fixture("market", [2000000000000000, 1000000000000000, 250]);
        market = await ethers.getContract("Market");
      })

      it("should be possible for the owner to get the fix fee value", async function () {
        const fixFee = await market.getFixFee();
        assert.equal(fixFee.toNumber(), 1000000000000000);
      })

      it("should be possible for a simple user to get the fix fee value", async function () {
        const fixFee = await market.connect(simple_user).getFixFee();
        assert.equal(fixFee.toNumber(), 1000000000000000);
      })

    })

    describe("getPercentFee", function () {

      beforeEach(async () => {
        await deployments.fixture(["collection"]);
        collection = await ethers.getContract("Collection");
        await collection.init(10, ethers.utils.parseEther('0.001'),
          'ipfs://bafybeifgrexwzvjkgql75wruqorhhm5l2estqug3ayfpi3kqwtgbxtisdi/');
        await deployments.fixture("market", [2000000000000000, 1000000000000000, 250]);
        market = await ethers.getContract("Market");
      })

      it("should be possible for the owner to get the percent fee value", async function () {
        const percentFee = await market.getPercentFee();
        assert.equal(percentFee.toNumber(), 250);
      })

      it("should be possible for a simple user to get the percent fee value", async function () {
        const percentFee = await market.connect(simple_user).getPercentFee();
        assert.equal(percentFee.toNumber(), 250);
      })

    })

    describe("getSale", function () {

      beforeEach(async () => {
        await deployments.fixture(["collection"]);
        collection = await ethers.getContract("Collection");
        await collection.init(10, ethers.utils.parseEther('0.001'),
          'ipfs://bafybeifgrexwzvjkgql75wruqorhhm5l2estqug3ayfpi3kqwtgbxtisdi/');
        await deployments.fixture("market", [2000000000000000, 1000000000000000, 250]);
        market = await ethers.getContract("Market");
        await collection.connect(simple_user).mint(5, { value: ethers.utils.parseEther('0.005') });
        await collection.connect(simple_user).approve(market.address, 0);
        await market.connect(simple_user).addToSale(collection.address, 0, 2100000000000000);
      })

      it("should be possible for the owner to get the selling information of an NFT", async function () {
        const sale = await market.getSale(collection.address, 0);
        assert.equal(sale.seller, simple_user.address);
        assert.equal(sale.price.toNumber(), 2100000000000000);
      })

      it("should be possible for a simple_user to get the selling information of an NFT", async function () {
        const sale = await market.connect(simple_user).getSale(collection.address, 0);
        assert.equal(sale.seller, simple_user.address);
        assert.equal(sale.price.toNumber(), 2100000000000000);
      })

    })

    // Fix when debugg buyItem
    describe("getEarnings", function () {

      beforeEach(async () => {
        await deployments.fixture(["collection"]);
        collection = await ethers.getContract("Collection");
        await collection.init(10, ethers.utils.parseEther('0.001'),
          'ipfs://bafybeifgrexwzvjkgql75wruqorhhm5l2estqug3ayfpi3kqwtgbxtisdi/');
        await deployments.fixture("market", [0, 0, 0]);
        market = await ethers.getContract("Market");
        await collection.connect(simple_user).mint(5, { value: ethers.utils.parseEther('0.005') });
        await collection.connect(simple_user).approve(market.address, 0);
        await market.connect(simple_user).addToSale(collection.address, 0, 2100000000000000);
        await market.connect(simple_user2).buyItem(collection.address, 0, { value: 2100000000000000 });
      })

      it("should be possible for the owner to get the earnings of an address", async function () {
        const royalties = 2100000000000000 * 5 / 100;
        const earningsEvaluation = 2100000000000000 - royalties;
        const earnings = await market.getEarnings(simple_user.address);
        //assert.equal(earnings.toNumber(), earningsEvaluation);
        console.log(earningsEvaluation)
        console.log(earnings.toNumber())
      })

      it("should be possible for a simple_user to get the earnings of an address", async function () {
        const royalties = 2100000000000000 * 5 / 100;
        const earningsEvaluation = 2100000000000000 - royalties;
        const earnings = await market.connect(simple_user2).getEarnings(simple_user.address);
        //assert.equal(earnings.toNumber(), earningsEvaluation);
      })

    })

    describe("addToSale", function () {

      beforeEach(async () => {
        await deployments.fixture(["collection"]);
        collection = await ethers.getContract("Collection");
        await collection.init(10, ethers.utils.parseEther('0.001'),
          'ipfs://bafybeifgrexwzvjkgql75wruqorhhm5l2estqug3ayfpi3kqwtgbxtisdi/');
        await deployments.fixture("market", [2000000000000000, 1000000000000000, 250]);
        market = await ethers.getContract("Market");
        await collection.connect(simple_user).mint(5, { value: ethers.utils.parseEther('0.005') });
      })

      it("should be possible for a user to add a NFT to the list of NFT to sell", async function () {
        await collection.connect(simple_user).approve(market.address, 0);
        await expect(market.connect(simple_user).addToSale(collection.address, 0, 2100000000000000))
          .to.emit(market, 'NFTOnSale')
          .withArgs(simple_user.address, collection.address, 0, 2100000000000000);
        const sale = await market.getSale(collection.address, 0);
        assert.equal(sale.seller, simple_user.address);
        assert.equal(sale.price.toNumber(), 2100000000000000);
      })

      it("should not be possible for a user to list a NFT with a price under the minimal price set by the marketplace", async function () {
        await collection.connect(simple_user).approve(market.address, 0);
      })

      it("should not be possible for a user to list a NFT already listed", async function () {
        await collection.connect(simple_user).approve(market.address, 0);
      })

      it("should not be possible for a user to list a NFT owned by another wallet", async function () {
        await collection.connect(simple_user).approve(market.address, 0);
      })

      it("should not be possible for a user to list a NFT if the marketplace is not approved", async function () {

      })

    })

    //await market.connect(simple_user2).buyItem(collection.address, 0, { value: 2100000000000000 });


  })
