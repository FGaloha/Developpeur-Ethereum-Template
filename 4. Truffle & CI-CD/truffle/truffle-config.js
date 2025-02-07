const HDWalletProvider = require("@truffle/hdwallet-provider");
require("dotenv").config();

module.exports = {

  networks: {
    development: {
      host: "127.0.0.1",     // Localhost (default: none)
      port: 8545,            // Standard Ethereum port (default: none)
      network_id: "*",       // Any network (default: none)
    },
    goerli: {
      provider: function () {
        return new HDWalletProvider(`${process.env.PK}`, `${process.env.INFURA}`)
      },
      network_id: 5
    }
  },

  // Set default mocha options here, use special reporters, etc.
  mocha: {
    // timeout: 100000
  },

  // Configure your compilers
  compilers: {
    solc: {
      version: "0.8.17",
      settings: {          // See the solidity docs for advice about optimization and evmVersion
        optimizer: {
          enabled: false,
          runs: 200
        }
      }
    }
  }
};
