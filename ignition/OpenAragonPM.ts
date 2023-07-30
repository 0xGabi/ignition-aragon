import { buildModule } from "@ignored/hardhat-ignition";
import { ethers } from "hardhat";

import AragonPMFactory from "./AragonPMFactory";
import AragonPM from "./AragonPM";

const openTld = ethers.utils.namehash("aragonpm.eth");
const openLabel = ethers.utils.id("open");

const OpenAragonPM = buildModule("OpenAragonPM", (m) => {
  const owner = m.getAccount(0);

  const { apmRegistryFactory } = m.useModule(AragonPMFactory);
  const { apm } = m.useModule(AragonPM);

  // DEPLOY_OPEN_APM
  //// Creating open subdomain and assigning it to APMRegistryFactory 
  const registrarAddress = m.staticCall(apm, "registrar");
  const registrar = m.contractAt("ENSSubdomainRegistrar", registrarAddress);

  m.call(registrar, "createName", [openLabel, apmRegistryFactory]);

  const callNewOpenAPM = m.call(apmRegistryFactory, 'newAPM', [
    openTld,
    openLabel,
    owner,
  ], {id: "CallNewOpenAPM"});
  const openAPMAddress = m.readEventArgument(callNewOpenAPM, 'DeployAPM', 'apm', {id: "OpenAPMAddress"});
  const openAPM = m.contractAt('APMRegistry', openAPMAddress, {id: "OpenAPM"});
  
  return {
    openAPM
  };
});

export default OpenAragonPM;
