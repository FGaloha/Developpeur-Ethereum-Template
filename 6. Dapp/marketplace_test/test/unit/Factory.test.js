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
    // A voter is a person who has been registered by the owner & is able to vote & access voter's features
    // A simple user is a person who is a non registered voter, cannot vote but can check the winning proposal

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
        voting = await ethers.getContract("Collection");
        await deployments.fixture(["factory"]);
        voting = await ethers.getContract("Factory");
      })

      it("should not be possible for a simple user to add a voter", async function () {
        // await expect(voting.connect(simple_user).addVoter(simple_user.address))
        //   .to.be.revertedWith("Ownable: caller is not the owner");
      })



    })



  })
