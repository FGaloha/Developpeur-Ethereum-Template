const { network } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()

  log("--------------------------------------")
  arguments = ["bafybeidyu7i6vii4lf6vdvaqpe3y5ezbo6w3ikmuxqeeoj74kutb4ox2xm"]
  const History = await deploy("History", {
    from: deployer,
    args: arguments,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1
  })

  //Verify the smart contract
  if (!developmentChains.includes(network.name)) {
    log("Verifying...")
    await verify(History.address, arguments)
  }
}

module.exports.tags = ["all", "history", "main"]
