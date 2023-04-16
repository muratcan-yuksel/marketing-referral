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

  describe("User level up", function () {
    beforeEach(async function () {
      //register users functionality
      let numUsers = 11;
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
      //register users done});
    });
    it("user1 can level up to level 2 after inviting 9 users and paying 0.5 ether", async function () {
      //level up functionality
      await referralContract.connect(user1).levelUp({
        value: ethers.utils.parseEther("0.5"),
      });
    });
    it("user1 can NOT level up to level 2 after inviting 9 users and paying 0.4 ether", async function () {
      //level up functionality
      await expect(
        referralContract.connect(user1).levelUp({
          value: ethers.utils.parseEther("0.4"),
        })
      ).to.be.revertedWith("User has not paid 0.5 ether");
    });
  });
  //this test is a standalone
  it("user cannot call the level up function before inviting 9 users", async function () {
    const numUsers = 5;
    const signers = [];
    //create 9 users, user index 0 is the owner, user index 1 is user1, that's why we start from 2 to 11 = 9 users
    for (let i = 2; i < numUsers; i++) {
      const userName = `user${i}`;
      const signer = await ethers.getSigner(i);
      signers.push({ name: userName, signer: signer });
    }

    //register the user1 to the owner
    await referralContract.connect(user1).register(owner.address, {
      value: ethers.utils.parseEther("0.25"),
    });
    for (let i = 0; i < signers.length; i++) {
      await referralContract
        .connect(signers[i].signer)
        .register(user1.address, {
          value: ethers.utils.parseEther("0.25"),
        });
    }
    //cannot call level up function
    await expect(
      referralContract.connect(user1).levelUp({
        value: ethers.utils.parseEther("0.5"),
      })
    ).to.be.revertedWith("User has not referred 9 people");
  });

  describe("payment transfer", () => {
    it("should have a balance of 0 ETH initially", async function () {
      const contractBalance = await ethers.provider.getBalance(
        referralContract.address
      );
      expect(contractBalance).to.equal(0);
    });
    it("after the initial user, the contract should have more than 0 ether", async function () {
      await referralContract.connect(user1).register(owner.address, {
        value: ethers.utils.parseEther("0.25"),
      });
      const contractBalance = await ethers.provider.getBalance(
        referralContract.address
      );

      console.log(Number(contractBalance));

      expect(contractBalance).to.be.gt(0);
      //inside test
      it("the contract should have 0.75 ether after the initial user", async function () {
        expect(contractBalance).to.be.equal(0.75);
      });
    });
    it("after the 3rd user, the contract should have X amount of money", async function () {
      const [owner, user1, user2, user3, user4, user5, user6, user7, user8] =
        await ethers.getSigners();
      await referralContract.connect(user1).register(owner.address, {
        value: ethers.utils.parseEther("0.25"),
      });

      await referralContract.connect(user2).register(user1.address, {
        value: ethers.utils.parseEther("0.25"),
      });

      await referralContract.connect(user3).register(user1.address, {
        value: ethers.utils.parseEther("0.25"),
      });

      await referralContract.connect(user4).register(user1.address, {
        value: ethers.utils.parseEther("0.25"),
      });

      const contractBalance = await ethers.provider.getBalance(
        referralContract.address
      );

      console.log(Number(contractBalance));

      expect(contractBalance).to.be.gt(0);
    });
  });
});
