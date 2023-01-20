const { assert, expect } = require("chai")
const { network, deployments, ethers } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Simple Storage Smart Contract Workflow Testing", function () {
    let accounts;
    let simplestorage;

    before(async () => {
      accounts = await ethers.getSigners()
      owner = accounts[0]
    })

    describe("Complete workflow: test of the entire simplestorage process", function () {

      before(async () => {
        await deployments.fixture(["simplestorage"]);
        voting = await ethers.getContract("SimpleStorage");
      })

    })
  })
