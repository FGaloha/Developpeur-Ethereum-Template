const { assert, expect } = require("chai")
const { network, deployments, ethers } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Bank Smart Contract Workflow Testing", function () {
    let accounts;
    let bank;

    before(async () => {
      accounts = await ethers.getSigners()
      owner = accounts[0]
    })

    describe("Complete workflow: test of the entire bank process", function () {

      before(async () => {
        await deployments.fixture(["bank"]);
        voting = await ethers.getContract("Bank");
      })

    })
  })
