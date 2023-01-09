const { network, ethers } = require("hardhat")

module.exports = async ({ getNamedAccounts }) => {

  const { deployer } = await getNamedAccounts()

  const Vault = await ethers.getContract("Vault")
  const mintTx = await Vault.store({ from: deployer, value: 1000 })
  await mintTx.wait(1)
  let balance = await Vault.balances(deployer)
  let contractBal = await Vault.balances(Vault.address)
  console.log(`Balance of deployer ${deployer} is ${balance}`)
  console.log(`Balance of contract ${Vault.address} is ${contractBal}`)
}

module.exports.tags = ["all", "vault", "mint"]
