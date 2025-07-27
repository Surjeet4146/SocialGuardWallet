let provider;
let signer;
let walletContract;
let userAddress;

const CONTRACT_ADDRESS = "0xF1cE76150A71820c7107dA495D567619E41b5dDF";
const CONTRACT_ABI = [
    "function addTrustedContact(address contact)",
    "function requestWalletRecovery(address newOwner)",
    "function executeMetaTransaction(address to, uint256 value, bytes data, uint256 nonce, bytes signature)",
    "function getTrustedContacts() view returns (address[])",
    "event TrustedContactAdded(address indexed contact)",
    "event RecoveryRequested(address indexed newOwner)"
];

async function initializeWallet() {
    try {
        if (typeof window.ethereum !== 'undefined') {
            provider = new ethers.providers.Web3Provider(window.ethereum);
            
            // Request account access
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            
            signer = provider.getSigner();
            userAddress = await signer.getAddress();
            walletContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
            
            updateWalletStatus();
            loadTrustedContacts();
            
            showNotification("Wallet connected successfully!", "success");
        } else {
            showNotification("Please install MetaMask to use this wallet", "error");
            document.getElementById('walletAddress').textContent = "MetaMask not detected";
            document.getElementById('connectionStatus').textContent = "Not Available";
        }
    } catch (error) {
        console.error("Failed to initialize wallet:", error);
        showNotification("Failed to connect wallet: " + error.message, "error");
        document.getElementById('walletAddress').textContent = "Connection failed";
        document.getElementById('connectionStatus').textContent = "Error";
    }
}

function updateWalletStatus() {
    if (userAddress) {
        document.getElementById('walletAddress').textContent = userAddress;
        document.getElementById('connectionStatus').textContent = "Connected";
        document.getElementById('connectionStatus').style.background = "rgba(76, 175, 80, 0.8)";
    }
}

async function addContact() {
    const contactAddress = document.getElementById('contactAddress').value.trim();
    
    if (!contactAddress) {
        showNotification("Please enter a contact address", "error");
        return;
    }
    
    if (!ethers.utils.isAddress(contactAddress)) {
        showNotification("Invalid Ethereum address", "error");
        return;
    }
    
    try {
        const btn = document.getElementById('addContactBtn');
        btn.disabled = true;
        btn.innerHTML = '<div class="loading"></div> Adding...';
        
        const tx = await walletContract.addTrustedContact(contactAddress);
        await tx.wait();
        
        showNotification("Trusted contact added successfully!", "success");
        document.getElementById('contactAddress').value = '';
        loadTrustedContacts();
        
    } catch (error) {
        console.error("Failed to add contact:", error);
        showNotification("Failed to add contact: " + error.message, "error");
    } finally {
        const btn = document.getElementById('addContactBtn');
        btn.disabled = false;
        btn.innerHTML = 'Add Contact';
    }
}

async function requestRecovery() {
    const newOwnerAddress = document.getElementById('newOwnerAddress').value.trim();
    
    if (!newOwnerAddress) {
        showNotification("Please enter the new owner address", "error");
        return;
    }
    
    if (!ethers.utils.isAddress(newOwnerAddress)) {
        showNotification("Invalid Ethereum address", "error");
        return;
    }
    
    try {
        const btn = document.getElementById('recoveryBtn');
        btn.disabled = true;
        btn.innerHTML = '<div class="loading"></div> Requesting...';
        
        const tx = await walletContract.requestWalletRecovery(newOwnerAddress);
        await tx.wait();
        
        showNotification("Recovery request submitted successfully!", "success");
        document.getElementById('newOwnerAddress').value = '';
        
    } catch (error) {
        console.error("Failed to request recovery:", error);
        showNotification("Failed to request recovery: " + error.message, "error");
    } finally {
        const btn = document.getElementById('recoveryBtn');
        btn.disabled = false;
        btn.innerHTML = 'Request Recovery';
    }
}

async function executeTransaction() {
    const toAddress = document.getElementById('toAddress').value.trim();
    const amount = document.getElementById('amount').value.trim();
    
    if (!toAddress || !amount) {
        showNotification("Please fill in all transaction fields", "error");
        return;
    }
    
    if (!ethers.utils.isAddress(toAddress)) {
        showNotification("Invalid recipient address", "error");
        return;
    }
    
    try {
        const btn = document.getElementById('transactionBtn');
        btn.disabled = true;
        btn.innerHTML = '<div class="loading"></div> Executing...';
        
        const value = ethers.utils.parseEther(amount);
        const nonce = Date.now(); // Simple nonce for demo
        const data = "0x"; // Empty data for simple transfer
        
        // In a real implementation, you would create a proper signature
        // This is a simplified version for demonstration
        const message = ethers.utils.solidityKeccak256(
            ['address', 'uint256', 'bytes', 'uint256'],
            [toAddress, value, data, nonce]
        );
        const signature = await signer.signMessage(ethers.utils.arrayify(message));
        
        const tx = await walletContract.executeMetaTransaction(
            toAddress,
            value,
            data,
            nonce,
            signature
        );
        await tx.wait();
        
        showNotification("Transaction executed successfully!", "success");
        document.getElementById('toAddress').value = '';
        document.getElementById('amount').value = '';
        
    } catch (error) {
        console.error("Failed to execute transaction:", error);
        showNotification("Failed to execute transaction: " + error.message, "error");
    } finally {
        const btn = document.getElementById('transactionBtn');
        btn.disabled = false;
        btn.innerHTML = 'Execute Transaction';
    }
}

async function loadTrustedContacts() {
    try {
        const contacts = await walletContract.getTrustedContacts();
        const contactList = document.getElementById('contactList');
        
        if (contacts.length === 0) {
            contactList.innerHTML = `
                <div style="text-align: center; color: #999; padding: 20px;">
                    No trusted contacts added yet
                </div>
            `;
        } else {
            contactList.innerHTML = contacts.map(contact => `
                <div class="contact-item">
                    <span>${contact}</span>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error("Failed to load contacts:", error);
        document.getElementById('contactList').innerHTML = `
            <div style="text-align: center; color: #f44336; padding: 20px;">
                Failed to load contacts
            </div>
        `;
    }
}

function showNotification(message, type = "success") {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 4000);
}

// Initialize wallet when page loads
window.addEventListener('load', initializeWallet);

// Handle account changes
if (window.ethereum) {
    window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
            initializeWallet();
        } else {
            document.getElementById('walletAddress').textContent = "No account connected";
            document.getElementById('connectionStatus').textContent = "Disconnected";
        }
    });

    window.ethereum.on('chainChanged', () => {
        window.location.reload();
    });
}