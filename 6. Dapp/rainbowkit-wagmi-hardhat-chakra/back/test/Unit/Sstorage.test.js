const { assert, expect } = require("chai")
const { network, deployments, ethers } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Simple Storage Smart Contract Unit Testing", function () {
    let accounts;
    let simplestorage;

    before(async () => {
      accounts = await ethers.getSigners()
      owner = accounts[0]
    })

    describe("setNumber", function () {

      beforeEach(async () => {
        await deployments.fixture(["simplestorage"]);
        voting = await ethers.getContract("SimpleStorage");
      })

    })

    describe("getNumber", function () {

      beforeEach(async () => {
        await deployments.fixture(["simplestorage"]);
        voting = await ethers.getContract("SimpleStorage");
      })

    })

  })
