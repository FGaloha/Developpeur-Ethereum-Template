# Voting Smart Contract: Security & Dapp phase

## Summary

This project is the last phase of the Voting dapp. Here are the steps followed:

- improve security Smart contract
- update tests files to take into account modifications
- gaz optimization
- create a front dapp
- deployment of smart contract on Goerli & front on Vercel

Conclusion : with the new contract we avoid a DOS gas limit, we save 64440 gas compare to Alyra version & the tests remains at 100% coverage.

The smart contract is here :  [Etherscan](https://goerli.etherscan.io/address/0x3c5C0AD32375e8973e35E0eF2CDaD9490F0B4330#code)
The platform is here : [High Jedi Council Voting Dapp](https://jedi-council.vercel.app/)

The following video show how the platform has been used by the High Jedi Council: [DEMO](https://jedi-council.vercel.app/)

Happy discovery !

## Security actions

There is a risk in the TallyVotes function of the smart contract due to the loop on the proposal array. A malicious person could try to create enough proposals to block the function. It would mean that the contract would not been able to manage its final step: the winning proposal evaluation.

To avoid this situation & save gas:
 - the proposals array has been changed from dynamic to static (255 slots).
 - An index proposalsLength has been added.
 - A require has been added in the addProposal function to properly manage a revert if more than 255 proposals (including "Genesis") were tried to be added.
Given the fact that the statement of the exercice precises it is for a small organization and the contract workflow runs only for one vote, it makes sense.

## Gas & other optimized actions

- all strings has been reduced
- all p++ has been changed in ++p
- Solidity Compiler Optimizer has been activated
- proposals array limited to 255 to be aligned with a proposalId uint8
- uint8 for proposalId when it was saving gas. It stayed at uint256 when the modification was costing more but all cases has been tested (example winningProposalId).
- For lisibility & gas, "bytes(_desc).length > 0" replaces "keccak256(abi.encode(_desc)) != keccak256(abi.encode(""))"
- packing possibilities has been tested: it showed increases in the gas costs so the contract has been remained without
- Linting code: visibility has been added were it was mising to improve lisibility (internal variables)

## Test & coverage

A test has been added to check the revert "Max proposals reached" is properly triggered when a voter attemps to create proposal number 256.

- yarn hardhat coverage: it should show a 100% coverage as followed:

    File         |  % Stmts | % Branch |  % Funcs |  % Lines |Uncovered Lines |
    -------------|----------|----------|----------|----------|----------------|
    contracts    |      100 |      100 |      100 |      100 |        -       |
    All files    |      100 |      100 |      100 |      100 |        -       |



![High Jedi Council Dapp](https://bafybeigyn7sh7ugc2ourpe5ivhascvnxz3nzkw7aia3apfbjrh4omx26f4.ipfs.nftstorage.link/)
