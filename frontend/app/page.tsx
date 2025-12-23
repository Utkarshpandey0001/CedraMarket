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
        accountAddress: "0x2af00cec9331ad1402032cf0612b904ed51eb2d7c401e38011c7e6b08cffc8f8",
        resourceType: "0x2af00cec9331ad1402032cf0612b904ed51eb2d7c401e38011c7e6b08cffc8f8::market_v2::Listings<0x2af00cec9331ad1402032cf0612b904ed51eb2d7c401e38011c7e6b08cffc8f8::market_v2::MarketItem>"
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

  const handleBuy = async (listingId: string, price: string) => {
    if (!account) return alert("Please connect wallet!");
    
    try {
      const response = await signAndSubmitTransaction({
        data: {
          function: `${MODULE_ADDRESS}::market_v2::buy_item`,
          typeArguments: [],
          functionArguments: [listingId],
        }
      });
      await aptos.waitForTransaction({ transactionHash: response.hash });
      alert("Purchase Successful!");
      loadMarketData();
    } catch (e) {
      console.error("Buy failed:", e);
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-6 py-12">
      
      {/* HERO SECTION */}
      <div className="mb-12 text-center space-y-4">
        <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white">Discover Digital Assets</h2>
        <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
          The decentralized marketplace for unique items on Aptos Devnet. 
          Connect, list, and collect with zero friction.
        </p>
      </div>

      <div className="my-10 border-t border-gray-200 dark:border-gray-800" />

      {/* --- MARKET GRID HEADER --- */}
      <div className="flex items-center justify-between mb-8">
        <div>
           <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Live Listings</h3>
           <span className="text-sm text-gray-500 dark:text-gray-400">{listings.length} Items Available</span>
        </div>

        <button 
          onClick={loadMarketData} 
          className={`px-6 py-2.5 rounded-xl font-medium transition-all duration-200 ${
            loading 
            ? 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600' 
            : 'bg-white border border-gray-200 text-gray-700 hover:border-blue-500 hover:text-blue-600 shadow-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:hover:border-blue-400 dark:hover:text-blue-400'
          }`}
        >
          {loading ? "Refreshing..." : "Refresh Grid"}
        </button>
      </div>

      {/* --- GRID --- */}
      {listings.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
          <p className="text-gray-400 text-lg">No assets listed properly yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {listings.map((item) => (
            <MarketCard 
              key={item.id} 
              item={item} 
              onBuy={() => handleBuy(item.id, item.price)} 
            />
          ))}
        </div>
      )}
    </main>
  );
}

// --- SUB-COMPONENT: CARD ---
function MarketCard({ item, onBuy }: { item: MarketItem; onBuy: () => void }) {
  const priceInApt = (parseInt(item.price) / 100_000_000).toFixed(2);
  
  const gradients = [
    "from-blue-500 to-purple-600",
    "from-pink-500 to-rose-500",
    "from-amber-400 to-orange-500",
    "from-emerald-400 to-cyan-500",
  ];
  const gradientClass = gradients[parseInt(item.id) % gradients.length];

  return (
    <div className="group bg-white dark:bg-gray-800 rounded-[1.5rem] p-3 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:-translate-y-1">
      <div className={`h-40 rounded-2xl bg-gradient-to-br ${gradientClass} flex items-center justify-center mb-4 relative overflow-hidden`}>
        <div className="absolute inset-0 bg-white/10 group-hover:bg-transparent transition-colors" />
        <span className="text-white font-bold text-2xl drop-shadow-md opacity-90">
          #{item.asset.id}
        </span>
      </div>

      <div className="px-2 pb-2">
        <h4 className="font-bold text-lg text-gray-900 dark:text-white truncate mb-1">{item.asset.name}</h4>
        <p className="text-xs text-gray-400 font-mono mb-4">Owner: {item.seller.slice(0, 8)}...</p>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider">Price</p>
            <p className="font-bold text-blue-600 dark:text-blue-400 text-lg">{priceInApt} APT</p>
          </div>
          <button 
            onClick={onBuy}
            className="bg-gray-900 dark:bg-white dark:text-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-600 dark:hover:bg-blue-400 dark:hover:text-white active:scale-95 transition-all shadow-lg shadow-gray-200 dark:shadow-none"
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}