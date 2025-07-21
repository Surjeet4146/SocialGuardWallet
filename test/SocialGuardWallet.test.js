const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SocialGuardWallet", function () {
  it("Should set the right owner and gas sponsor", async function () {
    const SocialGuardWallet = await ethers.getContractFactory("SocialGuardWallet");
    const [owner, gasSponsor, contact1] = await ethers.getSigners();
    const wallet = await SocialGuardWallet.deploy(gasSponsor.address);
    await wallet.deployed();

    expect(await wallet.owner()).to.equal(owner.address);
    expect(await wallet.gasSponsor()).to.equal(gasSponsor.address);
  });

  it("Should allow owner to add trusted contact", async function () {
    const SocialGuardWallet = await ethers.getContractFactory("SocialGuardWallet");
    const [owner, contact1] = await ethers.getSigners();
    const wallet = await SocialGuardWallet.deploy(owner.address);
    await wallet.deployed();

    await wallet.addTrustedContact(contact1.address);
    expect(await wallet.trustedContacts(0)).to.equal(contact1.address);
  });

  it("Should execute gasless transaction", async function () {
    const SocialGuardWallet = await ethers.getContractFactory("SocialGuardWallet");
    const [owner, recipient] = await ethers.getSigners();
    const wallet = await SocialGuardWallet.deploy(owner.address);
    await wallet.deployed();

    const value = ethers.utils.parseEther("0.1");
    await owner.sendTransaction({ to: wallet.address, value });
    await expect(wallet.executeGaslessTransaction(recipient.address, value))
      .to.emit(wallet, "GaslessTransactionExecuted")
      .withArgs(recipient.address, value);
  });

  it("Should handle recovery process", async function () {
    const SocialGuardWallet = await ethers.getContractFactory("SocialGuardWallet");
    const [owner, newOwner, contact1, contact2] = await ethers.getSigners();
    const wallet = await SocialGuardWallet.deploy(owner.address);
    await wallet.deployed();

    await wallet.addTrustedContact(contact1.address);
    await wallet.addTrustedContact(contact2.address);
    await wallet.requestRecovery(newOwner.address);

    await wallet.connect(contact1).approveRecovery();
    await wallet.connect(contact2).approveRecovery();
    expect(await wallet.owner()).to.equal(newOwner.address);
  });
});
