const { network } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

// const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
//     const { getNamedAccounts, deployments } = hre;

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()

  log("--------------------------------------")
  arguments = []
  const SimpleStorage = await deploy("SimpleStorage", {
    from: deployer,
    args: arguments,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1
  })

  //Verify the smart contract
  if (!developmentChains.includes(network.name)) {
    log("Verifying...")
    await verify(SimpleStorage.address, arguments)
  }
}

module.exports.tags = ["all", "simplestorage", "main"]
