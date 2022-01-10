import {hasMetaMask, isMetamaskSnapsSupported} from "./utils";
import {MetamaskFilecoinSnap as MFSnap} from "./snap";
import {SnapConfig} from "@chainsafe/filsnap-types";

const defaultSnapOrigin = "https://bafybeigzphbumdkucnj2c6nr5xb3kwsq5gs2gp7w3qldgbvfeycfsbjylu.ipfs.infura-ipfs.io";

export type MetamaskFilecoinSnap = MFSnap;

export {hasMetaMask, isMetamaskSnapsSupported} from "./utils";

/**
 * Install and enable Filecoin snap
 *
 * Checks for existence of Metamask and version compatibility with snaps before installation.
 *
 * Provided snap configuration must define at least network property so predefined configuration can be selected.
 * All other properties are optional, and if present will overwrite predefined property.
 *
 * @param config - SnapConfig
 * @param snapOrigin
 *
 * @return MetamaskFilecoinSnap - adapter object that exposes snap API
 */
export async function enableFilecoinSnap(
  config: Partial<SnapConfig>, snapOrigin?: string
): Promise<MetamaskFilecoinSnap> {

  const snapId = snapOrigin ?? defaultSnapOrigin;

  // check all conditions
  if (!hasMetaMask()) {
    throw new Error("Metamask is not installed");
  }
  if (!await isMetamaskSnapsSupported()) {
    throw new Error("Current Metamask version doesn't support snaps");
  }
  if (!config.network) {
    throw new Error("Configuration must at least define network type");
  }

  // enable snap
  await window.ethereum.request({
    method: "wallet_enable",
    params: [{
      [`wallet_snap_${snapId}`]: {}
    }]
  });

  //await unlockMetamask();

  // create snap describer
  const snap = new MFSnap(
    snapOrigin || defaultSnapOrigin
  );
  // set initial configuration
  await (await snap.getFilecoinSnapApi()).configure(config);
  // return snap object
  return snap;
}