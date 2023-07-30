import { buildModule } from "@ignored/hardhat-ignition";
import { ethers } from "hardhat";

const AragonOS = buildModule("AragonOS", (m) => {

  const petrify = m.getParameter("petrify", true);
  const withEVMscriptRegistryFactory = m.getParameter("withEVMscriptFactory", true);

  // DEPLOY_KERNEL_BASE
  const kernelBase = m.contract("Kernel", [petrify]);

  // DEPLOY_ACL_BASE
  const aclBase = m.contract("ACL", []);

  // DEPLOY_EVMSCRIPT_REGISTRY_FACTORY
  const evmScriptRegistryFactory = m.contract("EVMScriptRegistryFactory", []);

  // DEPLOY_DAO_FACTORY
  const daoFactory = m.contract("DAOFactory", [
    kernelBase,
    aclBase,
    withEVMscriptRegistryFactory? evmScriptRegistryFactory: ethers.constants.AddressZero,
  ]);


  return {
    kernelBase,
    aclBase,
    evmScriptRegistryFactory,
    daoFactory,
  };
});

export default AragonOS;
