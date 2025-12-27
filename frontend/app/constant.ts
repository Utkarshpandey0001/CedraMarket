
import { Cedra, CedraConfig, Network } from "@cedra-labs/ts-sdk";

const config = new CedraConfig({
  network: Network.TESTNET, 
});

export const cedra = new Cedra(config);


export const MODULE_ADDRESS = "0xea36baf8fde3f37627b3e9c1b95f691adaa27c39d58c55d64f540b92613999e2";