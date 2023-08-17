import { buildModule } from "@ignored/hardhat-ignition";
import { ethers } from "hardhat";

import AragonPMFactory from "./AragonPMFactory";
import AragonPM from "./AragonPM";

const openTld = ethers.utils.namehash("aragonpm.eth");
const openLabel = ethers.utils.id("open");

const ANY_ENTITY = "0xFFfFfFffFFfffFFfFFfFFFFFffFFFffffFfFFFfF";
const CREATE_NAME_ROLE = ethers.utils.id("CREATE_NAME_ROLE");
const CREATE_REPO_ROLE = ethers.utils.id("CREATE_REPO_ROLE");

const OpenAragonPM = buildModule("OpenAragonPM", (m) => {
  const owner = m.getAccount(0);

  const { apmRegistryFactory, ensSubdomainRegistrar } =
    m.useModule(AragonPMFactory);

  const { apm } = m.useModule(AragonPM);

  const apmKernelAddress = m.staticCall(apm, "kernel");
  const apmKernel = m.contractAt("Kernel", apmKernelAddress);

  const apmAclAddress = m.staticCall(apmKernel, "acl");
  const apmAcl = m.contractAt("ACL", apmAclAddress);

  // DEPLOY_OPEN_APM
  /// Create permission for root account on CREATE_NAME_ROLE
  m.call(apmAcl, "grantPermission", [
    owner,
    ensSubdomainRegistrar,
    CREATE_NAME_ROLE,
  ]);

  /// Creating open subdomain and assigning it to APMRegistryFactory
  m.call(ensSubdomainRegistrar, "createName", [openLabel, apmRegistryFactory]);

  const callNewAPM = m.call(apmRegistryFactory, "newAPM", [
    openTld,
    openLabel,
    owner,
  ]);
  const openAPMAddress = m.readEventArgument(callNewAPM, "DeployAPM", "apm");
  const openAPM = m.contractAt("APMRegistry", openAPMAddress);

  const openAPMKernelAddress = m.staticCall(openAPM, "kernel", [], {
    id: "openAPMKernelAddress",
  });
  const openAPMKernel = m.contractAt("Kernel", openAPMKernelAddress, {
    id: "openAPMKernel",
  });

  const openAPMAclAddress = m.staticCall(openAPMKernel, "acl", [], {
    id: "openAPMAclAddress",
  });
  const openAPMAcl = m.contractAt("ACL", openAPMAclAddress, {
    id: "openAPMAcl",
  });

  m.call(
    openAPMAcl,
    "grantPermission",
    [ANY_ENTITY, openAPM, CREATE_REPO_ROLE],
    { id: "grantPermissionToCreateRepo" }
  );

  return {
    openAPM,
  };
});

export default OpenAragonPM;
