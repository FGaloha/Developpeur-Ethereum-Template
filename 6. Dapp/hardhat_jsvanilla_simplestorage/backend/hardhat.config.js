require("@nomicfoundation/hardhat-toolbox")
require("dotenv").config()
require("@nomiclabs/hardhat-etherscan")
require("hardhat-deploy");
require("hardhat-gas-reporter")
require("solidity-coverage")
require('hardhat-docgen');

module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337
    }
  },
  solidity: {
    compilers: [
      {
        version: "0.8.17"
      }
    ]
  },
  namedAccounts: {
    deployer: {
      default: 0,
      1: 0,
    }
  },
  gasReporter: {
    enabled: true
  },
  docgen: {
    path: './docs',
    clear: true,
    runOnCompile: true,
  }
};
