// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Address.sol";

contract SocialGuardWallet is Ownable, ReentrancyGuard {
    address[] private trustedContacts;
    uint public constant REQUIRED_APPROVALS = 2;
    mapping(address => bool) private recoveryApprovals;
    address private newOwnerCandidate;
    address public gasSponsor; // Address to sponsor gas fees
    mapping(address => bool) public approvedDapps; // Placeholder for AI-approved DApps

    event RecoveryRequested(address indexed oldOwner, address indexed newOwner);
    event RecoveryApproved(address indexed approver, address indexed newOwner);
    event GaslessTransactionExecuted(address indexed to, uint value);
    event DappApproved(address indexed dapp);

    constructor(address _gasSponsor) {
        require(_gasSponsor != address(0), "Invalid gas sponsor");
        gasSponsor = _gasSponsor;
        transferOwnership(msg.sender);
    }

    // ... (rest of the contract remains unchanged)
}