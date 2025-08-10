require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      viaIR: true,
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    morphHolesky: {
      url: process.env.MORPH_RPC_URL || "https://rpc-quicknode-holesky.morphl2.io",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 2810,
      gasPrice: 2000000000, // 2 gwei
    },
    morphMainnet: {
      url: "https://rpc.morphl2.io",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 2818,
    },
  },
  etherscan: {
    apiKey: {
      morphHolesky: "anything",
    },
    customChains: [
      {
        network: "morphHolesky",
        chainId: 2810,
        urls: {
          apiURL: "https://explorer-api-holesky.morphl2.io/api?",
          browserURL: "https://explorer-holesky.morphl2.io/",
        },
      },
    ],
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
};