const FlavERC20 = artifacts.require("FlavERC20");

module.exports = async (deployer) => {
  const _money = 100000000;
  // Ganache address
  const _address = "0x8921B3238C306DF326c8d7cD67F2202d4b34dc0A"
  // MM address Mr Bean
  // const _address = "0xA770487d72Baad096729965011b90FFEDfecB1b4"
  await deployer.deploy(FlavERC20, _money, { from: _address });
}
