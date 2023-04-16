const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Referral", function () {
  let Referral, referralContract, owner, user1, user2;
  beforeEach(async function () {
    Referral = await ethers.getContractFactory("Referral");
    referralContract = await Referral.deploy();
    await referralContract.deployed();
    //get the deployer address
    [owner, user1, user2] = await ethers.getSigners();
  });
  it("Should set the deployer as the owner", async function () {
    owner = await referralContract.owner();
    expect(await referralContract.owner()).to.equal(owner);
  });
  it("should register user", async function () {
    await referralContract.connect(user1).register(owner.address, {
      value: ethers.utils.parseEther("0.25"),
    });

    // console.log("user", user1.address);
    // console.log(await referralContract.users(user1.address));
    let user = await referralContract.users(user1.address);
    // console.log(user.referrer);

    expect(user.referrer).to.equal(owner.address);
  });
});
