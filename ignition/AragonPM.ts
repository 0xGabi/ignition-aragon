import { buildModule } from "@ignored/hardhat-ignition";
import { ethers } from "hardhat";

import AragonPMFactory from "./AragonPMFactory";

const tld = ethers.utils.namehash("eth");
const label = ethers.utils.namehash("aragonpm");

const AragonPM = buildModule("AragonPM", (m) => {
  const owner = m.getAccount(0);

  const { apmRegistryFactory, ens } = m.useModule(AragonPMFactory);

  // DEPLOY_APM
  // Assigning ENS name to factory
  m.call(ens, "setSubnodeOwner", [tld, label, apmRegistryFactory]);

  const callNewAPM = m.call(apmRegistryFactory, "newAPM", [tld, label, owner]);

  const apmAddress = m.readEventArgument(callNewAPM, "DeployAPM", "apm");
  const apm = m.contractAt("APMRegistry", apmAddress);

  return {
    apm,
  };
});

export default AragonPM;
