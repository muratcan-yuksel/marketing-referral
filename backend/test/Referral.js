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

describe("User interactions", function () {
  let Referral, referralContract, owner, users, user1;
  // const NUM_USERS = 9;

  beforeEach(async function () {
    Referral = await ethers.getContractFactory("Referral");
    referralContract = await Referral.deploy();
    await referralContract.deployed();
    // get the deployer address
    [owner, user1] = await ethers.getSigners();
  });

  it("user1 can refer 9 users", async function () {
    const numUsers = 11;
    const signers = [];
    //create 9 users, user index 0 is the owner, user index 1 is user1, that's why we start from 2 to 11 = 9 users
    for (let i = 2; i < numUsers; i++) {
      const userName = `user${i}`;
      const signer = await ethers.getSigner(i);
      signers.push({ name: userName, signer: signer });
    }
    // console.log(signers.length);
    // console.log(user1);
    //register the user1 to the owner
    await referralContract.connect(user1).register(owner.address, {
      value: ethers.utils.parseEther("0.25"),
    });
    //register the 9 users to user1
    for (let i = 0; i < signers.length; i++) {
      await referralContract
        .connect(signers[i].signer)
        .register(user1.address, {
          value: ethers.utils.parseEther("0.25"),
        });
    }
  });

  it("user1 can NOT refer to more than 9  users", async function () {
    const numUsers = 17;
    const signers = [];
    //create 9 users, user index 0 is the owner, user index 1 is user1, that's why we start from 2 to 11 = 9 users
    for (let i = 2; i < numUsers; i++) {
      const userName = `user${i}`;
      const signer = await ethers.getSigner(i);
      signers.push({ name: userName, signer: signer });
    }
    // console.log(signers.length);
    // console.log(user1);
    //register the user1 to the owner
    await referralContract.connect(user1).register(owner.address, {
      value: ethers.utils.parseEther("0.25"),
    });
    //register 9 users to user1
    for (let i = 0; i < 9; i++) {
      await referralContract
        .connect(signers[i].signer)
        .register(user1.address, {
          value: ethers.utils.parseEther("0.25"),
        });
    }

    //register the 10th user to user1
    await expect(
      referralContract.connect(signers[9].signer).register(user1.address, {
        value: ethers.utils.parseEther("0.25"),
      })
    ).to.be.revertedWith("Referrer has already referred 9 people");
  });
});
