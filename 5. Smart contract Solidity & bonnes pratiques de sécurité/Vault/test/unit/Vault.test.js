const { assert, expect } = require("chai")
const { network, deployments, ethers } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Vault Contract Unit Testing", function () {
    let accounts;

    before(async () => {
      accounts = await ethers.getSigners()
      deployer = accounts[0]
    })

    describe("deployment", function () {

      beforeEach(async () => {
        await deployments.fixture(["vault"]);
        vault = await ethers.getContract("Vault");
      })

      it("should deploy", async function () {
        console.log(vault.address);
        const balanceDep = await vault.balances(vault.address);
        console.log(balanceDep.toString());
      })

    })

  })
