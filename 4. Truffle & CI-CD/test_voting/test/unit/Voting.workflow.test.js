const { assert, expect } = require("chai")
const { network, deployments, ethers } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Voting Smart Contract Workflow Testing", function () {
    let accounts;
    let voting;

    before(async () => {
      accounts = await ethers.getSigners()
      owner = accounts[0]
      voter1 = accounts[1]
      voter2 = accounts[2]
      simple_user = accounts[3]
      voter3 = accounts[4]
    })

    // DEFINITIONS
    // Owner is the address who deployed the contract
    // A voter is a person who has been registered by the owner & is able to vote & access voter's features
    // A simple user is a person who is a non registered voter, cannot vote but can check the winning proposal

    describe("Complete workflow: test of the entire voting process", function () {
      before(async () => {
        await deployments.fixture(["voting"]);
        voting = await ethers.getContract("Voting");
      })

      it("should be possible for the owner to register as a voter in phase (0)-RegisteringVoters", async function () {
        // check we are in phase (0)-RegisteringVoters
        assert.equal(await voting.workflowStatus(), 0);
        const addVoter = await voting.addVoter(owner.address);
        // check owner registration worked
        const myVoter = await voting.getVoter(owner.address);
        assert.equal(myVoter.isRegistered, true);
        // check it emit the expected event
        await expect(addVoter)
          .to.emit(voting, 'VoterRegistered')
          .withArgs(owner.address);
      })

      it("should be possible for the owner to register another address as a voter1 in phase (0)-RegisteringVoters", async function () {
        await expect(voting.addVoter(voter1.address))
          .to.emit(voting, 'VoterRegistered')
          .withArgs(voter1.address);
        // check voter1 registration worked
        const myVoter = await voting.getVoter(voter1.address);
        assert.equal(myVoter.isRegistered, true);
      })

      it("should be possible for the owner to register another address as a voter2 in phase (0)-RegisteringVoters", async function () {
        await expect(voting.addVoter(voter2.address))
          .to.emit(voting, 'VoterRegistered')
          .withArgs(voter2.address);
        // check voter2 registration worked
        const myVoter = await voting.getVoter(voter2.address);
        assert.equal(myVoter.isRegistered, true);
      })

      it("should be possible for the owner to register another address as a voter3 in phase (0)-RegisteringVoters", async function () {
        await expect(voting.addVoter(voter3.address))
          .to.emit(voting, 'VoterRegistered')
          .withArgs(voter3.address);
        // check voter3 registration worked
        const myVoter = await voting.getVoter(voter3.address);
        assert.equal(myVoter.isRegistered, true);
      })

      it("should be possible for the owner to startProposalsRegistering if the current Workflow is 0-RegisteringVoters", async function () {
        // check we are in phase (0)-RegisteringVoters
        assert.equal(await voting.workflowStatus(), 0);
        // check it emit the expected event
        await expect(await voting.startProposalsRegistering())
          .to.emit(voting, 'WorkflowStatusChange')
          .withArgs(0, 1);
        // check we are now in (1)-ProposalsRegistrationStarted
        assert.equal(await voting.workflowStatus(), 1);
        // check 1st proposal Genesis has been created
        const myProposal = await voting.getOneProposal(0);
        assert(myProposal.description, "GENESIS")
        assert(myProposal.voteCount, 0)
      })

      it("should be possible for a voter to add a proposal with a description during (1)-ProposalsRegistrationStarted", async function () {
        await expect(voting.connect(voter1).addProposal("Increase holidays"))
          .to.emit(voting, 'ProposalRegistered')
          .withArgs(1);
        // voter1 checks the proposal has been created in position 1 (0 is GENESIS) with correct data
        const myProposal = await voting.connect(voter1).getOneProposal(1);
        assert(myProposal.description, "Increase holidays");
        assert(myProposal.voteCount, 0);
      })

      it("should be possible for another voter to add a proposal with a description during (1)-ProposalsRegistrationStarted", async function () {
        await expect(voting.connect(voter2).addProposal("Raise wages"))
          .to.emit(voting, 'ProposalRegistered')
          .withArgs(2);
        // voter2 checks the proposal has been created in position 2 with appropriate data
        const myProposal = await voting.connect(voter2).getOneProposal(2);
        assert(myProposal.description, "Raise wages");
        assert(myProposal.voteCount, 0);
      })

      it("should be possible for the owner to endProposalsRegistering when current phase is (1)-ProposalsRegistrationStarted", async function () {
        await expect(await voting.endProposalsRegistering())
          .to.emit(voting, 'WorkflowStatusChange')
          .withArgs(1, 2);
        // check we are now in (2)-ProposalsRegistrationEnded
        assert.equal(await voting.workflowStatus(), 2);
      })

      it("should be possible for a voter to get proposal's info", async function () {
        // Voter3 checks proposal witn index 2
        myProposal = await voting.connect(voter3).getOneProposal(2);
        assert.equal(myProposal.description, "Raise wages");
        assert.equal(myProposal.voteCount, 0);
      })

      it("should be possible for the owner to startVotingSessionwhen current phase is (2)-ProposalsRegistrationEnded", async function () {
        // check it emit the expected event
        await expect(await voting.startVotingSession())
          .to.emit(voting, 'WorkflowStatusChange')
          .withArgs(2, 3);
        // check we are now in (3)-VotingSessionStarted
        assert.equal(await voting.workflowStatus(), 3);
      })

      it("should be possible for a voter to set a vote for an existing proposal during (3)-VotingSessionStarted", async function () {
        await expect(voting.connect(voter1).setVote(1))
          .to.emit(voting, 'Voted')
          .withArgs(voter1.address, 1);
        // check the vote has updated voters
        const voterInfo = await voting.connect(voter1).getVoter(voter1.address);
        assert(voterInfo.votedProposalId, 1);
        assert(voterInfo.hasVoted, true);
      })

      it("should be possible for another voter to set a vote for an existing proposal during (3)-VotingSessionStarted", async function () {
        await expect(voting.connect(voter2).setVote(2))
          .to.emit(voting, 'Voted')
          .withArgs(voter2.address, 2);
        // check the vote has updated voters
        const voterInfo = await voting.connect(voter2).getVoter(voter2.address);
        assert(voterInfo.votedProposalId, 2);
        assert(voterInfo.hasVoted, true);
      })

      it("should be possible for another voter to set a vote for an existing proposal during (3)-VotingSessionStarted", async function () {
        await expect(voting.connect(voter3).setVote(2))
          .to.emit(voting, 'Voted')
          .withArgs(voter3.address, 2);
        // check the vote has updated voters
        const voterInfo = await voting.connect(voter3).getVoter(voter3.address);
        assert(voterInfo.votedProposalId, 2);
        assert(voterInfo.hasVoted, true);
      })

      it("should be possible for the owner to endVotingSession when current phase is (3)-VotingSessionStarted", async function () {
        await expect(await voting.endVotingSession())
          .to.emit(voting, 'WorkflowStatusChange')
          .withArgs(3, 4);
        // check we are now in (4)-VotingSessionEnded
        assert.equal(await voting.workflowStatus(), 4);
      })

      it("should be possible for the owner to tallyVotes when current phase is (4)-VotingSessionEnded", async function () {
        // check the initial winningProposalID is O
        assert.equal(await voting.winningProposalID(), 0);
        // check it emit the expected event
        await expect(await voting.tallyVotes())
          .to.emit(voting, 'WorkflowStatusChange')
          .withArgs(4, 5);
        // check we are now in (5)-VotesTallied
        assert.equal(await voting.workflowStatus(), 5);
        // check winningProposalID is now 1
        assert.equal(await voting.winningProposalID(), 2);
      })

      it("should be possible for a simple user to get the winning proposal", async function () {
        const winningProposalId = await voting.connect(simple_user).winningProposalID();
        assert.equal(winningProposalId, 2);
      })

      it("should be possible for a voter to get the winning proposal", async function () {
        const winningProposalId = await voting.connect(voter1).winningProposalID();
        assert.equal(winningProposalId, 2);
      })

      it("should be possible for a voter to get info/vote of a voter", async function () {
        // voter1 get the data that should be live after the vote for voter2 [true, true, 2]
        const result = await voting.connect(voter1).getVoter(voter2.address);
        assert(result.isRegistered.toString(), "true");
        assert(result.hasVoted.toString(), "true");
        assert(result.votedProposalId.toString(), "2");
      })

      it("should be possible for a voter to get info/vote of a voter", async function () {
        // voter2 get the data that should be live after the vote for voter1 [true, true, 1]
        const result = await voting.connect(voter2).getVoter(voter1.address);
        assert(result.isRegistered.toString(), "true");
        assert(result.hasVoted.toString(), "true");
        assert(result.votedProposalId.toString(), "1");
      })

      it("should be possible for a voter to get info/vote of a voter", async function () {
        // voter2 get the data that should be live after the vote for owner [true, false, 0]
        const result = await voting.connect(voter2).getVoter(owner.address);
        assert(result.isRegistered.toString(), "true");
        assert(result.hasVoted.toString(), "false");
        assert(result.votedProposalId.toString(), "0");
      })

    })


  })
