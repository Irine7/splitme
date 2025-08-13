const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  
  console.log("Deploying contracts with account:", deployer.address);
  
  // Get balance using provider instead of directly from signer
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", balance.toString());

  // Deploy ExpenseToken first
  console.log("Deploying ExpenseToken...");
  const ExpenseToken = await hre.ethers.getContractFactory("ExpenseToken");
  // Pass deployer.address as initialOwner to ExpenseToken constructor
  const expenseToken = await ExpenseToken.deploy(deployer.address);
  // Wait for deployment instead of using .deployed()
  const expenseTokenDeployTx = await expenseToken.waitForDeployment();
  const expenseTokenAddress = await expenseToken.getAddress();
  console.log("ExpenseToken deployed to:", expenseTokenAddress);

  // Deploy SplitMe contract
  console.log("Deploying SplitMe...");
  const SplitMe = await hre.ethers.getContractFactory("SplitMe");
  // Pass both initialOwner and _usdcToken arguments to SplitMe constructor
  const splitMe = await SplitMe.deploy(deployer.address, expenseTokenAddress);
  // Wait for deployment instead of using .deployed()
  const splitMeDeployTx = await splitMe.waitForDeployment();
  const splitMeAddress = await splitMe.getAddress();
  console.log("SplitMe deployed to:", splitMeAddress);

  // Get transaction hashes
  const expenseTokenTxHash = expenseTokenDeployTx.hash || expenseToken.deploymentTransaction().hash;
  const splitMeTxHash = splitMeDeployTx.hash || splitMe.deploymentTransaction().hash;

  // Save deployment info
  const deploymentData = {
    network: hre.network.name,
    expenseTokenAddress: expenseTokenAddress,
    splitMeAddress: splitMeAddress,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    expenseTokenTx: expenseTokenTxHash,
    splitMeTx: splitMeTxHash
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
    // Wait for 6 blocks for confirmation
    await new Promise(resolve => setTimeout(resolve, 60000)); // Wait 60 seconds

    console.log("Verifying contracts...");
    try {
      await hre.run("verify:verify", {
        address: expenseTokenAddress,
        constructorArguments: [],
      });
      
      await hre.run("verify:verify", {
        address: splitMeAddress,
        constructorArguments: [expenseTokenAddress],
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