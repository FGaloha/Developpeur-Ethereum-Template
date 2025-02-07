const networkConfig = {
  31337: {
    name: "localhost"
  },
  5: {
    name: "goerli",
    ethUsdPriceFeed: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e"
  }
}

// for test 1eth = 200 USD
const DECIMALS = "18"
// equivalent of 200 eth in usd
const INITIAL_PRICE = "200000000000000000000"

const developmentChains = ["hardhat", "localhost"]

module.exports = {
  networkConfig,
  developmentChains
}
