// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

contract Voting {
    struct Voter {
        bool hasVoted;
        uint256 proposalId;
        uint256 stakedTokens;
        uint256 timeStamp;
    }

    struct Proposal {
        uint256 totalStakedTokens;
    }

    mapping(address => Voter) public voters;
    Proposal[] public proposals;

    function vote(uint256 proposalId, uint256 timeStamp) external {
        require(!voters[msg.sender].hasVoted, "You have already voted.");
        require(proposalId < proposals.length, "Invalid proposal ID.");

        Voter storage voter = voters[msg.sender];
        voter.hasVoted = true;
        voter.proposalId = proposalId;
        voter.timeStamp = timeStamp;
        proposals[proposalId].totalStakedTokens += voter.stakedTokens;
    }

    function stakeTokens(uint256 amount) external {
        require(amount > 0, "Invalid amount.");
        Voter storage voter = voters[msg.sender];
        voter.stakedTokens += amount;
    }

    function createProposal() external {
        proposals.push(Proposal(0));
    }
}