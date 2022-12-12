const SimpleStorage = artifacts.require("SimpleStorage");

module.exports = async (deployer) => {
  const _money = "1";
  const _number = 7;
  const _address = "0x8921B3238C306DF326c8d7cD67F2202d4b34dc0A"
  await deployer.deploy(SimpleStorage, _number, { from: _address, value: _money });
}
