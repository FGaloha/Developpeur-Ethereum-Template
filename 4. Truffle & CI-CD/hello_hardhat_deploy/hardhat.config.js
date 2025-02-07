require("@nomicfoundation/hardhat-toolbox")
require("dotenv").config()
require("@nomiclabs/hardhat-etherscan")
require("hardhat-deploy");

const PK = process.env.PK || "";
// const INFURA_GOERLI = process.env.INFURA_GOERLI || "";
const ETHERSCAN = process.env.ETHERSCAN || "";
const ALCHEMY_MUMBAI = process.env.ALCHEMY_MUMBAI || "";
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
      url: ALCHEMY_MUMBAI,
      accounts: [`0x${PK}`],
      chainId: 80001
    },
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
  etherscan: {
    apiKey: {
      goerli: ETHERSCAN
    },
  },
  polygonscan: {
    apiKey: {
      polygonMumbai: POLYGONSCAN
    }
  },
  namedAccounts: {
    deployer: {
      default: 0,
      1: 0,
    }
  }
};
