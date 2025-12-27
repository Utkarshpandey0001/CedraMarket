"use client";

import { useState, useEffect, useCallback } from "react";
import { Account } from "@cedra-labs/ts-sdk"; 
import { cedra, MODULE_ADDRESS } from "./constant"; 
import { motion, AnimatePresence } from "framer-motion"; 

// Icons
const CopyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5" />
  </svg>
);

interface MarketItem {
  id: string;
  price: string;
  seller: string;
  asset: { name: string; content_uri: string; id: string };
}

export default function Home() {
  const [listings, setListings] = useState<MarketItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [buyLoading, setBuyLoading] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null); // For Modal
  
  // RESTORED FILTER STATE
  const [searchText, setSearchText] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  
  // Fetch Logic
  const loadMarketData = useCallback(async () => {
    setLoading(true);
    try {
      console.log("Fetching listings from:", MODULE_ADDRESS);
      const resource = await cedra.getAccountResource({
        accountAddress: MODULE_ADDRESS,
        resourceType: `${MODULE_ADDRESS}::market_v6::Listings`,
      });
      // @ts-ignore
      setListings(resource.items);
    } catch (e) {
      console.error("Failed to load market:", e);
      setListings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadMarketData(); }, [loadMarketData]);

  // 🟢 UPDATED BUY LOGIC: Save Private Key & Ledger Status
  const handleBuy = async (e: React.MouseEvent, listingId: string, priceStr: string) => {
    e.stopPropagation(); // Prevent opening modal when clicking buy
    setBuyLoading(listingId);
    
    try {
      const price = parseInt(priceStr);
      const buyerAccount = Account.generate();
      
      // 1. Fund Ghost Buyer (Price + Gas)
      const fundAmount = price + 50_000_000; 
      await cedra.fundAccount({ 
        accountAddress: buyerAccount.accountAddress, 
        amount: fundAmount 
      });

      // 2. Buy Item
      const transaction = await cedra.transaction.build.simple({
        sender: buyerAccount.accountAddress,
        data: {
          function: `${MODULE_ADDRESS}::market_v6::buy_item`,
          typeArguments: [],
          functionArguments: [listingId],
        },
      });

      const response = await cedra.signAndSubmitTransaction({
        signer: buyerAccount,
        transaction,
      });

      await cedra.waitForTransaction({ transactionHash: response.hash });
      
      const buyerAddr = buyerAccount.accountAddress.toString();
      
      // 🟢 SAVE PRIVATE KEY (For Reselling)
      localStorage.setItem(`cedra_key_${buyerAddr}`, buyerAccount.privateKey.toString());

      // 🟢 SAVE TO RECENT WALLETS
      const existingWallets = JSON.parse(localStorage.getItem("cedra_recent_wallets") || "[]");
      if (!existingWallets.includes(buyerAddr)) {
        localStorage.setItem("cedra_recent_wallets", JSON.stringify([buyerAddr, ...existingWallets]));
      }

      // 🟢 UPDATE GLOBAL LEDGER (Mark as Sold)
      const history = JSON.parse(localStorage.getItem("cedra_global_ledger") || "[]");
      const updatedHistory = history.map((item: any) => {
        if (item.id === listingId || item.asset.name === listings.find(l => l.id === listingId)?.asset.name) {
          return { 
            ...item, 
            status: "Sold", 
            owner: buyerAddr, 
            price: priceStr 
          };
        }
        return item;
      });
      localStorage.setItem("cedra_global_ledger", JSON.stringify(updatedHistory));

      alert(`Success! Item purchased.\n\nKeys saved locally. You can now View & Resell this item in 'My Assets'.`);
      
      loadMarketData(); 
      setSelectedId(null); 

    } catch (e: any) {
      console.error(e);
      alert("Buy Failed: " + e.message);
    } finally {
      setBuyLoading(null);
    }
  };

  const copyAddress = (e: React.MouseEvent, addr: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(addr);
    alert("Address copied!");
  };

  // FILTER LOGIC
  const filteredListings = listings
    .filter((item) => {
      if (searchText && !item.asset.name.toLowerCase().includes(searchText.toLowerCase())) return false;
      
      const priceInCedra = parseInt(item.price) / 100_000_000; 
      if (minPrice && priceInCedra < parseFloat(minPrice)) return false;
      if (maxPrice && priceInCedra > parseFloat(maxPrice)) return false;
      
      return true;
    })
    .sort((a, b) => {
      const priceA = parseInt(a.price);
      const priceB = parseInt(b.price);
      return sortOrder === "asc" ? priceA - priceB : priceB - priceA;
    });

  return (
    <main className="max-w-7xl mx-auto px-6 pt-32 pb-12 relative min-h-screen">
      
      {/* Title */}
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
          Mint, collect, and trade GenAI artifacts in the <span className="text-cyan-400 font-bold">Cedra Ecosystem</span>.
        </p>
      </motion.div>

      {/* FILTER BAR - RESTORED */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-slate-900/60 backdrop-blur-xl rounded-2xl p-6 border border-slate-800 shadow-2xl mb-12"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <input
            type="text" placeholder="Search assets..." 
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

      {/* Grid */}
      <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {filteredListings.map((item) => (
          <motion.div
            layoutId={item.id} // Essential for the expansion animation
            onClick={() => setSelectedId(item.id)}
            key={item.id}
            className="cursor-pointer group relative bg-slate-900/80 backdrop-blur-md rounded-3xl p-3 border border-slate-800 hover:border-blue-500/50 transition-all hover:-translate-y-2"
          >
            <div className="aspect-square rounded-2xl overflow-hidden mb-4 relative bg-slate-800">
              <motion.img src={item.asset.content_uri} className="w-full h-full object-cover" />
            </div>
            <div className="px-2 pb-2">
              <h4 className="font-bold text-lg text-white truncate mb-1">{item.asset.name}</h4>
              <div className="flex justify-between items-center">
                 <span className="text-blue-400 font-bold">{(parseInt(item.price) / 100_000_000).toFixed(2)} CED</span>
                 <span className="text-xs text-slate-500">View Details</span>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
      
      {filteredListings.length === 0 && !loading && (
        <div className="text-center py-20">
          <p className="text-slate-500">No artifacts found matching your filters.</p>
          <button onClick={loadMarketData} className="mt-4 text-blue-400 hover:underline">Force Refresh</button>
        </div>
      )}

      {/* EXPANDED CARD MODAL */}
      <AnimatePresence>
        {selectedId && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedId(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
            />
            
            {/* Centered Modal */}
            <div className="fixed inset-0 grid place-items-center z-50 pointer-events-none">
              {filteredListings.filter(i => i.id === selectedId).map(item => (
                <motion.div
                  layoutId={selectedId}
                  key={selectedId}
                  className="pointer-events-auto w-[90%] max-w-4xl bg-[#0f172a] border border-slate-700 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row"
                >
                  {/* Image Half */}
                  <div className="md:w-1/2 bg-black flex items-center justify-center p-4">
                     <motion.img src={item.asset.content_uri} className="max-w-full max-h-[500px] object-contain rounded-xl shadow-lg" />
                  </div>

                  {/* Details Half */}
                  <div className="md:w-1/2 p-8 flex flex-col justify-between">
                    <div>
                      <h2 className="text-4xl font-black text-white mb-2">{item.asset.name}</h2>
                      <div className="flex items-center gap-2 mb-6 p-2 bg-slate-800/50 rounded-lg w-fit">
                        <span className="text-sm text-slate-400">Owner: {item.seller.slice(0, 6)}...{item.seller.slice(-6)}</span>
                        <button onClick={(e) => copyAddress(e, item.seller)} className="p-1 hover:bg-slate-700 rounded text-blue-400 transition-colors">
                          <CopyIcon />
                        </button>
                      </div>
                      <p className="text-slate-400 leading-relaxed">
                        This unique GenAI artifact is stored securely on the Cedra blockchain. 
                        Ownership is verifiable and immutable.
                      </p>
                    </div>

                    <div className="mt-8 pt-8 border-t border-slate-800 flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-400 mb-1">Current Price</p>
                        <p className="text-3xl font-black text-blue-400">{(parseInt(item.price) / 100_000_000).toFixed(2)} CED</p>
                      </div>
                      <button 
                        onClick={(e) => handleBuy(e, item.id, item.price)}
                        disabled={buyLoading === item.id}
                        className="px-8 py-4 bg-white text-black font-bold text-lg rounded-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                      >
                        {buyLoading === item.id ? "Processing..." : "Purchase Asset"}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </AnimatePresence>
    </main>
  );
}