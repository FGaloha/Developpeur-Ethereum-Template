# Morpheus Marketplace

## Summary

You will find here the major elements about the Morpheus project.
The Morpheus Dapp is an application providing to Morpheus subsidiaries, the possibility to easely create NFT collections.

The platform provide also marketplace functionnalities to let Morpheus clients buy & sell their NFT.

What have been prioritized:
- security of smart contracts
- usability for subsidiaries & clients
- financial meaning for the Group & subsidiaries

The following video show how the platform will be used by the Morpheus Group & clients: [DEMO](https://www.loom.com/share/400ed797f4784cd7acfa2b808a372c49)

The smart contracts are here :
- [Collection](https://goerli.etherscan.io/address/0x36aD8d2DcE8dCcb1526367B2308bcc6a7bbA572D#code)
- [Factory](https://goerli.etherscan.io/address/0x445d4427d0748e32932232CeC48db0920f38a1Ce#code)
- [Market](https://goerli.etherscan.io/address/0x8875508C3E4ab9df8193E05Df3b266E65D27113e#code)

The deployed platform (Vercel) is here : [Morpheus Dapp](https://morpheus-oneiroi.vercel.app/)

<br>
Home (click on the image to view it real size)
<br><br>
<img src="https://bafybeichgjhpcrwzys2rai7dx5hwbnez4qo3xfr44q6k4buwk7qlxmvrwa.ipfs.nftstorage.link/" width="50%"  alt="High Jedi Council Home">

<br>
Admin Factory & Market: manage subsidiaries & market earnings
<br><br>
<img src="https://bafybeieyf4dbkzj4dembzs2praf5m4im6hvmtir2kj5n44lwmaa6ywr4lu.ipfs.nftstorage.link/" width="50%"  alt="Admin page">

<br>
Subsidiary: manage collections & collection earnings
<br><br>
<img src="https://bafybeiagrynjjwevss6zythlupegsqkp7by33diajwxjmzroqmhks75xim.ipfs.nftstorage.link/" width="50%"  alt="Subsidiary page">

<br>
Client: be able to view, mint, sell & buy their NFTs
<br><br>
<img src="https://bafybeibqgh27zqaqgugdqtldnz2nl52eosraha2c74nxayg64dtab2gk3a.ipfs.nftstorage.link/" width="50%"  alt="Wallet owner page">

<br>

Happy discovery !

## Security actions

 - Use a maximum of optimized & verified code : Openzeppelin (ERC721, ReentrancyGuard, Paymensplitter, Ownable)
 - Check & fix reetrancy risks (withdraw, NFT buying...)
 - Check & fix DOS gas risks (minting...)


## Test & coverage

- 119 tests
- 4 files are provided:
  - A dedicated test file for unit tests for each smart contract
  - A file involving all 3 smart contracts at the same time and running a complete workflow using all functions
- Each smart contract has been fully checked (all lines).
- In Market smart contract case, % branch is 90% due to the nonReentrant modifier of ReentrancyGuard Openzeppelin.

- run yarn hardhat coverage: it should show a 100% coverage as followed:

<br>

File             |  % Stmts | % Branch |  % Funcs |  % Lines |Uncovered Lines |
-----------------|----------|----------|----------|----------|----------------|
  Collection.sol |      100 |      100 |      100 |      100 |        _       |
  Factory.sol    |      100 |      100 |      100 |      100 |        _       |
  Market.sol     |      100 |       90 |      100 |      100 |        _       |
-----------------|----------|----------|----------|----------|----------------|
All files        |      100 |    93.24 |      100 |      100 |        0       |

<br>

## Gas & other optimized actions

- Solidity Compiler Optimizer has been activated
- all strings are always remained short (require, revert...)
- always use ++i instead of i++
- packing possibilities have been tested: it showed increases (4849053 vs 4848441) in the gas costs so the contract has been remained without (ex: uint8 for maxQuantity was costing more)
- Linting code: code has been checked using Remix add-on

<br>

![Morpheus Dapp](https://bafybeicmcpfedaimwgwtfzlxzy7uy5ru4dsybyz7ymy5e7waef7ayxpozq.ipfs.nftstorage.link/)
