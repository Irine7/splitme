const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  
  console.log("Deploying BalanceChecker contract with account:", deployer.address);
  console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString(), "wei");

  // Deploy BalanceChecker
  console.log("Deploying BalanceChecker...");
  const BalanceChecker = await hre.ethers.getContractFactory("BalanceChecker");
  const balanceChecker = await BalanceChecker.deploy();
  await balanceChecker.waitForDeployment();
  console.log("BalanceChecker deployed to:", await balanceChecker.getAddress());

  // Save deployment info
  const deploymentData = {
    network: hre.network.name,
    balanceCheckerAddress: await balanceChecker.getAddress(),
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    balanceCheckerTx: balanceChecker.deploymentTransaction().hash
  };

  // Create deployments directory if it doesn't exist
  if (!fs.existsSync('./deployments')) {
    fs.mkdirSync('./deployments');
  }

  // Save to balance-checker-[network].json to keep separate from main deployment
  fs.writeFileSync(
    `./deployments/balance-checker-${hre.network.name}.json`,
    JSON.stringify(deploymentData, null, 2)
  );

  console.log("Deployment info saved to deployments/balance-checker-" + hre.network.name + ".json");

  // Verify contract on block explorer
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("Waiting for block confirmations...");
    await balanceChecker.deployTransaction.wait(6);
    
    console.log("Verifying contract on block explorer...");
    try {
      await hre.run("verify:verify", {
        address: balanceChecker.address,
        constructorArguments: [],
      });
      console.log("Contract verified successfully");
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
