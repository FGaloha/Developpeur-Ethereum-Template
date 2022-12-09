// SPDX-License-Identifier: MIT

pragma solidity 0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Voting is Ownable {
    // DECLARATION

    error Voting__ActionNotAvailableInThisPhase();
    error Voting__ContractOwnerCannotBeRegistered();
    error Voting__AddressAlreadyRegistered();
    error Voting__NoProposalToVoteYet();
    error Voting__NotRegisteredVoter();
    error Voting__ProposalExistsAlready();
    error Voting__DescriptionMissing();
    error Voting__IncorrectAddress();
    error Voting__IncorrectProposalId();
    error Voting__YouAlreadyVoted();
    error Voting__NotRegisteredVoterOrOwner();
    error Voting__NoVote();

    // struct used to manage Voters
    struct Voter {
        bool isRegistered;
        bool hasVoted;
        uint256 votedProposalId;
    }

    // list of registered voters and their info
    mapping(address => Voter) whitelist;

    // struct to manage users' proposal(s)
    struct Proposal {
        string description;
        uint256 voteCount;
    }

    // Table indexing the users' proposols (the index is the ID of a proposal)
    Proposal[] proposals;

    // ID of the winning proposal, the one who got the max voteCount
    uint256 winningProposalId;

    // enum with the ordered list of possible status involved during the voting process
    enum WorkflowStatus {
        RegisteringVoters,
        ProposalsRegistrationStarted,
        ProposalsRegistrationEnded,
        VotingSessionStarted,
        VotingSessionEnded,
        VotesTallied
    }

    // Current phase of the voting process
    WorkflowStatus CurrentStatus;

    event VoterRegistered(address voterAddress);
    event WorkflowStatusChange(
        WorkflowStatus previousStatus,
        WorkflowStatus newStatus
    );
    event ProposalRegistered(uint256 proposalId);
    event Voted(address voter, uint256 proposalId);

    modifier onlyOwnerOrVoter() {
        require(
            whitelist[msg.sender].isRegistered || msg.sender == owner(),
            "You are not a registered voter or the owner !"
        );
        _;
    }

    modifier onlyRightPhase(WorkflowStatus _phase) {
        if (CurrentStatus != _phase) {
            revert Voting__ActionNotAvailableInThisPhase();
        }
        _;
    }

    modifier onlyRegistered(address _voter) {
        //require(whitelist[_address].isRegistered, "It is not a registered address");
        if (!whitelist[_voter].isRegistered) {
            revert Voting__NotRegisteredVoter();
        }
        _;
    }

    // WORKFLOW MANAGEMENT

    // Only the contract owner can set a new status when moving forward in the voting workflow
    function changeWorkflowStatus(
        WorkflowStatus _previousStatus,
        WorkflowStatus _newStatus
    ) internal onlyOwner {
        CurrentStatus = _newStatus;
        emit WorkflowStatusChange(_previousStatus, _newStatus);
    }

    // Only the contract owner can set the status to ProposalsRegistrationStarted if previous status was RegisteringVoters
    function startProposalsRegistration()
        external
        onlyOwner
        onlyRightPhase(WorkflowStatus(0))
    {
        changeWorkflowStatus(
            CurrentStatus,
            WorkflowStatus.ProposalsRegistrationStarted
        );
    }

    // Only the contract owner can set the status to ProposalsRegistrationEnded if previous status was ProposalsRegistrationStarted
    function endProposalsRegistration()
        external
        onlyOwner
        onlyRightPhase(WorkflowStatus(1))
    {
        // The phase can end when at least 1 proposal has been made
        if (proposals.length == 0) {
            revert Voting__NoProposalToVoteYet();
        }
        changeWorkflowStatus(
            CurrentStatus,
            WorkflowStatus.ProposalsRegistrationEnded
        );
    }

    // Only the contract owner can set the status to VotingSessionStarted if previous status was ProposalsRegistrationEnded
    function startVotingSession()
        external
        onlyOwner
        onlyRightPhase(WorkflowStatus(2))
    {
        changeWorkflowStatus(
            CurrentStatus,
            WorkflowStatus.VotingSessionStarted
        );
    }

    // Only the contract owner can set the status to VotingSessionEnded if previous status was ProposalsRegistrationStarted
    function endVotingSession()
        external
        onlyOwner
        onlyRightPhase(WorkflowStatus(3))
    {
        changeWorkflowStatus(CurrentStatus, WorkflowStatus.VotingSessionEnded);
    }

    // Workflow voting process ended when winningProposalId has been set up by putting current status in after VotesTallied
    function setVotesTallied() internal {
        changeWorkflowStatus(CurrentStatus, WorkflowStatus.VotesTallied);
    }

    // A voter or the owner use it to get the current phase
    function getCurrentWorkFlowStatus()
        external
        view
        onlyOwnerOrVoter
        returns (WorkflowStatus)
    {
        return CurrentStatus;
    }

    // REGISTERING - VOTING - WINNING MANAGEMENT

    // The owner use it to register voters during the RegisteringVoters phase
    function registerVoter(address _voterAddress)
        external
        onlyOwner
        onlyRightPhase(WorkflowStatus(0))
    {
        // Check _voterAddress is correct
        if (_voterAddress == address(0)) {
            revert Voting__IncorrectAddress();
        }

        //Check if _voterAddress is already registered
        if (whitelist[_voterAddress].isRegistered) {
            revert Voting__AddressAlreadyRegistered();
        }

        // Contract owner cannot register its address
        if (_voterAddress == owner()) {
            revert Voting__ContractOwnerCannotBeRegistered();
        }

        whitelist[_voterAddress].isRegistered = true;
        emit VoterRegistered(_voterAddress);
    }

    // Voters & owner use it to check if an address is registered
    function isRegisteredVoters(address _address)
        external
        view
        onlyOwnerOrVoter
        returns (bool)
    {
        return whitelist[_address].isRegistered;
    }

    // A voter use it to add a proposal during proposals registration phase
    function registerProposal(string memory _description)
        external
        onlyRegistered(msg.sender)
        onlyRightPhase(WorkflowStatus(1))
    {
        // Check _description is not empty
        if (bytes(_description).length == 0) {
            revert Voting__DescriptionMissing();
        }

        // Check if proposal exists already
        for (uint256 i = 0; i < proposals.length; i++) {
            if (
                keccak256(abi.encodePacked(proposals[i].description)) ==
                keccak256(abi.encodePacked(_description))
            ) {
                revert Voting__ProposalExistsAlready();
            }
        }
        proposals.push(Proposal(_description, 0));
        emit ProposalRegistered(proposals.length - 1);
    }

    // A voter & owner use it to get the registered proposals to be able to select one or view what has been suggested so far
    function getRegisteredProposals()
        external
        view
        onlyOwnerOrVoter
        returns (Proposal[] memory)
    {
        // Available when it starts to be possible to send proposal
        if (CurrentStatus < WorkflowStatus.ProposalsRegistrationStarted) {
            revert Voting__ActionNotAvailableInThisPhase();
        }
        return proposals;
    }

    // A voter use it to vote during VotingSessionStarted
    function voterVote(uint256 _votedProposalId)
        external
        onlyRegistered(msg.sender)
        onlyRightPhase(WorkflowStatus(3))
    {
        // Check _votedProposalId exists
        if (_votedProposalId < 0 || _votedProposalId >= proposals.length) {
            revert Voting__IncorrectProposalId();
        }

        //  We can only vote once
        if (whitelist[msg.sender].hasVoted) {
            revert Voting__YouAlreadyVoted();
        }

        whitelist[msg.sender].votedProposalId = _votedProposalId;
        whitelist[msg.sender].hasVoted = true;

        proposals[_votedProposalId].voteCount += 1;

        emit Voted(msg.sender, _votedProposalId);
    }

    // Owner can set the winningProposalId so the Voters can easely check which proposal won but only during VotingSessionEnded
    // In case of equality the 1st proposal getting the max win
    function setWinningProposalId()
        external
        onlyOwner
        onlyRightPhase(WorkflowStatus(4))
    {
        uint256 maxVotedCount;
        uint256 winnerId;
        for (uint256 i = 0; i < proposals.length; i++) {
            if (proposals[i].voteCount > maxVotedCount) {
                maxVotedCount = proposals[i].voteCount;
                winnerId = i;
            }
        }
        winningProposalId = winnerId;
        // The worflowstatus change to the last phase VotesTallied
        setVotesTallied();
    }

    // Voters & owner use it to get the description & number of votes obtained by the winning proposal
    function getDetailsWinningProposal()
        external
        view
        onlyRightPhase(WorkflowStatus(5))
        onlyOwnerOrVoter
        returns (Proposal memory)
    {
        return proposals[winningProposalId];
    }

    // Voters & owner use it to get the details (description, voteCount) of the proposol a specicif voter choose
    function getDetailsProposalVoterChoose(address _voter)
        external
        view
        onlyRightPhase(WorkflowStatus(5))
        onlyOwnerOrVoter
        returns (Proposal memory)
    {
        // Check if address is registered
        if (!whitelist[_voter].isRegistered) {
            revert Voting__NotRegisteredVoter();
        }

        // Check if address has voted
        if (!whitelist[_voter].hasVoted) {
            revert Voting__NoVote();
        }
        return proposals[whitelist[_voter].votedProposalId];
    }
}
