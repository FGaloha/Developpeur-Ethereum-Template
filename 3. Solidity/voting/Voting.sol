// SPDX-License-Identifier: MIT

pragma solidity 0.8.17;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol";

contract Voting is Ownable {
    error Voting__ProposalsRegistrationNotStarted();
    error Voting__NotRegisteredVoter();

    struct Voter {
        bool isRegistered;
        bool hasVoted;
        uint votedProposalId;
    }

    struct Proposal {
        string description;
        uint voteCount;
    }

    enum WorkflowStatus {
        RegisteringVoters,
        ProposalsRegistrationStarted, //c ça le lancement de la session d'enregistrement?
        ProposalsRegistrationEnded,
        VotingSessionStarted,
        VotingSessionEnded,
        VotesTallied
    }

    WorkflowStatus public CurrentStatus;

    Proposal[] public proposals;

    // integer pour Id du gagnant ou faire une fonction getWinner qui retourne le gagnant
    uint winningProposalId;

    event VoterRegistered(address voterAddress);
    event WorkflowStatusChange(WorkflowStatus previousStatus, WorkflowStatus newStatus);
    event ProposalRegistered(uint proposalId);
    event Voted (address voter, uint proposalId);

    mapping(address => bool) whitelist;

    function registerVoter(address _voterAddress) public onlyOwner {
        whitelist[_voterAddress] = true;
        emit VoterRegistered(_voterAddress);
    }

    function launchWorkflow() public onlyOwner {
        CurrentStatus = WorkflowStatus.ProposalsRegistrationStarted;
        emit WorkflowStatusChange(WorkflowStatus.RegisteringVoters, CurrentStatus);
    }

    function registerProposal(string memory _description) public {

        // Only whitelisted address can register proposals
        if(!whitelist[msg.sender]) {
            revert Voting__NotRegisteredVoter();
        }

        // A proposal can only be added during the ProposalsRegistrationStarted phase
        if(CurrentStatus != WorkflowStatus.ProposalsRegistrationStarted) {
            revert Voting__ProposalsRegistrationNotStarted();
        }

        Proposal memory newProposal = Proposal(_description, 0);
        proposals.push(newProposal);
        emit ProposalRegistered(proposals.length - 1);
    }

    function changeWorkflowStatus(WorkflowStatus _newStatus) public onlyOwner {
        WorkflowStatus previousStatus = CurrentStatus;
        CurrentStatus = _newStatus;
        emit WorkflowStatusChange(previousStatus, _newStatus);
    }
}
