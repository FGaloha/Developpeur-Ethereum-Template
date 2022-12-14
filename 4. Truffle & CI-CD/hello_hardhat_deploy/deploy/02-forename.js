const { network, ethers } = require("hardhat")

module.exports = async ({ getNamedAccounts }) => {
  const { deployer } = await getNamedAccounts()
  const SayHello = await ethers.getContract("SayHello")
  const setForename = await SayHello.setForename("Alyra")
  await setForename.wait(1)
  const forename = await SayHello.getForename();
  console.log(`Set forename is ${forename}`)
}

module.exports.tags = ["all", "forename"]
