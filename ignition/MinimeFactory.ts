import { buildModule } from "@ignored/hardhat-ignition";

const MinimeFactory = buildModule("MinimeFactory", (m) => {
  const minimeFactory = m.contract("MiniMeTokenFactory")

  return { minimeFactory };
});

export default MinimeFactory;
