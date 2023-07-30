import { buildModule } from "@ignored/hardhat-ignition";

import AragonPMFactory, { tld, label } from "./AragonPMFactory";

const AragonPM = buildModule("AragonPM", (m) => {
  const owner = m.getAccount(0);

  const { apmRegistryFactory } = m.useModule(AragonPMFactory);

  // DEPLOY_APM
  const callNewAPM = m.call(apmRegistryFactory, "newAPM", [tld, label, owner]);

  const apmAddress = m.readEventArgument(callNewAPM, "DeployAPM", "apm");
  const apm = m.contractAt("APMRegistry", apmAddress);

  return {
    apm,
  };
});

export default AragonPM;
