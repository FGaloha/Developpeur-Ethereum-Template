const hre = require("hardhat");

async function main() {

  const Hello = await hre.ethers.getContractFactory("Hello");
  const hello = await Hello.deploy("Flavia");

  await hello.deployed();

  console.log(`Contract deployed at address : ${hello.address}`)

  // const _money = "1";
  // const _number = 7;
  // await deployer.deploy(SimpleStorage, _number, { from: account[0], value: _money });
  // let instance = await SimpleStorage.deployed();
  // let value = await instance.get();
  // console.log(value.toString())
  // await instance.set(444);
  // value = await instance.get();
  // console.log(value.toString());

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
