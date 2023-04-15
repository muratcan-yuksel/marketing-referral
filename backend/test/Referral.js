const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Referral", function () {
  let owner, deployerAddress;
  before("contract setup", async function () {
    Referral = await ethers.getContractFactory("Referral");
    referral = await Referral.deploy();
    await referral.deployed();

    // Get the contract owner
    owner = await referral.owner();
    //console log the address of the wallet who deployed the contract
    deployerAddress = referral.deployTransaction.from;
  });
  it("the owner should bethe deployer of the contract", async function () {
    console.log("Owner: ", owner);
    console.log("Deployer address:", deployerAddress);
    expect(owner).to.equal(deployerAddress);
  });
});
