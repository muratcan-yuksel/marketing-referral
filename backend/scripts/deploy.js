const { ethers } = require("hardhat");

async function main() {
  const referralContract = await ethers.getContractFactory("Referral");
  const referral = await referralContract.deploy();
  await referral.deployed();

  console.log("referral deployed to:", referral.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
