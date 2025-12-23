"use client";

import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useState, useEffect, useCallback } from "react";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { MODULE_ADDRESS } from "./constant";

const aptos = new Aptos(new AptosConfig({ network: Network.DEVNET }));

interface MarketItem {
  id: string;
  price: string;
  seller: string;
  asset: {
    name: string;
    content_uri: string; // <--- This holds the Image URL
    id: string;
  };
}

export default function Home() {
  const { account, signAndSubmitTransaction } = useWallet();
  const [listings, setListings] = useState<MarketItem[]>([]);
  const [loading, setLoading] = useState(false);

  const loadMarketData = useCallback(async () => {
    setLoading(true);
    try {
      const resource = await aptos.getAccountResource({
        accountAddress: MODULE_ADDRESS,
        resourceType: `${MODULE_ADDRESS}::market_v3::Listings`
      });
      // @ts-ignore
      setListings(resource.items);
    } catch (e) {
      console.error("Error fetching market:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMarketData();
  }, [loadMarketData]);

  const handleBuy = async (listingId: string) => {
    if (!account) return alert("Connect wallet first!");
    
    try {
      const response = await signAndSubmitTransaction({
        data: {
          function: `${MODULE_ADDRESS}::market_v3::buy_item`,
          typeArguments: [],
          functionArguments: [listingId],
        }
      });
      await aptos.waitForTransaction({ transactionHash: response.hash });
      alert("You bought the NFT!");
      loadMarketData();
    } catch (e) {
      console.error("Buy failed:", e);
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-6 py-12">
      {/* HEADER */}
      <div className="mb-12 text-center space-y-4">
        <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white">AI Art Marketplace</h2>
        <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
          Discover and collect unique AI-generated assets on Aptos Devnet.
        </p>
      </div>

      {/* CONTROLS */}
      <div className="flex items-center justify-between mb-8 border-t border-gray-200 dark:border-gray-800 pt-8">
        <div>
           <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Live Listings</h3>
           <span className="text-sm text-gray-500 dark:text-gray-400">{listings.length} Unique Assets</span>
        </div>

        <button 
          onClick={loadMarketData} 
          className={`px-6 py-2.5 rounded-xl font-medium transition-all ${
            loading 
            ? 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600' 
            : 'bg-white border border-gray-200 text-gray-700 hover:border-blue-500 hover:text-blue-600 shadow-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:hover:border-blue-400 dark:hover:text-blue-400'
          }`}
        >
          {loading ? "Refreshing..." : "Refresh Grid"}
        </button>
      </div>

      {/* GRID */}
      {listings.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
          <p className="text-gray-400 text-lg">No AI assets listed yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {listings.map((item) => (
            <div key={item.id} className="group bg-white dark:bg-gray-800 rounded-3xl p-3 shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:-translate-y-1">
              
              {/* IMAGE (Now using the real URL) */}
              <div className="aspect-square rounded-2xl overflow-hidden mb-4 relative bg-gray-100 dark:bg-gray-900">
                 <img 
                   src={item.asset.content_uri} 
                   alt={item.asset.name}
                   className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                 />
              </div>

              {/* DETAILS */}
              <div className="px-2 pb-2">
                <h4 className="font-bold text-lg text-gray-900 dark:text-white truncate mb-1">{item.asset.name}</h4>
                <p className="text-xs text-gray-400 font-mono mb-4">Owner: {item.seller.slice(0, 6)}...{item.seller.slice(-4)}</p>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider">Price</p>
                    <p className="font-bold text-blue-600 dark:text-blue-400 text-lg">
                      {(parseInt(item.price) / 100_000_000).toFixed(2)} APT
                    </p>
                  </div>
                  <button 
                    onClick={() => handleBuy(item.id)}
                    className="bg-gray-900 dark:bg-white dark:text-gray-900 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-600 dark:hover:bg-blue-400 dark:hover:text-white active:scale-95 transition-all shadow-lg"
                  >
                    Buy
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}