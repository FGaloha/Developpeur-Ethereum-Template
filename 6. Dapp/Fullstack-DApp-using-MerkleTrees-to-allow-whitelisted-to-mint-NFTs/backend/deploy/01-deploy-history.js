const { network } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")
const { MerkleTree } = require('merkletreejs');
const keccak256 = require('keccak256');
const whitelisted = require('../whitelisted.json');

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()

  const padBuffer = (addr) => {
    return Buffer.from(addr.substr(2).padStart(32 * 2, 0), 'hex')
  }

  // Generate Merkle Root
  const leaves = whitelisted.map((x) =>
    ethers.utils.solidityKeccak256(
      ["address"],
      [x.address]
    )
  );

  //const leaves = whitelisted.map(addr => keccak256(addr));

  // create a Merkle tree
  const merkleTree = new MerkleTree(leaves, keccak256, { sort: true });

  const buf2hex = x => '0x' + x.toString('hex')

  const merkleTreeRoot = buf2hex(merkleTree.getRoot())
  // console.log(merkleTreeRoot)

  log("--------------------------------------")
  arguments = [merkleTreeRoot]
  const History = await deploy("History", {
    from: deployer,
    args: arguments,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1
  })

  //Verify the smart contract
  if (!developmentChains.includes(network.name) && process.env.ETHERSCAN) {
    log("Verifying...")
    await verify(History.address, arguments)
  }
}

module.exports.tags = ["all", "history", "main"]
