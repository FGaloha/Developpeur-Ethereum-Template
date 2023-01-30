const { assert, expect } = require("chai")
const { network, deployments, ethers } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Voting Smart Contract Unit Testing", function () {
    let accounts;
    let voting;

    // DEFINITIONS
    // Owner is the address who deployed the contract
    // A voter is a person who has been registered by the owner & is able to vote & access voter's features
    // A simple user is a person who is a non registered voter, cannot vote but can check the winning proposal

    before(async () => {
      accounts = await ethers.getSigners()
      owner = accounts[0]
      voter1 = accounts[1]
      voter2 = accounts[2]
      simple_user = accounts[3]
    })

    describe("addVoter", function () {

      beforeEach(async () => {
        await deployments.fixture(["voting"]);
        voting = await ethers.getContract("Voting");
      })

      it("should not be possible for a simple user to add a voter", async function () {
        await expect(voting.connect(simple_user).addVoter(simple_user.address))
          .to.be.revertedWith("Ownable: caller is not the owner");
      })

      it("should not be possible for a voter to add a voter", async function () {
        await expect(voting.connect(voter1).addVoter(voter2.address))
          .to.be.revertedWith("Ownable: caller is not the owner");
      })

      it("should be possible for the owner to register as a voter in phase (0)-RegisteringVoters", async function () {
        // check we are in phase (0)-RegisteringVoters
        assert.equal(await voting.workflowStatus(), 0);
        await expect(voting.addVoter(owner.address))
          .to.emit(voting, 'VoterRegistered')
          .withArgs(owner.address);
        // check owner registration worked
        const myVoter = await voting.getVoter(owner.address);
        assert.equal(myVoter.isRegistered, true);
      })

      it("should be possible for the owner to register another address as a voter in phase (0)-RegisteringVoters", async function () {
        // starting by registering the owner to get access to getVoter who is limited to voters
        await voting.addVoter(owner.address);
        // check we are in phase (0)-RegisteringVoters
        assert.equal(await voting.workflowStatus(), 0);
        // adding another voter & check it emit the expected event
        await expect(voting.addVoter(voter1.address))
          .to.emit(voting, 'VoterRegistered')
          .withArgs(voter1.address);
        // check voter1 registration worked
        const myVoter = await voting.getVoter(voter1.address);
        assert.equal(myVoter.isRegistered, true);
      })

      it("should not be possible for the owner to register a voter twice", async function () {
        // check we are in phase (0)-RegisteringVoters
        assert.equal(await voting.workflowStatus(), 0);
        // the owner register voter1 once
        await voting.addVoter(voter1.address);
        // the owner try to register again the voter1
        await expect(voting.addVoter(voter1.address))
          .to.be.revertedWith("Already registered");
      })

      it("Should not be possible for the owner to register a voter outside the (0)-RegisteringVoters phase", async function () {
        // check the status is (0)-RegisteringVoters
        assert.equal(await voting.workflowStatus(), 0);
        // changing the workflowStatus (0) to status (1)-ProposalsRegistrationStarted
        await voting.startProposalsRegistering();
        // check the status is now (1)-ProposalsRegistrationStarted
        assert.equal(await voting.workflowStatus(), 1);
        // check the addVoter attempt in ProposalsRegistrationStarted trigger the expected revert
        await expect(voting.addVoter(voter1.address))
          .to.be.revertedWith("Voters registration not open");
      })

    })

    describe("getVoter", function () {

      beforeEach(async () => {
        await deployments.fixture(["voting"]);
        voting = await ethers.getContract("Voting");
      })

      it("should not be possible for a simple user to get info/vote of a voter", async function () {
        await expect(voting.connect(simple_user).getVoter(voter1.address))
          .to.be.revertedWith("Not a voter");
      })

      it("should be possible for a voter to get info/vote of a voter", async function () {
        // the owner first register himself as a voter to be able to use getVoter
        await voting.addVoter(owner.address);
        // the owner get the data that should be live after the addVoter action [true, false, 0]
        const result = await voting.getVoter(owner.address);
        assert.equal(result.isRegistered, true);
        assert.equal(result.hasVoted, false);
        assert.equal(result.votedProposalId, 0);
      })
    })

    describe("startProposalsRegistering", function () {

      beforeEach(async () => {
        await deployments.fixture(["voting"]);
        voting = await ethers.getContract("Voting");
      })

      it("should not be possible for a simple user to startProposalsRegistering", async function () {
        await expect(voting.connect(simple_user).startProposalsRegistering())
          .to.be.revertedWith("Ownable: caller is not the owner");
      })

      it("should not be possible for a voter to startProposalsRegistering", async function () {
        await expect(voting.connect(voter1).startProposalsRegistering())
          .to.be.revertedWith("Ownable: caller is not the owner");
      })

      it("should be possible for the owner to startProposalsRegistering if the current Workflow is 0-RegisteringVoters", async function () {
        // the owner first register himself as a voter to be able to use getOneProposal
        await voting.addVoter(owner.address);
        // check we are in phase (0)-RegisteringVoters
        assert.equal(await voting.workflowStatus(), 0);
        // check action emit the expected event
        await expect(voting.startProposalsRegistering())
          .to.emit(voting, 'WorkflowStatusChange')
          .withArgs(0, 1);
        // check we are now in (1)-ProposalsRegistrationStarted
        assert.equal(await voting.workflowStatus(), 1);
        // check 1st proposal Genesis has been created
        const myProposal = await voting.getOneProposal(0);
        assert.equal(myProposal.description, "GENESIS");
        assert.equal(myProposal.voteCount, 0);
      })

      it("should not be possible for the owner to startProposalsRegistering if the current Workflow is not (0)-RegisteringVoters", async function () {
        await voting.startProposalsRegistering();
        // check we are not in phase (0)-RegisteringVoters
        assert.isFalse(await voting.workflowStatus() == 0);
        await expect(voting.startProposalsRegistering())
          .to.be.revertedWith("Registering proposals cant be now");
      })
    })

    describe("addProposal", function () {

      beforeEach(async () => {
        await deployments.fixture(["voting"]);
        voting = await ethers.getContract("Voting");
        // voter1 is registered by the owner
        await voting.addVoter(voter1.address);
      })

      it("should not be possible for a simple user to add a proposal", async function () {
        await expect(voting.connect(simple_user).addProposal("Change the voting process"))
          .to.be.revertedWith("Not a voter");
      })

      it("should not be possible for a voter to add a proposal outside the (1)-ProposalsRegistrationStarted phase", async function () {
        // check we are not in phase (1)-ProposalsRegistrationStarted
        assert.isFalse(await voting.workflowStatus() == 1);
        // check not respecting workflow triggered revert
        await expect(voting.connect(voter1).addProposal("Increase holidays"))
          .to.be.revertedWith("Proposals session not open");
      })

      it("should not be possible for a voter to add an empty proposal during (1)-ProposalsRegistrationStarted", async function () {
        // owner start ProposalsRegistrationStarted
        await voting.startProposalsRegistering();
        // check we are in phase (1)-ProposalsRegistrationStarted
        assert.equal(await voting.workflowStatus(), 1);
        // check empty description triggered revert
        await expect(voting.connect(voter1).addProposal(""))
          .to.be.revertedWith("Missing description");
      })

      it("should be possible for a voter to add a proposal with a description during (1)-ProposalsRegistrationStarted", async function () {
        // owner start ProposalsRegistrationStarted
        await voting.startProposalsRegistering();
        // check we are in phase (1)-ProposalsRegistrationStarted
        assert.equal(await voting.workflowStatus(), 1);
        // check adding a 1st proposal emit the expected event
        await expect(voting.connect(voter1).addProposal("Increase holidays"))
          .to.emit(voting, 'ProposalRegistered')
          .withArgs(1);
        // voter1 checks the proposal has been created in position 1 (0 is GENESIS) with correct data
        const myProposal = await voting.connect(voter1).getOneProposal(1);
        assert.equal(myProposal.description, "Increase holidays");
        assert.equal(myProposal.voteCount, 0);
      })

      it("should not be possible for voters to add more than 254 proposals with a description during (1)-ProposalsRegistrationStarted", async function () {
        // owner start ProposalsRegistrationStarted
        await voting.startProposalsRegistering();
        // check we are in phase (1)-ProposalsRegistrationStarted
        assert.equal(await voting.workflowStatus(), 1);
        for (let i = 1; i < 255; i++) {
          await voting.connect(voter1).addProposal(`Raise wages ${i.toString()}`)
        }
        await expect(voting.connect(voter1).addProposal("Raise wages"))
          .to.be.revertedWith("Max proposals reached");
      })
    })

    describe("getOneProposal", function () {

      beforeEach(async () => {
        await deployments.fixture(["voting"]);
        voting = await ethers.getContract("Voting");
      })

      it("should not be possible for a simple user to get the proposal's info", async function () {
        await expect(voting.connect(simple_user).getOneProposal(0))
          .to.be.revertedWith("Not a voter");
      })

      it("should be possible for a voter to get proposal's info", async function () {
        // voter1 is registered by the owner
        await voting.addVoter(voter1.address);
        // Start (1)-ProposalsRegistrationStarted to have GENESIS proposal for the test
        await voting.startProposalsRegistering();
        // Check a voter can access the proposal's info
        myProposal = await voting.connect(voter1).getOneProposal(0);
        assert.equal(myProposal.description, "GENESIS");
        assert.equal(myProposal.voteCount, 0);
      })
    })

    describe("endProposalsRegistering", function () {

      beforeEach(async () => {
        await deployments.fixture(["voting"]);
        voting = await ethers.getContract("Voting");
        await voting.addVoter(voter1.address);
      })

      it("should not be possible for a simple user to endProposalsRegistering", async function () {
        await expect(voting.connect(simple_user).endProposalsRegistering())
          .to.be.revertedWith("Ownable: caller is not the owner");
      })

      it("should not be possible for a voter to endProposalsRegistering", async function () {
        await expect(voting.connect(voter1).endProposalsRegistering())
          .to.be.revertedWith("Ownable: caller is not the owner");
      })

      it("should not be possible for the owner to endProposalsRegistering if the current Workflow is not (1)-ProposalsRegistrationStarted", async function () {
        // check we are not in phase (1)-ProposalsRegistrationStarted
        assert.isFalse(await voting.workflowStatus() == 1);
        await expect(voting.endProposalsRegistering())
          .to.be.revertedWith("End registering proposals cant be now");
      })

      it("should be possible for the owner to endProposalsRegistering when current phase is (1)-ProposalsRegistrationStarted", async function () {
        await voting.startProposalsRegistering();
        // check we are in phase (1)-ProposalsRegistrationStarted
        assert.equal(await voting.workflowStatus(), 1);
        // check it emit the expected event
        await expect(voting.endProposalsRegistering())
          .to.emit(voting, 'WorkflowStatusChange')
          .withArgs(1, 2);
        // check we are now in (2)-ProposalsRegistrationEnded
        assert.equal(await voting.workflowStatus(), 2);
      })
    })

    describe("startVotingSession", function () {

      beforeEach(async () => {
        await deployments.fixture(["voting"]);
        voting = await ethers.getContract("Voting");
        await voting.addVoter(voter1.address);
        await voting.startProposalsRegistering();
        await voting.connect(voter1).addProposal("Increase holidays");
      })

      it("should not be possible for a simple user to startVotingSession", async function () {
        await expect(voting.connect(simple_user).startVotingSession())
          .to.be.revertedWith("Ownable: caller is not the owner");
      })

      it("should not be possible for a voter to startVotingSession", async function () {
        await expect(voting.connect(voter1).startVotingSession())
          .to.be.revertedWith("Ownable: caller is not the owner");
      })

      it("should not be possible for the owner to startVotingSession if the current Workflow is not (2)-ProposalsRegistrationEnded", async function () {
        // check we are not in phase (2)-ProposalsRegistrationEnded
        assert.isFalse(await voting.workflowStatus() == 2);
        await expect(voting.startVotingSession())
          .to.be.revertedWith("Voting cant be now");
      })

      it("should be possible for the owner to startVotingSession when current phase is (2)-ProposalsRegistrationEnded", async function () {
        await voting.endProposalsRegistering();
        // check we are in phase (2)-ProposalsRegistrationEnded
        assert.equal(await voting.workflowStatus(), 2);
        // check it emit the expected event
        await expect(voting.startVotingSession())
          .to.emit(voting, 'WorkflowStatusChange')
          .withArgs(2, 3);
        // check we are now in (3)-VotingSessionStarted
        assert.equal(await voting.workflowStatus(), 3);
      })
    })

    describe("setVote", function () {

      beforeEach(async () => {
        await deployments.fixture(["voting"]);
        voting = await ethers.getContract("Voting");
        await voting.addVoter(voter1.address);
        await voting.startProposalsRegistering();
        await voting.connect(voter1).addProposal("Increase holidays")
        await voting.endProposalsRegistering();
      })

      it("should not be possible for a simple user to vote", async function () {
        await expect(voting.connect(simple_user).setVote(1))
          .to.be.revertedWith("Not a voter");
      })

      it("should not be possible for a voter to set a vote outside the (3)-VotingSessionStarted phase", async function () {
        // check we are not in phase (3)-VotingSessionStarted
        assert.isFalse(await voting.workflowStatus() == 3);
        // check not respecting workflow triggered revert
        await expect(voting.connect(voter1).setVote(0))
          .to.be.revertedWith("Voting not open");
      })

      it("should not be possible for a voter to set a vote for a proposal which does not exist", async function () {
        await voting.startVotingSession();
        // check we are now in phase (3)-VotingSessionStarted
        assert.equal(await voting.workflowStatus(), 3);
        // check sending a wrong proposal triggers a revert
        await expect(voting.connect(voter1).setVote(9))
          .to.be.revertedWith("Missing proposal");
      })

      it("should be possible for a voter to set a vote for an existing proposal during (3)-VotingSessionStarted", async function () {
        // owner start VotingSessionStarted
        await voting.startVotingSession();
        // check we are in phase (3)-VotingSessionStarted
        assert.equal(await voting.workflowStatus(), 3);
        // check the voteCount is 0 at the beginning
        let voteCount = await voting.connect(voter1).getOneProposal(1);
        assert.equal(voteCount.voteCount, 0);
        // check setting the vote emit the expected event
        await expect(voting.connect(voter1).setVote(1))
          .to.emit(voting, 'Voted')
          .withArgs(voter1.address, 1);
        // check the vote has updated voters & proposalsArray
        const voterInfo = await voting.connect(voter1).getVoter(voter1.address);
        assert.equal(voterInfo.votedProposalId, 1);
        assert.equal(voterInfo.hasVoted, true);
        voteCount = await voting.connect(voter1).getOneProposal(1);
        assert.equal(voteCount.voteCount, 1);
      })

      it("should not be possible for a voter to vote twice", async function () {
        // owner start VotingSessionStarted
        await voting.startVotingSession();
        // check we are in phase (3)-VotingSessionStarted
        assert.equal(await voting.workflowStatus(), 3);
        // check the voteCount is 0 at the beginning
        let voteCount = await voting.connect(voter1).getOneProposal(1);
        assert.equal(voteCount.voteCount, 0);
        // Setting the 1st vote
        await voting.connect(voter1).setVote(1);
        // Checking it has been taken into account
        const voterInfo = await voting.connect(voter1).getVoter(voter1.address);
        assert.equal(voterInfo.votedProposalId, 1);
        assert.equal(voterInfo.hasVoted, true);
        voteCount = await voting.connect(voter1).getOneProposal(1);
        assert.equal(voteCount.voteCount, 1);
        // check second attemp triggers a revert
        await expect(voting.connect(voter1).setVote(1))
          .to.be.rejectedWith("Already voted");
        // check the 2nd vote did not update proposalsArray
        voteCount = await voting.connect(voter1).getOneProposal(1);
        assert.equal(voteCount.voteCount, 1);
      })
    })

    describe("endVotingSession", function () {

      beforeEach(async () => {
        await deployments.fixture(["voting"]);
        voting = await ethers.getContract("Voting");
        await voting.addVoter(voter1.address);
        await voting.startProposalsRegistering();
        await voting.connect(voter1).addProposal("Increase holidays");
        await voting.endProposalsRegistering();
      })

      it("should not be possible for a simple user to endVotingSession", async function () {
        await expect(voting.connect(simple_user).endVotingSession())
          .to.be.revertedWith("Ownable: caller is not the owner");
      })

      it("should not be possible for a voter to endVotingSession", async function () {
        await expect(voting.connect(voter1).endVotingSession())
          .to.be.revertedWith("Ownable: caller is not the owner");
      })

      it("should not be possible for the owner to endVotingSession if the current Workflow is not (3)-VotingSessionStarted", async function () {
        // check we are not in phase (3)-VotingSessionStarted
        assert.isFalse(await voting.workflowStatus() == 3);
        await expect(voting.endVotingSession())
          .to.be.revertedWith("End voting cant be now");
      })

      it("should be possible for the owner to endVotingSession when current phase is (3)-VotingSessionStarted", async function () {
        await voting.startVotingSession();
        // check we are in phase (3)-VotingSessionStarted
        assert.equal(await voting.workflowStatus(), 3);
        // check it emit the expected event
        await expect(voting.endVotingSession())
          .to.emit(voting, 'WorkflowStatusChange')
          .withArgs(3, 4);
        // check we are now in (4)-VotingSessionEnded
        assert.equal(await voting.workflowStatus(), 4);
      })
    })

    describe("tallyVotes", function () {

      beforeEach(async () => {
        await deployments.fixture(["voting"]);
        voting = await ethers.getContract("Voting");
        await voting.addVoter(voter1.address);
        await voting.startProposalsRegistering();
        await voting.connect(voter1).addProposal("Increase holidays");
        await voting.endProposalsRegistering();
        await voting.startVotingSession();
        await voting.connect(voter1).setVote(1);
      })

      it("should not be possible for a simple user to tallyVotes", async function () {
        await expect(voting.connect(simple_user).tallyVotes())
          .to.be.revertedWith("Ownable: caller is not the owner");
      })

      it("should not be possible for a voter to tallyVotes", async function () {
        await expect(voting.connect(voter1).tallyVotes())
          .to.be.revertedWith("Ownable: caller is not the owner");
      })

      it("should not be possible for the owner to tallyVotes if the current Workflow is not (4)-VotingSessionEnded", async function () {
        // check we are not in phase (4)-VotingSessionEnded
        assert.isFalse(await voting.workflowStatus() == 4);
        await expect(voting.tallyVotes())
          .to.be.revertedWith("Tally votes cant be now");
      })

      it("should be possible for the owner to tallyVotes when current phase is (4)-VotingSessionEnded", async function () {
        await voting.endVotingSession();
        // check we are in phase (4)-VotingSessionEnded
        assert.equal(await voting.workflowStatus(), 4);
        // check the initial winningProposalID is O
        assert.equal(await voting.winningProposalID(), 0);
        // check it emit the expected event
        await expect(voting.tallyVotes())
          .to.emit(voting, 'WorkflowStatusChange')
          .withArgs(4, 5);
        // check we are now in (5)-VotesTallied
        assert.equal(await voting.workflowStatus(), 5);
        // check winningProposalID is now 1
        assert.equal(await voting.winningProposalID(), 1);
      })
    })

    describe("winningProposalID", function () {
      beforeEach(async () => {
        await deployments.fixture(["voting"]);
        voting = await ethers.getContract("Voting");
        await voting.addVoter(voter1.address);
        await voting.startProposalsRegistering();
        await voting.connect(voter1).addProposal("Increase holidays");
        await voting.endProposalsRegistering();
        await voting.startVotingSession();
        await voting.connect(voter1).setVote(1);
        await voting.endVotingSession();
        await voting.tallyVotes();
      })

      it("should be possible for a simple user to get the winning proposal", async function () {
        const winningProposalId = await voting.connect(simple_user).winningProposalID();
        assert.equal(winningProposalId, 1);
      })

      it("should be possible for a voter to get the winning proposal", async function () {
        const winningProposalId = await voting.connect(voter1).winningProposalID();
        assert.equal(winningProposalId, 1);
      })
    })

  })
