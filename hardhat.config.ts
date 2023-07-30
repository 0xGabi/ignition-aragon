import { HardhatUserConfig } from "hardhat/config";

import "@ignored/hardhat-ignition";
import "@nomicfoundation/hardhat-toolbox";
import "@nomiclabs/hardhat-ethers";

const config: HardhatUserConfig = {
  networks: {
    frame: {
      chainId: 10,
      url: 'http://127.0.0.1:1248',
      httpHeaders: { origin: "hardhat" },
      timeout: 0,
      gas: 0,
    }
  },
  solidity: {
    compilers: [
      {
        version: '0.4.24',
        settings: {
          optimizer: {
            enabled: true,
            runs: 10000,
          },
        },
      },
    ],
  }
};

export default config;
