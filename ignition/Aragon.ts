import {buildModule} from '@ignored/hardhat-ignition';
import hre from 'hardhat';

const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000';
const ANY_ENTITY = '0xFFfFfFffFFfffFFfFFfFFFFFffFFFffffFfFFFfF';
const CREATE_REPO_ROLE = hre.ethers.utils.id('CREATE_REPO_ROLE');
const CREATE_NAME_ROLE = hre.ethers.utils.id('CREATE_NAME_ROLE');

const tldName = 'eth';
const labelName = 'aragonpm';
const tldHash = hre.ethers.utils.namehash(tldName);
const labelHash = hre.ethers.utils.id(labelName);

const openTldName = 'aragonpm.eth';
const openLabelName = 'open';
const openTldHash = hre.ethers.utils.namehash(openTldName);
const openLabelHash = hre.ethers.utils.id(openLabelName);

function grantRole(m: any, apm:any , registrar:any, owner: any, role: string) {
  const kernelAddress = m.staticCall(apm, 'kernel');
  const kernel = m.contractAt('Kernel', kernelAddress);

  const aclAddress = m.staticCall(kernel, 'acl');
  const acl = m.contractAt('ACL', aclAddress);

  m.call(acl, 'grantPermission', [owner, registrar, role]);
}

const AragonModule = buildModule('Aragon', (m) => {
  const owner = m.getAccount(0);

  const immediatelyPetrify = m.getParameter('petrify', true);
  const withEVMscriptRegistryFactory = m.getParameter(
    'withEVMscriptRegistryFactory',
    true
  );
  const ens = m.getParameter('ens', ADDRESS_ZERO);

  // DEPLOY_KERNEL_BASE
  const kernelBase = m.contract('Kernel', [immediatelyPetrify]);

  // DEPLOY_ACL_BASE
  const aclBase = m.contract('ACL', []);

  // DEPLOY_EVMSCRIPT_REGISTRY_FACTORY
  const evmScriptRegistryFactory = m.contract('EVMScriptRegistryFactory', []);

  // DEPLOY_DAO_FACTORY
  const daoFactory = m.contract('DAOFactory', [
    kernelBase,
    aclBase,
    withEVMscriptRegistryFactory ? evmScriptRegistryFactory : ADDRESS_ZERO,
  ]);

  // DEPLOY_APM_REGISTRY_BASE
  const apmRegistry = m.contract('APMRegistry', []);

  // DEPLOY_REPO_BASE
  const apmRepo = m.contract('Repo', []);

  // DEPLOY_ENS_SUBDOMAIN_REGISTRAR
  const ensSubdomainRegistrar = m.contract('ENSSubdomainRegistrar', []);

  // DEPLOY_ENS_FACTORY
  const ensFactory = m.contract('ENSFactory', []);

  // DEPLOY_APM_REGISTRY_FACTORY
  const apmRegistryFactory = m.contract('APMRegistryFactory', [
    daoFactory,
    apmRegistry,
    apmRepo,
    ensSubdomainRegistrar,
    ens,
    ensFactory,
  ]);

  // DEPLOY_APM
  const ensAddress = m.staticCall(apmRegistryFactory, 'ens');
  const ensContract = m.contractAt('ENS', ensAddress);
  m.call(ensContract, 'setSubnodeOwner', [
    tldHash,
    labelHash,
    apmRegistryFactory,
  ]);

  //// New APM instance
  const callNewAPM = m.call(apmRegistryFactory, 'newAPM', [
    tldHash,
    labelHash,
    owner,
  ]);

  const apmAddress = m.readEventArgument(callNewAPM, 'DeployAPM', 'apm');
  const apm = m.contractAt('APMRegistry', apmAddress);

  const registrarAddress = m.staticCall(apm, 'registrar');
  const registrar = m.contractAt('ENSSubdomainRegistrar', registrarAddress);

  //// Create permission for root account on CREATE_NAME_ROLE
  grantRole(m, apm, registrar, owner, CREATE_NAME_ROLE);

  //// Creating open subdomain and assigning it to APMRegistryFactory
  m.call(registrar, 'createName', [openLabelHash, apmRegistryFactory]);

  //// New Open APM instance
  const callNewOpenAPM = m.call(apmRegistryFactory, 'newAPM', [
    openTldHash,
    openLabelHash,
    owner,
  ]);

  const openApmAddress = m.readEventArgument(
    callNewOpenAPM,
    'DeployAPM',
    'apm'
  );
  const openApm = m.contractAt('APMRegistry', openApmAddress);

  const openRegistrarAddress = m.staticCall(openApm, 'registrar');
  const openRegistrar = m.contractAt(
    'ENSSubdomainRegistrar',
    openRegistrarAddress
  );

  grantRole(m, openApm, openRegistrar, ANY_ENTITY, CREATE_REPO_ROLE);

  return {
    kernelBase,
    aclBase,
    evmScriptRegistryFactory,
    daoFactory,
    apmRegistry,
    apmRepo,
    ensSubdomainRegistrar,
    ensFactory,
    apmRegistryFactory,
    apm,
    openApm,
  };
});

export default AragonModule;
