const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Deploy ExpenseToken first
  console.log("Deploying ExpenseToken...");
  const ExpenseToken = await hre.ethers.getContractFactory("ExpenseToken");
  const expenseToken = await ExpenseToken.deploy();
  await expenseToken.deployed();
  console.log("ExpenseToken deployed to:", expenseToken.address);

  // Deploy SplitMe contract
  console.log("Deploying SplitMe...");
  const SplitMe = await hre.ethers.getContractFactory("SplitMe");
  const splitMe = await SplitMe.deploy(expenseToken.address);
  await splitMe.deployed();
  console.log("SplitMe deployed to:", splitMe.address);

  // Save deployment info
  const deploymentData = {
    network: hre.network.name,
    expenseTokenAddress: expenseToken.address,
    splitMeAddress: splitMe.address,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    expenseTokenTx: expenseToken.deployTransaction.hash,
    splitMeTx: splitMe.deployTransaction.hash
  };

  // Create deployments directory if it doesn't exist
  if (!fs.existsSync('./deployments')) {
    fs.mkdirSync('./deployments');
  }

  fs.writeFileSync(
    `./deployments/${hre.network.name}.json`,
    JSON.stringify(deploymentData, null, 2)
  );

  console.log("Deployment info saved to deployments/" + hre.network.name + ".json");

  // Verify contracts on block explorer
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("Waiting for block confirmations...");
    await expenseToken.deployTransaction.wait(6);
    await splitMe.deployTransaction.wait(6);

    console.log("Verifying contracts...");
    try {
      await hre.run("verify:verify", {
        address: expenseToken.address,
        constructorArguments: [],
      });
      
      await hre.run("verify:verify", {
        address: splitMe.address,
        constructorArguments: [expenseToken.address],
      });
    } catch (error) {
      console.log("Verification failed:", error.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });