# Voting Smart Contract: Testing Hardhat Project

**********************
**    Objectives    **
**********************

This project illustrate the testing functionalities available in hardhat using javascript.
The objective is to cover the tests of a simple voting process built in the smart contract Voting.sol.

**********************
**      Config      **
**********************

The config is only set up to be deployed localy (no other network available).

The Test folder has 2 files:
- Voting.test.js is to test functions one after the other
- Voting.workflow.test.js is a workflow test set

Once cloned from the gitHub repo, form the terminal, you can run :
- yarn hardhat test: it will run the 2 test files
- yarn hardhat test test/unit/Voting.test.js : it will run the Voting.test.js only
- yarn hardhat test test/unit/Voting.workflow.test.js : it will run the Voting.workflow.test.js only

**********************
**     Coverage     **
**********************

- yarn hardhat coverage: it should show a 100% coverage as followed:

    -------------|----------|----------|----------|----------|----------------|
    File         |  % Stmts | % Branch |  % Funcs |  % Lines |Uncovered Lines |
    -------------|----------|----------|----------|----------|----------------|
    contracts/   |      100 |      100 |      100 |      100 |                |
      Voting.sol |      100 |      100 |      100 |      100 |                |
    -------------|----------|----------|----------|----------|----------------|
    All files    |      100 |      100 |      100 |      100 |                |
    -------------|----------|----------|----------|----------|----------------|

***********************
**  About the files  **
***********************

DEFINITIONS
- Owner is the address who deployed the contract
- A voter is a person who has been registered by the owner & is able to vote & access voter's features
- A simple user is a person who is a non registered voter, cannot vote but can check the winning proposal

Voting.test.js
--------------------------------------------------------------

--------------------------------------------------------------

Voting.workflow.js
--------------------------------------------------------------
Scenario
--------------------------------------------------------------

- The owner registers : himself, voter1, voter2, voter3
- The owner starts the ProposalsRegistering phase
- Voter1 adds the proposal 'Increase holidays'
- Voter2 adds the proposal 'Raise wages'
- The owner ends the ProposalsRegistering phase
- Voter3 checks the info of the proposal with the index 2
- The owner starts the VotingSession phase
- Voter1 votes for proposal index 1
- Voter2 votes for proposal index 2
- Voter3 votes for proposal index 2
- The owner ends the VotingSession phase
- The owner triggers the tallyVotes phase
- The simple user checks the winning proposal
- Voter1 checks the winning proposal
- Voter1 checks the vote of voter2
- Voter2 checks the vote of voter1
- Voter2 checks the vote of the owner who did not vote

--------------------------------------------------------------
List of tests
--------------------------------------------------------------

- it should be possible for the owner to register as a voter in phase (0)-RegisteringVoters
- it should be possible for the owner to register another address as a voter1 in phase (0 -RegisteringVoters
- it should be possible for the owner to register another address as a voter2 in phase (0)-RegisteringVoters
- it should be possible for the owner to register another address as a voter3 in phase (0)-RegisteringVoters
- it should be possible for the owner to startProposalsRegistering if the current Workflow is 0-RegisteringVoters
- it should be possible for a voter to add a proposal with a description during (1)-ProposalsRegistrationStarted
- it should be possible for another voter to add a proposal with a description during (1)-ProposalsRegistrationStarted
- it should be possible for the owner to endProposalsRegistering when current phase is (1)-ProposalsRegistrationStarted
- it should be possible for a voter to get proposal's info
- it should be possible for the owner to startVotingSession when current phase is (2)-ProposalsRegistrationEnded
- it should be possible for a voter to set a vote for an existing proposal during (3)-VotingSessionStarted
- it should be possible for another voter to set a vote for an existing proposal during (3)-VotingSessionStarted
- it should be possible for another voter to set a vote for an existing proposal during (3)-VotingSessionStarted
- it should be possible for the owner to endVotingSession when current phase is (3)-VotingSessionStarted
- it should be possible for the owner to tallyVotes when current phase is (4)-VotingSessionEnded
- it should be possible for a simple user to get the winning proposal
- it should be possible for a voter to get the winning proposal
- it should be possible for a voter to get info/vote of a voter
- it should be possible for a voter to get info/vote of a voter
- it should be possible for a voter to get info/vote of a voter

--------------------------------------------------------------
