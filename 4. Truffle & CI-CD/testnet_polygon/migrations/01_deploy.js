const SimpleStorage = artifacts.require("SimpleStorage");

module.exports = async (deployer, network, accounts) => {
  const _money = "1";
  const _number = 7;
  await deployer.deploy(SimpleStorage, _number, { from: accounts[0], value: _money });
  let instance = await SimpleStorage.deployed();
  let value = await instance.get();
  console.log(value.toString())
  await instance.set(444);
  value = await instance.get();
  console.log(value.toString());
}
