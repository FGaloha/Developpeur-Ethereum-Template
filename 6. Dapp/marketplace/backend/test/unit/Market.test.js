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
      seller1 = accounts[3]
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

    describe("getEarnings", function () {

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
        await market.connect(simple_user2).buyItem(collection.address, 0, { value: 2100000000000000 });
      })

      it("should be possible for the owner to get the earnings of an address", async function () {
        const price = 2100000000000000;
        const fixFee = 1000000000000000;
        const percentFee = price * 250 / 10000;
        const earningsWithRoyalties = price - fixFee - percentFee;
        // 5% royalties for creators
        const royalties = earningsWithRoyalties * 500 / 10000;
        const earnings = earningsWithRoyalties - royalties;
        const getEarnings = await market.getEarnings(simple_user.address);
        assert.equal(getEarnings.toNumber(), earnings);
      })

      it("should be possible for a simple_user to get the earnings of an address", async function () {
        const price = 2100000000000000;
        const fixFee = 1000000000000000;
        const percentFee = price * 250 / 10000
        const earningsWithRoyalties = price - fixFee - percentFee;
        // 5% royalties for creators
        const royalties = earningsWithRoyalties * 500 / 10000;
        const earnings = earningsWithRoyalties - royalties;
        const getEarnings = await market.connect(simple_user2).getEarnings(simple_user.address);
        assert.equal(getEarnings.toNumber(), earnings);
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
        await expect(market.connect(simple_user).addToSale(collection.address, 0, 1100000000000000))
          .to.be.revertedWithCustomError(market, 'Market_PriceTooLow');
      })

      it("should not be possible for a user to list a NFT already listed", async function () {
        await collection.connect(simple_user).approve(market.address, 0);
        await market.connect(simple_user).addToSale(collection.address, 0, 2100000000000000)
        await expect(market.connect(simple_user).addToSale(collection.address, 0, 2100000000000000))
          .to.be.revertedWithCustomError(market, 'Market_AlreadyOnSale').withArgs(collection.address, 0);
      })

      it("should not be possible for a user to list a NFT owned by another wallet", async function () {
        await collection.connect(simple_user).approve(market.address, 0);
        await expect(market.connect(simple_user2).addToSale(collection.address, 0, 2100000000000000))
          .to.be.revertedWithCustomError(market, 'Market_NotOwner');
      })

      it("should not be possible for a user to list a NFT if the marketplace is not approved", async function () {
        await expect(market.connect(simple_user).addToSale(collection.address, 0, 2100000000000000))
          .to.be.revertedWithCustomError(market, 'Market_MissingMarketApproval');
      })

    })

    describe("updateSalePrice", function () {

      beforeEach(async () => {
        await deployments.fixture(["collection"]);
        collection = await ethers.getContract("Collection");
        await collection.init(10, ethers.utils.parseEther('0.001'),
          'ipfs://bafybeifgrexwzvjkgql75wruqorhhm5l2estqug3ayfpi3kqwtgbxtisdi/');
        await deployments.fixture("market", [2000000000000000, 1000000000000000, 250]);
        market = await ethers.getContract("Market");
        await collection.connect(simple_user).mint(5, { value: ethers.utils.parseEther('0.005') });
        await collection.connect(simple_user).approve(market.address, 0);
        market.connect(simple_user).addToSale(collection.address, 0, 2100000000000000)
      })

      it("should be possible for a user to update the price of a NFT listed on the marketplace", async function () {
        await expect(market.connect(simple_user).updateSalePrice(3100000000000000, collection.address, 0))
          .to.emit(market, 'NFTOnSale')
          .withArgs(simple_user.address, collection.address, 0, 3100000000000000);
        const sale = await market.getSale(collection.address, 0);
        assert.equal(sale.seller, simple_user.address);
        assert.equal(sale.price.toNumber(), 3100000000000000);
      })

      it("should not be possible for a user to update the price of a NFT listed on the marketplace with a price under the minimal price set by the marketplace", async function () {
        await expect(market.connect(simple_user).updateSalePrice(1100000000000000, collection.address, 0))
          .to.be.revertedWithCustomError(market, 'Market_PriceTooLow');
      })

      it("should not be possible for a user to update the price of a NFT not listed on the marketplace ", async function () {
        await expect(market.connect(simple_user).updateSalePrice(3100000000000000, collection.address, 1))
          .to.be.revertedWithCustomError(market, 'Market_NotOnSale').withArgs(collection.address, 1);
      })

      it("should not be possible for a user to update the price of a NFT owned by another wallet", async function () {
        await expect(market.connect(simple_user2).updateSalePrice(3100000000000000, collection.address, 0))
          .to.be.revertedWithCustomError(market, 'Market_NotOwner');
      })

    })

    describe("deleteFromSale", function () {

      beforeEach(async () => {
        await deployments.fixture(["collection"]);
        collection = await ethers.getContract("Collection");
        await collection.init(10, ethers.utils.parseEther('0.001'),
          'ipfs://bafybeifgrexwzvjkgql75wruqorhhm5l2estqug3ayfpi3kqwtgbxtisdi/');
        await deployments.fixture("market", [2000000000000000, 1000000000000000, 250]);
        market = await ethers.getContract("Market");
        await collection.connect(simple_user).mint(5, { value: ethers.utils.parseEther('0.005') });
        await collection.connect(simple_user).approve(market.address, 0);
        market.connect(simple_user).addToSale(collection.address, 0, 2100000000000000)
      })

      it("should be possible for a user to unlist a NFT on the marketplace", async function () {
        await expect(market.connect(simple_user).deleteFromSale(collection.address, 0))
          .to.emit(market, 'SaleDeleted')
          .withArgs(simple_user.address, collection.address, 0);
        const sale = await market.getSale(collection.address, 0);
        assert.equal(sale.seller, '0x0000000000000000000000000000000000000000');
        assert.equal(sale.price.toNumber(), 0);
      })

      it("should not be possible for a user to unlist a NFT not listed on the marketplace ", async function () {
        await expect(market.connect(simple_user).deleteFromSale(collection.address, 1))
          .to.be.revertedWithCustomError(market, 'Market_NotOnSale').withArgs(collection.address, 1);
      })

      it("should not be possible for a user to unlist a NFT owned by another wallet", async function () {
        await expect(market.connect(simple_user2).deleteFromSale(collection.address, 0))
          .to.be.revertedWithCustomError(market, 'Market_NotOwner');
      })

    })

    describe("buyItem", function () {

      beforeEach(async () => {
        await deployments.fixture(["collection"]);
        collection = await ethers.getContract("Collection");
        await collection.init(10, ethers.utils.parseEther('0.001'),
          'ipfs://bafybeifgrexwzvjkgql75wruqorhhm5l2estqug3ayfpi3kqwtgbxtisdi/');
        await deployments.fixture("market", [2000000000000000, 1000000000000000, 250]);
        market = await ethers.getContract("Market");
        await collection.connect(simple_user).mint(5, { value: ethers.utils.parseEther('0.005') });
        await collection.connect(simple_user).approve(market.address, 0);
        market.connect(simple_user).addToSale(collection.address, 0, 2100000000000000)
      })

      it("should be possible for a user to buy a NFT listed on the marketplace", async function () {
        const price = 2100000000000000;
        const fixFee = 1000000000000000;
        const percentFee = price * 250 / 10000;
        const earningsWithRoyalties = price - fixFee - percentFee;
        // 5% royalties for creators
        const royalties = earningsWithRoyalties * 500 / 10000;
        const earnings = earningsWithRoyalties - royalties;
        const marketFee = fixFee + percentFee;
        console.log(marketFee)

        await expect(market.connect(simple_user2).buyItem(collection.address, 0, { value: price }))
          .to.emit(market, 'NFTSold')
          .withArgs(simple_user.address, simple_user2.address, collection.address, 0, price, royalties, marketFee);

        // The token is not anymore listed
        const sale = await market.getSale(collection.address, 0);
        assert.equal(sale.seller, '0x0000000000000000000000000000000000000000');
        assert.equal(sale.price, 0);

        // simple_user/seller earnings increased
        const sellerEarnings = await market.getEarnings(simple_user.address);
        assert.equal(sellerEarnings.toNumber(), earnings);

        // marketplace earnings increased
        const marketEarnings = await market.getEarnings(market.address);
        assert.equal(marketEarnings.toNumber(), marketFee);

        // simple_user2/buyer is now owner of the token
        const tokenOwner = await collection.ownerOf(0);
        assert.equal(tokenOwner, simple_user2.address);
      })

      it("should not be possible for a user to buy a NFT not listed on the marketplace ", async function () {
        await expect(market.connect(simple_user2).buyItem(collection.address, 1, { value: 2100000000000000 }))
          .to.be.revertedWithCustomError(market, 'Market_NotOnSale').withArgs(collection.address, 1);
      })

      it("should not be possible for a user to buy a NFT without the necessary funds", async function () {
        await expect(market.connect(simple_user2).buyItem(collection.address, 0, { value: 1100000000000000 }))
          .to.be.revertedWithCustomError(market, 'Market_MissingFounds').withArgs(collection.address, 0, 2100000000000000);
      })

    })

    describe("withdraw", function () {

      beforeEach(async () => {
        await deployments.fixture(["collection"]);
        collection = await ethers.getContract("Collection");
        await collection.init(10, ethers.utils.parseEther('0.001'),
          'ipfs://bafybeifgrexwzvjkgql75wruqorhhm5l2estqug3ayfpi3kqwtgbxtisdi/');
        await deployments.fixture("market", [2000000000000000, 1000000000000000, 250]);
        market = await ethers.getContract("Market");

        await collection.connect(simple_user).mint(5, { value: ethers.utils.parseEther('0.005') });
        await collection.connect(simple_user).approve(market.address, 0);
        market.connect(simple_user).addToSale(collection.address, 0, 2100000000000000);
        market.connect(simple_user2).buyItem(collection.address, 0, { value: 2100000000000000 });

      })

      it("should be possible for a user to withdraw the earnings", async function () {
        const price = 2100000000000000;
        const fixFee = 1000000000000000;
        const percentFee = price * 250 / 10000;
        const earningsWithRoyalties = price - fixFee - percentFee;
        // 5% royalties for creators
        const royalties = earningsWithRoyalties * 500 / 10000;
        const earnings = earningsWithRoyalties - royalties;

        // Earnings before withdraw
        const earningsBefore = await market.getEarnings(simple_user.address);
        assert.equal(earningsBefore.toNumber(), earnings);

        await expect(market.connect(simple_user).withdraw())
          .to.emit(market, 'EarningsWithdraw')
          .withArgs(simple_user.address, earnings);

        // Earnings after withdraw
        const earningsAfter = await market.getEarnings(simple_user.address);
        assert.equal(earningsAfter.toNumber(), 0);

      })

      it("should not be possible for a user to withdraw without having earnings", async function () {
        await expect(market.connect(simple_user2).withdraw())
          .to.be.revertedWithCustomError(market, 'Market_NoEarnings').withArgs();
      })

    })

    describe("releaseAll", function () {

      beforeEach(async () => {
        await deployments.fixture(["collection"]);
        collection = await ethers.getContract("Collection");
        await collection.init(10, ethers.utils.parseEther('0.001'),
          'ipfs://bafybeifgrexwzvjkgql75wruqorhhm5l2estqug3ayfpi3kqwtgbxtisdi/');
        await deployments.fixture("market", [2000000000000000, 1000000000000000, 250]);
        market = await ethers.getContract("Market");
        await collection.connect(simple_user).mint(5, { value: ethers.utils.parseEther('0.005') });
        await collection.connect(simple_user).approve(market.address, 0);
        market.connect(simple_user).addToSale(collection.address, 0, 2100000000000000)
        market.connect(simple_user2).buyItem(collection.address, 0, { value: 2100000000000000 });
      })

      it("should be possible for the market contract owner to withdraw funds", async function () {
        const marketEarnings = await market.getEarnings(market.address);
        await expect(market.releaseAll())
          .to.emit(market, 'FundsReleased')
          .withArgs(owner.address, marketEarnings);
      })

      it("should not be possible for the market contract owner to withdraw funds if earnings are 0", async function () {
        market.releaseAll();
        await expect(market.releaseAll())
          .to.be.revertedWithCustomError(market, 'Market_NoEarnings').withArgs();
      })

      it("should not be possible for a simple user to withdraw market contract funds", async function () {
        await expect(market.connect(simple_user).releaseAll())
          .to.be.revertedWith("Ownable: caller is not the owner");
      })

    })

  })
