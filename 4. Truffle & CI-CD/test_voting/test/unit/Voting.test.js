const { assert, expect } = require("chai")
const { network, deployments, ethers } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { _nameprepTableC } = require("@ethersproject/strings/lib/idna");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Units tests of Voting smart contract", function () {
    let accounts;
    let voting;
    // const _name = "FlavCoin";
    // const _symbol = "FLAV";
    // const _startAmount = 1000000 * 1e18;

    before(async () => {
      accounts = await ethers.getSigners()
      owner = accounts[0]
      voter1 = accounts[1]
      voter2 = accounts[2]
      simple_user = accounts[3]
    })

    // DEFINITIONS
    // A simple user is a person who is not a voter

    // Test contract can be deployed
    describe("Deployment", async function () {
      it("should deploy the smart contract", async function () {
        await deployments.fixture(["voting"]);
        voting = await ethers.getContract("Voting");
      })
    })

    beforeEach(async () => {
      await deployments.fixture(["voting"]);
      voting = await ethers.getContract("Voting");
    })

    describe("addVoter", async function () {
      it("should not be possible for a simple user to add a voter", async function () {
        await expect(
          voting.connect(simple_user).addVoter(simple_user.getAddress())
        ).to.be.revertedWith("Ownable: caller is not the owner");
      })

      it("should not be possible for a voter to add a voter", async function () {
        await expect(
          voting.connect(voter1).addVoter(voter2.getAddress())
        ).to.be.revertedWith("Ownable: caller is not the owner");
      })

      it("should be possible for the owner to register as a voter", async function () {
        const ownerAddress = await owner.getAddress();
        let addVoter = await voting.addVoter(ownerAddress);
        // check owner registration worked
        let myVoter = await voting.getVoter(ownerAddress);
        assert.equal(myVoter.isRegistered.toString(), "true");
        // check it emit the expected event
        await expect(addVoter)
          .to.emit(voting, 'VoterRegistered')
          .withArgs(ownerAddress);
      })

      it("should be possible for the owner to register a voter", async function () {
        // starting by registering the owner to get access to getVoter who is limited to voters
        const ownerAddress = await owner.getAddress();
        let addVoter = await voting.addVoter(ownerAddress);
        // adding another voter
        const voter1Address = await voter1.getAddress();
        addVoter = await voting.addVoter(voter1Address);
        // check voter1 registration worked
        myVoter = await voting.getVoter(voter1Address);
        assert.equal(myVoter.isRegistered.toString(), "true");
        // check it emit the expected event
        await expect(addVoter)
          .to.emit(voting, 'VoterRegistered')
          .withArgs(voter1Address);
      })

      it("should not be possible for the owner to register a voter twice", async function () {
        // the owner register voter1 once
        await voting.addVoter(voter1.getAddress());
        // the owner try to register again the voter1
        await expect(
          voting.addVoter(voter1.getAddress())
        ).to.be.revertedWith("Already registered");
      })

      it("Should not be possible for the owner to register a voter outside the RegisteringVoters phase", async function () {
        // changing the workflowStatus to status (1)-ProposalsRegistrationStarted
        addVoter = await voting.startProposalsRegistering();
        // check the status is different than (0)-RegisteringVoters
        let myStatus = await voting.workflowStatus();
        expect(myStatus).above(0);
        // check the addVoter attempt in ProposalsRegistrationStarted trigger the expected revert
        await expect(
          voting.addVoter(voter1.getAddress())
        ).to.be.revertedWith("Voters registration is not open yet");
      })

    })

    describe("getVoter", async function () {
      it("should not be possible for a simple user to get info/vote of a voter", async function () {
        await expect(voting.connect(simple_user).getVoter(voter1.getAddress())).to.be.revertedWith("You're not a voter");
      })

      it("should be possible for a voter to get info/vote of a voter", async function () {
        // the owner first register himself as a voter to be able to use getVoter
        await voting.addVoter(owner.getAddress());
        // test getVoter return the owner Voter & we can access the data that should be given the test [true, false, 0]
        const result = await voting.getVoter(owner.getAddress());
        assert(result.isRegistered.toString(), "true");
        assert(result.hasVoted.toString(), "false");
        assert(result.votedProposalId.toString(), "0");
      })
    })

    describe("startProposalsRegistering", async function () {

      it("should not be possible for a simple user to startProposalsRegistering", async function () {
        await expect(voting.connect(simple_user).startProposalsRegistering()).to.be.revertedWith("Ownable: caller is not the owner");
      })

      it("should not be possible for a voter to startProposalsRegistering", async function () {
        await expect(voting.connect(voter1).startProposalsRegistering()).to.be.revertedWith("Ownable: caller is not the owner");
      })

      it("should be possible for the owner to startProposalsRegistering", async function () {
        // the owner first register himself as a voter to be able to use getOneProposal
        await voting.addVoter(owner.getAddress());
        let myAction = await voting.startProposalsRegistering();
        // check we are now in (1)-ProposalsRegistrationStarted
        assert(voting.workflowStatus(), 1);
        // check 1st proposal Genesis has been created
        myProposal = await voting.getOneProposal(0);
        assert(myProposal.description, "GENESIS")
        assert(myProposal.voteCount, 0)
        // check it emit the expected event
        await expect(myAction)
          .to.emit(voting, 'WorkflowStatusChange')
          .withArgs(0, 1);
      })

      it("should not be possible for the owner to startProposalsRegistering if the current Workflow is not 0-RegisteringVoters", async function () {
        await voting.startProposalsRegistering();
        // check we are now in (1)-ProposalsRegistrationStarted
        assert(voting.workflowStatus(), 1);
        await expect(voting.startProposalsRegistering()).to.be.revertedWith("Registering proposals cant be started now");
      })
    })

    describe("addProposal", async function () {
      it("should not be possible for a simple user to add a proposal", async function () {
        await expect(voting.connect(simple_user).addProposal("Change the voting process")).to.be.revertedWith("You're not a voter");
      })

      it("should not be possible for a voter to add a proposal outside the (1)-ProposalsRegistrationStarted phase", async function () {
        // voter1 is registered by the owner
        await voting.addVoter(voter1.getAddress());
        // check
        await expect(voting.connect(voter1).addProposal("Increase holidays")).to.be.revertedWith("Proposals are not allowed yet");
      })

      it("should not be possible for a voter to add an empty proposal during (1)-ProposalsRegistrationStarted", async function () {
        // voter1 is registered by the owner
        await voting.addVoter(voter1.getAddress());
        // owner start ProposalsRegistrationStarted
        await voting.startProposalsRegistering();
        // check
        await expect(voting.connect(voter1).addProposal("")).to.be.revertedWith("Vous ne pouvez pas ne rien proposer");
      })

      it("should be possible for a voter to add a proposal with a description during (1)-ProposalsRegistrationStarted", async function () {
        // voter1 is registered by the owner
        await voting.addVoter(voter1.getAddress());
        // owner start ProposalsRegistrationStarted
        await voting.startProposalsRegistering();
        // voter1 adds a proposal
        let myAction = await voting.connect(voter1).addProposal("Increase holidays");
        // voter1 checks the proposal has been created in position 1 (0 is GENESIS) with correct data
        const myProposal = await voting.connect(voter1).getOneProposal(1);
        assert(myProposal.description, "Increase holidays");
        assert(myProposal.voteCount, 0);
        // check it emit the expected event
        await expect(myAction)
          .to.emit(voting, 'ProposalRegistered')
          .withArgs(1);
      })
    })

    // describe("getOneProposal", async function () {

    // })


  })
