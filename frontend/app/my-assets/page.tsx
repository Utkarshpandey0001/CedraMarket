"use client";

import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useState, useEffect, useCallback } from "react";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { MODULE_ADDRESS } from "../constant";
import Link from "next/link"; // Added Link for the empty state button

const aptos = new Aptos(new AptosConfig({ network: Network.DEVNET }));

interface MyItem {
  id: string;
  name: string;
  content_uri: string;
}

export default function MyAssetsPage() {
  const { account } = useWallet();
  const [myAssets, setMyAssets] = useState<MyItem[]>([]);
  const [loading, setLoading] = useState(false);

  const loadMyAssets = useCallback(async () => {
    if (!account) return;
    setLoading(true);
    try {
      const resource = await aptos.getAccountResource({
        accountAddress: account.address,
        resourceType: `${MODULE_ADDRESS}::market_v5::MyItems`
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

  return (
    <div className="min-h-screen pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">My Collection</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Your personal gallery of {myAssets.length} digital assets.
            </p>
          </div>
          <button 
            onClick={loadMyAssets} 
            className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 hover:border-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700 transition-all shadow-sm"
          >
            {loading ? "Syncing..." : "Sync Wallet"}
          </button>
        </div>

        {/* EMPTY STATES */}
        {!account ? (
          <div className="text-center py-32 bg-gray-50 dark:bg-gray-900/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800">
            <h3 className="text-xl font-bold text-gray-400">Wallet not connected</h3>
            <p className="text-gray-500 mt-2">Connect your Petra wallet to view your assets.</p>
          </div>
        ) : myAssets.length === 0 ? (
          <div className="text-center py-32 bg-gray-50 dark:bg-gray-900/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">No Assets Found</h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Your collection is empty. Explore the marketplace to find your first digital treasure.
            </p>
            <Link href="/" className="px-8 py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 hover:scale-105 transition-all shadow-lg shadow-blue-600/20">
              Explore Marketplace
            </Link>
          </div>
        ) : (
          
          /* ASSET GRID */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {myAssets.map((item) => (
              <div key={item.id} className="group bg-white dark:bg-gray-800 rounded-3xl p-3 shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:-translate-y-1">
                
                {/* IMAGE CONTAINER */}
                <div className="aspect-square rounded-2xl overflow-hidden mb-4 relative bg-gray-100 dark:bg-gray-900">
                   {/* The Image */}
                   <img 
                     src={item.content_uri} 
                     alt={item.name} 
                     className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                   />
                   
                   {/* Glassmorphism Badge */}
                   <div className="absolute top-3 right-3 bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold px-3 py-1.5 rounded-full tracking-wider shadow-lg">
                     OWNED
                   </div>
                </div>

                {/* CARD DETAILS */}
                <div className="px-2 pb-3">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-lg text-gray-900 dark:text-white truncate pr-4">{item.name}</h4>
                    <span className="text-xs font-mono text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-lg">
                      #{item.id}
                    </span>
                  </div>
                  
                  {/* Owner Display */}
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-[10px] text-white font-bold">
                      YOU
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                      {/* NEW (Fixed) */}
{account.address.toString().slice(0, 6)}...{account.address.toString().slice(-4)}
                    </p>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}