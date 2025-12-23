"use client";

import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";
import { useState, useEffect, useCallback } from "react";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { MODULE_ADDRESS } from "./src/constant";
import "@aptos-labs/wallet-adapter-ant-design/dist/index.css";

// 1. Setup the client
const aptos = new Aptos(new AptosConfig({ network: Network.DEVNET }));

// 2. Define the Item Interface
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

  // --- YOUR EXISTING FETCH LOGIC (UNTOUCHED) ---
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

  // --- BUY FUNCTION ---
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
      loadMarketData(); // Refresh to remove bought item
    } catch (e) {
      console.error("Buy failed:", e);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* --- NAVBAR --- */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">C</div>
            <h1 className="text-xl font-bold tracking-tight">Cedera Market</h1>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={loadMarketData} 
              className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${loading ? 'bg-gray-100 text-gray-400' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
            >
              {loading ? "Refreshing..." : "Refresh Data"}
            </button>
            <WalletSelector />
          </div>
        </div>
      </nav>

      {/* --- MAIN CONTENT --- */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        
        {/* HERO SECTION */}
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Discover Digital Assets</h2>
          <p className="text-lg text-green-500 max-w-2xl mx-auto">
            The decentralized marketplace for unique items on Aptos Devnet. 
            Connect, list, and collect with zero friction.
          </p>
        </div>

        {/* LISTING FORM WOULD GO HERE (Keep your ListingForm component separate if you want) */}
        
        <div className="my-10 border-t border-gray-200" />

        {/* --- MARKET GRID --- */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold">Live Listings</h3>
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {listings.length} Items Available
          </span>
        </div>

        {listings.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
            <p className="text-gray-400 text-lg">No assets listed properly yet.</p>
            <p className="text-gray-400 text-sm mt-2">Be the first to list an item!</p>
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
    </div>
  );
}

// --- SUB-COMPONENT: BEAUTIFUL CARD ---
function MarketCard({ item, onBuy }: { item: MarketItem; onBuy: () => void }) {
  // Convert Octas to APT
  const priceInApt = (parseInt(item.price) / 100_000_000).toFixed(2);
  
  // Generate a consistent cool gradient based on the item ID
  const gradients = [
    "from-blue-500 to-purple-600",
    "from-pink-500 to-rose-500",
    "from-amber-400 to-orange-500",
    "from-emerald-400 to-cyan-500",
  ];
  const gradientClass = gradients[parseInt(item.id) % gradients.length];

  return (
    <div className="group bg-white rounded-2xl p-3 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:-translate-y-1">
      {/* Image Placeholder */}
      <div className={`h-48 rounded-xl bg-gradient-to-br ${gradientClass} flex items-center justify-center mb-4 relative overflow-hidden`}>
        <div className="absolute inset-0 bg-white/10 group-hover:bg-transparent transition-colors" />
        <span className="text-white font-bold text-3xl drop-shadow-md opacity-80">
          #{item.asset.id}
        </span>
      </div>

      {/* Content */}
      <div className="px-2 pb-2">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h4 className="font-bold text-lg text-gray-900 truncate pr-4">{item.asset.name}</h4>
            <p className="text-xs text-gray-400 font-mono truncate w-24">
              Owner: {item.seller.slice(0, 6)}...
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="flex flex-col">
            <span className="text-xs text-gray-500">Price</span>
            <span className="font-bold text-blue-600 text-lg">{priceInApt} APT</span>
          </div>
          <button 
            onClick={onBuy}
            className="bg-gray-900 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-blue-600 active:scale-95 transition-all shadow-lg shadow-gray-200"
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}