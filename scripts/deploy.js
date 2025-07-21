const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const GasSponsor = deployer.address; // Use deployer as initial gas sponsor
  const SocialGuardWallet = await hre.ethers.getContractFactory("SocialGuardWallet");
  const wallet = await SocialGuardWallet.deploy(GasSponsor);

  await wallet.deployed();
  console.log("SocialGuardWallet deployed to:", wallet.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
