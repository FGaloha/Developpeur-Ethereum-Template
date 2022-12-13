const hre = require("hardhat");

async function main() {

  const SimpleStorage = await hre.ethers.getContractFactory("SimpleStorage");
  const simpleStorage = await SimpleStorage.deploy();

  await simpleStorage.deployed();

  console.log(`Contract deployed at address : ${simpleStorage.address}`)
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
