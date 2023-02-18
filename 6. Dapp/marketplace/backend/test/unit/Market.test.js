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
    })

    describe("constructor", function () {

      beforeEach(async () => {
        await deployments.fixture(["collection"]);
        collection = await ethers.getContract("Collection");
        await collection.init(10, ethers.utils.parseEther('0.001'),
          'ipfs://bafybeifgrexwzvjkgql75wruqorhhm5l2estqug3ayfpi3kqwtgbxtisdi/');
        await deployments.fixture(["market"]);
        collection = await ethers.getContract("Market");
      })

      it("should be possible to deploy the contract", async function () {


      })

    })

  })
