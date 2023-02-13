const { network, ethers, getNamedAccounts } = require("hardhat")

async function mintAndTransfer() {

  const { deployer } = await getNamedAccounts()
  accounts = await ethers.getSigners()
  let account1 = accounts[1]

  const contractMoney = await ethers.getContract("Money");
  const contractDefi = await ethers.getContract("Defi");

  let amountToMint = 1000;
  console.log(`Amount to mint ${amountToMint}`);

  const mintTx = await contractMoney.faucet(contractDefi.address, amountToMint, { value: ethers.utils.parseEther("1") });
  await mintTx.wait();

  let newBalance = await contractMoney.balanceOf(contractDefi.address)
  console.log(`New balance of ${contractDefi.address} is ${newBalance}`)

  //console.log(contractDefi)
  const transferTx = await contractDefi.transfer(account1.address, 500);
  await transferTx.wait();
  newBalance = await contractMoney.balanceOf(contractDefi.address)
  let newBalanceAccount1 = await contractMoney.balanceOf(account1.address)
  console.log(`New balance of ${contractDefi.address} is ${newBalance}`)
  console.log(`New balance of ${account1.address} is ${newBalanceAccount1}`)
}

mintAndTransfer()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error)
    process.exit(1)
  })
