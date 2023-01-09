// ensuite je lance le scipt avec node et avoir 0.042 ether
// node scripts/app.js
const { network, ethers } = require("hardhat")

const provider = new ethers.providers.JsonRpcProvider(process.env.ALCHEMY_GOERLI);

const ABI = [
  {
    "inputs": [],
    "name": "get",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
]

const address = "0xfA95935932ECcd000765C772CF8A731B1E215d06";

const SimpleStorage = new ethers.Contract(address, ABI, provider);

async function main() {
  // Connection to a network
  const balance = await provider.getBalance("0x4b984D560387C22f399B76a38edabFE52903E599");
  console.log(ethers.utils.formatEther(balance));

  // Use the functions of a contract
  const balance2 = await SimpleStorage.get();
  console.log(ethers.utils.formatWei(balance2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
