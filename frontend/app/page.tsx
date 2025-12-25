"use client";

import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useState, useEffect, useCallback } from "react";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { MODULE_ADDRESS } from "./constant";
import { motion, AnimatePresence } from "framer-motion"; // <--- THE MAGIC

const aptos = new Aptos(new AptosConfig({ network: Network.DEVNET }));

interface MarketItem {
  id: string;
  price: string;
  seller: string;
  asset: { name: string; content_uri: string; id: string };
}

export default function Home() {
  const { account, signAndSubmitTransaction } = useWallet();
  const [listings, setListings] = useState<MarketItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const loadMarketData = useCallback(async () => {
    setLoading(true);
    try {
      const resource = await aptos.getAccountResource({
        accountAddress: MODULE_ADDRESS,
        resourceType: `${MODULE_ADDRESS}::market_v6::Listings`,
      });
      // @ts-ignore
      setListings(resource.items);
    } catch (e) {
      console.log("Market empty");
      setListings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadMarketData(); }, [loadMarketData]);

  const handleBuy = async (listingId: string, price: string) => {
    if (!account) return alert("Connect wallet first!");
    try {
      const response = await signAndSubmitTransaction({
        data: {
          function: `${MODULE_ADDRESS}::market_v6::buy_item`,
          typeArguments: [],
          functionArguments: [listingId],
        },
      });
      await aptos.waitForTransaction({ transactionHash: response.hash });
      loadMarketData();
    } catch (e) {
      console.error(e);
    }
  };

  const filteredListings = listings
    .filter((item) => {
      if (searchText && !item.asset.name.toLowerCase().includes(searchText.toLowerCase())) return false;
      const priceInApt = parseInt(item.price) / 100_000_000;
      if (minPrice && priceInApt < parseFloat(minPrice)) return false;
      if (maxPrice && priceInApt > parseFloat(maxPrice)) return false;
      return true;
    })
    .sort((a, b) => {
      const priceA = parseInt(a.price);
      const priceB = parseInt(b.price);
      return sortOrder === "asc" ? priceA - priceB : priceB - priceA;
    });

  return (
    <main className="max-w-7xl mx-auto px-6 pt-32 pb-12">
      
      {/* HERO SECTION - ANIMATED */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="mb-16 text-center space-y-6"
      >
        <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 drop-shadow-2xl">
          Future of AI Assets
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto font-light">
          Mint, collect, and trade GenAI artifacts in a decentralized economy.
        </p>
      </motion.div>

      {/* FILTER BAR - GLASSMORPHISM */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-slate-900/60 backdrop-blur-xl rounded-2xl p-6 border border-slate-800 shadow-2xl mb-12"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <input
            type="text" placeholder="Search..." 
            className="w-full pl-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-white transition-all focus:bg-slate-800"
            value={searchText} onChange={(e) => setSearchText(e.target.value)}
          />
          <div className="flex gap-2">
            <input type="number" placeholder="Min" className="w-1/2 px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl outline-none text-white focus:ring-2 focus:ring-blue-500 transition-all focus:bg-slate-800" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
            <input type="number" placeholder="Max" className="w-1/2 px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl outline-none text-white focus:ring-2 focus:ring-blue-500 transition-all focus:bg-slate-800" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
          </div>
          <select className="px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl outline-none text-white cursor-pointer hover:bg-slate-800 transition-all" value={sortOrder} onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}>
            <option value="asc">Price: Low to High</option>
            <option value="desc">Price: High to Low</option>
          </select>
          <button onClick={loadMarketData} className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-95">
            {loading ? "Syncing..." : "Refresh Grid"}
          </button>
        </div>
      </motion.div>

      {/* THE GRID - FLUID LAYOUT ANIMATION */}
      <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <AnimatePresence>
          {filteredListings.map((item) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              key={item.id}
              className="group relative bg-slate-900/80 backdrop-blur-md rounded-3xl p-3 border border-slate-800 hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10 transition-all"
            >
              {/* Image Container */}
              <div className="aspect-square rounded-2xl overflow-hidden mb-4 relative bg-slate-800">
                <motion.img 
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                  src={item.asset.content_uri} 
                  alt={item.asset.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"/>
              </div>

              {/* Card Info */}
              <div className="px-2 pb-2">
                <h4 className="font-bold text-lg text-white truncate mb-1">{item.asset.name}</h4>
                <p className="text-xs text-slate-500 font-mono mb-4">
                  Seller: {item.seller.slice(0, 4)}...{item.seller.slice(-4)}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-400">Price</span>
                    <span className="font-bold text-blue-400 text-lg">
                      {(parseInt(item.price) / 100_000_000).toFixed(2)} APT
                    </span>
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleBuy(item.id, item.price)}
                    className="bg-white text-slate-900 px-6 py-2 rounded-xl text-sm font-bold hover:bg-cyan-50 transition-colors"
                  >
                    Buy
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
      
      {filteredListings.length === 0 && !loading && (
        <div className="text-center py-20 text-slate-500">No artifacts found.</div>
      )}
    </main>
  );
}