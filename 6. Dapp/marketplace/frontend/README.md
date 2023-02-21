# Morpheus Marketplace

## Summary

This project is the last phase of the Voting dapp. Here are the steps followed:

- improve security Smart contract
- update tests files to take into account modifications
- gaz optimization
- create a front dapp
- deployment of smart contract on Goerli & front on Vercel

Conclusion : with the new contract we avoid a DOS gas limit, we save 64440 gas compare to Alyra version & the tests remains at 100% coverage.

The following video show how the platform will be used by the Morpheus Group & users: [DEMO](https://www.loom.com/share/400ed797f4784cd7acfa2b808a372c49)

The smart contracts are here :
- [Collection](https://goerli.etherscan.io/address/0x3c5C0AD32375e8973e35E0eF2CDaD9490F0B4330#code)
- [Factory](https://goerli.etherscan.io/address/0x3c5C0AD32375e8973e35E0eF2CDaD9490F0B4330#code)
- [Market](https://goerli.etherscan.io/address/0x3c5C0AD32375e8973e35E0eF2CDaD9490F0B4330#code)

The deployed platform (Vercel) is here : [Morpheus Dapp](https://morpheus-bice.vercel.app/)

<br>
Home

<img src="https://bafybeicbpvsugvsbry5xjg5zivtw5lkyyvp67zxinkxa7frxzqbccyr3ym.ipfs.nftstorage.link/" width="50%"  alt="High Jedi Council Home">

<br>
Admin Factory & Market: admin actions (voting actions & detailed results if whitelisted)

<img src="https://bafkreiamki45pr3lhywkueprohcbx7loothmqc4angkz55lwyzzkris2zi.ipfs.nftstorage.link/" width="50%"  alt="Admin page">

<br>
Subsidiary: collections admin actions

<img src="https://bafkreiglpqwoxlergdjprl6axfduujhtps7bbf5ql53jh6dkwvez4k72aa.ipfs.nftstorage.link/" width="50%"  alt="Subsidiary page">

<br>
Users: minters, sellers & buyers

<img src="https://bafkreify6vukzikddfs6nflke6txxxoij7lo4whiydvj4zxfoypa5x4eae.ipfs.nftstorage.link/" width="50%"  alt="Wallet owner page">

<br>

Happy discovery !

## Security actions

 - Use of a maximum optimized & verified SM : Openzeppelin erc721, ReentrancyGuard, paymensplitter, ownable smart contract
 - Mint quantity limited to 50 to avoir DOS gas & answer client request of limitating ownership

## Gas & other optimized actions

- all strings are used at the minimum
- always use ++i instead of i++
- Solidity Compiler Optimizer has been activated
- proposals array limited to 255 to be aligned with a proposalId uint8
- uint8 for maxQuantity when it was saving gas. It stayed at uint256 when the modification was costing more but all cases has been tested (example winningProposalId).
- packing struct possibilities has been tested: it showed increases (4849053 vs 4848441) in the gas costs so the contract has been remained without
- Linting code: visibility has been added were it was mising to improve lisibility (internal variables)

## Test & coverage

- 119 tests
- 4 files are provided:
  - A dedicated test file for unit test for each smart contract
  - A file involving all 3 smart contracts at the same time and running a complete workflow using all functions
- Each smart contract has been fully checked (all lines).
- In Market smart contract case % branch is 90% due to the nonReentrant modifier of ReentrancyGuard Openzeppelin.

- yarn hardhat coverage: it should show a 100% coverage as followed:

-----------------|----------|----------|----------|----------|----------------|
File             |  % Stmts | % Branch |  % Funcs |  % Lines |Uncovered Lines |
-----------------|----------|----------|----------|----------|----------------|
 contracts/      |      100 |    93.24 |      100 |      100 |        _       |
  Collection.sol |      100 |      100 |      100 |      100 |        _       |
  Factory.sol    |      100 |      100 |      100 |      100 |        _       |
  Market.sol     |      100 |       90 |      100 |      100 |        _       |
-----------------|----------|----------|----------|----------|----------------|
All files        |      100 |    93.24 |      100 |      100 |        0       |
-----------------|----------|----------|----------|----------|----------------|


![Morpheus Dapp](https://bafybeicmcpfedaimwgwtfzlxzy7uy5ru4dsybyz7ymy5e7waef7ayxpozq.ipfs.nftstorage.link/)
