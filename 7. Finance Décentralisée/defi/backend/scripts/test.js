const { network, ethers, getNamedAccounts } = require("hardhat")

async function mintAndList() {
  const { deployer } = await getNamedAccounts()
  let amountToMint = 777777777;
  const AlyraIsERC20 = await ethers.getContract("AlyraIsERC20")
  const mintTx = await AlyraIsERC20.mint(deployer, amountToMint)
  await mintTx.wait(1)
  let newBalance = await AlyraIsERC20.balanceOf(deployer)
  console.log(`New balance of ${deployer} is ${newBalance}`)
}

mintAndList()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error)
    process.exit(1)
  })
