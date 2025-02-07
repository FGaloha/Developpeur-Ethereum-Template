// SPDX-License-Identifier: MIT

pragma solidity 0.8.13;
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title A simple voting contract
/// @author Flavia Gallois
/// @notice You can use this contract to organize a vote, for a small organization, in order to choose a proposal among several proposals (limited number) made by registered voters
contract Voting is Ownable {
    uint256 public winningProposalID;

    struct Voter {
        bool isRegistered;
        bool hasVoted;
        uint256 votedProposalId;
    }

    struct Proposal {
        string description;
        uint256 voteCount;
    }

    enum WorkflowStatus {
        RegisteringVoters,
        ProposalsRegistrationStarted,
        ProposalsRegistrationEnded,
        VotingSessionStarted,
        VotingSessionEnded,
        VotesTallied
    }

    WorkflowStatus public workflowStatus;

    Proposal[255] internal proposalsArray;
    uint256 internal proposalsLength;

    mapping(address => Voter) internal voters;

    event VoterRegistered(address voterAddress);
    event WorkflowStatusChange(
        WorkflowStatus previousStatus,
        WorkflowStatus newStatus
    );

    event ProposalRegistered(uint256 proposalId);
    event Voted(address voter, uint8 proposalId);

    modifier onlyVoters() {
        require(voters[msg.sender].isRegistered, "Not a voter");
        _;
    }

    // ::::::::::::: GETTERS ::::::::::::: //

    /// @notice Get the information of a voter identified by his address.
    /// @dev Only the registered voters can use this method
    /// @param _addr Address of the voter we look the information for
    /// @return Voter which contains the vote, registration status & voting status of a voter
    function getVoter(address _addr)
        external
        view
        onlyVoters
        returns (Voter memory)
    {
        return voters[_addr];
    }

    /// @notice Get the information of a proposal
    /// @dev Only the registered voters can use this method
    /// @param _id The identifier of a specific proposal
    /// @return Proposal which contains the description of the proposal and the number of votes it got so far
    function getOneProposal(uint8 _id)
        external
        view
        onlyVoters
        returns (Proposal memory)
    {
        return proposalsArray[_id];
    }

    // ::::::::::::: REGISTRATION ::::::::::::: //

    /// @notice Add an address in the list of voters
    /// @dev Only the owner of the contract can use this method
    /// @param _addr The address of the voter to register
    function addVoter(address _addr) external onlyOwner {
        require(
            workflowStatus == WorkflowStatus.RegisteringVoters,
            "Voters registration not open"
        );
        require(voters[_addr].isRegistered != true, "Already registered");

        voters[_addr].isRegistered = true;
        emit VoterRegistered(_addr);
    }

    // ::::::::::::: PROPOSAL ::::::::::::: //

    /// @notice Add a proposal to the list of proposals voted
    /// @dev Only the registered voters can use this method
    /// @param _desc The description of the proposal made by the voter
    function addProposal(string calldata _desc) external onlyVoters {
        require(
            workflowStatus == WorkflowStatus.ProposalsRegistrationStarted,
            "Proposals session not open"
        );
        require(bytes(_desc).length > 0, "Missing description");
        require(proposalsLength < 255, "Max proposals reached");
        Proposal memory proposal;
        proposal.description = _desc;
        proposalsArray[proposalsLength] = proposal;
        ++proposalsLength;
        emit ProposalRegistered(proposalsLength - 1);
    }

    // ::::::::::::: VOTE ::::::::::::: //

    /// @notice Vote for a proposal
    /// @dev Only the registered voters can use this method
    /// @param _id The identifier of the chosen proposal
    function setVote(uint8 _id) external onlyVoters {
        require(
            workflowStatus == WorkflowStatus.VotingSessionStarted,
            "Voting not open"
        );
        require(voters[msg.sender].hasVoted != true, "Already voted");
        require(_id < proposalsLength, "Missing proposal");

        voters[msg.sender].votedProposalId = _id;
        voters[msg.sender].hasVoted = true;
        ++proposalsArray[_id].voteCount;

        emit Voted(msg.sender, _id);
    }

    // ::::::::::::: STATE ::::::::::::: //

    /// @notice Start the proposals registration phase
    /// @dev Only the owner of the contract can use this method
    function startProposalsRegistering() external onlyOwner {
        require(
            workflowStatus == WorkflowStatus.RegisteringVoters,
            "Registering proposals cant be now"
        );
        workflowStatus = WorkflowStatus.ProposalsRegistrationStarted;

        Proposal memory proposal;
        proposal.description = "GENESIS";
        proposalsArray[proposalsLength] = proposal;
        ++proposalsLength;

        emit WorkflowStatusChange(
            WorkflowStatus.RegisteringVoters,
            WorkflowStatus.ProposalsRegistrationStarted
        );
    }

    /// @notice End the proposals registration phase
    /// @dev Only the owner of the contract can use this method
    function endProposalsRegistering() external onlyOwner {
        require(
            workflowStatus == WorkflowStatus.ProposalsRegistrationStarted,
            "End registering proposals cant be now"
        );
        workflowStatus = WorkflowStatus.ProposalsRegistrationEnded;
        emit WorkflowStatusChange(
            WorkflowStatus.ProposalsRegistrationStarted,
            WorkflowStatus.ProposalsRegistrationEnded
        );
    }

    /// @notice Start the voting session phase after the proposal registration ended
    /// @dev Only the owner of the contract can use this method
    function startVotingSession() external onlyOwner {
        require(
            workflowStatus == WorkflowStatus.ProposalsRegistrationEnded,
            "Voting cant be now"
        );
        workflowStatus = WorkflowStatus.VotingSessionStarted;
        emit WorkflowStatusChange(
            WorkflowStatus.ProposalsRegistrationEnded,
            WorkflowStatus.VotingSessionStarted
        );
    }

    /// @notice End the voting session phase
    /// @dev Only the owner of the contract can use this method
    function endVotingSession() external onlyOwner {
        require(
            workflowStatus == WorkflowStatus.VotingSessionStarted,
            "End voting cant be now"
        );
        workflowStatus = WorkflowStatus.VotingSessionEnded;
        emit WorkflowStatusChange(
            WorkflowStatus.VotingSessionStarted,
            WorkflowStatus.VotingSessionEnded
        );
    }

    /// @notice Calculate the winning proposal after the vote phase ended
    /// @dev Only the owner of the contract can use this method. Size limit of proposalsArray avoid DOS risk.
    function tallyVotes() external onlyOwner {
        require(
            workflowStatus == WorkflowStatus.VotingSessionEnded,
            "Tally votes cant be now"
        );
        uint256 _winningProposalId;
        for (uint256 p = 0; p < proposalsLength; ++p) {
            if (
                proposalsArray[p].voteCount >
                proposalsArray[_winningProposalId].voteCount
            ) {
                _winningProposalId = p;
            }
        }
        winningProposalID = _winningProposalId;

        workflowStatus = WorkflowStatus.VotesTallied;
        emit WorkflowStatusChange(
            WorkflowStatus.VotingSessionEnded,
            WorkflowStatus.VotesTallied
        );
    }
}
