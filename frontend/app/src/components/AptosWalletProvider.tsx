"use client";

import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { Network } from "@aptos-labs/ts-sdk";
import { PropsWithChildren } from "react";

export const WalletProvider = ({ children }: PropsWithChildren) => {
  return (
    <AptosWalletAdapterProvider
      autoConnect={true}
      dappConfig={{ 
        network: Network.DEVNET,
        aptosConnect: { dappName: "CederaMarket" } 
      }}
      onError={(error) => console.log("Wallet error", error)}
    >
      {children}
    </AptosWalletAdapterProvider>
  );
};