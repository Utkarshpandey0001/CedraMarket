"use client";

import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useState, useEffect, useCallback } from "react";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { MODULE_ADDRESS } from "../constant";
import Link from "next/link"; 

const aptos = new Aptos(new AptosConfig({ network: Network.DEVNET }));

interface MyItem {
  id: string;
  name: string;
  content_uri: string;
}

export default function MyAssetsPage() {
  const { account, signAndSubmitTransaction } = useWallet();
  const [myAssets, setMyAssets] = useState<MyItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Load Assets
  const loadMyAssets = useCallback(async () => {
    if (!account) return;
    setLoading(true);
    try {
      const resource = await aptos.getAccountResource({
        //@ts-ignore
        accountAddress: account.address,
        resourceType: `${MODULE_ADDRESS}::market_v6::MyItems` // 
      });
      // @ts-ignore
      setMyAssets(resource.items);
    } catch (e) {
      console.log("No assets found");
      setMyAssets([]);
    } finally {
      setLoading(false);
    }
  }, [account]);

  useEffect(() => {
    if (account) loadMyAssets();
  }, [account, loadMyAssets]);

  // --- NEW: RESELL FUNCTION ---
  const handleResell = async (itemId: string) => {
    const priceStr = prompt("Enter sale price (in APT):");
    if (!priceStr) return;

    const price = parseFloat(priceStr);
    if (isNaN(price) || price <= 0) return alert("Invalid price!");

    try {
      const response = await signAndSubmitTransaction({
        data: {
          function: `${MODULE_ADDRESS}::market_v6::resell_item`, // <--- V6 Function
          typeArguments: [],
          functionArguments: [
            itemId, 
            (price * 100_000_000).toString() // Convert to Octas
          ],
        }
      });
      await aptos.waitForTransaction({ transactionHash: response.hash });
      alert("Item listed for sale!");
      loadMyAssets(); // Refresh to show it's gone from wallet
    } catch (e) {
      console.error(e);
      alert("Failed to resell item.");
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">My Collection</h1>
          <button onClick={loadMyAssets} className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200">Sync Wallet</button>
        </div>

        {!account ? (
           <div className="text-center py-20 text-gray-500">Connect Wallet</div>
        ) : myAssets.length === 0 ? (
           <div className="text-center py-20 text-gray-500">No assets. <Link href="/" className="text-blue-500 underline">Buy some!</Link></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {myAssets.map((item) => (
              <div key={item.id} className="group bg-white dark:bg-gray-800 rounded-3xl p-3 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="aspect-square rounded-2xl overflow-hidden mb-4 relative bg-gray-100 dark:bg-gray-900">
                   <img src={item.content_uri} alt={item.name} className="w-full h-full object-cover" />
                   <div className="absolute top-3 right-3 bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold px-3 py-1.5 rounded-full">OWNED</div>
                </div>
                <div className="px-2 pb-3">
                  <h4 className="font-bold text-lg text-gray-900 dark:text-white truncate">{item.name}</h4>
                  
                  {/* SELL BUTTON */}
                  <button 
                    onClick={() => handleResell(item.id)}
                    className="mt-4 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all"
                  >
                    Sell Asset 💸
                  </button>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}