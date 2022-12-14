const { network, ethers, getNamedAccounts } = require("hardhat")

async function setForename() {
  const { deployer } = await getNamedAccounts()
  const SayHello = await ethers.getContract("SayHello")
  const setForename = await SayHello.setForename("Flavia2")
  await setForename.wait(1)
  const forename = await SayHello.getForename();
  console.log(`Set forename is ${forename}`)
}

setForename()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error)
    process.exit(1)
  })
