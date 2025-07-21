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
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event GaslessTransactionExecuted(address indexed to, uint value);
    event DappApproved(address indexed dapp);

    constructor(address _gasSponsor) {
        require(_gasSponsor != address(0), "Invalid gas sponsor");
        gasSponsor = _gasSponsor;
        transferOwnership(msg.sender);
    }

    // Add trusted contacts (max 3)
    function addTrustedContact(address _contact) external onlyOwner nonReentrant {
        require(trustedContacts.length < 3, "Max 3 trusted contacts allowed");
        require(_contact != address(0), "Invalid address");
        trustedContacts.push(_contact);
    }

    // Request ownership recovery
    function requestRecovery(address _newOwner) external onlyOwner nonReentrant {
        require(_newOwner != address(0), "Invalid new owner address");
        newOwnerCandidate = _newOwner;
        emit RecoveryRequested(owner(), _newOwner);
    }

    // Approve recovery by a trusted contact
    function approveRecovery() external nonReentrant {
        require(trustedContacts.length > 0, "No trusted contacts set");
        require(isTrustedContact(msg.sender), "Not a trusted contact");
        require(newOwnerCandidate != address(0), "No recovery requested");
        require(!recoveryApprovals[msg.sender], "Already approved");

        recoveryApprovals[msg.sender] = true;
        emit RecoveryApproved(msg.sender, newOwnerCandidate);

        uint approvalsCount = countApprovals();
        if (approvalsCount >= REQUIRED_APPROVALS) {
            transferOwnership(newOwnerCandidate);
            newOwnerCandidate = address(0);
            for (uint i = 0; i < trustedContacts.length; i++) {
                recoveryApprovals[trustedContacts[i]] = false;
            }
        }
    }

    // Execute a gasless transaction
    function executeGaslessTransaction(address _to, uint _value) external onlyOwner nonReentrant {
        require(_to != address(0), "Invalid recipient address");
        require(Address.isContract(_to) == false, "Cannot send to contract");
        require(msg.sender == owner(), "Only owner can initiate");
        require(gasSponsor != address(0), "No gas sponsor set");

        (bool sent, ) = _to.call{value: _value}("");
        require(sent, "Failed to send Ether");
        emit GaslessTransactionExecuted(_to, _value);
    }

    // Approve a DApp (placeholder for AI integration)
    function approveDapp(address _dapp) external onlyOwner nonReentrant {
        require(_dapp != address(0), "Invalid DApp address");
        approvedDapps[_dapp] = true;
        emit DappApproved(_dapp);
    }

    // Check if sender is a trusted contact
    function isTrustedContact(address _contact) internal view returns (bool) {
        for (uint i = 0; i < trustedContacts.length; i++) {
            if (trustedContacts[i] == _contact) {
                return true;
            }
        }
        return false;
    }

    // Count number of approvals
    function countApprovals() internal view returns (uint) {
        uint count = 0;
        for (uint i = 0; i < trustedContacts.length; i++) {
            if (recoveryApprovals[trustedContacts[i]]) {
                count++;
            }
        }
        return count;
    }

    // Update gas sponsor
    function setGasSponsor(address _newSponsor) external onlyOwner nonReentrant {
        require(_newSponsor != address(0), "Invalid gas sponsor");
        gasSponsor = _newSponsor;
    }

    // Receive Ether for gas sponsorship
    receive() external payable {}

    // Fallback function
    fallback() external payable {}
}
