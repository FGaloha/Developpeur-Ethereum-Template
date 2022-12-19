const { assert, expect } = require("chai")
const { network, deployments, ethers } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { _nameprepTableC } = require("@ethersproject/strings/lib/idna");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Units tests of FlavERC20 smart contract", function () {
    let accounts;
    let flaverc20;
    const _name = "FlavCoin";
    const _symbol = "FLAV";
    const _startAmount = 1000000 * 1e18;

    before(async () => {
      accounts = await ethers.getSigners()
      deployer = accounts[0]
      recipient = accounts[1]
    })

    describe("Deployment", async function () {
      it("should deploy the smart contract", async function () {
        await deployments.fixture(["flaverc20"]);
        flaverc20 = await ethers.getContract("FlavERC20");
      })

      it("should deploy the smart contract with the symbol FLAV", async function () {
        assert.equal(await flaverc20.symbol(), _symbol);
      })

      it("should deploy the smart contract with the name FlavCoin", async function () {
        assert.equal(await flaverc20.name(), _name);
      })

      it("...owner should have a balance equal to initialSupply", async () => {
        assert.equal(await flaverc20.balanceOf(deployer.getAddress()), _startAmount);
      });

    })

    describe("Mint", async function () {
      it("should be possible to mint as a owner", async function () {
        await flaverc20.mint(deployer.getAddress(), 100);
        let balanceOfdeployer = await flaverc20.balanceOf(deployer.getAddress());
        assert.equal(balanceOfdeployer, _startAmount + 100);
      })

      it("should not be possible to mint if not the owner", async function () {
        await expect(flaverc20.connect(recipient).mint(recipient.getAddress(), 100)).to.be.revertedWith("Ownable: caller is not the owner");
      })

      it("Should change balances owner & recipient after mint", async function () {
        let balanceRecipientBeforeTx = await flaverc20.balanceOf(recipient.address);
        assert.equal(balanceRecipientBeforeTx, 0);
        let balanceOwnerBeforeTx = await flaverc20.balanceOf(deployer.address);
        let myTx = await flaverc20.mint(recipient.address, 100);
        let balanceRecipientAfterTx = await flaverc20.balanceOf(recipient.address);
        let balanceOwnerAfterTx = await flaverc20.balanceOf(deployer.address);
        assert.equal(balanceRecipientAfterTx, 100);
        assert.equal(balanceOwnerAfterTx, balanceOwnerBeforeTx - 100);
      })
    })

    // describe("Set", async function () {
    //   it("should set the number", async function () {
    //     await simplestorage.set(5)
    //     let number = await simplestorage.get()
    //     assert.equal(number.toString(), "5");
    //   })
    // })
  })
