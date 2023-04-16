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
  it("should register user && the first referrer should be the owner", async function () {
    await referralContract.connect(user1).register(owner.address, {
      value: ethers.utils.parseEther("0.25"),
    });

    // console.log("user", user1.address);
    // console.log(await referralContract.users(user1.address));
    let user = await referralContract.users(user1.address);
    // console.log(user.referrer);

    expect(user.referrer).to.equal(owner.address);
  });

  it("should fail if the user is already registered", async function () {
    await referralContract.connect(user1).register(owner.address, {
      value: ethers.utils.parseEther("0.25"),
    });
    await expect(
      referralContract.connect(user1).register(owner.address, {
        value: ethers.utils.parseEther("0.25"),
      })
    ).to.be.revertedWith("User already registered");
  });

  it("should fail if the user is trying to register with a non-existing referrer", async function () {
    await expect(
      referralContract.connect(user1).register(user2.address, {
        value: ethers.utils.parseEther("0.25"),
      })
    ).to.be.revertedWith("Referrer does not exist");
  });

  it("should fail if the user is trying to send less than 0.25 ether", async function () {
    await expect(
      referralContract.connect(user1).register(owner.address, {
        value: ethers.utils.parseEther("0.24"),
      })
    ).to.be.revertedWith("Registration fee is 0.25 ether");
  });
});
