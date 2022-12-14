const { network, ethers } = require("hardhat")

module.exports = async ({ getNamedAccounts }) => {

  const { deployer } = await getNamedAccounts()

  const AlyraIsERC20 = await ethers.getContract("AlyraIsERC20")
  const mintTx = await AlyraIsERC20.mint(deployer, 1000)
  await mintTx.wait(1)
  let balance = await AlyraIsERC20.balanceOf(deployer)
  console.log(`Balance of deployer ${deployer} is ${balance}`)
}

module.exports.tags = ["all", "erc20", "mint"]
