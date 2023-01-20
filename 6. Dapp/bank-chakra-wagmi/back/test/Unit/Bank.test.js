const { assert, expect } = require("chai")
const { network, deployments, ethers } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Bank Smart Contract Unit Testing", function () {
    let accounts;
    let bank;

    before(async () => {
      accounts = await ethers.getSigners()
      owner = accounts[0]
    })

    describe("sendEthers", function () {

      beforeEach(async () => {
        await deployments.fixture(["bank"]);
        bank = await ethers.getContract("Bank");
      })

    })

  })
