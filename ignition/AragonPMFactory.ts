import { buildModule } from "@ignored/hardhat-ignition";
import { ethers } from "hardhat";

import AragonOS from "./AragonOS";

export const tld = ethers.utils.namehash("eth");
export const label = ethers.utils.id("aragonpm");

const AragonPMFactory = buildModule("AragonPMFactory", (m) => {
  const owner = m.getAccount(0);

  const { daoFactory } = m.useModule(AragonOS);

  // DEPLOY_APM_REGISTRY_BASE
  const apmRegistry = m.contract("APMRegistry");

  // DEPLOY_REPO_BASE
  const apmRepo = m.contract("Repo");

  // DEPLOY_ENS_SUBDOMAIN_REGISTRAR
  const ensSubdomainRegistrar = m.contract("ENSSubdomainRegistrar");

  // DEPLOY_ENS_FACTORY
  const ensFactory = m.contract("ENSFactory");

  // DEPLOY_ENS
  const calNewENS = m.call(ensFactory, "newENS", [owner]);
  const ensAddress = m.readEventArgument(calNewENS, "DeployENS", "ens");
  const ens = m.contractAt("ENS", ensAddress);

  // DEPLOY_APM_REGISTRY_FACTORY
  const apmRegistryFactory = m.contract("APMRegistryFactory", [
    daoFactory,
    apmRegistry,
    apmRepo,
    ensSubdomainRegistrar,
    ens,
    ethers.constants.AddressZero,
  ]);

  // Assigning ENS name to factory
  m.call(ens, "setSubnodeOwner", [tld, label, apmRegistryFactory]);

  return {
    apmRegistry,
    apmRepo,
    ensSubdomainRegistrar,
    ensFactory,
    ens,
    apmRegistryFactory,
  };
});

export default AragonPMFactory;
