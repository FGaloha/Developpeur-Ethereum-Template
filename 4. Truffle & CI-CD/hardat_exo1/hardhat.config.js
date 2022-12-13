require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
require("@nomiclabs/hardhat-etherscan");

const PK = process.env.PK || "";
const INFURA = process.env.INFURA || "";
const ETHERSCAN = process.env.ETHERSCAN || "";

module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    goerli: {
      url: INFURA,
      accounts: [`0x${PK}`],
      chainId: 5
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
    }
  }
};
