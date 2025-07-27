require("@nomiclabs/hardhat-ethers");
require("dotenv").config();

module.exports = {
  solidity: "0.8.20",
  networks: {
    blockdagTestnet: {
      url: process.env.BLOCKDAG_RPC_URL || "https://placeholder.blockdag.com", // Replace with actual RPC URL
      accounts: [process.env.PRIVATE_KEY]
    }
  }
};
