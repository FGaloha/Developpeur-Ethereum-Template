require("@nomicfoundation/hardhat-toolbox")
require("dotenv").config()
require("@nomiclabs/hardhat-etherscan")
require("hardhat-deploy");
require("hardhat-gas-reporter")
require("solidity-coverage")
require('hardhat-docgen');

const PK = process.env.PK || "";
// const INFURA = process.env.INFURA || "";
const ETHERSCAN = process.env.ETHERSCAN || "";
const ALCHEMY = process.env.ALCHEMY || "";
const ALCHEMY_GOERLI = process.env.ALCHEMY_GOERLI || "";
const POLYGONSCAN = process.env.POLYGONSCAN || "";

module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    goerli: {
      url: ALCHEMY_GOERLI,
      accounts: [`0x${PK}`],
      chainId: 5,
      blockConfirmations: 6
    },
    polygonMumbai: {
      url: ALCHEMY,
      accounts: [`0x${PK}`],
      chainId: 80001
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337
    }
  },
  solidity: {
    version: "0.8.17",
    settings: {
      optimizer: {
        enabled: true,
        runs: 10000,
      },
    },
    // compilers: [
    //   {
    //     version: "0.8.13"
    //   }
    // ]
  },
  etherscan: {
    apiKey: {
      goerli: ETHERSCAN
    },
  },
  namedAccounts: {
    deployer: {
      default: 0,
      1: 0,
    }
  },
  polygonscan: {
    apiKey: {
      polygonMumbai: POLYGONSCAN
    }
  },
  gasReporter: {
    enabled: true
  }
};
