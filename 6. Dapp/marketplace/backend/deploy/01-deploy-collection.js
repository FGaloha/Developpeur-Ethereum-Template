const { network } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()

  log("--------------------------------------")
  arguments = ["Morpheus", "MOS", ['0xFC7CEEB77a94EAbB99d0DD55f99784F29aBfb401', '0xA770487d72Baad096729965011b90FFEDfecB1b4']]
  const Collection = await deploy("Collection", {
    from: deployer,
    args: arguments,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1
  })

  //Verify the smart contract
  if (!developmentChains.includes(network.name)) {
    log("Verifying...")
    await verify(Collection.address, arguments)
  }
}

module.exports.tags = ["all", "collection", "main"]
