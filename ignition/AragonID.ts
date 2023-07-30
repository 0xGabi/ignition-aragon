import { buildModule } from "@ignored/hardhat-ignition";
import { ethers } from "hardhat";

import AragonPMFactory from "./AragonPMFactory";

const tld = ethers.utils.namehash("eth");
const label = ethers.utils.id("aragonid");
const node = ethers.utils.namehash("aragonid.eth");
const resolver = ethers.utils.namehash("resolver.eth");

const AragonID = buildModule("AragonID", (m) => {
  const { ens } = m.useModule(AragonPMFactory);

  const publicResolver = m.staticCall(ens, "resolver", [resolver]);

  const aragonID = m.contract("FIFSResolvingRegistrar", [
    ens,
    publicResolver,
    node,
  ]);

  m.call(ens, "setSubnodeOwner", [tld, label, aragonID]);

  return { aragonID };
});

export default AragonID;
