const { network, ethers } = require("hardhat")

module.exports = async ({ getNamedAccounts }) => {

  const { deployer } = await getNamedAccounts()

  const Reentrancy = await ethers.getContract("Reentrancy")
  const attack = await Reentrancy.attack();
  await attack.wait(1)
  let balance = await Reentrancy.getBalance();
  console.log(`Balance of contract ${Reentrancy.address} is ${balance}`)
}

module.exports.tags = ["all", "reentrancy", "mint"]
